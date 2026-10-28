const nodemailer = require("nodemailer");

const TICKETAT_LOGO =
  "https://res.cloudinary.com/ticketat/image/upload/v1782899628/logo-1_tkuiis.png";

const RECIPIENT_EMAIL = "anfahmy92@gmail.com";

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
  res.setHeader("Access-Control-Allow-Origin", "*");
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
    const { name, email, subject, message } = req.body || {};

    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    // Field length validation
    if (
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      cleanSubject.length > 150 ||
      cleanMessage.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail) || /[\r\n]/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Escape user input before rendering HTML
    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeSubject = escapeHtml(cleanSubject);

    const safeMessage = escapeHtml(cleanMessage)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n/g, "<br>");

    // Same Brevo SMTP configuration used by Ticketat
    const transport = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>New Contact Message - Ticketat</title>

  <style>
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f3f5f9;
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
      -ms-interpolation-mode: bicubic;
    }

    a {
      text-decoration: none;
    }

    .email-wrapper {
      width: 100%;
      background-color: #f3f5f9;
    }

    .email-card {
      width: 100%;
      max-width: 620px;
      background-color: #ffffff;
      border: 1px solid #e5eaf3;
      border-radius: 16px;
      overflow: hidden;
    }

    .email-content {
      padding: 32px 28px;
    }

    .sender-card {
      padding: 22px;
      background-color: #f8faff;
      border: 1px solid #e5eaf3;
      border-radius: 12px;
    }

    .message-card {
      padding: 20px;
      background-color: #ffffff;
      border: 1px solid #e5eaf3;
      border-radius: 12px;
      overflow-wrap: anywhere;
      word-wrap: break-word;
      word-break: break-word;
    }

    .email-title {
      margin: 20px 0 12px;
      color: #111827;
      font-size: 27px;
      line-height: 1.4;
    }

    .reply-button {
      display: inline-block;
      padding: 14px 24px;
      background-color: #4f46e5;
      background-image: linear-gradient(100deg, #2563eb, #7c3aed);
      border-radius: 10px;
      color: #ffffff !important;
      font-size: 13px;
      font-weight: bold;
      line-height: 1.5;
      text-align: center;
    }

    .break-word {
      overflow-wrap: anywhere;
      word-wrap: break-word;
      word-break: break-word;
    }

    @media only screen and (max-width: 620px) {
      .outer-padding {
        padding: 16px 10px !important;
      }

      .email-card {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 12px !important;
      }

      .brand-header {
        padding: 22px 14px !important;
      }

      .email-content {
        padding: 26px 18px !important;
      }

      .email-title {
        font-size: 23px !important;
        line-height: 1.4 !important;
      }

      .sender-card {
        padding: 17px !important;
      }

      .message-card {
        padding: 16px !important;
      }

      .footer {
        padding: 20px 15px !important;
      }

      .reply-button {
        display: block !important;
        padding: 14px 12px !important;
      }
    }

    @media only screen and (max-width: 360px) {
      .outer-padding {
        padding: 10px 6px !important;
      }

      .email-content {
        padding: 22px 13px !important;
      }

      .email-title {
        font-size: 21px !important;
      }

      .sender-card {
        padding: 14px !important;
      }

      .message-card {
        padding: 13px !important;
      }
    }
  </style>
</head>

<body style="margin:0;padding:0;width:100%;background-color:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

  <!-- PREHEADER -->
  <div style="display:none;font-size:1px;color:#f3f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    A new message has been received through the Ticketat website.
  </div>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    class="email-wrapper"
    style="width:100%;background-color:#f3f5f9;"
  >
    <tr>
      <td
        align="center"
        class="outer-padding"
        style="padding:32px 12px;"
      >

        <!-- EMAIL CARD -->
        <table
          role="presentation"
          width="620"
          cellpadding="0"
          cellspacing="0"
          border="0"
          class="email-card"
          style="width:100%;max-width:620px;background-color:#ffffff;border:1px solid #e5eaf3;border-radius:16px;"
        >

          <!-- BRAND HEADER -->
          <tr>
            <td
              align="center"
              class="brand-header"
              style="padding:25px 20px;background-color:#ffffff;border-bottom:1px solid #edf0f5;"
            >
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td
                    align="center"
                    bgcolor="#080a0f"
                    style="padding:10px 14px;background-color:#080a0f;border-radius:12px;"
                  >
                    <img
                      src="${TICKETAT_LOGO}"
                      alt="Ticketat"
                      width="135"
                      style="display:block;width:135px;max-width:100%;height:auto;border:0;"
                    />
                  </td>
                </tr>
              </table>

              <p style="margin:18px 0 0;color:#64748b;font-size:12px;letter-spacing:1.5px;font-weight:bold;">
                WEBSITE CONTACT REQUEST
              </p>
            </td>
          </tr>

          <!-- EMAIL CONTENT -->
          <tr>
            <td class="email-content" style="padding:32px 28px;">

              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td
                    bgcolor="#eff6ff"
                    style="padding:8px 13px;background-color:#eff6ff;border:1px solid #dbeafe;border-radius:30px;color:#1d4ed8;font-size:11px;font-weight:bold;letter-spacing:.5px;"
                  >
                    NEW MESSAGE RECEIVED
                  </td>
                </tr>
              </table>

              <h1 class="email-title" style="margin:20px 0 12px;color:#111827;font-size:27px;line-height:1.4;">
                Someone wants to talk to you!
              </h1>

              <p style="margin:0 0 25px;color:#64748b;font-size:14px;line-height:1.8;">
                A visitor has submitted a new message through the Ticketat Contact Us page.
                Here are the details.
              </p>

              <!-- SENDER INFORMATION -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%;background-color:#f8faff;border:1px solid #e5eaf3;border-radius:12px;"
              >
                <tr>
                  <td class="sender-card" style="padding:22px;">

                    <p style="margin:0 0 7px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:.8px;">
                      FULL NAME
                    </p>

                    <p class="break-word" style="margin:0 0 19px;color:#111827;font-size:15px;font-weight:bold;line-height:1.7;overflow-wrap:anywhere;word-wrap:break-word;word-break:break-word;">
                      ${safeName}
                    </p>

                    <p style="margin:0 0 7px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:.8px;">
                      EMAIL ADDRESS
                    </p>

                    <p class="break-word" style="margin:0 0 19px;font-size:14px;line-height:1.7;overflow-wrap:anywhere;word-wrap:break-word;word-break:break-word;">
                      <a
                        href="mailto:${safeEmail}"
                        style="color:#2563eb;text-decoration:none;"
                      >${safeEmail}</a>
                    </p>

                    <p style="margin:0 0 7px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:.8px;">
                      SUBJECT
                    </p>

                    <p class="break-word" style="margin:0;color:#111827;font-size:15px;font-weight:bold;line-height:1.7;overflow-wrap:anywhere;word-wrap:break-word;word-break:break-word;">
                      ${safeSubject}
                    </p>

                  </td>
                </tr>
              </table>

              <!-- MESSAGE -->
              <h2 style="margin:28px 0 12px;color:#111827;font-size:17px;line-height:1.5;">
                Message Details
              </h2>

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%;border:1px solid #e5eaf3;border-radius:12px;"
              >
                <tr>
                  <td
                    class="message-card"
                    style="padding:20px;background-color:#ffffff;border-radius:12px;color:#475569;font-size:14px;line-height:1.9;overflow-wrap:anywhere;word-wrap:break-word;word-break:break-word;"
                  >
                    ${safeMessage.replace(/\r\n|\r|\n/g, "<br>")}
                  </td>
                </tr>
              </table>

              <!-- REPLY BUTTON -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%;margin-top:26px;"
              >
                <tr>
                  <td align="center">
                    <a
                      href="mailto:${safeEmail}"
                      class="reply-button"
                      style="display:inline-block;padding:14px 24px;background-color:#4f46e5;background-image:linear-gradient(100deg,#2563eb,#7c3aed);border-radius:10px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;line-height:1.5;text-align:center;"
                    >
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:25px 0 0;color:#64748b;font-size:13px;line-height:1.8;">
                Please review the message and get back to the sender when possible.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              align="center"
              class="footer"
              style="padding:23px 20px;background-color:#f8fafc;border-top:1px solid #edf0f5;"
            >
              <p style="margin:0 0 8px;color:#64748b;font-size:12px;line-height:1.8;">
                You received this email because someone contacted you through the Ticketat website.
              </p>

              <p style="margin:0;color:#2563eb;font-size:13px;font-weight:bold;">
                Ticketat
              </p>

              <p style="margin:12px 0 0;color:#94a3b8;font-size:11px;line-height:1.7;">
                &copy; 2025 Ticketat. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- END EMAIL CARD -->

      </td>
    </tr>
  </table>

</body>
</html>`;

    const info = await transport.sendMail({
      from: '"Ticketat Contact Us" <anfahmy92@gmail.com>',
      to: RECIPIENT_EMAIL,
      replyTo: {
        name: cleanName,
        address: cleanEmail,
      },
      subject: `Ticketat | Contact Us - ${cleanSubject}`,
      text: [
        "New Contact Message - Ticketat",
        "",
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Subject: ${cleanSubject}`,
        "",
        "Message:",
        cleanMessage,
      ].join("\n"),
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Ticketat Contact Us email error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again later.",
    });
  }
};
