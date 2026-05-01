const db  = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// In-memory OTP store (use Redis in production)
const otpStore = {};

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ── POST /api/auth/send-otp ──────────────────
exports.sendOTP = (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Enter valid 10-digit phone number' });
  }
  const otp    = generateOTP();
  const expiry = Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000;
  otpStore[phone] = { otp, expiry };

  // In production: send via SMS (Twilio / Fast2SMS)
  console.log(`\n📱 OTP for ${phone}: ${otp}  (expires in 5 min)\n`);

  return res.status(200).json({ success: true, message: 'OTP sent successfully', demo_otp: otp });
};

// ── POST /api/auth/verify-otp ────────────────
exports.verifyOTP = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required' });

  const stored = otpStore[phone];
  if (!stored) return res.status(400).json({ success: false, message: 'OTP not found. Request a new one.' });
  if (Date.now() > stored.expiry) {
    delete otpStore[phone];
    return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
  }
  if (stored.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

  delete otpStore[phone];

  db.query('SELECT * FROM users WHERE phone = ?', [phone], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });

    if (results.length > 0) {
      const user  = results[0];
      const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({ success: true, message: 'Login successful', token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role }, isNewUser: false });
    }

    db.query('INSERT INTO users (phone) VALUES (?)', [phone], (err2, result) => {
      if (err2) return res.status(500).json({ success: false, message: 'Error creating user', error: err2.message });
      const token = jwt.sign({ id: result.insertId, phone }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ success: true, message: 'Account created', token, user: { id: result.insertId, phone }, isNewUser: true });
    });
  });
};
