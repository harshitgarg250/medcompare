import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://harshitgarg@localhost:5432/medcompare?schema=public',
  },
})