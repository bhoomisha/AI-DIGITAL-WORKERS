const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { createProfile, getAllWorkers, getUserById, updateUser } = require('../controllers/user.controller');
router.post('/profile',   auth, createProfile);
router.get('/workers',    auth, getAllWorkers);
router.get('/:id',        auth, getUserById);
router.put('/:id',        auth, updateUser);
module.exports = router;
