const nodemailer = require("nodemailer");

module.exports = async (req, res) => {

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
            from: "anfahmy92@gmail.com",
            to,
            subject: "Confirm Ticket",

            html: `
                <div>
                    <h2>${eventName}</h2>
                    <p>Hello ${userName}</p>
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