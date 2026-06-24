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
// Auto generate report jab booking date past ho jaye
const autoGenerateReport = async (req, res) => {
  try {
    const { bookingId } = req.params

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { user: true, hospital: true, test: true }
    })

    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    // Check karo report already exist karti hai
    const existingReport = await prisma.report.findUnique({
      where: { bookingId: parseInt(bookingId) }
    })

    if (existingReport) {
      return res.status(200).json({ message: 'Report already exists', report: existingReport })
    }

    // Check karo booking date past ho gayi hai
    const bookingDate = new Date(booking.slot?.date || booking.createdAt)
    const now = new Date()
    if (bookingDate > now) {
      return res.status(400).json({ message: 'Booking date not yet passed' })
    }

    // Default results based on test category
    const defaultResults = getDefaultResults(booking.test?.name || 'General Test')

    const report = await prisma.report.create({
      data: {
        bookingId: parseInt(bookingId),
        userId: booking.userId,
        hospitalId: booking.hospitalId,
        testId: booking.testId,
        status: 'COMPLETED',
        sampleType: 'Blood',
        sampleCollectedAt: bookingDate,
        sampleReceivedAt: new Date(bookingDate.getTime() + 2 * 60 * 60 * 1000),
        reportGeneratedAt: new Date(),
        healthScore: Math.floor(Math.random() * 20) + 75,
        riskLevel: 'LOW',
        doctorName: `Dr. ${booking.hospital?.name} Lab`,
        technicianName: 'Lab Technician',
        notes: 'Auto-generated report. Please consult your doctor for interpretation.',
        results: {
          create: defaultResults
        }
      },
      include: { results: true }
    })

    res.status(201).json({ message: 'Report auto-generated', report })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Default results based on test name
const getDefaultResults = (testName) => {
  const name = testName.toLowerCase()

  if (name.includes('blood') || name.includes('cbc')) {
    return [
      { parameterName: 'Hemoglobin', value: (Math.random() * 2 + 13).toFixed(1), unit: 'g/dL', referenceRange: '13.5-17.5', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'WBC Count', value: (Math.random() * 3000 + 5000).toFixed(0), unit: '/uL', referenceRange: '4000-11000', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'Platelet Count', value: (Math.random() * 100000 + 200000).toFixed(0), unit: '/uL', referenceRange: '150000-450000', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'RBC Count', value: (Math.random() * 1 + 4.5).toFixed(1), unit: 'mill/uL', referenceRange: '4.5-5.9', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'Hematocrit', value: (Math.random() * 8 + 38).toFixed(1), unit: '%', referenceRange: '38.8-50', status: 'NORMAL', trend: 'STABLE' },
    ]
  }

  if (name.includes('sugar') || name.includes('glucose')) {
    const val = Math.floor(Math.random() * 30 + 85)
    return [
      { parameterName: 'Fasting Blood Glucose', value: val.toString(), unit: 'mg/dL', referenceRange: '70-100', status: val > 100 ? 'HIGH' : 'NORMAL', trend: 'STABLE' },
      { parameterName: 'HbA1c', value: (Math.random() * 1 + 4.5).toFixed(1), unit: '%', referenceRange: '4.0-5.6', status: 'NORMAL', trend: 'STABLE' },
    ]
  }

  if (name.includes('lipid') || name.includes('cholesterol')) {
    return [
      { parameterName: 'Total Cholesterol', value: (Math.random() * 50 + 150).toFixed(0), unit: 'mg/dL', referenceRange: '<200', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'HDL Cholesterol', value: (Math.random() * 20 + 45).toFixed(0), unit: 'mg/dL', referenceRange: '>40', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'LDL Cholesterol', value: (Math.random() * 30 + 90).toFixed(0), unit: 'mg/dL', referenceRange: '<130', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'Triglycerides', value: (Math.random() * 50 + 100).toFixed(0), unit: 'mg/dL', referenceRange: '<150', status: 'NORMAL', trend: 'STABLE' },
    ]
  }

  if (name.includes('thyroid') || name.includes('tsh')) {
    return [
      { parameterName: 'TSH', value: (Math.random() * 3 + 0.5).toFixed(2), unit: 'mIU/L', referenceRange: '0.4-4.0', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'T3', value: (Math.random() * 50 + 80).toFixed(0), unit: 'ng/dL', referenceRange: '80-200', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'T4', value: (Math.random() * 4 + 5).toFixed(1), unit: 'μg/dL', referenceRange: '5.0-12.0', status: 'NORMAL', trend: 'STABLE' },
    ]
  }

  if (name.includes('liver') || name.includes('lft')) {
    return [
      { parameterName: 'SGOT (AST)', value: (Math.random() * 20 + 15).toFixed(0), unit: 'U/L', referenceRange: '10-40', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'SGPT (ALT)', value: (Math.random() * 25 + 10).toFixed(0), unit: 'U/L', referenceRange: '7-56', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'Total Bilirubin', value: (Math.random() * 0.8 + 0.2).toFixed(1), unit: 'mg/dL', referenceRange: '0.1-1.2', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'Albumin', value: (Math.random() * 1 + 3.8).toFixed(1), unit: 'g/dL', referenceRange: '3.5-5.0', status: 'NORMAL', trend: 'STABLE' },
    ]
  }

  if (name.includes('ecg')) {
    return [
      { parameterName: 'Heart Rate', value: (Math.floor(Math.random() * 30 + 65)).toString(), unit: 'bpm', referenceRange: '60-100', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'PR Interval', value: (Math.random() * 40 + 120).toFixed(0), unit: 'ms', referenceRange: '120-200', status: 'NORMAL', trend: 'STABLE' },
      { parameterName: 'QRS Duration', value: (Math.random() * 20 + 80).toFixed(0), unit: 'ms', referenceRange: '80-120', status: 'NORMAL', trend: 'STABLE' },
    ]
  }

  // Default generic results
  return [
    { parameterName: 'Parameter 1', value: 'Normal', unit: '', referenceRange: 'Normal', status: 'NORMAL', trend: 'STABLE' },
    { parameterName: 'Parameter 2', value: 'Normal', unit: '', referenceRange: 'Normal', status: 'NORMAL', trend: 'STABLE' },
  ]
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

module.exports = { createReport, getMyReports, getReportById, autoGenerateReport }