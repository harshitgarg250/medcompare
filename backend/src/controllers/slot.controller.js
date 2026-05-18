const prisma = require('../config/prisma')

// Hospital ke slots get karo
const getSlots = async (req, res) => {
  try {
    const { hospitalId, date } = req.query

    const slots = await prisma.slot.findMany({
      where: {
        hospitalId: parseInt(hospitalId),
        ...(date && {
          date: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 86400000)
          }
        })
      },
      orderBy: { time: 'asc' }
    })

    res.status(200).json(slots)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Slots banao hospital ke liye
const createSlots = async (req, res) => {
  try {
    const { hospitalId, date, times } = req.body

    const slots = await prisma.slot.createMany({
      data: times.map(time => ({
        hospitalId: parseInt(hospitalId),
        date: new Date(date),
        time,
        isBooked: false
      }))
    })

    res.status(201).json({
      message: 'Slots created successfully',
      count: slots.count
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getSlots, createSlots }