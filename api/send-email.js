const nodemailer = require("nodemailer");

const TICKETAT_LOGO =
  "https://res.cloudinary.com/ticketat/image/upload/v1782899628/logo-1_tkuiis.png";

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

const isValidImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { to, userName, eventName, partnerLogo = "" } = req.body || {};

    if (
      typeof to !== "string" ||
      !to.trim() ||
      typeof userName !== "string" ||
      !userName.trim() ||
      typeof eventName !== "string" ||
      !eventName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email, user name, and event name are required.",
      });
    }

    const safeName = escapeHtml(userName.trim());
    const safeEventName = escapeHtml(eventName.trim());

    const safePartnerLogo = isValidImageUrl(partnerLogo)
      ? partnerLogo.trim()
      : "";

    const transport = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject =
      "Ticketat | Partial Payment Received - تم استلام الدفعة الجزئية";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />

  <title>Partial Payment Confirmation - Ticketat</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: #f3f5f9;
      color: #1f2937;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

    img {
      display: block;
      border: 0;
      outline: none;
      text-decoration: none;
    }

    .email-wrapper {
      width: 100%;
      padding: 32px 12px;
      background-color: #f3f5f9;
    }

    .email-container {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      overflow: hidden;
      background-color: #ffffff;
      border: 1px solid #e8ecf2;
      border-radius: 16px;
    }

    .brand-header {
      padding: 26px 12px;
      background-color: #ffffff;
      border-bottom: 1px solid #edf0f5;
      text-align: center;
    }

    .brand-table {
      margin: 0 auto;
    }

    .brand-cell {
      padding: 12px;
      background-color: #080a0f;
      border-radius: 12px;
      text-align: center;
      vertical-align: middle;
    }

    .brand-logo {
      display: block;
      width: 150px;
      max-width: 150px;
      height: 68px;
      margin: 0 auto;
      object-fit: contain;
    }

    .brand-spacer {
      width: 20px;
      font-size: 0;
      line-height: 0;
    }

    .email-content {
      padding: 34px 32px;
      background-color: #ffffff;
    }

    .status-badge {
      display: inline-block;
      padding: 8px 13px;
      color: #8a5b00;
      background-color: #fff5d6;
      border: 1px solid #ffe8a3;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .email-title {
      margin: 20px 0 12px;
      color: #111827;
      font-size: 27px;
      line-height: 1.35;
      font-weight: 700;
    }

    .email-text {
      margin: 0 0 16px;
      color: #596579;
      font-size: 15px;
      line-height: 1.8;
    }

    .event-card {
      margin: 26px 0;
      padding: 22px;
      background-color: #f8fafc;
      border: 1px solid #e8edf4;
      border-radius: 12px;
    }

    .event-label {
      margin: 0 0 8px;
      color: #7b8495;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.7px;
      text-transform: uppercase;
    }

    .event-name {
      margin: 0;
      color: #111827;
      font-size: 20px;
      line-height: 1.5;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .payment-notice {
      margin: 24px 0;
      padding: 18px;
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      border-radius: 8px;
    }

    .payment-notice-title {
      margin: 0 0 8px;
      color: #1d4ed8;
      font-size: 15px;
      line-height: 1.5;
      font-weight: 700;
    }

    .payment-notice-text {
      margin: 0;
      color: #475569;
      font-size: 14px;
      line-height: 1.8;
    }

    .next-steps {
      margin: 26px 0 0;
      padding: 0;
      list-style: none;
    }

    .next-steps li {
      margin-bottom: 12px;
      color: #596579;
      font-size: 14px;
      line-height: 1.8;
    }

    .step-number {
      display: inline-block;
      width: 23px;
      height: 23px;
      margin-right: 8px;
      color: #ffffff;
      background-color: #2563eb;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 700;
      line-height: 23px;
      text-align: center;
      vertical-align: middle;
    }

    .email-divider {
      height: 1px;
      margin: 28px 0;
      background-color: #edf0f5;
      border: 0;
    }

    .email-footer {
      padding: 24px 20px;
      background-color: #f8fafc;
      border-top: 1px solid #edf0f5;
      text-align: center;
    }

    .footer-text {
      margin: 0 0 8px;
      color: #7b8495;
      font-size: 12px;
      line-height: 1.7;
    }

    .footer-brand {
      color: #2563eb;
      font-weight: 700;
      text-decoration: none;
    }

    .footer-note {
      margin: 12px 0 0;
      color: #9aa3b2;
      font-size: 11px;
      line-height: 1.7;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 12px 6px !important;
      }

      .email-container {
        border-radius: 12px !important;
      }

      .brand-header {
        padding: 20px 8px !important;
      }

      .brand-cell {
        padding: 8px !important;
      }

      .brand-logo {
        width: 112px !important;
        max-width: 112px !important;
        height: 54px !important;
      }

      .brand-spacer {
        width: 10px !important;
      }

      .email-content {
        padding: 26px 18px !important;
      }

      .email-title {
        font-size: 23px !important;
      }

      .event-card {
        padding: 17px !important;
      }

      .event-name {
        font-size: 18px !important;
      }

      .payment-notice {
        padding: 15px !important;
      }

      .email-footer {
        padding: 22px 14px !important;
      }
    }

    @media only screen and (max-width: 360px) {
      .brand-logo {
        width: 90px !important;
        max-width: 90px !important;
        height: 46px !important;
      }

      .brand-spacer {
        width: 6px !important;
      }

      .brand-cell {
        padding: 6px !important;
      }

      .email-content {
        padding: 22px 14px !important;
      }
    }
  </style>
</head>

<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- BRAND HEADER -->
      <div
        class="brand-header"
        style="
          padding: 26px 12px;
          border-bottom: 1px solid #edf0f5;
          background-color: #ffffff;
          text-align: center;
        "
      >
        <table
          role="presentation"
          class="brand-table"
          align="center"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin: 0 auto;"
        >
          <tr>
            <td
              class="brand-cell"
              align="center"
              valign="middle"
              bgcolor="#080a0f"
              style="
                background-color: #080a0f;
                border-radius: 12px;
                padding: 12px;
                text-align: center;
              "
            >
              <img
                class="brand-logo"
                src="${TICKETAT_LOGO}"
                alt="Ticketat"
                width="150"
                height="68"
                style="
                  display: block;
                  width: 150px;
                  height: 68px;
                  max-width: 150px;
                  border: 0;
                  margin: 0 auto;
                "
              />
            </td>

            ${
              safePartnerLogo
                ? `
                  <td
                    class="brand-spacer"
                    width="20"
                    style="width: 20px; font-size: 0; line-height: 0;"
                  >
                    &nbsp;
                  </td>

                  <td
                    class="brand-cell"
                    align="center"
                    valign="middle"
                    bgcolor="#080a0f"
                    style="
                      background-color: #080a0f;
                      border-radius: 12px;
                      padding: 12px;
                      text-align: center;
                    "
                  >
                    <img
                      class="brand-logo"
                      src="${safePartnerLogo}"
                      alt="Event Partner"
                      width="150"
                      height="68"
                      style="
                        display: block;
                        width: 150px;
                        height: 68px;
                        max-width: 150px;
                        border: 0;
                        margin: 0 auto;
                      "
                    />
                  </td>
                `
                : ""
            }
          </tr>
        </table>
      </div>

      <!-- MAIN CONTENT -->
      <div class="email-content">

        <span class="status-badge">
          Partial Payment Received
        </span>

        <h1 class="email-title">
          Your Partial Payment Is Confirmed!
        </h1>

        <p class="email-text">
          Hi ${safeName},
        </p>

        <p class="email-text">
          We've successfully recorded your partial payment for
          <strong>${safeEventName}</strong>.
          Your booking is progressing, and we're happy to have you with us!
        </p>

        <!-- EVENT DETAILS -->
        <div class="event-card">
          <p class="event-label">
            Event Details
          </p>

          <h2 class="event-name">
            ${safeEventName}
          </h2>
        </div>

        <!-- PAYMENT STATUS -->
        <div class="payment-notice">
          <h3 class="payment-notice-title">
            Payment Update
          </h3>

          <p class="payment-notice-text">
            Your partial payment has been recorded successfully.
            Please keep your booking details and payment confirmation
            for your records.
          </p>
        </div>

        <p class="email-text">
          <strong>What's next?</strong>
        </p>

        <ul class="next-steps">
          <li>
            <span class="step-number">1</span>
            Your partial payment is now recorded in our system.
          </li>

          <li>
            <span class="step-number">2</span>
            If there is a remaining balance, please coordinate with
            the event organizer to complete your payment.
          </li>

          <li>
            <span class="step-number">3</span>
            Keep this email for your reference.
          </li>
        </ul>

        <hr class="email-divider" />

        <p class="email-text">
          Thank you for choosing Ticketat. We look forward to seeing
          you at the event!
        </p>

        <p class="email-text" style="margin-bottom: 0;">
          Best regards,<br />
          <strong>The Ticketat Team</strong>
        </p>

      </div>

      <!-- FOOTER -->
      <div class="email-footer">

        <p class="footer-text">
          Need help with your booking? Please contact your event organizer.
        </p>

        <p class="footer-text">
          Powered by
          <span class="footer-brand">Ticketat</span>
        </p>

        <p class="footer-note">
          &copy; ${new Date().getFullYear()} Ticketat. All rights reserved.
        </p>

        <p class="footer-note">
          This email was sent regarding your event booking.
        </p>

      </div>

    </div>
  </div>
</body>
</html>`;

    const info = await transport.sendMail({
      from: '"Ticketat.eg" <anfahmy92@gmail.com>',
      to: to.trim(),
      subject,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Partial payment email sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Partial payment email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send partial payment email.",
    });
  }
};
