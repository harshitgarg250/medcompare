const express = require('express')
const router = express.Router()
const { createReport, getMyReports, getReportById, autoGenerateReport } = require('../controllers/report.controller')
const { protect } = require('../middleware/auth.middleware')


router.post('/', protect, createReport)
router.get('/my', protect, getMyReports)
router.get('/:id', getReportById)
router.post('/auto-generate/:bookingId', protect, autoGenerateReport)


module.exports = router