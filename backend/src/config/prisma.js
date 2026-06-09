const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Client } = require('pg')
require('dotenv').config()

const connectionString = process.env.DATABASE_URL

console.log('🔌 Prisma Config:')
console.log('   DATABASE_URL:', connectionString ? '✓ SET' : '❌ NOT SET')
console.log('   Full URL:', connectionString)

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set!')
  process.exit(1)
}

try {
  const client = new Client({ connectionString })
  console.log('✅ Client created successfully')
  
  const adapter = new PrismaPg({ client })
  console.log('✅ Adapter created successfully')
  
  const prisma = new PrismaClient({ adapter })
  console.log('✅ Prisma Client created successfully')
  
  module.exports = prisma
} catch (error) {
  console.error('❌ Error creating Prisma client:', error.message)
  throw error
}