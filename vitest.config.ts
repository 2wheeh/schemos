import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    projects: [
      {
        test: {
          name: 'unit',
          globalSetup: process.env.TYPES
            ? ['./test/globalSetup.ts']
            : undefined,
          include: [
            ...(process.env.TYPES ? ['src/**/*.bench-d.ts'] : []),
            'src/**/*.test-d.ts',
            'src/**/*.test.ts',
            'test/spike/**/*.test-d.ts',
            'test/spike/**/*.test.ts',
          ],
        },
      },
      ...(process.env.E2E
        ? [
            {
              test: {
                name: 'e2e',
                include: ['test/e2e/**/*.test.ts'],
                fileParallelism: false,
                globalSetup: './test/e2e/global-setup.ts',
                testTimeout: 60_000,
              },
            },
          ]
        : []),
    ],
  },
})
