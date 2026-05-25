const prisma = require('../config/prisma')

// Booking banao
const createBooking = async (req, res) => {
  try {
    const { hospitalId, testId, slotId, totalPrice, notes } = req.body
    const userId = req.userId

    console.log('Creating booking:', { hospitalId, testId, slotId, totalPrice, userId })

    const slot = await prisma.slot.findUnique({
      where: { id: parseInt(slotId) }
    })

    console.log('Found slot:', slot)

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' })
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Slot already booked' })
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        hospitalId: parseInt(hospitalId),
        testId: parseInt(testId),
        slotId: parseInt(slotId),
        totalPrice: parseFloat(totalPrice),
        notes,
        status: 'CONFIRMED'
      }
    })

    await prisma.slot.update({
      where: { id: parseInt(slotId) },
      data: { isBooked: true }
    })

    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking
    })
  } catch (error) {
    console.log('Booking error:', error.message)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
// User ki saari bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.userId

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        hospital: { select: { name: true, address: true } },
        test: { select: { name: true } },
        slot: { select: { date: true, time: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.status(200).json(bookings)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Booking cancel karo
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    })

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Booking cancel karo
    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' }
    })

    // Slot free karo
    await prisma.slot.update({
      where: { id: booking.slotId },
      data: { isBooked: false }
    })

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking: updated
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createBooking, getUserBookings, cancelBooking }