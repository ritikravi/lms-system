const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  register, login, logout, refreshToken,
  forgotPassword, resetPassword, getMe
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
