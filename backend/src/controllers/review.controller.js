const prisma = require('../config/prisma')

const createReview = async (req, res) => {
  try {
    const { hospitalId, rating, comment } = req.body
    const userId = req.userId

    // Check karo user ne is hospital mein booking ki hai
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        hospitalId: parseInt(hospitalId),
        status: 'CONFIRMED'
      }
    })

    if (!booking) {
      return res.status(403).json({ message: 'You can only review hospitals where you have booked a test' })
    }

    // Check karo review already exist karti hai
    const existing = await prisma.review.findFirst({
      where: { userId, hospitalId: parseInt(hospitalId) }
    })

    if (existing) {
      // Update existing review
      const review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating: parseInt(rating), comment }
      })
      return res.status(200).json({ message: 'Review updated', review })
    }

    const review = await prisma.review.create({
      data: {
        userId,
        hospitalId: parseInt(hospitalId),
        rating: parseInt(rating),
        comment
      }
    })

    res.status(201).json({ message: 'Review submitted', review })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getHospitalReviews = async (req, res) => {
  try {
    const { hospitalId } = req.params
    const reviews = await prisma.review.findMany({
      where: { hospitalId: parseInt(hospitalId) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.status(200).json(reviews)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createReview, getHospitalReviews }