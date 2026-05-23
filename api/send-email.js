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
              <div style="font-family: Arial, sans-serif; font-size: 14px; background:#f4f6f8; padding: 20px;">

                <div style="padding: 15px 0; border-top: 1px dashed #ddd; border-bottom: 1px dashed #ddd; margin-bottom: 20px;">
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="vertical-align: middle; width: 110px;">
                        <img src="https://res.cloudinary.com/ticketat/image/upload/v1776549141/mini-icon_iylrx0.png" style="width: 80px; display: block;">
                      </td>

                      <td>
                        <div style="color:#2c3e50; font-size:18px; font-weight:700;">
                          Ticketateg
                        </div>
                        <div style="color:#777; font-size:13px;">
                          Check Your Ticket
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>

                <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:10px;">

                  <h2 style="text-align:center; color:#2c3e50;">
                    🎓 ${eventName}
                  </h2>

                  <p>Dear Student <strong>${userName}</strong>,</p>

                  <p>
                    Thank you for completing the down payment for <strong>${eventName}</strong>.
                  </p>

                  <hr style="margin:20px 0;">

                  <h3 style="text-align:right;">عزيزنا الطالب/الطالبة</h3>

                  <p style="text-align:right;">
                    نشكرك على إتمام دفع عربون حفل <strong>${eventName}</strong> 🎓
                  </p>

                  <p style="text-align:right;">
                    مع أطيب التمنيات<br>
                    <strong>Remold Events</strong>
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