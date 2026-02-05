import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
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
        // Current coverage: 79.28% (with all tests including slow)
        // Fast tests only: ~65%
        // Target: 80% for v1.0.0 (achieved with full test suite)
        lines: 75,
        functions: 75,
        branches: 65,
        statements: 75,
      },
    },
  },
})
