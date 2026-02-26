// src/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, verifyFormateurCode, verifyEmail } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.post('/verify-formateur-code', verifyFormateurCode);
router.post('/verify-email', verifyEmail);

module.exports = router;
