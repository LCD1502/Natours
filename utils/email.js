const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    //1) Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        // Active in Gmail "less secure app" option
    });
    //2) Define a mail option
    const mailOptions = {
        from: 'LCD <LCD@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html:
    };
    //3) Actually send the mail
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
