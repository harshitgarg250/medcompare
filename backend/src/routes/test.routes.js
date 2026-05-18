const express = require('express')
const router = express.Router()
const {
  getAllTests,
  compareTest,
  createTest,
  addTestPrice
} = require('../controllers/test.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

router.get('/', getAllTests)
router.get('/compare/:testId', compareTest)
router.post('/', protect, adminOnly, createTest)
router.post('/price', protect, adminOnly, addTestPrice)

module.exports = router