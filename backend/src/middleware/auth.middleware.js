const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  try {
    // Header se token lo
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token, access denied' })
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.userRole = decoded.role

    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access only' })
  }
  next()
}

module.exports = { protect, adminOnly }