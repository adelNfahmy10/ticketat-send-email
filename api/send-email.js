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

        const { to, userName, eventName } = req.body;

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
            subject: "Confirm Your Ticket",
            html: `
            <div style="font-family: Arial, sans-serif; font-size: 14px; background:#f4f6f8; padding: 10px;">
                <!-- BODY CARD -->
                <div style="max-width:600px; margin:auto; background:#ffffff; padding:15px; border-radius:10px;">
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

                    <div style="color:#2c3e50; font-size:18px; font-weight:700; text-align:center; margin-bottom:20px;">
                        Ticketateg | <span style="color:#777; font-size:13px;">Check Your Ticket</span>
                    </div>

                    <h2 style="text-align:center; color:#2c3e50; margin-bottom:20px;">
                    🎓 ${eventName}
                    </h2>

                    <p>Dear Student <strong>${userName}</strong>,</p>

                    <p>
                    Thank you for completing the down payment for <strong>${eventName}</strong>. 
                    We are excited to be part of this special milestone with you 🎓
                    </p>

                    <p>
                    Please note that the graduation package collection date will be coordinated with your class representative.
                    Updates will be shared via WhatsApp group.
                    </p>

                    <p><strong>Kindly note:</strong> Booking for companions is currently not available.</p>

                    <p>
                    The second down payment date will be announced later. At that stage, companion booking will open and your QR code will be sent.
                    </p>

                    <hr style="margin:20px 0; border:none; border-top:1px solid #eee;">

                    <h3 style="text-align:right; color:#2c3e50;">عزيزنا الطالب/الطالبة</h3>
                    
                    <p style="text-align:right; direction:'rtl'">
                    نشكرك على إتمام دفع عربون حفل <strong>${eventName}</strong> 🎓
                    </p>

                    <p style="text-align:right;">
                    سيتم تحديد موعد استلام الباكدج بالتنسيق مع ممثل الدفعة وسيتم الإبلاغ عبر جروب الواتساب
                    </p>

                    <p style="text-align:right;">
                    لا يمكن حجز مرافقين حالياً، وسيتم فتح ذلك لاحقاً مع الدفع الثاني
                    </p>

                    <p style="text-align:right;">
                    مع أطيب التمنيات<br><br>
                    <strong style="color: #9f47d4;">Remold Events</strong>
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