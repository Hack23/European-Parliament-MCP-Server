import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.config.ts',
        '**/types/**',
        'tests/**'
      ],
      // Updated thresholds to enforce 80%+ coverage
      // Security-critical files have 95%+ coverage (tools: 97.2%, utils: 95.45%, schemas: 100%)
      // Line threshold set to 80% (up from 78.9%) — achievable with new test infrastructure
      // Branch threshold set to 72% (up from 70%) — incremental improvement
      // Function threshold set to 82% (up from 80%) — achievable with new mocked tests
      thresholds: {
        lines: 80,
        branches: 72,
        functions: 82,
        statements: 82
      }
    },
    reporters: ['default', 'html', 'json'],
    outputFile: {
      html: './builds/test-results/index.html',
      json: './builds/test-results/results.json'
    },
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'tests/**/*.test.ts'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'tests/e2e/**', // E2E tests require live EP API — run via `npm run test:e2e`
      'tests/helpers/**', // Test utilities
      'tests/fixtures/**' // Test data
    ],
    testTimeout: 10000,
    hookTimeout: 10000
  }
});
