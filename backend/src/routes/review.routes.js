const express = require('express')
const router = express.Router()
const { createReview, getHospitalReviews } = require('../controllers/review.controller')
const { protect } = require('../middleware/auth.middleware')

router.post('/', protect, createReview)
router.get('/:hospitalId', getHospitalReviews)

module.exports = router