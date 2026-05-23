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
            subject: "Ticketat Send OTP",
            html: `
                <div style="font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #2c3e50;">
    
                    <h2 style="margin-bottom: 10px;">Email Verification</h2>
                    
                    <p>
                        Hello <strong>${name}</strong>,
                    </p>

                    <p>
                        We received a request to verify your email address. Please use the One-Time Password (OTP) below to continue:
                    </p>

                    <div style="margin: 25px 0; text-align: center;">
                        <span style="
                        display: inline-block;
                        padding: 15px 25px;
                        font-size: 28px;
                        letter-spacing: 5px;
                        font-weight: bold;
                        background-color: #f4f6f8;
                        border-radius: 8px;
                        border: 1px dashed #ccc;
                        ">
                        ${otp}
                        </span>
                    </div>

                    <p style="margin-top: 20px;">
                        This code is valid for a limited time. Please do not share it with anyone for security reasons.
                    </p>

                    <p>
                        If you didn’t request this, you can safely ignore this email.
                    </p>

                    <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

                    <p style="font-size: 12px; color: #999;">
                        © 2025 Ticketat. All rights reserved.
                    </p>

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