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
        'tests/**',
        'src/generated/**'
      ],
      // Updated thresholds to enforce 80%+ coverage
      // Security-critical files have 95%+ coverage (tools: 97.2%, utils: 95.45%, schemas: 100%)
      // Line threshold set to 80% (up from 78.9%) — achievable with new test infrastructure
      // Branch threshold set to 72% (up from 70%) — incremental improvement
      // Function threshold set to 82% (up from 80%) — achievable with new mocked tests
      //
      // Per-file thresholds (Vitest 3+ `thresholds.<glob>` map syntax) enforce tighter
      // gates on the 15 OSINT tools:
      //   • Non-DOCEO tools (10): lines ≥90, branches ≥78, functions ≥90, statements ≥88
      //   • DOCEO-touching tools (5): lines ≥92, branches ≥78, functions ≥95, statements ≥90
      //     (assessMepInfluence, detectVotingAnomalies, sentimentTracker, networkAnalysis,
      //      analyzeCoalitionDynamics — carry the highest correctness risk)
      // Follow-up to #461 / PR #474. ISMS: A.8.29.
      thresholds: {
        lines: 80,
        branches: 72,
        functions: 82,
        statements: 82,
        perFile: false,
        // DOCEO-touching OSINT tools — highest correctness risk surface.
        // Thresholds calibrated to current coverage floor (branches ~80 %,
        // statements ~93 %) with small headroom to avoid flaky CI. Promote
        // once coverage improves.
        'src/tools/{assessMepInfluence,detectVotingAnomalies,sentimentTracker,networkAnalysis,analyzeCoalitionDynamics}.ts': {
          lines: 92,
          branches: 78,
          functions: 95,
          statements: 90
        },
        // Remaining OSINT tools — registered with `category: 'osint'` in src/server/toolRegistry.ts.
        // Thresholds calibrated to current coverage floor (branches ~80 %,
        // statements ~88 %). Promote as coverage improves.
        'src/tools/{analyzeCommitteeActivity,analyzeCountryDelegation,analyzeLegislativeEffectiveness,comparativeIntelligence,comparePoliticalGroups,correlateIntelligence,earlyWarningSystem,generatePoliticalLandscape,monitorLegislativePipeline,trackMepAttendance}.ts': {
          lines: 90,
          branches: 78,
          functions: 90,
          statements: 88
        }
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
