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
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#f3f5f9;
  font-family:Arial,Helvetica,sans-serif;
  color:#202938;
">

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

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="width:100%;background-color:#f3f5f9;"
  >
    <tr>
      <td align="center" style="padding:36px 16px;">

        <!-- MAIN CONTAINER -->
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            max-width:700px;
            background-color:#ffffff;
            border:1px solid #e6eaf0;
            border-radius:16px;
            overflow:hidden;
          "
        >

          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="
              padding:28px 30px;
              background-color:#ffffff;
              border-bottom:1px solid #edf0f4;
            ">

              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
              >
                <tr>
                  <!-- TICKETAT LOGO -->
                  <td align="center" valign="middle" style="padding:0 22px;">

                    <img
                      src="${TICKETAT_LOGO}"
                      alt="Ticketat"
                      width="155"
                      style="
                        display:block;
                        width:155px;
                        max-width:100%;
                        height:auto;
                        border:0;
                      "
                    />

                  </td>

                  ${
                    safePartnerLogo
                      ? `
                        <!-- LOGO DIVIDER -->
                        <td
                          width="1"
                          style="
                            width:1px;
                            background-color:#e4e8ef;
                            font-size:0;
                            line-height:0;
                          "
                        >
                          &nbsp;
                        </td>

                        <!-- PARTNER LOGO -->
                        <td align="center" valign="middle" style="padding:0 22px;">

                          <img
                            src="${safePartnerLogo}"
                            alt="Event Partner"
                            width="130"
                            style="
                              display:block;
                              width:130px;
                              max-width:100%;
                              max-height:58px;
                              height:auto;
                              border:0;
                            "
                          />

                        </td>
                      `
                      : ""
                  }
                </tr>
              </table>

            </td>
          </tr>

          <!-- TITLE SECTION -->
          <tr>
            <td align="center" style="padding:42px 32px 28px;">

              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
              >
                <tr>
                  <td align="center" style="
                    padding:9px 16px;
                    background-color:#fff5df;
                    border:1px solid #f8e5b8;
                    border-radius:30px;
                    color:#946200;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1px;
                  ">
                    PAYMENT UPDATE
                  </td>
                </tr>
              </table>

              <h1 style="
                margin:22px 0 10px;
                color:#172b4d;
                font-size:30px;
                line-height:1.35;
                font-weight:700;
                text-align:center;
              ">
                Partial Payment Received
              </h1>

              <p style="
                margin:0;
                color:#68758a;
                font-size:17px;
                line-height:1.7;
                text-align:center;
                direction:rtl;
              ">
                تم استلام الدفعة الجزئية بنجاح
              </p>

              <div style="
                width:48px;
                height:4px;
                margin:24px auto 0;
                background-color:#2563eb;
                border-radius:4px;
                font-size:0;
                line-height:0;
              ">
                &nbsp;
              </div>

            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:0 36px 36px;">

              <!-- GREETING -->
              <p style="
                margin:0 0 14px;
                color:#202938;
                font-size:17px;
                line-height:1.7;
              ">
                Hello <strong>${safeName}</strong>,
              </p>

              <p style="
                margin:0 0 28px;
                color:#5e697b;
                font-size:15px;
                line-height:1.9;
              ">
                Thank you for choosing Ticketat. We're pleased to confirm
                that your partial payment has been received and recorded
                successfully for your event.
              </p>

              <!-- EVENT CARD -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width:100%;
                  background-color:#f7f9fd;
                  border:1px solid #e5eaf4;
                  border-radius:12px;
                "
              >
                <tr>
                  <td style="padding:23px 25px;">

                    <p style="
                      margin:0 0 10px;
                      color:#7b8798;
                      font-size:11px;
                      font-weight:700;
                      letter-spacing:1px;
                      text-transform:uppercase;
                    ">
                      EVENT DETAILS
                    </p>

                    <p style="
                      margin:0;
                      color:#1e3a67;
                      font-size:21px;
                      font-weight:700;
                      line-height:1.6;
                      overflow-wrap:anywhere;
                    ">
                      ${safeEventName}
                    </p>

                  </td>
                </tr>
              </table>

              <!-- PAYMENT STATUS -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width:100%;
                  margin-top:20px;
                  background-color:#fffaf0;
                  border:1px solid #f3e4bd;
                  border-radius:12px;
                "
              >
                <tr>
                  <td width="5" style="
                    width:5px;
                    background-color:#e7a52d;
                    border-radius:12px 0 0 12px;
                    font-size:0;
                    line-height:0;
                  ">
                    &nbsp;
                  </td>

                  <td style="padding:22px 24px;">

                    <p style="
                      margin:0 0 9px;
                      color:#805600;
                      font-size:15px;
                      font-weight:700;
                      line-height:1.6;
                    ">
                      Payment Status: Partially Paid
                    </p>

                    <p style="
                      margin:0;
                      color:#776548;
                      font-size:14px;
                      line-height:1.9;
                    ">
                      Your payment has been recorded successfully.
                      Your booking is not yet fully paid or confirmed.
                      Please complete any remaining payment according
                      to the instructions provided for your event.
                    </p>

                  </td>
                </tr>
              </table>

              <!-- NEXT STEPS -->
              <h2 style="
                margin:32px 0 12px;
                color:#202938;
                font-size:19px;
                font-weight:700;
                line-height:1.5;
              ">
                What's Next?
              </h2>

              <p style="
                margin:0;
                color:#5e697b;
                font-size:14px;
                line-height:2;
              ">
                Once the required payment has been completed and your
                booking is fully confirmed, your tickets and QR codes
                will be sent in a separate email according to the
                event's booking process. Please check your inbox and
                Spam/Junk folder for the confirmation and ticket emails.
              </p>

              <!-- SEPARATOR -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%;margin:34px 0;"
              >
                <tr>
                  <td style="
                    border-top:1px solid #e9edf3;
                    font-size:0;
                    line-height:0;
                  ">
                    &nbsp;
                  </td>
                </tr>
              </table>

              <!-- ARABIC CONTENT -->
              <div dir="rtl" style="
                text-align:right;
                font-family:Arial,Tahoma,sans-serif;
              ">

                <p style="
                  margin:0 0 14px;
                  color:#202938;
                  font-size:17px;
                  line-height:1.9;
                ">
                  أهلًا <strong>${safeName}</strong>،
                </p>

                <p style="
                  margin:0 0 26px;
                  color:#5e697b;
                  font-size:15px;
                  line-height:2;
                ">
                  شكرًا لاختيارك Ticketat. يسعدنا تأكيد استلام وتسجيل
                  الدفعة الجزئية الخاصة بحجزك بنجاح.
                </p>

                <!-- ARABIC STATUS -->
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    width:100%;
                    background-color:#fffaf0;
                    border:1px solid #f3e4bd;
                    border-radius:12px;
                  "
                >
                  <tr>
                    <td style="padding:22px 24px;">

                      <p style="
                        margin:0 0 10px;
                        color:#805600;
                        font-size:15px;
                        font-weight:700;
                        line-height:1.8;
                      ">
                        حالة الدفع: تم دفع جزء من المبلغ
                      </p>

                      <p style="
                        margin:0;
                        color:#776548;
                        font-size:14px;
                        line-height:2;
                      ">
                        تم تسجيل دفعتك بنجاح، ولكن الحجز لم يتم دفع
                        قيمته بالكامل أو تأكيده نهائيًا حتى الآن.
                        يُرجى استكمال أي مبلغ متبقٍ وفقًا لتعليمات
                        الدفع الخاصة بالفعالية.
                      </p>

                    </td>
                  </tr>
                </table>

                <h2 style="
                  margin:30px 0 12px;
                  color:#202938;
                  font-size:19px;
                  font-weight:700;
                  line-height:1.7;
                ">
                  الخطوة التالية
                </h2>

                <p style="
                  margin:0;
                  color:#5e697b;
                  font-size:14px;
                  line-height:2.1;
                ">
                  بعد استكمال المبلغ المطلوب وتأكيد الحجز بالكامل،
                  سيتم إرسال التذاكر وأكواد QR في رسالة بريد إلكتروني
                  منفصلة وفقًا لنظام الحجز الخاص بالفعالية. يُرجى
                  متابعة البريد الوارد ومجلد الرسائل غير المرغوب فيها
                  (Spam/Junk) لاستلام رسالة التأكيد والتذاكر.
                </p>

              </div>

              <!-- THANK YOU PANEL -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width:100%;
                  margin-top:34px;
                  background-color:#f5f8ff;
                  border:1px solid #e4ebfb;
                  border-radius:12px;
                "
              >
                <tr>
                  <td align="center" style="padding:25px 20px;">

                    <p style="
                      margin:0 0 9px;
                      color:#1e3a67;
                      font-size:16px;
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

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="
              padding:26px 28px;
              background-color:#f8f9fc;
              border-top:1px solid #e9edf3;
            ">

              <p style="
                margin:0 0 8px;
                color:#7b8494;
                font-size:12px;
                line-height:1.8;
              ">
                This is an automated email. Please do not reply directly.
              </p>

              <p style="
                margin:0;
                color:#7b8494;
                font-size:12px;
                line-height:1.9;
                direction:rtl;
              ">
                هذه رسالة تلقائية، يُرجى عدم الرد عليها مباشرةً.
              </p>

              <p style="
                margin:17px 0 5px;
                color:#2563eb;
                font-size:14px;
                font-weight:700;
                letter-spacing:0.3px;
              ">
                Ticketat.eg
              </p>

              <p style="
                margin:0;
                color:#9aa3b2;
                font-size:11px;
                line-height:1.7;
              ">
                &copy; ${new Date().getFullYear()} Ticketat. All rights reserved.
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
