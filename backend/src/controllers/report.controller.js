const prisma = require('../config/prisma')

// Report create karo (admin/lab)
const createReport = async (req, res) => {
  try {
    const {
      bookingId, sampleType, sampleCollectedAt,
      sampleReceivedAt, results, healthScore,
      riskLevel, doctorName, technicianName, notes
    } = req.body

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { user: true, hospital: true, test: true }
    })

    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const report = await prisma.report.create({
      data: {
        bookingId: parseInt(bookingId),
        userId: booking.userId,
        hospitalId: booking.hospitalId,
        testId: booking.testId,
        status: 'COMPLETED',
        sampleType: sampleType || 'Blood',
        sampleCollectedAt: sampleCollectedAt ? new Date(sampleCollectedAt) : new Date(),
        sampleReceivedAt: sampleReceivedAt ? new Date(sampleReceivedAt) : new Date(),
        reportGeneratedAt: new Date(),
        healthScore: healthScore ? parseInt(healthScore) : null,
        riskLevel: riskLevel || 'LOW',
        doctorName: doctorName || 'Dr. MedCompare Lab',
        technicianName: technicianName || 'Lab Technician',
        notes: notes || '',
        results: {
          create: results?.map(r => ({
            parameterName: r.parameterName,
            value: r.value,
            unit: r.unit || '',
            referenceRange: r.referenceRange || '',
            status: r.status || 'NORMAL',
            previousValue: r.previousValue || null,
            trend: r.trend || 'STABLE'
          })) || []
        }
      },
      include: {
        results: true,
        booking: {
          include: { user: true, hospital: true, test: true }
        }
      }
    })

    res.status(201).json({ message: 'Report created', report })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// User ke reports get karo
const getMyReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.userId },
      include: {
        results: true,
        test: true,
        hospital: true,
        booking: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.status(200).json(reports)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Single report get karo
const getReportById = async (req, res) => {
  try {
    const { id } = req.params

    const report = await prisma.report.findFirst({
      where: {
        OR: [
          { id: parseInt(id) || 0 },
          { reportId: id }
        ]
      },
      include: {
        results: true,
        test: true,
        hospital: true,
        booking: true,
        user: {
          select: {
            name: true, email: true, phone: true
          }
        }
      }
    })

    if (!report) return res.status(404).json({ message: 'Report not found' })

    res.status(200).json(report)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createReport, getMyReports, getReportById }