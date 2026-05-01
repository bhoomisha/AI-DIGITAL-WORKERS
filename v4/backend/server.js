const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
require('dotenv').config();
require('./config/db');

const app = express();

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.use(cors({ origin: ['http://localhost:3000','http://localhost:3001'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Core routes ────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/jobs',          require('./routes/job.routes'));
app.use('/api/applications',  require('./routes/application.routes'));
app.use('/api/attendance',    require('./routes/attendance.routes'));
app.use('/api/payments',      require('./routes/payment.routes'));
app.use('/api/reviews',       require('./routes/review.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// ── AI routes (new in v4) ──────────────────────────
app.use('/api/ai',            require('./routes/ai.routes'));

// ── Health check ───────────────────────────────────
app.get('/', (req, res) => res.json({
  success:   true,
  message:   '✅ AI Digital Workers API v4 Running!',
  version:   '4.0.0',
  demoMode:  process.env.DEMO_MODE === 'true',
  endpoints: [
    '/api/auth', '/api/users', '/api/jobs', '/api/applications',
    '/api/attendance', '/api/payments', '/api/reviews', '/api/notifications',
    '/api/ai/video-bio', '/api/ai/voice-resume', '/api/ai/interview-score',
    '/api/ai/fraud-check', '/api/ai/chatbot', '/api/ai/contract',
  ],
}));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error('❌', err.message);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('\n🚀 ==========================================');
  console.log('🚀  AI Digital Workers Backend v4');
  console.log(`🚀  http://localhost:${PORT}`);
  console.log(`🚀  Demo Mode: ${process.env.DEMO_MODE === 'true' ? '✅ ON (no API keys needed)' : '❌ OFF (using real AI)'}`);
  console.log('🚀 ==========================================\n');
});
