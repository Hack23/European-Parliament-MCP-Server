import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/e2e/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/'],
    testTimeout: 60000,
    hookTimeout: 30000
  }
});
