const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')

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
        password: hashedPassword
      }
    })

    // JWT token banao
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
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

    // Password check karo
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // JWT token banao
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
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
        createdAt: true
      }
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { register, login, getMe }