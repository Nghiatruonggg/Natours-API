const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  // Looking to send emails in production? Check out our Email API/SMTP product!
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: 'NghiaTruong <nghiatruong110700@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html
  };
  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
