const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { processPayment, getPaymentHistory } = require('../controllers/payment.controller');
router.post('/process',          auth, processPayment);
router.get('/history/:userId',   auth, getPaymentHistory);
module.exports = router;
