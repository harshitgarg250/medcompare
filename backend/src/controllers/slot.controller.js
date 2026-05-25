const prisma = require('../config/prisma')

// Hospital ke slots get karo — testId ke saath
const getSlots = async (req, res) => {
  try {
    const { hospitalId, date, testId } = req.query

    const slots = await prisma.slot.findMany({
      where: {
        hospitalId: parseInt(hospitalId),
        ...(testId && { testId: parseInt(testId) }),
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

// Slots banao — testId ke saath
const createSlots = async (req, res) => {
  try {
    const { hospitalId, date, times, testId } = req.body
    console.log('Creating slot:', { hospitalId, date, times, testId })

    const slots = await prisma.slot.createMany({
      data: times.map(time => ({
        hospitalId: parseInt(hospitalId),
        date: new Date(date),
        time,
        isBooked: false,
        testId: testId ? parseInt(testId) : null
      }))
    })

    res.status(201).json({
      message: 'Slots created successfully',
      count: slots.count
    })
  } catch (error) {
    console.log('Slot error:', error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getSlots, createSlots }