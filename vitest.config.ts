import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: process.env.TYPES ? ['./test/globalSetup.ts'] : undefined,
    include: [
      ...(process.env.TYPES ? ['src/**/*.bench-d.ts'] : []),
      'src/**/*.test-d.ts',
      'src/**/*.test.ts',
      'test/**/*.test-d.ts',
      'test/**/*.test.ts',
    ],
  },
})
