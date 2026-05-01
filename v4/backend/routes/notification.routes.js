const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { getUserNotifications, markRead, markAllRead } = require('../controllers/notification.controller');
router.get('/',               auth, getUserNotifications);
router.put('/read-all',       auth, markAllRead);
router.put('/:id/read',       auth, markRead);
module.exports = router;
