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
</head>

<body style="margin:0;padding:0;background:#f3f5f9;color:#1f2937;font-family:Arial,Helvetica,sans-serif;">

  <div style="width:100%;padding:32px 12px;background:#f3f5f9;box-sizing:border-box;">

    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5eaf3;border-radius:16px;overflow:hidden;">

      <!-- BRAND HEADER -->
      <div style="padding:25px 20px;background:#ffffff;border-bottom:1px solid #edf0f5;text-align:center;">

        <div style="display:inline-block;padding:10px 14px;background:#080a0f;border-radius:12px;">
          <img
            src="${TICKETAT_LOGO}"
            alt="Ticketat"
            width="135"
            style="display:block;width:135px;max-width:100%;height:auto;border:0;"
          />
        </div>

        <p style="margin:18px 0 0;color:#64748b;font-size:12px;letter-spacing:1.5px;font-weight:bold;">
          WEBSITE CONTACT REQUEST
        </p>

      </div>

      <!-- EMAIL CONTENT -->
      <div style="padding:32px 28px;">

        <div style="display:inline-block;padding:8px 13px;background:#eff6ff;border:1px solid #dbeafe;border-radius:30px;color:#1d4ed8;font-size:11px;font-weight:bold;letter-spacing:.5px;">
          NEW MESSAGE RECEIVED
        </div>

        <h1 style="margin:20px 0 12px;color:#111827;font-size:27px;line-height:1.4;">
          Someone wants to talk to you!
        </h1>

        <p style="margin:0 0 25px;color:#64748b;font-size:14px;line-height:1.8;">
          A visitor has submitted a new message through the Ticketat Contact Us page.
          Here are the details.
        </p>

        <!-- SENDER INFORMATION -->
        <div style="padding:22px;background:#f8faff;border:1px solid #e5eaf3;border-radius:12px;">

          <div style="margin-bottom:19px;">
            <p style="margin:0 0 7px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:.8px;">
              FULL NAME
            </p>
            <p style="margin:0;color:#111827;font-size:15px;font-weight:bold;line-height:1.7;overflow-wrap:anywhere;">
              ${safeName}
            </p>
          </div>

          <div style="margin-bottom:19px;">
            <p style="margin:0 0 7px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:.8px;">
              EMAIL ADDRESS
            </p>
            <p style="margin:0;font-size:14px;line-height:1.7;overflow-wrap:anywhere;">
              <a
                href="mailto:${safeEmail}"
                style="color:#2563eb;text-decoration:none;"
              >${safeEmail}</a>
            </p>
          </div>

          <div>
            <p style="margin:0 0 7px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:.8px;">
              SUBJECT
            </p>
            <p style="margin:0;color:#111827;font-size:15px;font-weight:bold;line-height:1.7;overflow-wrap:anywhere;">
              ${safeSubject}
            </p>
          </div>

        </div>

        <!-- MESSAGE -->
        <h2 style="margin:28px 0 12px;color:#111827;font-size:17px;">
          Message Details
        </h2>

        <div style="padding:20px;background:#ffffff;border:1px solid #e5eaf3;border-radius:12px;color:#475569;font-size:14px;line-height:1.9;overflow-wrap:anywhere;">
          ${safeMessage}
        </div>

        <!-- REPLY BUTTON -->
        <div style="margin-top:26px;text-align:center;">
          <a
            href="mailto:${safeEmail}"
            style="display:inline-block;padding:14px 24px;background:linear-gradient(100deg,#2563eb,#7c3aed);border-radius:10px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;"
          >
            Reply to ${safeName}
          </a>
        </div>

        <p style="margin:25px 0 0;color:#64748b;font-size:13px;line-height:1.8;">
          Please review the message and get back to the sender when possible.
        </p>

      </div>

      <!-- FOOTER -->
      <div style="padding:23px 20px;background:#f8fafc;border-top:1px solid #edf0f5;text-align:center;">

        <p style="margin:0 0 8px;color:#64748b;font-size:12px;line-height:1.8;">
          You received this email because someone contacted you through the Ticketat website.
        </p>

        <p style="margin:0;color:#2563eb;font-size:13px;font-weight:bold;">
          Ticketat
        </p>

        <p style="margin:12px 0 0;color:#94a3b8;font-size:11px;line-height:1.7;">
          &copy; ${new Date().getFullYear()} Ticketat. All rights reserved.
        </p>

      </div>

    </div>

  </div>

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
