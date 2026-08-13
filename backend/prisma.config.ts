/// <reference types="node" />

import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DIRECT_URL!,
    },
  },
})