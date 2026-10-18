const crypto = require("crypto");
const admin = require("firebase-admin");

const HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
];

function getValue(obj, path) {
  return path.split(".").reduce((value, key) => value?.[key], obj);
}

function verifyHmac(obj, receivedHmac) {
  const secret = process.env.PAYMOB_HMAC_SECRET;

  if (
    !secret ||
    typeof receivedHmac !== "string" ||
    !/^[a-fA-F0-9]{128}$/.test(receivedHmac) ||
    !obj
  ) {
    return false;
  }

  const data = HMAC_FIELDS.map((field) => {
    const value = getValue(obj, field);
    return value == null ? "" : String(value);
  }).join("");

  const calculated = crypto.createHmac("sha512", secret).update(data).digest();

  const received = Buffer.from(receivedHmac, "hex");

  return (
    received.length === calculated.length &&
    crypto.timingSafeEqual(calculated, received)
  );
}

function initializeFirebase() {
  if (admin.apps.length) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error("Firebase service account is not configured");
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
  });
}

/**
 * Sends the order confirmation email only after Firestore confirms
 * that both order.status and order.paymentStatus are Paid.
 */
async function sendOrderConfirmationEmail(orderRef) {
  const secret = process.env.ORDER_EMAIL_API_SECRET;

  if (!secret) {
    throw new Error("ORDER_EMAIL_API_SECRET is missing");
  }

  const db = admin.firestore();

  // Claim the email job to reduce duplicate sends from concurrent callbacks.
  const claim = await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(orderRef);

    if (!snapshot.exists) {
      throw new Error("Order not found when sending confirmation email");
    }

    const order = snapshot.data();

    if (order.status !== "Paid" || order.paymentStatus !== "Paid") {
      return { status: "not-paid" };
    }

    if (
      order.orderConfirmationEmailSent === true ||
      order.orderConfirmationEmailStatus === "sent"
    ) {
      return { status: "already-sent" };
    }

    const sendingAt = order.orderConfirmationEmailSendingAt?.toDate?.();
    const isSending = order.orderConfirmationEmailStatus === "sending";
    const isRecentClaim =
      sendingAt && Date.now() - sendingAt.getTime() < 2 * 60 * 1000;

    if (isSending && isRecentClaim) {
      return { status: "in-progress" };
    }

    if (!order.email) {
      throw new Error("Order email is missing");
    }

    tx.update(orderRef, {
      orderConfirmationEmailStatus: "sending",
      orderConfirmationEmailSendingAt:
        admin.firestore.FieldValue.serverTimestamp(),
      orderConfirmationEmailLastError: admin.firestore.FieldValue.delete(),
    });

    return {
      status: "claimed",
      email: order.email,
      name: order.name || "Valued Customer",
      orderId: orderRef.id,
    };
  });

  if (claim.status === "not-paid" || claim.status === "already-sent") {
    return claim.status;
  }

  if (claim.status === "in-progress") {
    // Return a retryable webhook error rather than acknowledging an
    // email attempt that another request is still processing.
    throw new Error("Order confirmation email is already being processed");
  }

  try {
    // APP_URL should be the root URL of this Vercel project.
    const baseUrl = (
      process.env.APP_URL || "https://uventuo-gilt.vercel.app"
    ).replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/api/order-success-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: claim?.email,
        userName: claim?.name,
        orderId: claim?.orderId,
      }),
      signal: AbortSignal.timeout(20000),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.message || `Email endpoint failed: ${response.status}`,
      );
    }

    await orderRef.update({
      orderConfirmationEmailSent: true,
      orderConfirmationEmailStatus: "sent",
      orderConfirmationEmailSentAt:
        admin.firestore.FieldValue.serverTimestamp(),
      orderConfirmationEmailSendingAt: admin.firestore.FieldValue.delete(),
      orderConfirmationEmailLastError: admin.firestore.FieldValue.delete(),
    });

    console.log("Order confirmation email sent", {
      firestoreOrderId: claim.orderId,
    });

    return "sent";
  } catch (error) {
    // Allow a later verified callback to retry the email.
    await orderRef.update({
      orderConfirmationEmailStatus: "pending",
      orderConfirmationEmailSendingAt: admin.firestore.FieldValue.delete(),
      orderConfirmationEmailLastError: String(
        error.message || "Email delivery failed",
      ).slice(0, 300),
    });

    throw error;
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    initializeFirebase();

    const transaction = req.body?.obj;
    const hmac = req.query?.hmac;

    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: "Missing transaction object",
      });
    }

    if (!verifyHmac(transaction, hmac)) {
      console.warn("Paymob webhook rejected: invalid HMAC");

      return res.status(403).json({
        success: false,
        message: "Invalid HMAC",
      });
    }

    const transactionId = String(transaction.id ?? "");
    const paymobOrderId = String(transaction.order?.id ?? "");
    const integrationId = Number(process.env.PAYMOB_INTEGRATION_ID);

    if (
      !transactionId ||
      !/^\d+$/.test(transactionId) ||
      !paymobOrderId ||
      !/^\d+$/.test(paymobOrderId)
    ) {
      console.error("Paymob webhook contains invalid IDs");

      return res.status(200).json({
        success: true,
        received: true,
        processed: false,
      });
    }

    // HMAC validity alone does not establish payment success.
    const paymentSucceeded =
      transaction.success === true &&
      transaction.pending === false &&
      transaction.error_occured === false &&
      transaction.currency === "EGP" &&
      transaction.is_voided !== true &&
      transaction.is_refunded !== true &&
      Number(transaction.integration_id) === integrationId;

    if (!paymentSucceeded) {
      console.log("Paymob transaction not eligible for paid status", {
        transactionId,
        success: transaction.success,
        pending: transaction.pending,
        currency: transaction.currency,
      });

      return res.status(200).json({
        success: true,
        received: true,
        processed: false,
      });
    }

    const db = admin.firestore();

    const ordersSnapshot = await db
      .collection("orders")
      .where("paymobOrderId", "==", paymobOrderId)
      .limit(2)
      .get();

    if (ordersSnapshot.empty || ordersSnapshot.size !== 1) {
      console.error("No unique Firestore order matched Paymob order ID", {
        paymobOrderId,
        transactionId,
        matches: ordersSnapshot.size,
      });

      return res.status(200).json({
        success: true,
        received: true,
        processed: false,
      });
    }

    const orderRef = ordersSnapshot.docs[0].ref;
    const paymentRef = db.collection("paymobTransactions").doc(transactionId);

    const result = await db.runTransaction(async (tx) => {
      const paymentSnapshot = await tx.get(paymentRef);
      const orderSnapshot = await tx.get(orderRef);

      if (!orderSnapshot.exists) {
        return "order-not-found";
      }

      const order = orderSnapshot.data();

      // Verify the amount even when a callback is being retried.
      const expectedAmountCents = Math.round(Number(order.total) * 100);
      const receivedAmountCents = Number(transaction.amount_cents);

      if (
        !Number.isSafeInteger(expectedAmountCents) ||
        expectedAmountCents <= 0 ||
        !Number.isSafeInteger(receivedAmountCents) ||
        receivedAmountCents !== expectedAmountCents
      ) {
        return "amount-mismatch";
      }

      if (String(order.paymobOrderId) !== paymobOrderId) {
        return "order-id-mismatch";
      }

      // A repeated callback must still be allowed to retry a failed email.
      if (paymentSnapshot.exists) {
        return order.status === "Paid" && order.paymentStatus === "Paid"
          ? "duplicate"
          : "duplicate-unpaid";
      }

      // Do not overwrite an order already paid by another transaction.
      if (order.paymentStatus === "Paid" || order.status === "Paid") {
        return "already-paid";
      }

      if (order.paymentStatus !== "Pending" || order.status !== "Pending") {
        return "order-not-payable";
      }

      tx.update(orderRef, {
        status: "Paid",
        paymentStatus: "Paid",
        paymobTransactionId: transactionId,
        paymentCurrency: "EGP",
        paidAmount: receivedAmountCents / 100,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      tx.create(paymentRef, {
        transactionId,
        paymobOrderId,
        firestoreOrderId: orderRef.id,
        amountCents: receivedAmountCents,
        currency: transaction.currency,
        success: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return "paid";
    });

    console.log("Paymob webhook transaction result", {
      transactionId,
      paymobOrderId,
      firestoreOrderId: orderRef.id,
      result,
    });

    // Send or retry the email only for a confirmed paid order.
    if (["paid", "duplicate", "already-paid"].includes(result)) {
      await sendOrderConfirmationEmail(orderRef);
    }

    return res.status(200).json({
      success: true,
      received: true,
      processed: ["paid", "duplicate", "already-paid"].includes(result),
      result,
    });
  } catch (error) {
    console.error("Paymob webhook error:", error.message);

    // A 500 allows Paymob to retry when email delivery fails.
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
