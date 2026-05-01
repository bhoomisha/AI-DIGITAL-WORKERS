const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { submitReview, getUserReviews, getAllReviews } = require('../controllers/review.controller');
router.post('/submit',    auth, submitReview);
router.get('/all',        auth, getAllReviews);
router.get('/:userId',    auth, getUserReviews);
module.exports = router;
