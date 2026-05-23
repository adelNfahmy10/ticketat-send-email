// require("dotenv").config();

// const nodemailer = require("nodemailer");

// const transport = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });

// const mailOptions = {
//   from: "anfahmy92@gmail.com",
//   to: "adelnasserfahmy@gmail.com",
//   subject: "Test Email",
  
//   html: `
//     <div style="font-family: Arial, sans-serif; font-size: 14px; background:#f4f6f8; padding: 20px;">

//     <!-- HEADER -->
//     <div style="padding: 15px 0; border-top: 1px dashed #ddd; border-bottom: 1px dashed #ddd; margin-bottom: 20px;">
//         <table role="presentation" style="width: 100%;">
//         <tr>
//             <td style="vertical-align: middle; width: 110px;">
//             <img 
//                 src="https://res.cloudinary.com/ticketat/image/upload/v1776549141/mini-icon_iylrx0.png" 
//                 style="width: 80px; display: block;"
//             >
//             </td>

//             <td style="vertical-align: middle;">
//             <div style="color:#2c3e50; font-size:18px; font-weight:700;">
//                 Ticketateg
//             </div>
//             <div style="color:#777; font-size:13px; margin-top:3px;">
//                 Check Your Ticket
//             </div>
//             </td>
//         </tr>
//         </table>
//     </div>

//     <!-- BODY CARD -->
//     <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:10px;">

//         <h2 style="text-align:center; color:#2c3e50; margin-bottom:20px;">
//         🎓 {{eventName}}
//         </h2>

//         <p>Dear Student <strong>{{userName}}</strong>,</p>

//         <p>
//         Thank you for completing the down payment for <strong>{{eventName}}</strong>. 
//         We are excited to be part of this special milestone with you 🎓
//         </p>

//         <p>
//         Please note that the graduation package collection date will be coordinated with your class representative.
//         Updates will be shared via WhatsApp group.
//         </p>

//         <p><strong>Kindly note:</strong> Booking for companions is currently not available.</p>

//         <p>
//         The second down payment date will be announced later. At that stage, companion booking will open and your QR code will be sent.
//         </p>

//         <hr style="margin:20px 0; border:none; border-top:1px solid #eee;">

//         <h3 style="text-align:right; color:#2c3e50;">عزيزنا الطالب/الطالبة</h3>
        
//         <p style="text-align:right; direction='rtl'">
//         نشكرك على إتمام دفع عربون حفل <strong>{{eventName}}</strong> 🎓
//         </p>

//         <p style="text-align:right;">
//         سيتم تحديد موعد استلام الباكدج بالتنسيق مع ممثل الدفعة وسيتم الإبلاغ عبر جروب الواتساب
//         </p>

//         <p style="text-align:right;">
//         لا يمكن حجز مرافقين حالياً، وسيتم فتح ذلك لاحقاً مع الدفع الثاني
//         </p>

//         <p style="text-align:right;">
//         مع أطيب التمنيات<br><br>
//         <strong>Remold Events</strong>
//         </p>

//     </div>
//     </div>
//   `
// };

// transport.sendMail(mailOptions, (err, info) => {
//   if (err) {
//     console.log("Error:", err);
//   } else {
//     console.log("Sent:", info.response);
//   }
// });

require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());


// 👇 هنا مباشرة
console.log("APP STARTED");
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS);

const transport = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
});

// test route
app.get("/", (req, res) => {
  res.json({ status: "server running 🚀" });
});

// send email route
app.post("/send-email", async (req, res) => {
  const { to, userName, eventName } = req.body;

  res.json({ status: "processing" }); // رد سريع

  try {
    await transport.sendMail({
      from: "anfahmy92@gmail.com",
      to,
      subject: `Graduation - ${eventName}`,
      html: `
        <h2>🎓 ${eventName}</h2>
        <p>Dear ${userName}</p>
      `
    });

    console.log("Email sent");
  } catch (err) {
    console.log("Email error:", err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});