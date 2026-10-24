// const nodemailer = require("nodemailer");

// const TICKETAT_LOGO =
//   "https://res.cloudinary.com/ticketat/image/upload/v1782899628/logo-1_tkuiis.png";

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

//         const { to, name, eventName, qrs } = req.body;

//         const BASE_URL = 'https://www.ticketateg.com/';

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
//             subject: `Ticketat - Registration Confirmed | ${eventName}`,
//             html:`
//                 <div style="font-family:Arial,sans-serif;border:1px solid #ddd;">

//                     <div style="max-width:700px;margin:auto;background:#fff;border-radius:12px;padding:10px;">

//                         <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto;">
//                             <tr>
//                                 <td align="center" style="padding:10px;">
//                                     <table role="presentation" cellpadding="0" cellspacing="0" border="0">
//                                         <tr>
//                                             <td align="center" valign="middle" style="background:#000; border-radius:12px; padding:15px;">
//                                                 <img
//                                                     src="https://res.cloudinary.com/ticketat/image/upload/v1782899628/logo-1_tkuiis.png"
//                                                     alt="Ticketat Logo"
//                                                     width="140"
//                                                     style="display:block; max-width:80px; width:100%; height:auto; border:0;"
//                                                 >
//                                             </td>

//                                             <td width="20"></td>

//                                             <td align="center" valign="middle" style="background:#000; border-radius:12px; padding:15px;">
//                                                 <img
//                                                     src="https://res.cloudinary.com/ticketat/image/upload/v1782948163/IMG_5016.JPG_wrvsjw.jpg"
//                                                     alt="Partner Logo"
//                                                     width="140"
//                                                     style="display:block; max-width:80px; width:100%; height:auto; border:0;"
//                                                 >
//                                             </td>
//                                         </tr>
//                                     </table>
//                                 </td>
//                             </tr>
//                         </table>

//                         <h3 style="color:#27ae60;text-align:center;">
//                             ✅ Registration Completed Successfully
//                         </h3>

//                         <p>Hello <strong>${name}</strong>,</p>

//                         <p>Thank you for registering with <strong>Ticketat</strong>.</p>

//                         <p>Your registration for:</p>

//                         <h3 style="color:#2c3e50;">${eventName}</h3>

//                         <p>has been successfully confirmed.</p>

//                         <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0;">
//                             <strong>Important:</strong>
//                             Please keep your QR codes safe. They will be required to enter the event.
//                         </div>

//                         ${
//                             qrs.map((qr, index) => {
//                                 const qrLink = `${BASE_URL}/qrcode/${qr.id}`;

//                                 return `
//                                     <div style="margin-bottom:30px;padding:20px;border:1px solid #eee;border-radius:10px;">
//                                         <h4>🎫 Ticket #${index + 1}</h4>

//                                         <p>
//                                             <strong>Type:</strong> ${qr.type == 'owner' ? 'Graduate' : 'Outcomer'}<br>
//                                         </p>

//                                         <div style="text-align:center;">
//                                             <a
//                                                 href="${qrLink}"
//                                                 target="_blank"
//                                                 style="
//                                                     display:inline-block;
//                                                     background:#9f47d4;
//                                                     color:#fff;
//                                                     padding:12px 20px;
//                                                     border-radius:6px;
//                                                     text-decoration:none;
//                                                     font-weight:bold;
//                                                 "
//                                             >
//                                                 View QR Code
//                                             </a>
//                                         </div>
//                                     </div>
//                                 `;
//                             }).join("")
//                         }

//                         <hr style="margin:30px 0;">

//                         <p style="font-size:13px;color:#777;text-align:center;">
//                             We look forward to seeing you at the event.
//                         </p>

//                         <p style="font-size:12px;color:#999;text-align:center;">
//                             © ${new Date().getFullYear()} Ticketat. All rights reserved.
//                         </p>

//                     </div>
//                 </div>
//             `

//         });

//         return res.status(200).json({
//             success: true
//         });

//     } catch (error) {
//         console.error(error);

//         return res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

const nodemailer = require("nodemailer");

const TICKETAT_LOGO =
  "https://res.cloudinary.com/ticketat/image/upload/v1782899628/logo-1_tkuiis.png";

const BASE_URL = "https://www.ticketateg.com";

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
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeStatus = (value = "") => String(value).trim().toLowerCase();

const getEventCategory = (eventType = "") => {
  const type = normalizeStatus(eventType);

  if (type.includes("graduation") || type.includes("graduate")) {
    return "graduation";
  }

  if (type.includes("tour")) {
    return "tour";
  }

  return "event";
};

const getEmailContent = (category) => {
  if (category === "Tours") {
    return {
      badge: "YOUR TOUR TICKETS ARE READY",
      title: "Get Ready for Your Tour!",
      intro:
        "Your registration is confirmed, and your tour QR codes are ready.",
      description:
        "Thank you for booking with Ticketat. Keep your QR codes accessible and present the appropriate code to your tour organizer when requested.",
      noticeTitle: "Important Tour Information",
      notice:
        "Please keep your QR codes safe and ready on your phone. Your tour organizer may scan them to verify your booking and admission.",
      closing: "We look forward to being part of your next adventure!",
      ticketLabel: "Tour Ticket",
      qrInstruction: "Open your QR code when requested by your tour organizer.",
    };
  }

  if (category === "Graduation") {
    return {
      badge: "GRADUATION REGISTRATION CONFIRMED",
      title: "Your Graduation Tickets Are Ready!",
      intro:
        "Your graduation booking is confirmed, and your QR codes are ready.",
      description:
        "Thank you for choosing Ticketat to be part of this special occasion. Your email contains the QR codes associated with your booking.",
      noticeTitle: "Important Graduation Information",
      notice:
        "Keep each QR code accessible. The graduate and accompanying guests should use their respective QR codes for entry, according to the event organizer's instructions.",
      closing:
        "Congratulations, and we look forward to celebrating this special moment with you!",
      ticketLabel: "Graduation Ticket",
      qrInstruction: "Use the QR code assigned to the relevant ticket holder.",
    };
  }

  return {
    badge: "REGISTRATION CONFIRMED",
    title: "Your Tickets Are Ready!",
    intro: "Your registration is confirmed, and your QR codes are ready.",
    description:
      "Thank you for registering with Ticketat. Your email contains the QR codes associated with your booking.",
    noticeTitle: "Important Event Information",
    notice:
      "Please keep your QR codes safe and accessible. Present the appropriate QR code to the event organizer or entry staff when requested.",
    closing: "We look forward to seeing you at the event!",
    ticketLabel: "Event Ticket",
    qrInstruction: "Open your QR code when requested by the event organizer.",
  };
};

const getTicketType = (qr, category, ticketLabel) => {
  if (category === "graduation") {
    return normalizeStatus(qr.type) === "owner" ? "Graduate" : "Outcomer";
  }

  return ticketLabel;
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
    const {
      to,
      name,
      eventName,
      eventType = "",
      partnerLogo = "",
      qrs,
    } = req.body || {};

    if (
      typeof to !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim()) ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof eventName !== "string" ||
      !eventName.trim() ||
      !Array.isArray(qrs)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid email, customer name, event name, and QR codes are required.",
      });
    }

    // Exclude invalid, cancelled, and rejected QR codes.
    const validQrs = qrs.filter((qr) => {
      if (!qr || typeof qr !== "object") {
        return false;
      }

      const id = String(qr.id || "").trim();
      const status = normalizeStatus(qr.bookingStatus);

      return !!id && status !== "cancelled" && status !== "rejected";
    });

    if (!validQrs.length) {
      return res.status(400).json({
        success: false,
        message: "No eligible QR codes were provided.",
      });
    }

    const safeName = escapeHtml(name.trim());
    const safeEventName = escapeHtml(eventName.trim());

    const category = getEventCategory(eventType);
    const content = getEmailContent(category);

    const safePartnerLogo = isValidImageUrl(partnerLogo)
      ? partnerLogo.trim()
      : "";

    const currentYear = new Date().getFullYear();

    const logoHtml = `
      <table
        role="presentation"
        align="center"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="margin:0 auto;"
      >
        <tr>
          <td
            align="center"
            valign="middle"
            bgcolor="#080a0f"
            style="
              background-color:#080a0f;
              border-radius:12px;
              padding:10px 12px;
            "
          >
            <img
              src="${TICKETAT_LOGO}"
              alt="Ticketat"
              width="140"
              height="68"
              style="
                display:block;
                width:140px;
                max-width:100%;
                height:68px;
                object-fit:contain;
                border:0;
              "
            />
          </td>

          ${
            safePartnerLogo
              ? `
                <td
                  width="14"
                  style="width:14px;font-size:0;line-height:0;"
                >
                  &nbsp;
                </td>

                <td
                  align="center"
                  valign="middle"
                  bgcolor="#080a0f"
                  style="
                    background-color:#080a0f;
                    border-radius:12px;
                    padding:10px 12px;
                  "
                >
                  <img
                    src="${safePartnerLogo}"
                    alt="Event Partner"
                    width="140"
                    height="68"
                    style="
                      display:block;
                      width:140px;
                      max-width:100%;
                      height:68px;
                      object-fit:contain;
                      border:0;
                    "
                  />
                </td>
              `
              : ""
          }
        </tr>
      </table>
    `;

    const ticketsHtml = validQrs
      .map((qr, index) => {
        const qrId = String(qr.id).trim();
        const qrLink = `${BASE_URL}/qrcode/${encodeURIComponent(qrId)}`;

        const ticketType = escapeHtml(
          getTicketType(qr, category, content.ticketLabel),
        );

        return `
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              width:100%;
              margin:0 0 16px;
              border:1px solid #e8edf4;
              border-radius:12px;
              background-color:#ffffff;
            "
          >
            <tr>
              <td style="padding:20px;">

                <p style="
                  margin:0 0 12px;
                  color:#7b8495;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:0.6px;
                  text-transform:uppercase;
                ">
                  TICKET ${index + 1}
                </p>

                <h3 style="
                  margin:0 0 10px;
                  color:#111827;
                  font-size:18px;
                  line-height:1.5;
                ">
                  ${ticketType}
                </h3>

                <p style="
                  margin:0 0 20px;
                  color:#596579;
                  font-size:13px;
                  line-height:1.7;
                ">
                  ${escapeHtml(content.qrInstruction)}
                </p>

                <table
                  role="presentation"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin:0 auto;"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#7c3aed"
                      style="
                        background-color:#7c3aed;
                        border-radius:8px;
                      "
                    >
                      <a
                        href="${qrLink}"
                        target="_blank"
                        style="
                          display:inline-block;
                          padding:13px 24px;
                          color:#ffffff;
                          font-size:14px;
                          font-weight:700;
                          text-decoration:none;
                          border-radius:8px;
                        "
                      >
                        View QR Code
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        `;
      })
      .join("");

    const subject =
      category === "tour"
        ? `Ticketat | Your Tour Tickets Are Ready - ${eventName.trim()}`
        : category === "graduation"
          ? `Ticketat | Graduation Tickets Confirmed - ${eventName.trim()}`
          : `Ticketat | Registration Confirmed - ${eventName.trim()}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(content.title)}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin:0;
      padding:0;
      background-color:#f3f5f9;
      color:#1f2937;
      font-family:Arial,Helvetica,sans-serif;
      -webkit-text-size-adjust:100%;
    }

    table {
      border-spacing:0;
      border-collapse:collapse;
    }

    img {
      display:block;
      border:0;
      outline:none;
      text-decoration:none;
    }

    .email-wrapper {
      width:100%;
      padding:32px 12px;
      background-color:#f3f5f9;
    }

    .email-container {
      width:100%;
      max-width:620px;
      margin:0 auto;
      overflow:hidden;
      background-color:#ffffff;
      border:1px solid #e8ecf2;
      border-radius:16px;
    }

    .brand-header {
      padding:26px 12px;
      background-color:#ffffff;
      border-bottom:1px solid #edf0f5;
      text-align:center;
    }

    .email-content {
      padding:34px 32px;
      background-color:#ffffff;
    }

    .status-badge {
      display:inline-block;
      padding:8px 13px;
      color:#166534;
      background-color:#dcfce7;
      border:1px solid #bbf7d0;
      border-radius:30px;
      font-size:11px;
      font-weight:700;
      letter-spacing:0.4px;
    }

    .email-title {
      margin:20px 0 12px;
      color:#111827;
      font-size:27px;
      line-height:1.35;
      font-weight:700;
    }

    .email-text {
      margin:0 0 16px;
      color:#596579;
      font-size:15px;
      line-height:1.8;
    }

    .event-card {
      margin:26px 0;
      padding:22px;
      background-color:#f8fafc;
      border:1px solid #e8edf4;
      border-radius:12px;
    }

    .event-label {
      margin:0 0 8px;
      color:#7b8495;
      font-size:12px;
      font-weight:700;
      letter-spacing:0.7px;
      text-transform:uppercase;
    }

    .event-name {
      margin:0;
      color:#111827;
      font-size:20px;
      line-height:1.5;
      font-weight:700;
      overflow-wrap:anywhere;
    }

    .notice {
      margin:24px 0;
      padding:18px;
      background-color:#eff6ff;
      border-left:4px solid #2563eb;
      border-radius:8px;
    }

    .notice-title {
      margin:0 0 8px;
      color:#1d4ed8;
      font-size:15px;
      line-height:1.5;
      font-weight:700;
    }

    .notice-text {
      margin:0;
      color:#475569;
      font-size:14px;
      line-height:1.8;
    }

    .section-title {
      margin:28px 0 14px;
      color:#111827;
      font-size:18px;
      line-height:1.5;
    }

    .email-divider {
      height:1px;
      margin:28px 0;
      background-color:#edf0f5;
      border:0;
    }

    .email-footer {
      padding:24px 20px;
      background-color:#f8fafc;
      border-top:1px solid #edf0f5;
      text-align:center;
    }

    .footer-text {
      margin:0 0 8px;
      color:#7b8495;
      font-size:12px;
      line-height:1.7;
    }

    .footer-brand {
      color:#2563eb;
      font-weight:700;
    }

    .footer-note {
      margin:12px 0 0;
      color:#9aa3b2;
      font-size:11px;
      line-height:1.7;
    }

    @media only screen and (max-width:600px) {
      .email-wrapper {
        padding:12px 6px !important;
      }

      .email-container {
        border-radius:12px !important;
      }

      .brand-header {
        padding:20px 8px !important;
      }

      .email-content {
        padding:26px 18px !important;
      }

      .email-title {
        font-size:23px !important;
      }

      .event-card {
        padding:17px !important;
      }

      .event-name {
        font-size:18px !important;
      }

      .email-footer {
        padding:22px 14px !important;
      }
    }

    @media only screen and (max-width:360px) {
      .email-content {
        padding:22px 14px !important;
      }
    }
  </style>
</head>

<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- BRAND HEADER -->
      <div class="brand-header">
        ${logoHtml}
      </div>

      <!-- MAIN CONTENT -->
      <div class="email-content">

        <span class="status-badge">
          ${escapeHtml(content.badge)}
        </span>

        <h1 class="email-title">
          ${escapeHtml(content.title)}
        </h1>

        <p class="email-text">
          Hello <strong>${safeName}</strong>,
        </p>

        <p class="email-text">
          ${escapeHtml(content.intro)}
        </p>

        <p class="email-text">
          ${escapeHtml(content.description)}
        </p>

        <!-- EVENT DETAILS -->
        <div class="event-card">
          <p class="event-label">Event Details</p>
          <h2 class="event-name">${safeEventName}</h2>
        </div>

        <!-- IMPORTANT NOTICE -->
        <div class="notice">
          <h3 class="notice-title">
            ${escapeHtml(content.noticeTitle)}
          </h3>

          <p class="notice-text">
            ${escapeHtml(content.notice)}
          </p>
        </div>

        <!-- QR TICKETS -->
        <h2 class="section-title">
          Your QR Codes
        </h2>

        <p class="email-text">
          We have included ${validQrs.length} ${
            validQrs.length === 1 ? "QR code" : "QR codes"
          } for your booking below.
          Open each QR code using its button.
        </p>

        ${ticketsHtml}

        <hr class="email-divider" />

        <p class="email-text">
          ${escapeHtml(content.closing)}
        </p>

        <p class="email-text" style="margin-bottom:0;">
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
          Powered by <span class="footer-brand">Ticketat</span>
        </p>

        <p class="footer-note">
          &copy; ${currentYear} Ticketat. All rights reserved.
        </p>

        <p class="footer-note">
          This email was sent regarding your registration.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

    const transport = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transport.sendMail({
      from: '"Ticketat.eg" <anfahmy92@gmail.com>',
      to: to.trim(),
      subject,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "QR email sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("QR email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send QR email.",
    });
  }
};
