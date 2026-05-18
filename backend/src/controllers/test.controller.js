const prisma = require('../config/prisma')

// Sabhi tests get karo
const getAllTests = async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      include: {
        prices: {
          include: {
            hospital: true
          }
        }
      }
    })
    res.status(200).json(tests)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Test compare karo — ek test ki sabhi hospitals mein price
const compareTest = async (req, res) => {
  try {
    const { testId } = req.params

    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
      include: {
        prices: {
          include: {
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
                rating: true,
                isOpen: true
              }
            }
          },
          orderBy: { price: 'asc' }
        }
      }
    })

    if (!test) {
      return res.status(404).json({ message: 'Test not found' })
    }

    res.status(200).json(test)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Test banao
const createTest = async (req, res) => {
  try {
    const { name, description, category } = req.body

    const test = await prisma.test.create({
      data: { name, description, category }
    })

    res.status(201).json({
      message: 'Test created successfully',
      test
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Hospital mein test ki price add karo
const addTestPrice = async (req, res) => {
  try {
    const { hospitalId, testId, price, duration, reportTime } = req.body

    const testPrice = await prisma.testPrice.create({
      data: {
        hospitalId: parseInt(hospitalId),
        testId: parseInt(testId),
        price: parseFloat(price),
        duration,
        reportTime
      }
    })

    res.status(201).json({
      message: 'Test price added successfully',
      testPrice
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getAllTests,
  compareTest,
  createTest,
  addTestPrice
}