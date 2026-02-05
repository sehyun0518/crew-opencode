import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.config.ts',
        'src/cli/index.ts',
      ],
      thresholds: {
        // TODO: Increase thresholds as test coverage improves
        // Target: 80% for v1.0.0
        lines: 25,
        functions: 50,
        branches: 40,
        statements: 25,
      },
    },
  },
})
