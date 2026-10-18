const nodemailer = require("nodemailer");

const STORE_URL = "https://uventuo-gilt.vercel.app";

const UVÉNTUO_LOGO =
  "https://uventuo-gilt.vercel.app/assets/image/logos/uv-logo-white.png";

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

  // Protect the endpoint: only the backend webhook should call it.
  const expectedSecret = process.env.ORDER_EMAIL_API_SECRET;
  const authorization = req.headers.authorization || "";

  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }

  try {
    const { to, userName, orderId } = req.body || {};

    if (
      typeof to !== "string" ||
      !to.trim() ||
      typeof orderId !== "string" ||
      !orderId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing email address or Order ID.",
      });
    }

    const safeName = escapeHtml(
      typeof userName === "string" && userName.trim()
        ? userName.trim()
        : "Valued Customer",
    );

    const safeOrderId = escapeHtml(orderId.trim());

    const subject = `Your UVÉNTUO Order Is Confirmed! #${orderId.trim()}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Your UVÉNTUO Order Is Confirmed</title>
</head>

<body style="margin:0;padding:0;background-color:#f0eee7;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Your UVÉNTUO order is confirmed. Thank you for choosing us.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="width:100%;background-color:#f0eee7;">
    <tr>
      <td align="center" style="padding:30px 12px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px;width:100%;background-color:#ffffff;border:1px solid #e6e4dc;">

          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding:32px 20px;background-color:#0a0a0a;">
              <a href="${STORE_URL}" style="text-decoration:none;">
                <img
                  src="${UVÉNTUO_LOGO}"
                  alt="UVÉNTUO"
                  width="145"
                  style="display:block;width:145px;max-width:100%;height:auto;border:0;margin:0 auto;"
                />
              </a>

              <p style="margin:13px 0 0;color:#bdb9ac;font-size:10px;letter-spacing:4px;text-transform:uppercase;">
                A signature of your style
              </p>
            </td>
          </tr>

          <!-- ACCENT -->
          <tr>
            <td style="height:5px;background-color:#fed100;font-size:0;line-height:0;">
              &nbsp;
            </td>
          </tr>

          <!-- CONFIRMATION -->
          <tr>
            <td align="center" style="padding:42px 28px 24px;background-color:#f7f6f1;">

              <div style="display:inline-block;padding:9px 15px;border:1px solid #e6d47b;background-color:#fff9d9;color:#655300;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                Payment Successful
              </div>

              <div style="width:54px;height:54px;margin:24px auto 18px;border-radius:50%;background-color:#fed100;line-height:54px;text-align:center;font-size:28px;font-weight:700;color:#111111;">
                &#10003;
              </div>

              <h1 style="margin:0 0 16px;color:#111111;font-size:29px;line-height:1.35;font-weight:700;">
                Your Order Is Confirmed!
              </h1>

              <p style="margin:0 0 14px;color:#333333;font-size:15px;line-height:1.9;">
                Hi ${safeName},
              </p>

              <p style="margin:0;color:#68665f;font-size:14px;line-height:1.9;">
                Thank you for choosing UVÉNTUO. Your payment was successful, and your order is officially confirmed.
              </p>

              <p style="margin:14px 0 0;color:#68665f;font-size:14px;line-height:1.9;">
                We’re preparing your order with care. We can’t wait for you to experience your new favorite fragrance.
              </p>

            </td>
          </tr>

          <!-- ORDER ID -->
          <tr>
            <td style="padding:28px 28px 20px;">

              <div style="padding:24px 18px;background-color:#171717;text-align:center;">

                <p style="margin:0 0 12px;color:#aaa79e;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  Your Order ID
                </p>

                <p style="margin:0;color:#fed100;font-size:21px;font-weight:700;line-height:1.5;overflow-wrap:anywhere;">
                  #${safeOrderId}
                </p>

                <p style="margin:10px 0 0;color:#bdb9ac;font-size:12px;line-height:1.7;">
                  Keep this number for your reference.
                </p>

              </div>

            </td>
          </tr>

          <!-- CLOSING -->
          <tr>
            <td align="center" style="padding:12px 28px 36px;">

              <p style="margin:0 0 22px;color:#68665f;font-size:14px;line-height:1.9;">
                Thank you for being part of UVÉNTUO. We hope you love every detail of your experience.
              </p>

              <a href="${STORE_URL}"
                style="display:inline-block;padding:15px 30px;background-color:#fed100;color:#111111;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">
                Discover UVÉNTUO
              </a>

              <p style="margin:25px 0 0;color:#777777;font-size:12px;line-height:1.8;">
                Good taste takes you places.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding:25px 20px;background-color:#0a0a0a;">

              <p style="margin:0 0 10px;color:#fed100;font-size:15px;font-weight:700;letter-spacing:3px;">
                UVÉNTUO
              </p>

              <p style="margin:0 0 12px;color:#aaa79e;font-size:11px;line-height:1.8;">
                Thoughtfully chosen. Beautifully delivered.
              </p>

              <a href="${STORE_URL}"
                style="color:#fed100;font-size:11px;text-decoration:none;">
                uventuo-gilt.vercel.app
              </a>

              <p style="margin:18px 0 0;color:#777777;font-size:10px;line-height:1.8;">
                &copy; ${new Date().getFullYear()} UVÉNTUO. All rights reserved.
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
      from: '"UVÉNTUO" <anfahmy92@gmail.com>',
      to: to.trim(),
      subject,
      html,
      text: [
        "Your UVÉNTUO order is confirmed!",
        "",
        `Hi ${typeof userName === "string" ? userName.trim() : "Valued Customer"},`,
        "",
        "Your payment was successful, and your order is officially confirmed.",
        "We're preparing your order with care. We can't wait for you to experience your new favorite fragrance.",
        "",
        `Your Order ID: #${orderId.trim()}`,
        "",
        "Visit UVÉNTUO:",
        STORE_URL,
        "",
        "Thank you for being part of UVÉNTUO.",
      ].join("\n"),
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
