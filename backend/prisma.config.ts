import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: 'postgresql://harshitgarg@localhost:5432/medcompare?schema=public',
  },
})