const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  googleAuth,
  updateProfile,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');

// ====================
// Public Routes
// ====================

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

// ====================
// Protected Routes
// ====================

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;