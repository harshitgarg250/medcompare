
require('dotenv').config()

const { prisma } = require('../src/config/prisma')

// --------------------------------------------------
// MEDICAL TESTS
// --------------------------------------------------

const tests = [
  {
    name: 'Blood Test',
    description: 'Complete blood count and basic blood screening',
  },
  {
    name: 'MRI Scan',
    description: 'Magnetic resonance imaging scan',
  },
  {
    name: 'X-Ray',
    description: 'Digital X-ray imaging',
  },
  {
    name: 'CT Scan',
    description: 'Computed tomography scan',
  },
  {
    name: 'ECG',
    description: 'Electrocardiogram heart screening',
  },
  {
    name: 'Ultrasound',
    description: 'Ultrasound imaging test',
  },
  {
    name: 'Thyroid Profile',
    description: 'T3, T4 and TSH thyroid screening',
  },
  {
    name: 'Liver Function Test',
    description: 'LFT blood panel',
  },
  {
    name: 'Kidney Function Test',
    description: 'KFT blood panel',
  },
  {
    name: 'Lipid Profile',
    description: 'Cholesterol and triglyceride profile',
  },
  {
    name: 'Diabetes Test',
    description: 'Blood glucose and diabetes screening',
  },
  {
    name: 'HbA1c',
    description: 'Average blood sugar level test',
  },
  {
    name: 'Vitamin D Test',
    description: 'Vitamin D level screening',
  },
  {
    name: 'Vitamin B12 Test',
    description: 'Vitamin B12 level screening',
  },
  {
    name: 'Urine Test',
    description: 'Routine urine analysis',
  },
  {
    name: 'CBC Test',
    description: 'Complete blood count test',
  },
  {
    name: 'Hemoglobin Test',
    description: 'Hemoglobin level screening',
  },
  {
    name: 'Chest X-Ray',
    description: 'Chest radiography examination',
  },
  {
    name: 'Abdominal Ultrasound',
    description: 'Ultrasound examination of abdominal organs',
  },
  {
    name: 'Kidney Ultrasound',
    description: 'Ultrasound examination of kidneys',
  },
  {
    name: 'Cardiac Test',
    description: 'Basic cardiac health screening',
  },
  {
    name: 'Stress Test',
    description: 'Cardiac stress testing',
  },
  {
    name: 'Mammography',
    description: 'Breast imaging examination',
  },
  {
    name: 'Bone Density Test',
    description: 'Bone mineral density screening',
  },
  {
    name: 'Allergy Test',
    description: 'Common allergy screening',
  },
]

// --------------------------------------------------
// CITY DATA
// --------------------------------------------------

const cities = [
  {
    city: 'Dehradun',
    areas: [
      'Rajpur Road',
      'Haridwar Road',
      'Ballupur Road',
      'Sahastradhara Road',
      'Chakrata Road',
      'Dharampur',
      'Clement Town',
    ],
    lat: 30.3165,
    lng: 78.0322,
  },

  {
    city: 'Delhi',
    areas: [
      'Saket',
      'Dwarka',
      'Rohini',
      'Vasant Kunj',
      'Lajpat Nagar',
      'Greater Kailash',
      'Karol Bagh',
    ],
    lat: 28.6139,
    lng: 77.209,
  },

  {
    city: 'Noida',
    areas: [
      'Sector 18',
      'Sector 27',
      'Sector 62',
      'Sector 50',
      'Sector 76',
      'Sector 128',
    ],
    lat: 28.5355,
    lng: 77.391,
  },

  {
    city: 'Gurugram',
    areas: [
      'DLF Phase 1',
      'DLF Phase 2',
      'Sector 14',
      'Sector 29',
      'Golf Course Road',
      'Sohna Road',
    ],
    lat: 28.4595,
    lng: 77.0266,
  },

  {
    city: 'Chandigarh',
    areas: [
      'Sector 17',
      'Sector 22',
      'Sector 34',
      'Sector 35',
      'Sector 43',
      'Manimajra',
    ],
    lat: 30.7333,
    lng: 76.7794,
  },

  {
    city: 'Haridwar',
    areas: [
      'Ranipur More',
      'Jwalapur',
      'Kankhal',
      'Har Ki Pauri Road',
      'SIDCUL',
    ],
    lat: 29.9457,
    lng: 78.1642,
  },

  {
    city: 'Saharanpur',
    areas: [
      'Court Road',
      'Delhi Road',
      'Dehradun Road',
      'Awas Vikas',
      'Mission Compound',
    ],
    lat: 29.968,
    lng: 77.5552,
  },

  {
    city: 'Meerut',
    areas: [
      'Garh Road',
      'Delhi Road',
      'Shastri Nagar',
      'Civil Lines',
      'Kanker Khera',
    ],
    lat: 28.9845,
    lng: 77.7064,
  },

  {
    city: 'Lucknow',
    areas: [
      'Gomti Nagar',
      'Hazratganj',
      'Aliganj',
      'Indira Nagar',
      'Alambagh',
      'Vikas Nagar',
    ],
    lat: 26.8467,
    lng: 80.9462,
  },

  {
    city: 'Jaipur',
    areas: [
      'Malviya Nagar',
      'Vaishali Nagar',
      'Mansarovar',
      'C-Scheme',
      'Jagatpura',
    ],
    lat: 26.9124,
    lng: 75.7873,
  },
]

// --------------------------------------------------
// HOSPITAL NAME GENERATOR
// --------------------------------------------------

const hospitalPrefixes = [
  'City',
  'Apollo',
  'Max',
  'Care',
  'Life',
  'Metro',
  'Prime',
  'Medicare',
  'Sunrise',
  'Fortis',
  'Wellness',
  'Global',
  'Healing',
  'Shanti',
  'HealthPlus',
  'Star',
  'Apex',
  'Green Valley',
  'Hope',
  'Sanjeevani',
]

const hospitalTypes = [
  'Hospital',
  'Multi-speciality Hospital',
  'Diagnostic Center',
  'Medical Center',
  'Healthcare Center',
]

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min, max, decimals = 1) {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(decimals))
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

// --------------------------------------------------
// GENERATE HOSPITALS
// --------------------------------------------------

function generateHospitals() {
  const hospitals = []
  const usedNames = new Set()

  let counter = 1

  while (hospitals.length < 50) {
    const cityData = cities[(counter - 1) % cities.length]

    const prefix = randomItem(hospitalPrefixes)
    const type = randomItem(hospitalTypes)
    const area = randomItem(cityData.areas)

    const name = `${prefix} ${cityData.city} ${counter}`

    if (usedNames.has(name)) {
      counter++
      continue
    }

    usedNames.add(name)

    const lat = randomFloat(
      cityData.lat - 0.035,
      cityData.lat + 0.035,
      6
    )

    const lng = randomFloat(
      cityData.lng - 0.035,
      cityData.lng + 0.035,
      6
    )

    hospitals.push({
      name,
      type,
      address: area,
      city: cityData.city,
      lat,
      lng,
      phone: `+91 98${random(10000000, 99999999)}`,
      email: `hospital${counter}@medcompare.demo`,
      rating: randomFloat(3.5, 4.9, 1),
      isOpen: Math.random() > 0.12,
      isVerified: true,
    })

    counter++
  }

  return hospitals
}

// --------------------------------------------------
// TEST PRICE GENERATOR
// --------------------------------------------------

function generatePrice(testName) {
  const priceRanges = {
    'Blood Test': [80, 250],
    'MRI Scan': [2200, 5000],
    'X-Ray': [150, 450],
    'CT Scan': [1200, 3500],
    ECG: [100, 400],
    Ultrasound: [300, 900],
    'Thyroid Profile': [300, 800],
    'Liver Function Test': [400, 1000],
    'Kidney Function Test': [400, 1000],
    'Lipid Profile': [400, 900],
    'Diabetes Test': [100, 350],
    HbA1c: [300, 700],
    'Vitamin D Test': [700, 1600],
    'Vitamin B12 Test': [600, 1400],
    'Urine Test': [100, 300],
    'CBC Test': [150, 400],
    'Hemoglobin Test': [100, 250],
    'Chest X-Ray': [200, 500],
    'Abdominal Ultrasound': [500, 1200],
    'Kidney Ultrasound': [500, 1200],
    'Cardiac Test': [500, 1500],
    'Stress Test': [1200, 2500],
    Mammography: [1000, 2500],
    'Bone Density Test': [1000, 2500],
    'Allergy Test': [800, 2000],
  }

  const range = priceRanges[testName] || [200, 1000]

  return random(range[0], range[1])
}

// --------------------------------------------------
// UPSERT HOSPITAL
// --------------------------------------------------

async function upsertHospital(data) {
  const existing = await prisma.hospital.findFirst({
    where: {
      name: data.name,
      city: data.city,
    },
  })

  if (existing) {
    return prisma.hospital.update({
      where: {
        id: existing.id,
      },
      data,
    })
  }

  return prisma.hospital.create({
    data,
  })
}

// --------------------------------------------------
// MAIN
// --------------------------------------------------

async function main() {
  console.log('🌱 Starting database seed...\n')

  // ----------------------------------------------
  // 1. Insert / update tests
  // ----------------------------------------------

  const testByName = new Map()

  for (const test of tests) {
    const saved = await prisma.test.upsert({
      where: {
        name: test.name,
      },

      update: test,

      create: test,
    })

    testByName.set(saved.name, saved)
  }

  console.log(`✅ ${tests.length} tests ready`)

  // ----------------------------------------------
  // 2. Generate hospitals
  // ----------------------------------------------

  const hospitals = generateHospitals()

  console.log(`🏥 Generated ${hospitals.length} hospitals\n`)

  // ----------------------------------------------
  // 3. Insert hospitals + prices
  // ----------------------------------------------

  let priceCount = 0

  for (const hospitalData of hospitals) {
    const hospital = await upsertHospital(hospitalData)

    // Each hospital gets 8-15 random tests
    const selectedTests = shuffle(tests).slice(
      0,
      random(8, 15)
    )

    for (const testData of selectedTests) {
      const test = testByName.get(testData.name)

      if (!test) {
        continue
      }

      const price = generatePrice(test.name)

      await prisma.testPrice.upsert({
        where: {
          testId_hospitalId: {
            testId: test.id,
            hospitalId: hospital.id,
          },
        },

        update: {
          price,
        },

        create: {
          hospitalId: hospital.id,
          testId: test.id,
          price,
        },
      })

      priceCount++
    }
  }

  console.log('\n----------------------------------')
  console.log('🎉 DATABASE SEED COMPLETED')
  console.log('----------------------------------')
  console.log(`🏥 Hospitals: ${hospitals.length}`)
  console.log(`🧪 Tests: ${tests.length}`)
  console.log(`💰 Test Prices: ${priceCount}`)
  console.log('----------------------------------')
}

main()
  .catch((error) => {
    console.error('\n❌ Seed error:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
