require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('EMAIL_HOST:', process.env.EMAIL_HOST);

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP bağlantı doğrulama hatası:', err);
  } else {
    console.log('SMTP servisi hazır.');
  }
});

async function sendMail(to, subject, htmlBody) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlBody
    });
    console.log('Mail gönderildi, messageId:', info.messageId);
  } catch (err) {
    console.error('Mail gönderim hatası:', err);
    throw err;
  }
}

module.exports = { sendMail }; 