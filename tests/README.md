# European Parliament MCP Server Tests

This directory contains the integration, E2E, and performance test suites for the European Parliament MCP Server.

## Directory Structure

```
tests/
├── integration/          # Integration tests with real EP API
├── e2e/                  # End-to-end MCP client tests
├── performance/          # Performance benchmarks
├── fixtures/             # Test data and fixtures
└── helpers/              # Test utilities
```

## Quick Start

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit          # Unit tests (in src/)
npm run test:integration   # Integration tests
npm run test:e2e           # E2E tests
npm run test:performance   # Performance tests

# Run with coverage
npm run test:coverage
```

## Test Suites

### Integration Tests (`tests/integration/`)

Tests integration with the European Parliament API:
- API client functionality
- Caching behavior
- Rate limiting
- Error handling
- Data validation

**Configuration**:
- `EP_INTEGRATION_TESTS=true` — Run against real API (disabled in CI by default)
- `EP_USE_MOCK=true` — Use synthetic fixture data instead of real API
- `EP_API_URL=...` — Override API base URL

### E2E Tests (`tests/e2e/`)

Tests complete user workflows via MCP client:
- All 46 MCP tools (`fullWorkflow.e2e.test.ts`)
- MEP query workflows (`mepQueries.e2e.test.ts`)
- Prompts and resource templates (`promptsAndResources.e2e.test.ts`)
- MCP protocol compliance
- Tool input validation
- Error handling and recovery

**Requires**: Built server (`npm run build`)

### Performance Tests (`tests/performance/`)

Validates performance requirements using mocked EP client (no real API calls):
- Response time benchmarks (`benchmarks.test.ts`) — <200ms (CI: <500ms)
- EP API endpoint latency (`apiLatency.test.ts`) — per-tool latency
- Concurrent request handling (`concurrency.test.ts`) — parallel request safety
- Throughput (5+ req/s)
- Cache effectiveness (80%+ hit rate)
- Memory usage

**CI Detection**: `CI=true` automatically increases thresholds to `500ms` for cached
and `15000ms` for concurrent request tests.

## Environment Variables

Create `.env.test` for test configuration:

```env
# European Parliament API
EP_API_URL=https://data.europarl.europa.eu/api/v2/
EP_INTEGRATION_TESTS=false
EP_USE_MOCK=false

# Test configuration
NODE_ENV=test
TEST_RATE_LIMIT_TOKENS=50
TEST_RATE_LIMIT_INTERVAL=minute
TEST_CACHE_TTL=900000
TEST_CACHE_MAX_SIZE=500

# Timeout override (milliseconds)
TEST_TIMEOUT_MS=10000

# CI detection
CI=false
```

## Test Utilities

### Fixtures (`tests/fixtures/`)

GDPR-compliant **synthetic** data for testing without hitting real API:

```typescript
// Original mock data
import { mockMEPs, mockPlenarySessions } from './fixtures/mockEPData.js';

// Extended fixture modules
import { mepFixtures } from './fixtures/mepFixtures.js';
import { plenaryFixtures } from './fixtures/plenaryFixtures.js';
import { votingFixtures } from './fixtures/votingFixtures.js';
import { documentFixtures } from './fixtures/documentFixtures.js';
import { committeeFixtures } from './fixtures/committeeFixtures.js';
import { procedureFixtures } from './fixtures/procedureFixtures.js';
import { questionFixtures } from './fixtures/questionFixtures.js';
```

All synthetic data uses clearly non-real names ("Anna Andersson", "Klaus Mueller")
and test IDs ("mep-test-001"). No real EP personal data is used in tests.

### Helpers (`tests/helpers/`)

Test utilities for common operations:

```typescript
import {
  retry,
  retryOrSkip,
  measureTime,
  waitFor,
  parseMCPResponse,
  parsePaginatedMCPResponse,
  validateMCPResponse,
  getTestTimeout,
  DEFAULT_TEST_TIMEOUT_MS
} from './helpers/testUtils.js';

// Mock EP client for unit/performance tests
import { createMockEPClient, getMockEPClient, resetMockEPClient } from './helpers/mockEPClient.js';

// EP API mock server helpers
import {
  buildEPApiResponse,
  buildPaginatedEPApiResponse,
  createMockFetch,
  createRateLimitingMockFetch,
  setupEPApiMocks,
  teardownEPApiMocks
} from './helpers/epApiMock.js';
```

## Writing Tests

### Performance Test Example (with vi.mock)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { measureTime } from '../helpers/testUtils.js';
import { mepFixtures } from '../fixtures/mepFixtures.js';

vi.mock('../../src/clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn().mockResolvedValue({ data: mepFixtures, total: 5 })
  }
}));

const { handleGetMEPs } = await import('../../src/tools/getMEPs.js');

describe('Performance', () => {
  it('should respond in <200ms (mocked)', async () => {
    const [, duration] = await measureTime(() => handleGetMEPs({ limit: 10 }));
    expect(duration).toBeLessThan(200);
  });
});
```

### Integration Test Example (with mock client)

```typescript
import { describe, it, expect } from 'vitest';
import { epClient, useMockClient } from './setup.js';

describe('EP API Integration', () => {
  it('should fetch MEPs data', async () => {
    const result = await epClient.getMEPs({ country: 'SE', limit: 10 });
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    // Works with both real API and mock (EP_USE_MOCK=true)
  });
});
```

### E2E Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MCPTestClient } from './mcpClient.js';
import { parsePaginatedMCPResponse } from '../helpers/testUtils.js';

describe('MEP Queries E2E', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    client = new MCPTestClient();
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  it('should retrieve MEPs', async () => {
    const response = await client.callTool('get_meps', { limit: 5 });
    const data = parsePaginatedMCPResponse(response.content);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should list prompts', async () => {
    const prompts = await client.listPrompts();
    expect(prompts.length).toBeGreaterThanOrEqual(6);
  });

  it('should list resource templates', async () => {
    const templates = await client.listResourceTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(6);
  });
});
```

## CI/CD Integration

Tests run in GitHub Actions via `.github/workflows/integration-tests.yml`:

- Runs on: pull requests, pushes to main, daily schedule
- Environment: Node.js 24.x, Ubuntu latest
- Artifacts: Coverage reports, test results
- Integration: Codecov for coverage reporting

**Performance tests** now run in CI without `it.skip` — they use mocked EP client
so no real API calls are made. CI detection (`CI=true`) adjusts thresholds automatically.

## Coverage Requirements

- **Lines**: 80%+ ✅
- **Branches**: 72%+
- **Functions**: 82%+
- **Statements**: 82%+
- **Security-Critical** (tools, utils, schemas): 95%+

## GDPR Compliance

All test fixtures use **synthetic data** only:
- Names: "Anna Andersson", "Klaus Mueller", "Marie Dupont" (clearly synthetic)
- IDs: "mep-test-001", "session-test-001" (test prefix)
- No real contact information, addresses, or personal data
- Compliant with ISMS DP-001 (Data Protection and GDPR Compliance)

## ISMS Compliance

Testing aligns with Hack23 ISMS policies:
- ISO 27001 A.14.2.8 - System security testing
- NIST CSF 2.0 ID.RA-5 - Vulnerability identification
- CIS Control 18.3 - Secure application testing

See: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)

## Documentation

- [Full Testing Guide](../docs/TESTING_GUIDE.md) - Comprehensive testing documentation
- [Contributing Guide](../CONTRIBUTING.md) - Testing requirements for contributors
- [Security Policy](../SECURITY.md) - Security testing practices

## Troubleshooting

### Integration Tests Failing

1. Check `EP_INTEGRATION_TESTS` environment variable
2. Try `EP_USE_MOCK=true` to use synthetic data instead
3. Verify network connectivity
4. Check rate limits not exceeded
5. Review EP API status

### E2E Tests Failing

1. Rebuild server: `npm run build`
2. Verify server starts: `node dist/index.js`
3. Check stdio transport communication
4. Review server logs in test output

### Performance Tests Failing

1. Tests now use mocked EP client — should not fail from API issues
2. If threshold exceeded: `CI=true` sets more lenient thresholds
3. Clear caches: `rm -rf node_modules/.cache`
4. Run in isolation: `npm run test:performance`

## Support

For issues or questions:
- Open an issue: [GitHub Issues](https://github.com/Hack23/European-Parliament-MCP-Server/issues)
- Review docs: [docs/](../docs/)
- Check ISMS: [Hack23 ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC)
