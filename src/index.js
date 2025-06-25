require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const User = require('./models/User');
const Feedback = require('./models/Feedback');
const mailService = require('./services/mailService');
const cors = require('cors');

const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middlewares/auth');
const categoryRoutes = require('./routes/categories');
const feedbackRoutes = require('./routes/feedback');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', testRoutes);
app.use('/api/v1/auth',    authRoutes);
app.use('/api/v1/categories', authMiddleware, categoryRoutes);
app.use('/api/v1/feedback', authMiddleware, feedbackRoutes);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Schedule daily feedback summary at 09:00 Europe/Istanbul time
    cron.schedule('* * * * *', async () => {
      try {
        const users = await User.find();
        for (const user of users) {
          const feedbacks = await Feedback.find({ user: user._id, sentAt: null });
          if (feedbacks.length === 0) continue;

          // Group feedbacks by category
          const grouped = feedbacks.reduce((acc, fb) => {
            acc[fb.category] = acc[fb.category] || [];
            acc[fb.category].push(fb.message);
            return acc;
          }, {});

          // Compose HTML
          let htmlBody = `<h2>Geri Bildirimleriniz</h2>`;
          for (const [category, messages] of Object.entries(grouped)) {
            htmlBody += `<h3>${category}</h3><ul>`;
            for (const msg of messages) {
              htmlBody += `<li>${msg}</li>`;
            }
            htmlBody += `</ul>`;
          }

          // Send mail
          try {
            await mailService.sendMail(user.email, 'Günlük Geri Bildirim', htmlBody);
          } catch (mailErr) {
            console.error(`Kullanıcıya mail gönderilemedi (${user.email}):`, mailErr);
          }

          // Update sentAt for feedbacks
          await Feedback.updateMany({ _id: { $in: feedbacks.map(fb => fb._id) } }, { $set: { sentAt: new Date() } });
        }
      } catch (err) {
        console.error('Günlük feedback mail cron hatası:', err);
      }
    }, {
      timezone: 'Europe/Istanbul'
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 