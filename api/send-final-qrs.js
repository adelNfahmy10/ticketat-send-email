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

        const { to, name, eventName, qrs } = req.body;

        const BASE_URL = 'https://www.ticketateg.com/#';

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
            subject: `Ticketat - Registration Confirmed | ${eventName}`,
            html:`
                <div style="font-family:Arial,sans-serif;border:1px solid #ddd;">
                
                    <div style="max-width:700px;margin:auto;background:#fff;border-radius:12px;padding:10px;">
                        
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto;">
                            <tr>
                                <td align="center" style="padding:10px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center" valign="middle" style="background:#000; border-radius:12px; padding:15px;">
                                                <img
                                                    src="https://res.cloudinary.com/ticketat/image/upload/v1782899628/logo-1_tkuiis.png"
                                                    alt="Ticketat Logo"
                                                    width="140"
                                                    style="display:block; max-width:80px; width:100%; height:auto; border:0;"
                                                >
                                            </td>

                                            <td width="20"></td>

                                            <td align="center" valign="middle" style="background:#000; border-radius:12px; padding:15px;">
                                                <img
                                                    src="https://res.cloudinary.com/ticketat/image/upload/v1782948163/IMG_5016.JPG_wrvsjw.jpg"
                                                    alt="Partner Logo"
                                                    width="140"
                                                    style="display:block; max-width:80px; width:100%; height:auto; border:0;"
                                                >
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        
                        <h3 style="color:#27ae60;text-align:center;">
                            ✅ Registration Completed Successfully
                        </h3>

                        <p>Hello <strong>${name}</strong>,</p>

                        <p>Thank you for registering with <strong>Ticketat</strong>.</p>

                        <p>Your registration for:</p>

                        <h3 style="color:#2c3e50;">${eventName}</h3>

                        <p>has been successfully confirmed.</p>

                        <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0;">
                            <strong>Important:</strong>
                            Please keep your QR codes safe. They will be required to enter the event.
                        </div>

                        ${
                            qrs.map((qr, index) => {
                                const qrLink = `${BASE_URL}/qrcode/${qr.id}`;

                                return `
                                    <div style="margin-bottom:30px;padding:20px;border:1px solid #eee;border-radius:10px;">
                                        <h4>🎫 Ticket #${index + 1}</h4>

                                        <p>
                                            <strong>Type:</strong> ${qr.type == 'owner' ? 'Graduate' : 'Outcomer'}<br>
                                        </p>

                                        <div style="text-align:center;">
                                            <a
                                                href="${qrLink}"
                                                target="_blank"
                                                style="
                                                    display:inline-block;
                                                    background:#9f47d4;
                                                    color:#fff;
                                                    padding:12px 20px;
                                                    border-radius:6px;
                                                    text-decoration:none;
                                                    font-weight:bold;
                                                "
                                            >
                                                View QR Code
                                            </a>
                                        </div>
                                    </div>
                                `;
                            }).join("")
                        }

                        <hr style="margin:30px 0;">

                        <p style="font-size:13px;color:#777;text-align:center;">
                            We look forward to seeing you at the event.
                        </p>

                        <p style="font-size:12px;color:#999;text-align:center;">
                            © ${new Date().getFullYear()} Ticketat. All rights reserved.
                        </p>

                    </div>
                </div>
            `

        });

        return res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};