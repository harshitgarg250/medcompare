const prisma = require('../config/prisma')

// Sabhi hospitals get karo
const getAllHospitals = async (req, res) => {
  try {
    const { city, rating, isOpen } = req.query

    const hospitals = await prisma.hospital.findMany({
      where: {
        isVerified: true,
        ...(city && { city }),
        ...(isOpen && { isOpen: isOpen === 'true' }),
        ...(rating && { rating: { gte: parseFloat(rating) } })
      },
      include: {
        tests: {
          include: { test: true }
        },
        reviews: true
      }
    })

    res.status(200).json(hospitals)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Single hospital get karo
const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params

    const hospital = await prisma.hospital.findUnique({
      where: { id: parseInt(id) },
      include: {
        tests: {
          include: { test: true }
        },
        slots: true,
        reviews: {
          include: { user: { select: { name: true } } }
        }
      }
    })

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' })
    }

    res.status(200).json(hospital)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Hospital banao (admin only)
const createHospital = async (req, res) => {
  try {
    const {
      name, type, address, city,
      lat, lng, phone, email
    } = req.body

    const hospital = await prisma.hospital.create({
      data: {
        name, type, address, city,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        phone, email
      }
    })

    res.status(201).json({
      message: 'Hospital created successfully',
      hospital
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Nearby hospitals (lat/lng se)
const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng required' })
    }

    const hospitals = await prisma.hospital.findMany({
      where: { isVerified: true }
    })

    // Distance calculate karo (Haversine formula)
    const nearby = hospitals
      .map(h => {
        const distance = getDistance(
          parseFloat(lat), parseFloat(lng),
          h.lat, h.lng
        )
        return { ...h, distance: parseFloat(distance.toFixed(1)) }
      })
      .filter(h => h.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance)

    res.status(200).json(nearby)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Haversine formula — do points ke beech distance km mein
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

module.exports = {
  getAllHospitals,
  getHospitalById,
  createHospital,
  getNearbyHospitals
}