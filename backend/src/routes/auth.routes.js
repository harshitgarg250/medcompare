const express = require('express')
const router = express.Router()
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  googleAuth,
} = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/google', googleAuth)

// Protected route
router.get('/me', protect, getMe)

module.exports = router
