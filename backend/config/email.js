const nodemailer = require('nodemailer');

/**
 * Reusable Email Service
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    // Create transporter (SMTP configuration)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Define email message
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // Send email
    const info = await transporter.sendMail(message);

    console.log(`Email sent: ${info.messageId}`);
    return info;
};

module.exports = sendEmail;
