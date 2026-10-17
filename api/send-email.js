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
  <title>Partial Payment Received | Ticketat</title>
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#f4f6fb;
  font-family:Arial,Helvetica,sans-serif;
  color:#252b36;
">

  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;
    color:transparent;
  ">
    Your partial payment has been received successfully for ${safeEventName}.
  </div>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color:#f4f6fb;padding:30px 12px;"
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:650px;
            background-color:#ffffff;
            border-radius:16px;
            overflow:hidden;
            border:1px solid #e8ebf2;
          "
        >

          <!-- HEADER -->
          <tr>
            <td align="center" style="
              padding:30px 20px;
              background-color:#ffffff;
              border-bottom:1px solid #edf0f5;
            ">
              <img
                src="${TICKETAT_LOGO}"
                alt="Ticketat"
                width="170"
                style="
                  display:block;
                  width:170px;
                  max-width:100%;
                  height:auto;
                  border:0;
                "
              />

              ${
                safePartnerLogo
                  ? `
                    <div style="
                      margin-top:20px;
                      padding-top:18px;
                      border-top:1px solid #edf0f5;
                    ">
                      <p style="
                        margin:0 0 12px;
                        color:#8991a0;
                        font-size:12px;
                      ">
                        Event Partner
                      </p>

                      <img
                        src="${safePartnerLogo}"
                        alt="Event Partner"
                        width="130"
                        style="
                          display:block;
                          width:130px;
                          max-width:100%;
                          max-height:65px;
                          height:auto;
                          object-fit:contain;
                          margin:0 auto;
                          border:0;
                        "
                      />
                    </div>
                  `
                  : ""
              }
            </td>
          </tr>

          <!-- MAIN HEADING -->
          <tr>
            <td align="center" style="padding:32px 24px 18px;">

              <div style="
                display:inline-block;
                padding:9px 18px;
                margin-bottom:20px;
                border-radius:30px;
                background-color:#fff4dc;
                color:#a86b00;
                font-size:12px;
                font-weight:700;
                letter-spacing:0.5px;
              ">
                PARTIAL PAYMENT
              </div>

              <h1 style="
                margin:0 0 12px;
                color:#2563eb;
                font-size:28px;
                font-weight:700;
                line-height:1.4;
              ">
                Partial Payment Received
              </h1>

              <h2 style="
                margin:0;
                color:#333333;
                font-size:21px;
                font-weight:600;
                line-height:1.8;
                direction:rtl;
              ">
                تم استلام الدفعة الجزئية
              </h2>

            </td>
          </tr>

          <!-- MESSAGE -->
          <tr>
            <td style="padding:10px 30px 30px;">

              <p style="
                margin:0 0 18px;
                color:#252b36;
                font-size:16px;
                line-height:1.8;
              ">
                Hello <strong>${safeName}</strong>,
              </p>

              <p style="
                margin:0 0 20px;
                color:#596273;
                font-size:15px;
                line-height:1.9;
              ">
                Thank you for choosing Ticketat! We have successfully
                received and recorded your partial payment for the
                following event.
              </p>

              <!-- EVENT DETAILS -->
              <div style="
                margin:24px 0;
                padding:20px;
                background-color:#f5f8ff;
                border:1px solid #e0e9ff;
                border-radius:12px;
              ">
                <p style="
                  margin:0 0 8px;
                  color:#6b7280;
                  font-size:12px;
                  font-weight:600;
                  text-transform:uppercase;
                  letter-spacing:0.6px;
                ">
                  Event Name
                </p>

                <p style="
                  margin:0;
                  color:#1d4ed8;
                  font-size:20px;
                  font-weight:700;
                  line-height:1.6;
                  overflow-wrap:anywhere;
                ">
                  ${safeEventName}
                </p>
              </div>

              <!-- PAYMENT STATUS -->
              <div style="
                margin:24px 0;
                padding:18px 20px;
                background-color:#fff9ed;
                border-left:4px solid #f0ad35;
                border-radius:8px;
              ">
                <p style="
                  margin:0 0 8px;
                  color:#8a5a00;
                  font-size:15px;
                  font-weight:700;
                ">
                  Your Payment Status: Partially Paid
                </p>

                <p style="
                  margin:0;
                  color:#725a32;
                  font-size:14px;
                  line-height:1.8;
                ">
                  Your payment has been recorded successfully. Please note
                  that your booking is not yet fully paid or confirmed
                  unless you receive a separate booking confirmation.
                </p>
              </div>

              <h3 style="
                margin:28px 0 12px;
                color:#252b36;
                font-size:17px;
                font-weight:700;
              ">
                What's Next?
              </h3>

              <p style="
                margin:0 0 20px;
                color:#596273;
                font-size:14px;
                line-height:1.9;
              ">
                Please follow the payment instructions provided for your
                event to settle any remaining balance. Once the required
                payment is completed and your booking is fully confirmed,
                your tickets and QR codes will be sent in a separate email
                according to the event's booking process. Please keep an
                eye on your inbox and Spam/Junk folder.
              </p>

              <div style="
                height:1px;
                background-color:#edf0f5;
                margin:28px 0;
              "></div>

              <!-- ARABIC MESSAGE -->
              <div dir="rtl" style="
                text-align:right;
                font-family:Arial,Tahoma,sans-serif;
              ">

                <p style="
                  margin:0 0 18px;
                  color:#252b36;
                  font-size:16px;
                  line-height:1.9;
                ">
                  أهلًا <strong>${safeName}</strong>،
                </p>

                <p style="
                  margin:0 0 20px;
                  color:#596273;
                  font-size:15px;
                  line-height:2;
                ">
                  شكرًا لاختيارك Ticketat! بنأكد لك إننا استلمنا وسجّلنا
                  الدفعة الجزئية بنجاح الخاصة بالفعالية الموضحة أعلاه.
                </p>

                <div style="
                  margin:22px 0;
                  padding:18px;
                  background-color:#fff9ed;
                  border-right:4px solid #f0ad35;
                  border-radius:8px;
                ">
                  <p style="
                    margin:0 0 8px;
                    color:#8a5a00;
                    font-size:15px;
                    font-weight:700;
                  ">
                    حالة الدفع: تم دفع جزء من المبلغ
                  </p>

                  <p style="
                    margin:0;
                    color:#725a32;
                    font-size:14px;
                    line-height:2;
                  ">
                    تم تسجيل دفعتك بنجاح. يُرجى العلم أن الحجز لا يُعتبر
                    مدفوعًا بالكامل أو مؤكدًا إلا بعد استكمال المبلغ
                    المطلوب واستلام تأكيد الحجز.
                  </p>
                </div>

                <h3 style="
                  margin:26px 0 12px;
                  color:#252b36;
                  font-size:17px;
                  font-weight:700;
                ">
                  الخطوة التالية
                </h3>

                <p style="
                  margin:0 0 20px;
                  color:#596273;
                  font-size:14px;
                  line-height:2;
                ">
                  يُرجى اتباع تعليمات الدفع الخاصة بالفعالية لاستكمال
                  أي مبلغ متبقٍ. بعد استكمال المبلغ المطلوب وتأكيد الحجز،
                  سيتم إرسال التذاكر وأكواد QR في رسالة بريد إلكتروني
                  منفصلة وفقًا لنظام الحجز الخاص بالفعالية. يُرجى متابعة
                  البريد الوارد ومجلد الرسائل غير المرغوب فيها (Spam/Junk).
                </p>

              </div>

              <!-- THANK YOU -->
              <div style="
                margin-top:28px;
                padding:22px 20px;
                background-color:#f7f8fb;
                border-radius:12px;
                text-align:center;
              ">
                <p style="
                  margin:0 0 8px;
                  color:#252b36;
                  font-size:16px;
                  font-weight:700;
                ">
                  Thank you for choosing Ticketat!
                </p>

                <p style="
                  margin:0;
                  color:#7b8494;
                  font-size:13px;
                  line-height:1.8;
                  direction:rtl;
                ">
                  شكرًا لثقتك في Ticketat، ونتمنى لك تجربة رائعة!
                </p>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="
              padding:24px 20px;
              background-color:#f9fafc;
              border-top:1px solid #edf0f5;
            ">
              <p style="
                margin:0 0 8px;
                color:#687184;
                font-size:12px;
                line-height:1.8;
              ">
                This is an automated email. Please do not reply directly
                to this message.
              </p>

              <p style="
                margin:0;
                color:#687184;
                font-size:12px;
                line-height:1.8;
                direction:rtl;
              ">
                هذه رسالة تلقائية، يُرجى عدم الرد عليها مباشرةً.
              </p>

              <p style="
                margin:16px 0 0;
                color:#2563eb;
                font-size:13px;
                font-weight:700;
              ">
                Ticketat.eg
              </p>

              <p style="
                margin:6px 0 0;
                color:#9aa2b1;
                font-size:11px;
              ">
                © ${new Date().getFullYear()} Ticketat. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

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
