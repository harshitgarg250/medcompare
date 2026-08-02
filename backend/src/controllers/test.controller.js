const { prisma } = require("../config/prisma");

// GET /api/tests
const getAllTests = async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      include: {
        prices: {
          include: {
            hospital: true,
          },
        },
      },
    });

    res.json(tests);
  } catch (error) {
    console.error("GET TESTS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/tests/compare/:testId
const compareTest = async (req, res) => {
  try {
    const id = Number(req.params.testId);

    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: {
            price: "asc",
          },
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    res.json(test);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/tests
const createTest = async (req, res) => {
  try {
    const { name, description } = req.body;

    const test = await prisma.test.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(test);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/tests/price
const addTestPrice = async (req, res) => {
  try {
    const { hospitalId, testId, price, testName } = req.body;

    const result = await prisma.testPrice.create({
      data: {
        hospitalId: Number(hospitalId),
        testId: Number(testId),
        price: Number(price),
        testName,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllTests,
  compareTest,
  createTest,
  addTestPrice,
};