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

        const { to, name, eventName } = req.body;

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
            subject: "Ticketat - Booking Confirmation | تأكيد الحجز",
            html:`
                <div style="font-family:Arial,sans-serif;background:#f4f6f9;padding:30px;color:#2c3e50;">

                <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:12px;padding:35px;border:1px solid #e5e5e5;">

                    <!-- Logos -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                    <tr>

                        <!-- Ticketat -->
                        <td align="left" width="33%">
                        <a href="https://www.ticketateg.com" target="_blank">
                            <img
                            src="https://res.cloudinary.com/ticketat/image/upload/v1776549141/mini-icon_iylrx0.png"
                            alt="Ticketat"
                            style="width:80px;height:auto;display:block;"
                            />
                        </a>
                        </td>

                        <!-- Title -->
                        <td align="center" width="34%">
                        <h2 style="margin:0;color:#27ae60;font-size:24px;">
                            Booking Confirmation
                        </h2>

                        <p dir="rtl" style="margin:8px 0 0;font-size:16px;color:#666;">
                            تأكيد الحجز
                        </p>
                        </td>

                        <!-- Event Logo -->
                        <td align="right" width="33%">
                        <img
                            src="https://res.cloudinary.com/ticketat/image/upload/v1782440402/remold-events_zdt2bo.png"
                            alt="Remold Events"
                            style="width:90px;height:auto;display:block;margin-left:auto;"
                        />
                        </td>

                    </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #ececec;margin-bottom:30px;">

                    <!-- Greeting -->
                    <p style="font-size:16px;">
                    Hello <strong>${name}</strong>,
                    </p>

                    <p dir="rtl" style="font-size:16px;">
                    مرحبًا <strong>${name}</strong>،
                    </p>

                    <!-- English -->
                    <p style="line-height:1.8;">
                    Thank you for choosing <strong>Ticketat</strong>.
                    We are pleased to confirm that your booking has been completed successfully.
                    We truly appreciate your trust and hope you enjoy a wonderful experience at our event.
                    </p>

                    <!-- Arabic -->
                    <p dir="rtl" style="line-height:2;">
                    شكرًا لاختياركم <strong>Ticketat</strong>.
                    يسعدنا إبلاغكم بأنه تم إتمام عملية الحجز بنجاح.
                    نُقدّر ثقتكم بنا، ونتمنى أن تنال خدماتنا رضاكم وأن تستمتعوا بتجربة مميزة في الفعالية.
                    </p>

                    <!-- Event -->
                    <div style="background:#f8f9fa;padding:18px;border-radius:10px;border-left:5px solid #27ae60;margin:30px 0;">

                    <p style="margin:0;font-size:14px;color:#888;">
                        EVENT
                    </p>

                    <p dir="rtl" style="margin:10px 0 0;font-size:14px;color:#888;">
                        الفعالية
                    </p>

                    <h2 style="margin:15px 0 0;color:#2c3e50;">
                        ${eventName}
                    </h2>

                    </div>

                    <!-- Next Step -->
                    <div style="background:#eef7ff;padding:20px;border-radius:10px;border-left:5px solid #3498db;">

                    <h3 style="margin-top:0;color:#3498db;">
                        📩 What's Next?
                    </h3>

                    <p style="line-height:1.8;">
                        Your event tickets and QR Codes will be sent to you in a
                        <strong>separate email</strong> shortly.
                        Please keep an eye on your inbox.
                        If you don't receive the email within a few minutes,
                        kindly check your Spam or Junk folder.
                    </p>

                    <hr style="border:none;border-top:1px solid #dbe9f5;margin:25px 0;">

                    <h3 dir="rtl" style="margin-top:0;color:#3498db;">
                        📩 الخطوة التالية
                    </h3>

                    <p dir="rtl" style="line-height:2;">
                        سيتم إرسال التذاكر الخاصة بكم ورموز
                        <strong>QR Code</strong>
                        في رسالة بريد إلكتروني منفصلة خلال دقائق قليلة.
                        يُرجى متابعة صندوق الوارد،
                        وفي حال عدم وصول الرسالة يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam).
                    </p>

                    </div>

                    <!-- Thank You -->
                    <div style="margin-top:35px;background:#fffaf2;padding:20px;border-radius:10px;border-left:5px solid #f39c12;">

                    <p style="margin:0;line-height:1.8;">
                        💛 Thank you for trusting Ticketat.
                        We hope our service met your expectations and wish you an unforgettable event experience.
                    </p>

                    <p dir="rtl" style="margin-top:18px;line-height:2;">
                        💛 شكرًا لثقتكم في Ticketat.
                        نتمنى أن تكون خدماتنا قد نالت إعجابكم،
                        ونتطلع لأن تستمتعوا بتجربة رائعة في هذه الفعالية.
                    </p>

                    </div>

                    <!-- Footer -->
                    <hr style="margin:35px 0;border:none;border-top:1px solid #ececec;">

                    <p style="text-align:center;color:#666;font-size:14px;">
                    Need help? Our support team is always happy to assist you.
                    </p>

                    <p dir="rtl" style="text-align:center;color:#666;font-size:14px;">
                    إذا احتجتم لأي مساعدة، يسعد فريق الدعم لدينا بخدمتكم.
                    </p>

                    <p style="text-align:center;font-size:12px;color:#999;margin-top:25px;">
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
        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};