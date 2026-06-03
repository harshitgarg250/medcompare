const express = require('express')
const router = express.Router()
const { getSlots, createSlots } = require('../controllers/slot.controller')
const { protect, adminOnly } = require('../middleware/auth.middleware')

router.get('/', getSlots)
router.post('/', protect,  createSlots)

module.exports = router  