const admin = require("firebase-admin");

const ALLOWED_ORIGIN = "https://uventuo-gilt.vercel.app";

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Access-Control-Max-Age", "86400");
  }
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
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    initializeFirebase();

    const orderId = req.body?.orderId;

    if (
      typeof orderId !== "string" ||
      !/^[a-zA-Z0-9_-]{1,150}$/.test(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid orderId is required",
      });
    }

    // Paymob environment variables
    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.PAYMOB_PUBLIC_KEY;
    const integrationId = Number(process.env.PAYMOB_INTEGRATION_ID);
    const apiBaseUrl = process.env.API_BASE_URL;
    const appUrl = process.env.APP_URL;

    if (
      !secretKey ||
      !Number.isInteger(integrationId) ||
      integrationId <= 0 ||
      !publicKey ||
      !apiBaseUrl ||
      !appUrl
    ) {
      throw new Error("Paymob environment variables are missing");
    }

    // Get order from Firestore
    const db = admin.firestore();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnapshot = await orderRef.get();

    if (!orderSnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderSnapshot.data();

    if (order.status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "This order cannot be paid in its current status",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    // Total amount in EGP converted to cents
    const amountCents = Math.round(Number(order.total) * 100);

    if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    if (!order.email || !order.name || !order.phone) {
      return res.status(400).json({
        success: false,
        message: "Order customer details are incomplete",
      });
    }

    // Build actual order items
    const products = Array.isArray(order.products) ? order.products : [];

    if (!products.length) {
      return res.status(400).json({
        success: false,
        message: "Order has no products",
      });
    }

    const items = products.map((product) => {
      const quantity = Number(product.quantity);
      const priceCents = Math.round(Number(product.price) * 100);

      if (
        !product.name ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0 ||
        !Number.isSafeInteger(priceCents) ||
        priceCents <= 0
      ) {
        throw new Error("Invalid order product data");
      }

      const description = [
        product.variantName,
        product.size ? `Size: ${product.size}` : null,
      ]
        .filter(Boolean)
        .join(" - ");

      return {
        name: String(product.name).slice(0, 255),
        amount: priceCents,
        description: description || String(product.name),
        quantity,
      };
    });

    // Ensure item totals do not exceed the order total
    const productsTotalCents = items.reduce(
      (sum, item) => sum + item.amount * item.quantity,
      0,
    );

    const additionalAmountCents = amountCents - productsTotalCents;

    if (additionalAmountCents < 0) {
      return res.status(400).json({
        success: false,
        message: "Order total is less than the products total",
      });
    }

    // Preserve any difference in the order total
    if (additionalAmountCents > 0) {
      items.push({
        name: "Additional Charges",
        amount: additionalAmountCents,
        description: "Additional order charges",
        quantity: 1,
      });
    }

    // Customer billing data
    const nameParts = String(order.name).trim().split(/\s+/);

    const firstName = nameParts.shift() || "Customer";
    const lastName = nameParts.join(" ") || "Customer";

    const apiUrl = apiBaseUrl.replace(/\/+$/, "");
    const frontendUrl = appUrl.replace(/\/+$/, "");

    const notificationUrl = `${apiUrl}/api/paymob-webhook-uventuo`;

    const redirectionUrl = `${frontendUrl}/order-successfully`;

    // Paymob intention payload
    const payload = {
      amount: amountCents,
      currency: "EGP",
      payment_methods: [integrationId],

      // Actual products instead of a single order item
      items,

      billing_data: {
        first_name: firstName,
        last_name: lastName,
        email: String(order.email).trim(),
        phone_number: String(order.phone).trim(),
        street: String(order.address || "NA"),
        building: "NA",
        apartment: "NA",
        floor: "NA",
        city: "Cairo",
        state: "Cairo",
        country: "EG",
        postal_code: "NA",
      },

      special_reference: orderId,
      notification_url: notificationUrl,
      redirection_url: redirectionUrl,

      extras: {
        firestoreOrderId: orderId,
      },
    };

    // Create Paymob intention
    const paymobResponse = await fetch(
      "https://accept.paymob.com/v1/intention/",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await paymobResponse.json();

    if (!paymobResponse.ok) {
      console.error("Paymob intention creation failed", {
        status: paymobResponse.status,
        message: result?.message,
        errors: result?.errors,
      });

      return res.status(502).json({
        success: false,
        message: "Could not initialize payment",
      });
    }

    if (!result.client_secret || !result.intention_order_id) {
      console.error("Unexpected Paymob response", {
        intentionOrderId: result.intention_order_id,
      });

      return res.status(502).json({
        success: false,
        message: "Invalid payment response",
      });
    }

    // Save payment initialization data
    await orderRef.update({
      paymentProvider: "Paymob",
      paymentStatus: "Pending",
      paymobOrderId: String(result.intention_order_id),
      paymobIntentionId: result.id || null,
      paymobSpecialReference: orderId,
      paymentStartedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Unified Checkout URL
    const checkoutUrl = new URL("https://accept.paymob.com/unifiedcheckout/");

    checkoutUrl.searchParams.set("publicKey", publicKey);

    checkoutUrl.searchParams.set("clientSecret", result.client_secret);

    return res.status(200).json({
      success: true,
      checkoutUrl: checkoutUrl.toString(),
    });
  } catch (error) {
    console.error("Create payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create payment",
    });
  }
};
