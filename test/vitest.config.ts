import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { conditions: ['source'] },
  ssr: { resolve: { conditions: ['source'] } },
  test: {
    environment: 'node',
    include: ['./**/*.test.ts'],
    fileParallelism: false,
    globalSetup: './global-setup.ts',
    testTimeout: 60_000,
    reporters: ['default', 'verbose'],
  },
})
