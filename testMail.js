require('dotenv').config();
const { sendMail } = require('./src/services/mailService');

(async () => {
  try {
    console.log('Test maili gönderiliyor…');
    await sendMail('pinarlizeynep@gmail.com', 'Test Maili', '<p>Bu bir test mailidir.</p>');
    console.log('Test maili başarıyla gönderildi.');
  } catch (err) {
    console.error('Mail gönderim hatası:', err);
  }
})(); 