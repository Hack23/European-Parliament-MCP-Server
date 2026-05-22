import { defineConfig } from 'vitest/config';

// Vitest configuration scoped for Stryker mutation testing.
//
// Stryker's vitest-runner reads this file via stryker.config.json#vitest.configFile
// and executes the full test suite once during its initial dry-run (to discover
// which tests cover which mutants) and again per mutant. Using the default
// vitest.config.ts pulls in tests/**/*.test.ts (integration tests that hit the
// live European Parliament API), which times out Stryker's dry-run on CI.
//
// This config restricts the include glob to src/**/*.{test,spec}.ts -- the
// unit tests that cover the 15 OSINT tools + 7 shared utils declared in
// stryker.config.json#mutate -- so the dry-run finishes well within the
// 5-minute Stryker default.
//
// Globals, environment, and timeouts mirror the main config; the only
// intentional differences are the include glob and the omitted coverage
// block (Stryker provides its own coverage instrumentation via perTest).
//
// ISMS: A.8.29 (Security testing in development & acceptance).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'tests/**'
    ],
    testTimeout: 10000,
    hookTimeout: 10000
  }
});
