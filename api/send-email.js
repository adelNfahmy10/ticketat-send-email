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

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Partial Payment Received | Ticketat</title>

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
    }

    img {
      display: block;
      border: 0;
      outline: none;
      text-decoration: none;
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
      padding: 22px 16px;
      border-bottom: 1px solid #edf0f5;
      background-color: #ffffff;
    }

    .brand-row {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 20px;
    }

    .brand-logo {
      margin: 0 10px;
      width: auto;
      max-width: 155px;
      max-height: 58px;
      height: auto;
      object-fit: contain;
    }

    .brand-divider {
      flex: 0 0 1px;
      width: 1px;
      height: 38px;
      background-color: #e4e8ef;
    }

    .email-content {
      padding: 30px 28px;
    }

    .email-title {
      margin: 18px 0 8px;
      color: #172b4d;
      font-size: 26px;
      line-height: 1.3;
      font-weight: 700;
      text-align: center;
    }

    .email-subtitle {
      margin: 0;
      color: #68758a;
      font-size: 15px;
      line-height: 1.8;
      text-align: center;
      direction: rtl;
    }

    .message-text {
      margin: 0;
      color: #566276;
      font-size: 14px;
      line-height: 1.9;
    }

    .event-card {
      margin: 22px 0 16px;
      padding: 18px 20px;
      background-color: #f6f8fc;
      border: 1px solid #e5eaf3;
      border-radius: 10px;
      overflow-wrap: anywhere;
    }

    .status-card {
      margin: 16px 0 24px;
      padding: 17px 18px;
      background-color: #fff9ed;
      border: 1px solid #f3e4bd;
      border-left: 4px solid #e7a52d;
      border-radius: 9px;
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
    }

    .thank-you {
      margin-top: 26px;
      padding: 20px 16px;
      background-color: #f4f7ff;
      border: 1px solid #e4ebfb;
      border-radius: 10px;
      text-align: center;
    }

    .email-footer {
      padding: 22px 18px;
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
        padding: 18px 8px !important;
      }

      .brand-row {
        gap: 12px !important;
      }

      .brand-logo {
        max-width: 125px !important;
        max-height: 48px !important;
      }

      .brand-divider {
        height: 32px !important;
      }

      .email-content {
        padding: 24px 17px !important;
      }

      .email-title {
        font-size: 23px !important;
        line-height: 1.35 !important;
      }

      .email-subtitle {
        font-size: 14px !important;
      }

      .message-text {
        font-size: 14px !important;
        line-height: 1.85 !important;
      }

      .event-card {
        margin: 18px 0 14px !important;
        padding: 16px !important;
      }

      .status-card {
        margin: 14px 0 22px !important;
        padding: 15px !important;
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
  </style>
</head>

<body>

  <!-- PREVIEW TEXT -->
  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;
    color:transparent;
    mso-hide:all;
  ">
    Your partial payment for ${safeEventName} has been received successfully.
  </div>

  <div class="email-wrapper">
    <div class="email-container">

      <!-- BRAND HEADER -->
      <div class="brand-header">
        <div class="brand-row">

          <img
            class="brand-logo"
            src="${TICKETAT_LOGO}"
            alt="Ticketat"
            width="155"
          />

          ${
            safePartnerLogo
              ? `
                <span class="brand-divider"></span>

                <img
                  class="brand-logo"
                  src="${safePartnerLogo}"
                  alt="Event Partner"
                  width="155"
                />
              `
              : ""
          }

        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="email-content">

        <!-- TITLE -->
        <div style="text-align:center;">

          <span style="
            display:inline-block;
            padding:7px 12px;
            background-color:#fff5df;
            border:1px solid #f8e5b8;
            border-radius:30px;
            color:#946200;
            font-size:10px;
            font-weight:700;
            letter-spacing:0.8px;
          ">
            PAYMENT UPDATE
          </span>

          <h1 class="email-title">
            Partial Payment Received
          </h1>

          <p class="email-subtitle">
            تم استلام الدفعة الجزئية بنجاح
          </p>

          <div style="
            width:40px;
            height:3px;
            margin:20px auto 0;
            background-color:#2563eb;
            border-radius:3px;
            font-size:0;
            line-height:0;
          ">
            &nbsp;
          </div>

        </div>

        <!-- ENGLISH MESSAGE -->
        <div style="margin-top:28px;">

          <p style="
            margin:0 0 10px;
            color:#202938;
            font-size:15px;
            line-height:1.8;
          ">
            Hello <strong>${safeName}</strong>,
          </p>

          <p class="message-text">
            Thank you for choosing Ticketat. We're pleased to confirm
            that your partial payment has been received and recorded
            successfully for your event.
          </p>

        </div>

        <!-- EVENT DETAILS -->
        <div class="event-card">

          <p style="
            margin:0 0 8px;
            color:#7b8798;
            font-size:10px;
            font-weight:700;
            letter-spacing:1px;
          ">
            EVENT DETAILS
          </p>

          <p style="
            margin:0;
            color:#1e3a67;
            font-size:19px;
            font-weight:700;
            line-height:1.55;
            overflow-wrap:anywhere;
          ">
            ${safeEventName}
          </p>

        </div>

        <!-- PAYMENT STATUS -->
        <div class="status-card">

          <p style="
            margin:0 0 8px;
            color:#805600;
            font-size:14px;
            font-weight:700;
            line-height:1.6;
          ">
            Payment Status: Partially Paid
          </p>

          <p style="
            margin:0;
            color:#776548;
            font-size:13px;
            line-height:1.85;
          ">
            Your payment has been recorded successfully. Your booking
            is not yet fully paid or confirmed. Please complete any
            remaining payment according to the instructions provided
            for your event.
          </p>

        </div>

        <!-- NEXT STEPS -->
        <h2 class="section-title">
          What's Next?
        </h2>

        <p class="message-text">
          Once the required payment has been completed and your booking
          is fully confirmed, your tickets and QR codes will be sent in
          a separate email according to the event's booking process.
          Please check your inbox and Spam/Junk folder.
        </p>

        <div class="email-divider"></div>

        <!-- ARABIC MESSAGE -->
        <div class="arabic-section">

          <p style="
            margin:0 0 10px;
            color:#202938;
            font-size:15px;
            line-height:1.9;
          ">
            أهلًا <strong>${safeName}</strong>،
          </p>

          <p class="message-text" style="margin-bottom:18px;">
            شكرًا لاختيارك Ticketat. يسعدنا تأكيد استلام وتسجيل
            الدفعة الجزئية الخاصة بحجزك بنجاح.
          </p>

          <!-- ARABIC PAYMENT STATUS -->
          <div class="status-card">

            <p style="
              margin:0 0 8px;
              color:#805600;
              font-size:14px;
              font-weight:700;
              line-height:1.8;
            ">
              حالة الدفع: تم دفع جزء من المبلغ
            </p>

            <p style="
              margin:0;
              color:#776548;
              font-size:13px;
              line-height:2;
            ">
              تم تسجيل دفعتك بنجاح، ولكن الحجز لم يتم دفع قيمته
              بالكامل أو تأكيده نهائيًا حتى الآن. يُرجى استكمال أي
              مبلغ متبقٍ وفقًا لتعليمات الدفع الخاصة بالفعالية.
            </p>

          </div>

          <h2 class="section-title">
            الخطوة التالية
          </h2>

          <p class="message-text">
            بعد استكمال المبلغ المطلوب وتأكيد الحجز بالكامل، سيتم
            إرسال التذاكر وأكواد QR في رسالة بريد إلكتروني منفصلة
            وفقًا لنظام الحجز الخاص بالفعالية. يُرجى متابعة البريد
            الوارد ومجلد الرسائل غير المرغوب فيها (Spam/Junk).
          </p>

        </div>

        <!-- THANK YOU -->
        <div class="thank-you">

          <p style="
            margin:0 0 7px;
            color:#1e3a67;
            font-size:15px;
            font-weight:700;
            line-height:1.7;
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
      <div class="email-footer">

        <p style="
          margin:0 0 7px;
          color:#7b8494;
          font-size:11px;
          line-height:1.8;
        ">
          This is an automated email. Please do not reply directly.
        </p>

        <p style="
          margin:0;
          color:#7b8494;
          font-size:11px;
          line-height:1.9;
          direction:rtl;
        ">
          هذه رسالة تلقائية، يُرجى عدم الرد عليها مباشرةً.
        </p>

        <p style="
          margin:15px 0 5px;
          color:#2563eb;
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
