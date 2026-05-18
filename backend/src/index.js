const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')
const hospitalRoutes = require('./routes/hospital.routes')
const testRoutes = require('./routes/test.routes')
const bookingRoutes = require('./routes/booking.routes')
const slotRoutes = require('./routes/slot.routes')

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/hospitals', hospitalRoutes)
app.use('/api/tests', testRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/slots', slotRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'MedCompare API is running 🚀' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})