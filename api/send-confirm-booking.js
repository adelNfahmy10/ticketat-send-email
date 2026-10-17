// const nodemailer = require("nodemailer");

// module.exports = async (req, res) => {

//     // ✅ CORS FIX (مهم جدًا)
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

//     // preflight request
//     if (req.method === "OPTIONS") {
//         return res.status(200).end();
//     }

//     if (req.method !== "POST") {
//         return res.status(405).json({
//             message: "Method not allowed"
//         });
//     }

//     try {

//         const { to, userName, eventName } = req.body;

//         const transport = nodemailer.createTransport({
//             host: "smtp-relay.brevo.com",
//             port: 587,
//             secure: false,
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASS
//             }
//         });

//         await transport.sendMail({
//             from: "Ticketat.eg <anfahmy92@gmail.com>",
//             to,
//             subject: "Ticketat - Booking Confirmation | تأكيد الحجز",
//             html:`
//             <div style="font-family:Arial,sans-serif;background:#f4f6f9;color:#2c3e50;">

//                 <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:12px;padding:15px;border:1px solid #e5e5e5;">

//                     <!-- Logos -->
//                     <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto;">
//                         <tr>
//                             <td align="center" style="padding:10px;">
//                                 <table role="presentation" cellpadding="0" cellspacing="0" border="0">
//                                     <tr>
//                                         <td align="center" valign="middle" style="background:#000; border-radius:12px; padding:15px;">
//                                             <img
//                                                 src="https://res.cloudinary.com/ticketat/image/upload/v1782899628/logo-1_tkuiis.png"
//                                                 alt="Ticketat Logo"
//                                                 width="140"
//                                                 style="display:block; max-width:80px; width:100%; height:auto; border:0;"
//                                             >
//                                         </td>

//                                         <td width="20"></td>

//                                         <td align="center" valign="middle" style="background:#000; border-radius:12px; padding:15px;">
//                                             <img
//                                                 src="https://res.cloudinary.com/ticketat/image/upload/v1782948163/IMG_5016.JPG_wrvsjw.jpg"
//                                                 alt="Partner Logo"
//                                                 width="140"
//                                                 style="display:block; max-width:80px; width:100%; height:auto; border:0;"
//                                             >
//                                         </td>
//                                     </tr>
//                                 </table>
//                             </td>
//                         </tr>
//                     </table>

//                     <hr style="border:none;border-top:1px solid #ececec;margin-bottom:10px;">

//                     <div>

//                     </div>
//                     <!-- Greeting -->
//                     <p style="font-size:16px;">
//                     Hello <strong>${userName}</strong>,
//                     </p>

//                     <p dir="rtl" style="font-size:16px;">
//                     مرحبًا <strong>${userName}</strong>،
//                     </p>

//                     <!-- English -->
//                     <p style="line-height:1.8;">
//                     Thank you for choosing <strong>Ticketat</strong>.
//                     We are pleased to confirm that your booking has been completed successfully.
//                     We truly appreciate your trust and hope you enjoy a wonderful experience at our event.
//                     </p>

//                     <!-- Arabic -->
//                     <p dir="rtl" style="line-height:2;">
//                     شكرًا لاختياركم <strong>Ticketat</strong>.
//                     يسعدنا إبلاغكم بأنه تم إتمام عملية الحجز بنجاح.
//                     نُقدّر ثقتكم بنا، ونتمنى أن تنال خدماتنا رضاكم وأن تستمتعوا بتجربة مميزة في الفعالية.
//                     </p>

//                     <!-- Event -->
//                     <div style="background:#f8f9fa;padding:18px;border-radius:10px;border-left:5px solid #27ae60;margin:30px 0;">

//                     <p style="margin:0;font-size:14px;color:#888;">
//                         EVENT
//                     </p>

//                     <p dir="rtl" style="margin:10px 0 0;font-size:14px;color:#888;">
//                         الفعالية
//                     </p>

//                     <h2 style="margin:15px 0 0;color:#2c3e50;">
//                         ${eventName}
//                     </h2>

//                     </div>

//                     <!-- Next Step -->
//                     <div style="background:#eef7ff;padding:20px;border-radius:10px;border-left:5px solid #3498db;">

//                     <h3 style="margin-top:0;color:#3498db;">
//                         📩 What's Next?
//                     </h3>

//                     <p style="line-height:1.8;">
//                         Your event tickets and QR Codes will be sent to you in a
//                         <strong>separate email</strong> shortly.
//                         Please keep an eye on your inbox.
//                         If you don't receive the email within a few minutes,
//                         kindly check your Spam or Junk folder.
//                     </p>

//                     <hr style="border:none;border-top:1px solid #dbe9f5;margin:25px 0;">

//                     <h3 dir="rtl" style="margin-top:0;color:#3498db;">
//                         📩 الخطوة التالية
//                     </h3>

//                     <p dir="rtl" style="line-height:2;">
//                         سيتم إرسال التذاكر الخاصة بكم ورموز
//                         <strong>QR Code</strong>
//                         في رسالة بريد إلكتروني منفصلة خلال دقائق قليلة.
//                         يُرجى متابعة صندوق الوارد،
//                         وفي حال عدم وصول الرسالة يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam).
//                     </p>

//                     </div>

//                     <!-- Thank You -->
//                     <div style="margin-top:35px;background:#fffaf2;padding:20px;border-radius:10px;border-left:5px solid #f39c12;">

//                     <p style="margin:0;line-height:1.8;">
//                         💛 Thank you for trusting Ticketat.
//                         We hope our service met your expectations and wish you an unforgettable event experience.
//                     </p>

//                     <p dir="rtl" style="margin-top:18px;line-height:2;">
//                         💛 شكرًا لثقتكم في Ticketat.
//                         نتمنى أن تكون خدماتنا قد نالت إعجابكم،
//                         ونتطلع لأن تستمتعوا بتجربة رائعة في هذه الفعالية.
//                     </p>

//                     </div>

//                     <!-- Footer -->
//                     <hr style="margin:35px 0;border:none;border-top:1px solid #ececec;">

//                     <p style="text-align:center;color:#666;font-size:14px;">
//                     Need help? Our support team is always happy to assist you.
//                     </p>

//                     <p dir="rtl" style="text-align:center;color:#666;font-size:14px;">
//                     إذا احتجتم لأي مساعدة، يسعد فريق الدعم لدينا بخدمتكم.
//                     </p>

//                     <p style="text-align:center;font-size:12px;color:#999;margin-top:25px;">
//                     © ${new Date().getFullYear()} Ticketat. All rights reserved.
//                     </p>

//                 </div>

//             </div>
//             `

//         });

//         return res.status(200).json({
//           success: true
//         });

//     } catch (error) {
//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

const nodemailer = require("nodemailer");

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

    // Accept partner logos only from Cloudinary HTTPS URLs.
    const safePartnerLogo = isValidImageUrl(partnerLogo)
      ? escapeHtml(partnerLogo.trim())
      : "";

    const subject =
      "Ticketat - Booking & Payment Confirmed | تأكيد الدفع والحجز";

    const accentColor = "#168b63";

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
      <div style="
        font-family:Arial,sans-serif;
        background:#f4f6f9;
        color:#2c3e50;
        padding:20px 10px;
      ">
        <div style="
          max-width:700px;
          margin:auto;
          background:#ffffff;
          border-radius:12px;
          padding:20px;
          border:1px solid #e5e5e5;
        ">

          <!-- Logos -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
          >
            <tr>
              <td align="center" style="padding:10px;">
                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>
                    <!-- Ticketat Logo -->
                    <td
                      align="center"
                      valign="middle"
                      style="
                        background:#000;
                        border-radius:12px;
                        padding:15px;
                      "
                    >
                      <img
                        src="https://res.cloudinary.com/ticketat/image/upload/v1782899628/logo-1_tkuiis.png"
                        alt="Ticketat Logo"
                        width="80"
                        style="
                          display:block;
                          width:80px;
                          height:auto;
                          border:0;
                        "
                      >
                    </td>

                    ${
                      safePartnerLogo
                        ? `
                          <td width="20"></td>
                          <td
                            align="center"
                            valign="middle"
                            style="
                              background:#000;
                              border-radius:12px;
                              padding:15px;
                            "
                          >
                            <img
                              src="${safePartnerLogo}"
                              alt="Partner Logo"
                              width="80"
                              style="
                                display:block;
                                width:80px;
                                height:auto;
                                border:0;
                              "
                            >
                          </td>
                        `
                        : ""
                    }
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <hr style="
            border:none;
            border-top:1px solid #ececec;
            margin:15px 0 25px;
          ">

          <!-- Greeting -->
          <p style="font-size:16px;">
            Hello <strong>${safeName}</strong>,
          </p>

          <p dir="rtl" style="font-size:16px;">
            مرحبًا <strong>${safeName}</strong>،
          </p>

          <!-- Status -->
          <div style="
            background:#f8f9fa;
            padding:18px;
            border-radius:10px;
            border-left:5px solid ${accentColor};
            margin:25px 0;
          ">
            <p style="
              margin:0;
              color:${accentColor};
              font-size:20px;
              font-weight:bold;
            ">
              Booking & Payment Confirmed
            </p>

            <p dir="rtl" style="
              margin:12px 0 0;
              color:${accentColor};
              font-size:20px;
              font-weight:bold;
            ">
              تم تأكيد الحجز والدفع
            </p>
          </div>

          <!-- Main Message -->
          <p style="line-height:1.8;">
            We are pleased to confirm that your booking for
            <strong>${safeEventName}</strong> has been confirmed
            and your payment has been completed successfully.
            Thank you for choosing Ticketat.
          </p>

          <p dir="rtl" style="line-height:2;">
            يسعدنا تأكيد حجزكم في فعالية
            <strong>${safeEventName}</strong>،
            ونؤكد اكتمال عملية الدفع بنجاح.
            شكرًا لاختياركم Ticketat.
          </p>

          <!-- Next Step -->
          <div style="
            background:#eef7ff;
            padding:20px;
            border-radius:10px;
            border-left:5px solid ${accentColor};
            margin:25px 0;
          ">
            <h3 style="margin-top:0;color:${accentColor};">
              📩 What's Next?
            </h3>

            <p style="line-height:1.8;">
              Your tickets and QR codes will be sent in a separate
              email within a few minutes. Please check your inbox
              and your Spam or Junk folder if you do not receive
              the email.
            </p>

            <hr style="
              border:none;
              border-top:1px solid #dbe9f5;
              margin:25px 0;
            ">

            <h3 dir="rtl" style="margin-top:0;color:${accentColor};">
              📩 الخطوة التالية
            </h3>

            <p dir="rtl" style="line-height:2;">
              سيتم إرسال التذاكر ورموز QR الخاصة بكم في رسالة
              بريد إلكتروني منفصلة خلال دقائق قليلة.
              يُرجى متابعة صندوق الوارد والتحقق من مجلد الرسائل
              غير المرغوب فيها (Spam) إذا لم تصلكم الرسالة.
            </p>
          </div>

          <!-- Event -->
          <div style="
            background:#f8f9fa;
            padding:18px;
            border-radius:10px;
            border-left:5px solid #d1d5db;
            margin:25px 0;
          ">
            <p style="margin:0;font-size:13px;color:#6b7280;">
              EVENT
            </p>

            <h2 style="margin:10px 0;color:#2c3e50;">
              ${safeEventName}
            </h2>

            <p dir="rtl" style="margin:0;font-size:13px;color:#6b7280;">
              الفعالية
            </p>
          </div>

          <!-- Thank You -->
          <div style="
            margin-top:30px;
            background:#fffaf2;
            padding:20px;
            border-radius:10px;
            border-left:5px solid #f39c12;
          ">
            <p style="margin:0;line-height:1.8;">
              💛 Thank you for trusting Ticketat. We look forward
              to giving you a wonderful event experience.
            </p>

            <p dir="rtl" style="margin-top:15px;line-height:2;">
              💛 شكرًا لثقتكم في Ticketat، ونتمنى لكم تجربة رائعة
              في الفعالية.
            </p>
          </div>

          <!-- Footer -->
          <hr style="
            margin:30px 0;
            border:none;
            border-top:1px solid #ececec;
          ">

          <p style="text-align:center;color:#666;font-size:14px;">
            Need help? Our support team is happy to assist you.
          </p>

          <p dir="rtl" style="text-align:center;color:#666;font-size:14px;">
            إذا احتجتم لأي مساعدة، يسعد فريق الدعم لدينا بخدمتكم.
          </p>

          <p style="
            text-align:center;
            font-size:12px;
            color:#999;
            margin-top:25px;
          ">
            © ${new Date().getFullYear()} Ticketat. All rights reserved.
          </p>

        </div>
      </div>
    `;

    await transport.sendMail({
      from: "Ticketat.eg <anfahmy92@gmail.com>",
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
