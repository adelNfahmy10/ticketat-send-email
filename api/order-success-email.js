const nodemailer = require("nodemailer");

const UVÉNTUO_LOGO =
  "https://uventuo-gilt.vercel.app/assets/image/logos/uv-logo-white.png";

const STORE_URL = "https://uventuo-gilt.vercel.app";

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const formatCurrency = (amount) =>
  `${Number(amount || 0).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const formatDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Cairo",
  }).format(new Date(date));

module.exports = async (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://uventuo-gilt.vercel.app",
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const {
      to,
      userName,
      orderId,
      products,
      subtotal,
      shipping,
      total,
      paymentMethod,
      paymentStatus,
      shippingAddress,
      orderDate,
    } = req.body || {};

    if (
      typeof to !== "string" ||
      !to.trim() ||
      typeof userName !== "string" ||
      !userName.trim() ||
      typeof orderId !== "string" ||
      !orderId.trim() ||
      !Array.isArray(products) ||
      products.length === 0 ||
      !Number.isFinite(Number(total)) ||
      Number(total) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid order information.",
      });
    }

    const safeName = escapeHtml(userName.trim());
    const safeOrderId = escapeHtml(orderId.trim());
    const safePaymentMethod = escapeHtml(paymentMethod || "Not specified");
    const safePaymentStatus = escapeHtml(paymentStatus || "Pending");
    const safeAddress = escapeHtml(shippingAddress || "Not provided");
    const safeOrderDate = escapeHtml(formatDate(orderDate || new Date()));

    const productRows = products
      .map((product) => {
        const name = escapeHtml(product.name || "Product");
        const variant = product.variantName
          ? escapeHtml(product.variantName)
          : "";
        const size = product.size ? escapeHtml(product.size) : "";
        const quantity = Math.max(1, Number(product.quantity) || 1);
        const price = Number(product.price) || 0;

        const details = [variant, size ? `Size: ${size}` : ""]
          .filter(Boolean)
          .join(" · ");

        return `
          <tr>
            <td style="padding:16px 10px;border-bottom:1px solid #e9e5da;">
              <div style="font-size:14px;font-weight:700;color:#111111;line-height:1.6;">
                ${name}
              </div>
              ${
                details
                  ? `<div style="margin-top:4px;font-size:12px;color:#777777;line-height:1.6;">${details}</div>`
                  : ""
              }
            </td>
            <td align="center" style="padding:16px 6px;border-bottom:1px solid #e9e5da;font-size:13px;color:#444444;white-space:nowrap;">
              ${quantity}
            </td>
            <td align="right" style="padding:16px 10px;border-bottom:1px solid #e9e5da;font-size:13px;font-weight:700;color:#111111;white-space:nowrap;">
              ${escapeHtml(formatCurrency(price * quantity))}
            </td>
          </tr>
        `;
      })
      .join("");

    const safeSubtotal = escapeHtml(formatCurrency(subtotal ?? total));
    const safeShipping = escapeHtml(formatCurrency(shipping ?? 0));
    const safeTotal = escapeHtml(formatCurrency(total));

    const isPaid = String(paymentStatus || "").toLowerCase() === "paid";

    const subject = `Uvéntuo | Order Confirmed #${orderId.trim()}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Your Uvéntuo Order Confirmation</title>
</head>

<body style="margin:0;padding:0;background-color:#f0eee7;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Your Uvéntuo order is confirmed. Get ready for something special.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0eee7;">
    <tr>
      <td align="center" style="padding:30px 12px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:620px;background-color:#ffffff;border:1px solid #e6e4dc;">

          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding:30px 20px;background-color:#0a0a0a;">
              <a href="${STORE_URL}" style="text-decoration:none;">
                <img
                  src="${UVÉNTUO_LOGO}"
                  alt="Uvéntuo"
                  width="145"
                  style="display:block;width:145px;max-width:100%;height:auto;border:0;margin:0 auto;"
                />
              </a>
              <p style="margin:13px 0 0;color:#bdb9ac;font-size:10px;letter-spacing:4px;text-transform:uppercase;">
                A signature of your style
              </p>
            </td>
          </tr>

          <!-- YELLOW ACCENT -->
          <tr>
            <td style="height:5px;background-color:#fed100;font-size:0;line-height:0;">
              &nbsp;
            </td>
          </tr>

          <!-- SUCCESS INTRO -->
          <tr>
            <td style="padding:38px 30px 24px;text-align:center;background-color:#f7f6f1;">

              <div style="display:inline-block;padding:9px 15px;border:1px solid #e6d47b;background-color:#fff9d9;color:#655300;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                Order Confirmed
              </div>

              <div style="width:54px;height:54px;margin:23px auto 16px;border-radius:50%;background-color:#fed100;line-height:54px;text-align:center;font-size:28px;font-weight:700;color:#111111;">
                &#10003;
              </div>

              <h1 style="margin:0 0 14px;color:#111111;font-size:30px;line-height:1.3;font-weight:700;">
                It's Officially Yours.
              </h1>

              <p style="margin:0;color:#68665f;font-size:15px;line-height:1.9;">
                Hi ${safeName},<br />
                Thank you for choosing Uvéntuo. Your order is in, and we're getting everything ready for you.
              </p>
            </td>
          </tr>

          <!-- ORDER NUMBER -->
          <tr>
            <td style="padding:27px 30px 10px;">
              <p style="margin:0 0 8px;color:#777777;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                Order Number
              </p>

              <p style="margin:0;color:#111111;font-size:19px;font-weight:700;overflow-wrap:anywhere;">
                #${safeOrderId}
              </p>

              <p style="margin:8px 0 0;color:#888888;font-size:12px;">
                Placed on ${safeOrderDate}
              </p>
            </td>
          </tr>

          <!-- DELIVERY NOTICE -->
          <tr>
            <td style="padding:20px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#0a0a0a;">
                <tr>
                  <td style="padding:22px 20px;border-left:5px solid #fed100;">
                    <p style="margin:0 0 7px;color:#fed100;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                      A Little Something Is On Its Way
                    </p>

                    <p style="margin:0 0 8px;color:#ffffff;font-size:21px;line-height:1.4;font-weight:700;">
                      Delivery within 3 days
                    </p>

                    <p style="margin:0;color:#c6c4bd;font-size:13px;line-height:1.8;">
                      Your order is being prepared with care. We expect it to reach you within 3 days.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ORDER DETAILS -->
          <tr>
            <td style="padding:8px 30px 0;">
              <h2 style="margin:0 0 18px;color:#111111;font-size:19px;line-height:1.5;">
                Your Order Details
              </h2>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-top:1px solid #e9e5da;border-bottom:1px solid #e9e5da;">
                <thead>
                  <tr style="background-color:#f7f6f1;">
                    <th align="left" style="padding:12px 10px;color:#777777;font-size:10px;letter-spacing:1px;text-transform:uppercase;">
                      Item
                    </th>
                    <th align="center" style="padding:12px 6px;color:#777777;font-size:10px;letter-spacing:1px;text-transform:uppercase;">
                      Qty
                    </th>
                    <th align="right" style="padding:12px 10px;color:#777777;font-size:10px;letter-spacing:1px;text-transform:uppercase;">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${productRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="padding:20px 30px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:7px 0;color:#777777;font-size:13px;">Subtotal</td>
                  <td align="right" style="padding:7px 0;color:#444444;font-size:13px;">${safeSubtotal}</td>
                </tr>

                <tr>
                  <td style="padding:7px 0;color:#777777;font-size:13px;">Shipping</td>
                  <td align="right" style="padding:7px 0;color:#444444;font-size:13px;">${safeShipping}</td>
                </tr>

                <tr>
                  <td colspan="2" style="padding:8px 0;">
                    <div style="height:1px;background-color:#e6e4dc;"></div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:10px 0;color:#111111;font-size:16px;font-weight:700;">Total</td>
                  <td align="right" style="padding:10px 0;color:#111111;font-size:19px;font-weight:700;">${safeTotal}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SHIPPING ADDRESS -->
          <tr>
            <td style="padding:20px 30px 10px;">
              <div style="padding:19px;background-color:#f7f6f1;border:1px solid #e6e4dc;">
                <p style="margin:0 0 9px;color:#777777;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                  Shipping Address
                </p>

                <p style="margin:0;color:#111111;font-size:14px;line-height:1.9;overflow-wrap:anywhere;">
                  ${safeAddress}
                </p>
              </div>
            </td>
          </tr>

          <!-- PAYMENT INFORMATION -->
          <tr>
            <td style="padding:15px 30px 28px;">
              <p style="margin:0 0 8px;color:#777777;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                Payment Information
              </p>

              <p style="margin:0;color:#444444;font-size:13px;line-height:1.9;">
                <strong style="color:#111111;">Method:</strong>
                ${safePaymentMethod}<br />

                <strong style="color:#111111;">Status:</strong>
                ${isPaid ? "Paid" : safePaymentStatus}
              </p>
            </td>
          </tr>

          <!-- CLOSING -->
          <tr>
            <td style="padding:27px 30px;background-color:#fed100;text-align:center;">
              <h2 style="margin:0 0 10px;color:#111111;font-size:21px;line-height:1.5;">
                Good taste takes you places.
              </h2>

              <p style="margin:0 0 20px;color:#333333;font-size:13px;line-height:1.8;">
                Thank you for being part of Uvéntuo. We hope you love every detail of your order.
              </p>

              <a href="${STORE_URL}"
                style="display:inline-block;padding:13px 25px;background-color:#111111;color:#fed100;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                Visit Uvéntuo
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:25px 20px;background-color:#0a0a0a;text-align:center;">
              <p style="margin:0 0 8px;color:#ffffff;font-size:15px;font-weight:700;letter-spacing:2px;">
                UVÉNTUO
              </p>

              <p style="margin:0 0 12px;color:#aaa79e;font-size:11px;line-height:1.8;">
                Thoughtfully chosen. Beautifully delivered.
              </p>

              <p style="margin:0;color:#777777;font-size:10px;line-height:1.8;">
                &copy; ${new Date().getFullYear()} Uvéntuo. All rights reserved.
              </p>

              <p style="margin:10px 0 0;color:#777777;font-size:10px;line-height:1.8;">
                This email confirms your order with Uvéntuo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error("Email SMTP credentials are missing.");

      return res.status(500).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    const transport = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transport.sendMail({
      from: '"Uvéntuo" <anfahmy92@gmail.com>',
      to: to.trim(),
      subject,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Order confirmation email sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Order confirmation email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send order confirmation email.",
    });
  }
};
