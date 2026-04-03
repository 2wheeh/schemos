import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    projects: [
      {
        test: {
          name: 'unit',
          include: [
            ...(process.env.TYPES ? ['src/**/*.bench-d.ts'] : []),
            'src/**/*.test-d.ts',
            'src/**/*.test.ts',
          ],
          globalSetup: [...(process.env.TYPES ? ['./global-setup.ts'] : [])],
        },
      },
    ],
  },
})
