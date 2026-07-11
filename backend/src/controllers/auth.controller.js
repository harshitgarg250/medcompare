const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { OAuth2Client } = require('google-auth-library')
const prisma = require('../config/prisma')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id')
const JWT_SECRET = process.env.JWT_SECRET || 'medcompare_super_secret_key_2024'

const createToken = (user) =>
  jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profilePicture: user.profilePicture,
  authProvider: user.authProvider,
})

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const sendResetOtp = async (email, otp) => {
  const transporter = getTransporter()
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  if (!transporter) {
    console.log(`Password reset OTP for ${email}: ${otp}`)
    return
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Reset your MedCompare password',
    text: `Your MedCompare password reset code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2>Reset your MedCompare password</h2>
        <p>Your verification code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
        <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  })
}

// Register
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // Check karo email already exist karta hai ya nahi
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Password hash karo
    const hashedPassword = await bcrypt.hash(password, 10)

    // User banao
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        authProvider: 'email',
      }
    })

    const token = createToken(user)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: publicUser(user)
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // User dhundo
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Please continue with Google for this account' })
    }

    // Password check karo
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = createToken(user)

    res.status(200).json({
      message: 'Login successful',
      token,
      user: publicUser(user)
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get current user (profile)
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profilePicture: true,
        authProvider: true,
        createdAt: true
      }
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Same response for privacy, even when email does not exist.
    if (!user) {
      return res.status(200).json({ message: 'If this email is registered, a reset code has been sent' })
    }

    if (!user.password && user.authProvider === 'google') {
      return res.status(400).json({ message: 'This account uses Google sign-in. Please continue with Google.' })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const otpHash = await bcrypt.hash(otp, 10)
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOtpHash: otpHash,
        resetPasswordExpires: expires,
      },
    })

    await sendResetOtp(email, otp)

    res.status(200).json({ message: 'If this email is registered, a reset code has been sent' })
  } catch (error) {
    res.status(500).json({ message: 'Could not send reset code', error: error.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, code and new password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.resetPasswordOtpHash || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired reset code' })
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired' })
    }

    const isValidOtp = await bcrypt.compare(otp, user.resetPasswordOtpHash)
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid reset code' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        authProvider: user.authProvider === 'google' ? 'google' : 'email',
        resetPasswordOtpHash: null,
        resetPasswordExpires: null,
      },
    })

    const token = createToken(updatedUser)

    res.status(200).json({
      message: 'Password reset successful',
      token,
      user: publicUser(updatedUser),
    })
  } catch (error) {
    res.status(500).json({ message: 'Could not reset password', error: error.message })
  }
}

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' })
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google sign-in is not configured' })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    if (!payload?.email) {
      return res.status(400).json({ message: 'Google account email is required' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: existingUser.googleId || payload.sub,
            profilePicture: payload.picture || existingUser.profilePicture,
            authProvider: existingUser.password ? existingUser.authProvider : 'google',
          },
        })
      : await prisma.user.create({
          data: {
            name: payload.name || payload.email.split('@')[0],
            email: payload.email,
            profilePicture: payload.picture,
            googleId: payload.sub,
            authProvider: 'google',
          },
        })

    const token = createToken(user)

    res.status(200).json({
      message: existingUser ? 'Login successful' : 'Account created successfully',
      token,
      user: publicUser(user),
    })
  } catch (error) {
    res.status(401).json({ message: 'Google authentication failed', error: error.message })
  }
}

module.exports = { register, login, getMe, forgotPassword, resetPassword, googleAuth }
