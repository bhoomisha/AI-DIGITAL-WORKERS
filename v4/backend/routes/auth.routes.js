const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { sendOTP, verifyOTP } = require('../controllers/auth.controller');

// Standard OTP auth
router.post('/send-otp',   sendOTP);
router.post('/verify-otp', verifyOTP);

// Demo role switcher — returns JWT without password (demo mode only)
router.post('/demo-switch', (req, res) => {
  const { role } = req.body;
  if (!['worker', 'client'].includes(role)) {
    return res.status(400).json({ success: false, message: 'role must be worker or client' });
  }
  const demoUsers = {
    worker: { id: 'demo_worker', phone: '9900000001', name: 'Raju Mistri (Demo)', role: 'worker' },
    client: { id: 'demo_client', phone: '9900000002', name: 'Ramesh Gupta (Demo)', role: 'client' },
  };
  const user  = demoUsers[role];
  const token = jwt.sign(user, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1d' });
  res.json({ success: true, token, user, isDemo: true });
});

module.exports = router;
