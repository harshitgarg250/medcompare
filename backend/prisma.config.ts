import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

export default defineConfig({
  datasource: {
    url: 'postgresql://harshitgarg@localhost:5432/medcompare?schema=public',
  },
})