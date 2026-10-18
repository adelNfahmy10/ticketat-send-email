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
      console.error("Paymob webhook contains invalid transaction/order IDs");

      return res.status(200).json({
        success: true,
        received: true,
        processed: false,
      });
    }

    // A valid HMAC does not automatically mean a successful payment.
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

    // The creation endpoint saves Paymob's intention_order_id here.
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

    const result = await db.runTransaction(async (firestoreTransaction) => {
      const paymentSnapshot = await firestoreTransaction.get(paymentRef);
      const orderSnapshot = await firestoreTransaction.get(orderRef);

      if (paymentSnapshot.exists) {
        return "duplicate";
      }

      if (!orderSnapshot.exists) {
        return "order-not-found";
      }

      const order = orderSnapshot.data();

      // Compare Paymob's received amount with the amount stored for the order.
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

      // Never overwrite an order already paid by another transaction.
      if (order.paymentStatus === "Paid" || order.status === "Paid") {
        return "already-paid";
      }

      if (
        order.paymentStatus !== "Pending" ||
        order.status !== "Pending" ||
        String(order.paymobOrderId) !== paymobOrderId
      ) {
        return "order-not-payable";
      }

      firestoreTransaction.update(orderRef, {
        status: "Paid",
        paymentStatus: "Paid",
        paymobTransactionId: transactionId,
        paymentCurrency: "EGP",
        paidAmount: receivedAmountCents / 100,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      firestoreTransaction.create(paymentRef, {
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

    if (result !== "paid") {
      console.warn("Paymob callback not applied to order", {
        transactionId,
        paymobOrderId,
        result,
      });
    } else {
      console.log("Paymob payment confirmed", {
        transactionId,
        paymobOrderId,
        firestoreOrderId: orderRef.id,
      });
    }

    // Acknowledge verified callbacks so Paymob doesn't keep retrying
    // callbacks that cannot be resolved automatically.
    return res.status(200).json({
      success: true,
      received: true,
      processed: result === "paid" || result === "duplicate",
      result,
    });
  } catch (error) {
    console.error("Paymob webhook error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
