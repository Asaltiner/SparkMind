// testCron.js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./src/models/User');
const Feedback = require('./src/models/Feedback');
const mailService = require('./src/services/mailService');

async function runDailyFeedback() {
  // 1) Tüm kullanıcıları çek
  const users = await User.find().lean();
  for (const user of users) {
    // 2) Henüz gönderilmemiş feedback'leri al
    const list = await Feedback.find({ user: user._id, sentAt: null }).lean();
    if (list.length === 0) continue;

    // 3) Basit bir HTML oluştur
    const grouped = list.reduce((acc, fb) => {
      acc[fb.category] = acc[fb.category] || [];
      acc[fb.category].push(fb.message);
      return acc;
    }, {});
    let htmlBody = `<h1>Günlük Geri Bildiriminiz</h1>`;
    for (const [cat, msgs] of Object.entries(grouped)) {
      htmlBody += `<h2>${cat}</h2><ul>${msgs.map(m=>`<li>${m}</li>`).join('')}</ul>`;
    }

    // 4) Mail gönder
    await mailService.sendMail(user.email, 'Günlük Geri Bildirim', htmlBody);

    // 5) sentAt alanını güncelle
    await Feedback.updateMany(
      { user: user._id, sentAt: null },
      { $set: { sentAt: new Date() } }
    );
    console.log(`Feedback maili gönderildi: ${user.email}`);
  }
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB'ye bağlandı, cron handler çalışıyor…");
    await runDailyFeedback();
  } catch (err) {
    console.error('Cron handler sırasında hata:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})(); 