require('dotenv').config()
const prisma = require('../src/config/prisma')

const tests = [
  { name: 'Blood Test', category: 'Pathology', description: 'Complete blood count and basic screening' },
  { name: 'MRI Scan', category: 'Radiology', description: 'Magnetic resonance imaging scan' },
  { name: 'X-Ray', category: 'Radiology', description: 'Digital X-ray imaging' },
  { name: 'CT Scan', category: 'Radiology', description: 'Computed tomography scan' },
  { name: 'ECG', category: 'Cardiology', description: 'Electrocardiogram heart screening' },
  { name: 'Ultrasound', category: 'Radiology', description: 'Ultrasound imaging test' },
  { name: 'Thyroid Profile', category: 'Pathology', description: 'T3, T4 and TSH thyroid screening' },
  { name: 'Liver Function Test', category: 'Pathology', description: 'LFT blood panel' },
  { name: 'Kidney Function Test', category: 'Pathology', description: 'KFT blood panel' },
  { name: 'Lipid Profile', category: 'Pathology', description: 'Cholesterol and triglyceride profile' },
]

const hospitals = [
  {
    name: 'City Hospital',
    type: 'Diagnostic Center',
    address: 'Rajpur Road',
    city: 'Dehradun',
    lat: 30.3256,
    lng: 78.0437,
    phone: '+91 98765 11001',
    email: 'city@medcompare.demo',
    rating: 4.5,
    prices: {
      'Blood Test': [80, '15 min', '24 hrs'],
      'MRI Scan': [2500, '45 min', 'Same day'],
      'X-Ray': [200, '10 min', '2 hrs'],
      'Thyroid Profile': [350, '15 min', '24 hrs'],
    },
  },
  {
    name: 'Kailash Hospital',
    type: 'Multi-speciality Hospital',
    address: 'Haridwar Road',
    city: 'Dehradun',
    lat: 30.3008,
    lng: 78.0461,
    phone: '+91 98765 11002',
    email: 'kailash@medcompare.demo',
    rating: 4.3,
    prices: {
      'Blood Test': [90, '15 min', '24 hrs'],
      'CT Scan': [1500, '30 min', 'Same day'],
      ECG: [150, '10 min', '30 min'],
      'Liver Function Test': [500, '15 min', '24 hrs'],
    },
  },
  {
    name: 'Synergy Hospital',
    type: 'Hospital',
    address: 'Ballupur Road',
    city: 'Dehradun',
    lat: 30.3346,
    lng: 78.0108,
    phone: '+91 98765 11003',
    email: 'synergy@medcompare.demo',
    rating: 4.6,
    prices: {
      'Blood Test': [100, '15 min', '24 hrs'],
      'MRI Scan': [2800, '45 min', 'Same day'],
      Ultrasound: [400, '20 min', '4 hrs'],
      'Kidney Function Test': [480, '15 min', '24 hrs'],
    },
  },
  {
    name: 'Velmed Hospital',
    type: 'Hospital',
    address: 'Turner Road',
    city: 'Dehradun',
    lat: 30.2866,
    lng: 78.0078,
    phone: '+91 98765 11004',
    email: 'velmed@medcompare.demo',
    rating: 4.2,
    isOpen: false,
    prices: {
      'X-Ray': [220, '10 min', '2 hrs'],
      'CT Scan': [1600, '30 min', 'Same day'],
      ECG: [180, '10 min', '30 min'],
      'Lipid Profile': [650, '15 min', '24 hrs'],
    },
  },
  {
    name: 'Apollo Hospital',
    type: 'Hospital',
    address: 'Sarita Vihar',
    city: 'Delhi',
    lat: 28.5363,
    lng: 77.2839,
    phone: '+91 98765 11005',
    email: 'apollo@medcompare.demo',
    rating: 4.7,
    prices: {
      'Blood Test': [120, '15 min', '24 hrs'],
      'MRI Scan': [3200, '45 min', 'Same day'],
      Ultrasound: [550, '20 min', '4 hrs'],
      'Thyroid Profile': [450, '15 min', '24 hrs'],
    },
  },
  {
    name: 'Max Hospital',
    type: 'Hospital',
    address: 'Saket',
    city: 'Delhi',
    lat: 28.5276,
    lng: 77.213,
    phone: '+91 98765 11006',
    email: 'max@medcompare.demo',
    rating: 4.5,
    prices: {
      'Blood Test': [110, '15 min', '24 hrs'],
      'CT Scan': [1900, '30 min', 'Same day'],
      'X-Ray': [250, '10 min', '2 hrs'],
      'Liver Function Test': [600, '15 min', '24 hrs'],
    },
  },
]

async function upsertHospital(data) {
  const existing = await prisma.hospital.findFirst({ where: { name: data.name, city: data.city } })
  const hospitalData = {
    name: data.name,
    type: data.type,
    address: data.address,
    city: data.city,
    lat: data.lat,
    lng: data.lng,
    phone: data.phone,
    email: data.email,
    rating: data.rating,
    isOpen: data.isOpen ?? true,
    isVerified: true,
  }

  if (existing) {
    return prisma.hospital.update({ where: { id: existing.id }, data: hospitalData })
  }

  return prisma.hospital.create({ data: hospitalData })
}

async function main() {
  const testByName = new Map()

  for (const test of tests) {
    const saved = await prisma.test.upsert({
      where: { name: test.name },
      update: test,
      create: test,
    })
    testByName.set(saved.name, saved)
  }

  for (const hospitalSeed of hospitals) {
    const hospital = await upsertHospital(hospitalSeed)

    for (const [testName, [price, duration, reportTime]] of Object.entries(hospitalSeed.prices)) {
      const test = testByName.get(testName)
      if (!test) continue

      await prisma.testPrice.upsert({
        where: {
          hospitalId_testId: {
            hospitalId: hospital.id,
            testId: test.id,
          },
        },
        update: { price, duration, reportTime },
        create: {
          hospitalId: hospital.id,
          testId: test.id,
          price,
          duration,
          reportTime,
        },
      })
    }
  }

  console.log(`Seeded ${hospitals.length} hospitals and ${tests.length} tests.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
