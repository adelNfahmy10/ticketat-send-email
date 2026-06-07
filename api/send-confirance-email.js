const nodemailer = require("nodemailer");

module.exports = async (req, res) => {

    // ✅ CORS FIX (مهم جدًا)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }

    try {

        const { to, name, otp } = req.body;

        const transport = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transport.sendMail({
            from: "Ticketat.eg <anfahmy92@gmail.com>",
            to,
            subject: "Ticketat - Booking Confirmed",
            html: `
                <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px; color:#2c3e50;">

                <div style="max-width:600px; margin:auto; background:#fff; padding:25px; border-radius:10px; border:1px solid #eee;">

                    <h2 style="color:#27ae60; margin-bottom:10px;">
                    Booking Confirmed!
                    </h2>

                    <p>Hi <strong>${name}</strong>,</p>

                    <p>
                    Thank you for booking with <strong>Ticketat</strong> 🙌
                    </p>

                    <p>
                    Your registration for the event:
                    </p>

                    <h3 style="margin:10px 0; color:#2c3e50;">
                    ${eventName}
                    </h3>

                    <p style="margin-bottom:20px;">
                    has been successfully confirmed.
                    </p>

                    <div style="padding:15px; background:#f4f6f8; border-radius:8px; margin-bottom:20px;">
                    <p style="margin:0;">
                        Please find your QR code below to access the event:
                    </p>
                    </div>

                    <div style="text-align:center; margin:20px 0;">
                    <a href="${qrLink}"
                        style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#3498db;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                        font-weight:bold;
                        ">
                        🎫 View My QR Code
                    </a>
                    </div>

                    <p style="margin-top:20px;">
                    📌 Please keep this email safe. You will need the QR code for entry.
                    </p>

                    <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />

                    <p style="font-size:12px; color:#999; text-align:center;">
                    © 2025 Ticketat. All rights reserved.
                    </p>

                </div>

                </div>
            `
        });

        return res.status(200).json({
          success: true
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};