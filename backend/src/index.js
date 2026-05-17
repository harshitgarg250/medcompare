const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'MedCompare API is running 🚀' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})