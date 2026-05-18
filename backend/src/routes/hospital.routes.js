const express = require('express')
const router = express.Router()
const {
  getAllHospitals,
  getHospitalById,
  createHospital,
  getNearbyHospitals
} = require('../controllers/hospital.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

router.get('/', getAllHospitals)
router.get('/nearby', getNearbyHospitals)
router.get('/:id', getHospitalById)
router.post('/', protect, adminOnly, createHospital)

module.exports = router