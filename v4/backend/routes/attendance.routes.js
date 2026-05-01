const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const upload  = require('../middleware/upload.middleware');
const { markAttendance, getWorkerAttendance, submitCompletion } = require('../controllers/attendance.controller');
router.post('/upload',         auth, upload.single('photo'), markAttendance);
router.get('/:workerId',       auth, getWorkerAttendance);
router.post('/complete',       auth, submitCompletion);
module.exports = router;
