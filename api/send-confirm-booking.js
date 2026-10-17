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

    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
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
    const { to, userName, eventName, partnerLogo } = req.body || {};

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
        message: "Email, user name and event name are required.",
      });
    }

    const safeName = escapeHtml(userName.trim());
    const safeEventName = escapeHtml(eventName.trim());

    const safePartnerLogo = isValidImageUrl(partnerLogo)
      ? escapeHtml(partnerLogo.trim())
      : "";

    const accentColor = "#168b63";
    const currentYear = new Date().getFullYear();

    const subject =
      "Ticketat - Booking & Payment Confirmed | تأكيد الدفع والحجز";

    const transport = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />

  <title>Booking Confirmed | Ticketat</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: #f2f4f8;
      font-family: Arial, Helvetica, sans-serif;
      color: #202938;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table {
      border-collapse: collapse;
      border-spacing: 0;
    }

    img {
      display: block;
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    .email-wrapper {
      width: 100%;
      padding: 24px 12px;
    }

    .email-container {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e7ebf2;
      border-radius: 14px;
      overflow: hidden;
    }

    .brand-header {
      padding: 26px 12px;
      border-bottom: 1px solid #edf0f5;
      background-color: #ffffff;
      text-align: center;
    }

    .brand-table {
      width: auto;
      max-width: 100%;
      margin: 0 auto;
    }

    .brand-cell {
      background-color: #080a0f;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      vertical-align: middle;
    }

    .brand-logo {
      display: block;
      width: 150px;
      max-width: 150px;
      height: 68px;
      border: 0;
      margin: 0 auto;
      object-fit: contain;
    }

    .brand-spacer {
      width: 20px;
      min-width: 20px;
      font-size: 0;
      line-height: 0;
    }

    .brand-divider {
      width: 1px;
      min-width: 1px;
      height: 44px;
      background-color: #e4e8ef;
    }

    .email-content {
      padding: 30px 28px;
    }

    .email-title {
      margin: 18px 0 8px;
      color: #173b30;
      font-size: 26px;
      line-height: 1.35;
      font-weight: 700;
      text-align: center;
    }

    .email-subtitle {
      margin: 0;
      color: #68758a;
      font-size: 15px;
      line-height: 1.9;
      text-align: center;
      direction: rtl;
    }

    .message-text {
      margin: 0;
      color: #566276;
      font-size: 14px;
      line-height: 1.9;
      overflow-wrap: anywhere;
      word-wrap: break-word;
    }

    .event-card {
      margin: 24px 0 18px;
      padding: 20px;
      background-color: #f6f8fc;
      border: 1px solid #e5eaf3;
      border-radius: 10px;
      overflow-wrap: anywhere;
      word-wrap: break-word;
    }

    .status-card {
      margin: 22px 0;
      padding: 20px;
      background-color: #effaf5;
      border: 1px solid #cdebdc;
      border-left: 4px solid #168b63;
      border-radius: 10px;
    }

    .section-title {
      margin: 26px 0 10px;
      color: #202938;
      font-size: 18px;
      line-height: 1.5;
      font-weight: 700;
    }

    .arabic-section {
      direction: rtl;
      text-align: right;
      font-family: Arial, Tahoma, sans-serif;
    }

    .email-divider {
      height: 1px;
      margin: 28px 0;
      background-color: #e9edf3;
      font-size: 0;
      line-height: 0;
    }

    .thank-you {
      margin-top: 28px;
      padding: 22px 18px;
      background-color: #f1faf5;
      border: 1px solid #dcefe4;
      border-radius: 10px;
      text-align: center;
    }

    .email-footer {
      padding: 24px 18px;
      background-color: #f8f9fc;
      border-top: 1px solid #e9edf3;
      text-align: center;
    }

    @media only screen and (max-width: 480px) {
      .email-wrapper {
        padding: 8px 5px !important;
      }

      .email-container {
        border-radius: 10px !important;
      }

      .brand-header {
        padding: 20px 6px !important;
      }

      .brand-cell {
        padding: 8px !important;
      }

      .brand-logo {
        width: 125px !important;
        max-width: 125px !important;
        height: 58px !important;
      }

      .brand-spacer {
        width: 12px !important;
        min-width: 12px !important;
      }

      .brand-divider {
        height: 34px !important;
      }

      .email-content {
        padding: 24px 17px !important;
      }

      .email-title {
        margin-top: 16px !important;
        font-size: 23px !important;
        line-height: 1.4 !important;
      }

      .email-subtitle {
        font-size: 14px !important;
        line-height: 1.9 !important;
      }

      .message-text {
        font-size: 14px !important;
        line-height: 1.85 !important;
      }

      .event-card {
        margin: 18px 0 14px !important;
        padding: 16px !important;
      }

      .event-name {
        font-size: 18px !important;
        line-height: 1.55 !important;
      }

      .status-card {
        margin: 18px 0 !important;
        padding: 16px !important;
      }

      .section-title {
        margin-top: 23px !important;
        font-size: 17px !important;
      }

      .email-divider {
        margin: 24px 0 !important;
      }

      .thank-you {
        margin-top: 22px !important;
        padding: 18px 12px !important;
      }

      .email-footer {
        padding: 20px 12px !important;
      }
    }

    @media only screen and (max-width: 360px) {
      .brand-cell {
        padding: 6px !important;
      }

      .brand-logo {
        width: 105px !important;
        max-width: 105px !important;
        height: 52px !important;
      }

      .brand-spacer {
        width: 8px !important;
        min-width: 8px !important;
      }

      .email-content {
        padding: 21px 14px !important;
      }
    }
  </style>
</head>

<body style="margin:0;padding:0;background-color:#f2f4f8;">

  <!-- PREVIEW TEXT -->
  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;
    color:transparent;
    mso-hide:all;
  ">
    Your booking and payment for ${safeEventName} have been confirmed successfully.
  </div>

  <div class="email-wrapper" style="width:100%;padding:24px 12px;">

    <div
      class="email-container"
      style="
        width:100%;
        max-width:620px;
        margin:0 auto;
        background-color:#ffffff;
        border:1px solid #e7ebf2;
        border-radius:14px;
        overflow:hidden;
      "
    >

      <!-- BRAND HEADER -->
      <div class="brand-header" style="
        padding:26px 12px;
        border-bottom:1px solid #edf0f5;
        background-color:#ffffff;
        text-align:center;
      ">

        <table
          role="presentation"
          class="brand-table"
          align="center"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin:0 auto;"
        >
          <tr>

            <!-- TICKETAT LOGO -->
            <td
              class="brand-cell"
              align="center"
              valign="middle"
              bgcolor="#080a0f"
              style="
                background-color:#080a0f;
                border-radius:12px;
                padding:12px;
                text-align:center;
              "
            >
              <img
                class="brand-logo"
                src="${TICKETAT_LOGO}"
                alt="Ticketat"
                width="150"
                height="68"
                style="
                  display:block;
                  width:150px;
                  height:68px;
                  max-width:150px;
                  border:0;
                  margin:0 auto;
                  object-fit:contain;
                "
              />
            </td>

            ${
              safePartnerLogo
                ? `
                  <td
                    class="brand-spacer"
                    width="20"
                    style="width:20px;min-width:20px;font-size:0;line-height:0;"
                  >&nbsp;</td>

                  <td
                    class="brand-divider"
                    width="1"
                    bgcolor="#e4e8ef"
                    style="
                      width:1px;
                      min-width:1px;
                      height:44px;
                      background-color:#e4e8ef;
                      font-size:0;
                      line-height:0;
                    "
                  >&nbsp;</td>

                  <td
                    class="brand-spacer"
                    width="20"
                    style="width:20px;min-width:20px;font-size:0;line-height:0;"
                  >&nbsp;</td>

                  <td
                    class="brand-cell"
                    align="center"
                    valign="middle"
                    bgcolor="#080a0f"
                    style="
                      background-color:#080a0f;
                      border-radius:12px;
                      padding:12px;
                      text-align:center;
                    "
                  >
                    <img
                      class="brand-logo"
                      src="${safePartnerLogo}"
                      alt="Event Partner"
                      width="150"
                      height="68"
                      style="
                        display:block;
                        width:150px;
                        height:68px;
                        max-width:150px;
                        border:0;
                        margin:0 auto;
                        object-fit:contain;
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
      <div class="email-content" style="padding:30px 28px;">

        <!-- TITLE -->
        <div style="text-align:center;">

          <span style="
            display:inline-block;
            padding:7px 13px;
            background-color:#eaf8f0;
            border:1px solid #cdebdc;
            border-radius:30px;
            color:#14764f;
            font-size:10px;
            font-weight:700;
            letter-spacing:0.8px;
          ">
            BOOKING CONFIRMED
          </span>

          <h1 class="email-title" style="
            margin:18px 0 8px;
            color:#173b30;
            font-size:26px;
            line-height:1.35;
            font-weight:700;
            text-align:center;
          ">
            Booking &amp; Payment Confirmed
          </h1>

          <p class="email-subtitle" dir="rtl" style="
            margin:0;
            color:#68758a;
            font-size:15px;
            line-height:1.9;
            text-align:center;
          ">
            تم تأكيد الحجز والدفع بنجاح
          </p>

          <div style="
            width:42px;
            height:3px;
            margin:20px auto 0;
            background-color:${accentColor};
            border-radius:3px;
            font-size:0;
            line-height:0;
          ">&nbsp;</div>

        </div>

        <!-- ENGLISH GREETING -->
        <div style="margin-top:28px;">

          <p style="
            margin:0 0 10px;
            color:#202938;
            font-size:15px;
            line-height:1.8;
          ">
            Hello <strong>${safeName}</strong>,
          </p>

          <p class="message-text" style="
            margin:0;
            color:#566276;
            font-size:14px;
            line-height:1.9;
          ">
            Thank you for choosing Ticketat. We're pleased to confirm
            that your booking and payment have been completed successfully.
            We appreciate your trust and look forward to giving you a
            wonderful event experience.
          </p>

        </div>

        <!-- BOOKING STATUS -->
        <div class="status-card" style="
          margin:22px 0;
          padding:20px;
          background-color:#effaf5;
          border:1px solid #cdebdc;
          border-left:4px solid ${accentColor};
          border-radius:10px;
        ">

          <p style="
            margin:0 0 9px;
            color:#14764f;
            font-size:16px;
            font-weight:700;
            line-height:1.6;
          ">
            <span style="font-size:18px;">&#10003;</span>
            Payment Completed Successfully
          </p>

          <p class="message-text" style="
            margin:0;
            color:#456b59;
            font-size:13px;
            line-height:1.85;
          ">
            Your payment has been received and your booking is confirmed.
            You're all set for your event!
          </p>

        </div>

        <!-- EVENT DETAILS -->
        <div class="event-card" style="
          margin:24px 0 18px;
          padding:20px;
          background-color:#f6f8fc;
          border:1px solid #e5eaf3;
          border-radius:10px;
          overflow-wrap:anywhere;
          word-wrap:break-word;
        ">

          <p style="
            margin:0 0 9px;
            color:#7b8798;
            font-size:10px;
            font-weight:700;
            letter-spacing:1px;
          ">
            EVENT DETAILS
          </p>

          <p class="event-name" style="
            margin:0;
            color:#1e3a67;
            font-size:20px;
            font-weight:700;
            line-height:1.55;
            overflow-wrap:anywhere;
            word-wrap:break-word;
          ">
            ${safeEventName}
          </p>

          <div style="
            height:1px;
            margin:16px 0;
            background-color:#e5eaf3;
            font-size:0;
            line-height:0;
          ">&nbsp;</div>

          <p dir="rtl" style="
            margin:0;
            color:#7b8798;
            font-size:13px;
            line-height:1.8;
          ">
            تفاصيل الفعالية
          </p>

        </div>

        <!-- NEXT STEPS -->
        <h2 class="section-title" style="
          margin:26px 0 10px;
          color:#202938;
          font-size:18px;
          line-height:1.5;
          font-weight:700;
        ">
          What's Next?
        </h2>

        <p class="message-text" style="
          margin:0;
          color:#566276;
          font-size:14px;
          line-height:1.9;
        ">
          Your event tickets and QR codes will be sent in a separate
          email within a few minutes. Please check your inbox.
          If you don't receive the email, kindly check your Spam or
          Junk folder as well.
        </p>

        <div class="email-divider" style="
          height:1px;
          margin:28px 0;
          background-color:#e9edf3;
          font-size:0;
          line-height:0;
        ">&nbsp;</div>

        <!-- ARABIC CONTENT -->
        <div class="arabic-section" dir="rtl" style="
          direction:rtl;
          text-align:right;
          font-family:Arial,Tahoma,sans-serif;
        ">

          <p style="
            margin:0 0 10px;
            color:#202938;
            font-size:15px;
            line-height:1.9;
          ">
            أهلًا <strong>${safeName}</strong>،
          </p>

          <p class="message-text" style="
            margin:0;
            color:#566276;
            font-size:14px;
            line-height:2;
          ">
            شكرًا لاختيارك Ticketat. يسعدنا تأكيد اكتمال عملية الحجز
            والدفع بنجاح. نُقدّر ثقتك بنا، ونتمنى لك تجربة مميزة
            في الفعالية.
          </p>

          <!-- ARABIC CONFIRMATION -->
          <div class="status-card" style="
            margin:22px 0;
            padding:18px;
            background-color:#effaf5;
            border:1px solid #cdebdc;
            border-right:4px solid ${accentColor};
            border-radius:10px;
          ">

            <p style="
              margin:0 0 9px;
              color:#14764f;
              font-size:15px;
              font-weight:700;
              line-height:1.8;
            ">
              <span style="font-size:18px;">&#10003;</span>
              تم تأكيد الحجز والدفع
            </p>

            <p style="
              margin:0;
              color:#456b59;
              font-size:13px;
              line-height:2;
            ">
              تم استلام المبلغ المطلوب وتأكيد حجزك بنجاح.
              نتمنى لك وقتًا ممتعًا وتجربة رائعة في الفعالية.
            </p>

          </div>

          <h2 class="section-title" style="
            margin:26px 0 10px;
            color:#202938;
            font-size:18px;
            line-height:1.7;
            font-weight:700;
          ">
            الخطوة التالية
          </h2>

          <p class="message-text" style="
            margin:0;
            color:#566276;
            font-size:14px;
            line-height:2;
          ">
            سيتم إرسال التذاكر ورموز QR الخاصة بك في رسالة بريد
            إلكتروني منفصلة خلال دقائق قليلة. يُرجى متابعة صندوق
            الوارد، وفي حال عدم وصول الرسالة يُرجى التحقق من مجلد
            الرسائل غير المرغوب فيها (Spam/Junk).
          </p>

        </div>

        <!-- THANK YOU -->
        <div class="thank-you" style="
          margin-top:28px;
          padding:22px 18px;
          background-color:#f1faf5;
          border:1px solid #dcefe4;
          border-radius:10px;
          text-align:center;
        ">

          <p style="
            margin:0 0 8px;
            color:#173b30;
            font-size:15px;
            font-weight:700;
            line-height:1.8;
          ">
            Thank You for Choosing Ticketat
          </p>

          <p style="
            margin:0;
            color:#65738a;
            font-size:13px;
            line-height:1.9;
            direction:rtl;
          ">
            شكرًا لثقتك في Ticketat، ونتمنى لك تجربة رائعة!
          </p>

        </div>

      </div>

      <!-- FOOTER -->
      <div class="email-footer" style="
        padding:24px 18px;
        background-color:#f8f9fc;
        border-top:1px solid #e9edf3;
        text-align:center;
      ">

        <p style="
          margin:0 0 7px;
          color:#7b8494;
          font-size:11px;
          line-height:1.8;
        ">
          This is an automated email. Please do not reply directly.
        </p>

        <p dir="rtl" style="
          margin:0;
          color:#7b8494;
          font-size:11px;
          line-height:1.9;
        ">
          هذه رسالة تلقائية، يُرجى عدم الرد عليها مباشرةً.
        </p>

        <p style="
          margin:15px 0 5px;
          color:${accentColor};
          font-size:13px;
          font-weight:700;
        ">
          Ticketat.eg
        </p>

        <p style="
          margin:0;
          color:#9aa3b2;
          font-size:10px;
          line-height:1.7;
        ">
          &copy; 2025 Ticketat. All rights reserved.
        </p>

      </div>

    </div>

  </div>

</body>
</html>
`;

    await transport.sendMail({
      from: '"Ticketat.eg" <anfahmy92@gmail.com>',
      to: to.trim(),
      subject,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Booking confirmation email sent successfully.",
    });
  } catch (error) {
    console.error("Email sending error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email.",
    });
  }
};
