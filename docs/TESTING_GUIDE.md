# Testing Guide

Comprehensive testing documentation for the European Parliament MCP Server.

## Table of Contents

- [Overview](#overview)
- [Test Infrastructure](#test-infrastructure)
- [Coverage Requirements](#coverage-requirements)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests for MCP Tools](#writing-tests-for-mcp-tools)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [Performance Tests](#performance-tests)
- [CI/CD Integration](#cicd-integration)
- [Security Testing](#security-testing)
- [ISMS Compliance](#isms-compliance)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

This project implements a comprehensive testing strategy across four layers:

1. **Unit Tests** — Test individual functions and modules (`src/**/*.test.ts`)
2. **Integration Tests** — Test integration with real European Parliament API (`tests/integration/`)
3. **E2E Tests** — Test complete workflows via MCP client (`tests/e2e/`)
4. **Performance Tests** — Validate performance requirements (`tests/performance/`)

## Test Infrastructure

| Tool | Version | Purpose |
|------|---------|---------|
| [Vitest](https://vitest.dev/) | 4.x | Unit test runner with native ESM support |
| `@vitest/coverage-v8` | 4.x | V8 native code coverage |
| `@vitest/ui` | 4.x | Interactive browser test UI |
| TypeScript | 5.x | Type-checked test files |
| `MCPTestClient` | internal | Stdio-based MCP E2E harness |

### Vitest Configuration

Unit tests use `vitest.config.ts` (default):

```typescript
// vitest.config.ts (abbreviated)
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
```

E2E tests use a separate config `vitest.e2e.config.ts`.

## Coverage Requirements

| Metric | Threshold | Notes |
|--------|-----------|-------|
| Lines | **80%** | Enforced by Vitest coverage gate |
| Statements | **80%** | Enforced by Vitest coverage gate |
| Functions | **80%** | Enforced by Vitest coverage gate |
| Branches | **70%** | Enforced by Vitest coverage gate |
| Security-critical code | **95%** | Rate limiter, input validation, audit logger |

Coverage is reported to GitHub Pages on every CI run:
**[📊 Coverage Report →](https://hack23.github.io/European-Parliament-MCP-Server/coverage/)**

## Test Structure

```
src/
└── tools/
    ├── getMEPs.ts                    # Tool implementation
    └── getMEPs.test.ts               # Co-located unit test ← preferred location

tests/
├── integration/                      # Integration tests with real EP API
│   ├── setup.ts                     # Environment setup, shared client
│   ├── epApi.integration.test.ts    # Raw API client tests
│   └── tools.integration.test.ts    # Tool-level integration tests
├── e2e/                             # End-to-end MCP client tests
│   ├── mcpClient.ts                 # MCP stdio test harness
│   ├── mepQueries.e2e.test.ts       # MEP tool E2E tests
│   ├── plenarySession.e2e.test.ts   # Plenary tool E2E tests
│   └── fullWorkflow.e2e.test.ts     # Multi-tool workflow tests
├── performance/                     # Performance benchmarks
│   ├── benchmarks.test.ts           # Latency benchmarks
│   ├── loadTest.test.ts             # Concurrency tests
│   └── cachePerformance.test.ts     # Cache hit-rate tests
├── fixtures/                        # Mock data for unit tests
│   └── mockEPData.ts               # Typed mock MEPs, sessions, etc.
└── helpers/                         # Shared test utilities
    └── testUtils.ts                 # retry(), measureTime(), parseMCPResponse()
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests (fast, no network)
npm run test:unit

# Run in interactive watch mode (TDD)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run a specific test file
npx vitest run src/tools/getMEPs.test.ts

# Run tests matching a pattern
npx vitest run --reporter=verbose -t "handleGetMEPs"
```

### All Tests

```bash
# Run every test suite sequentially
npm run test:all

# Run with full coverage + JUnit XML for CI
npm run test:ci
```

### Integration Tests

```bash
# Dry-run (no real API calls — default)
npm run test:integration

# Enable real API tests (use with caution — rate-limited)
EP_INTEGRATION_TESTS=true npm run test:integration

# Capture fresh API fixtures
EP_INTEGRATION_TESTS=true EP_SAVE_FIXTURES=true npm run test:integration
```

### E2E Tests

```bash
# Run E2E tests via MCP stdio client
npm run test:e2e

# Run a specific E2E test
npx vitest run --config vitest.e2e.config.ts tests/e2e/mepQueries.e2e.test.ts
```

### Performance Tests

```bash
npm run test:performance
```

## Writing Tests for MCP Tools

Every tool at `src/tools/myTool.ts` must have `src/tools/myTool.test.ts`.

### Required Test Cases

Each tool test file must cover:

| Test case | Why |
|-----------|-----|
| Valid input returns `ToolResult` with `content[0].type === "text"` | Verifies MCP protocol compliance |
| Valid input returns parseable JSON | Ensures `buildToolResponse` works correctly |
| API failure throws descriptive `Error` | Verifies error sanitization |
| Invalid/empty required field throws `ZodError` | Verifies input validation |
| Default parameter values are applied | Ensures sensible defaults work |
| Boundary values (min/max limit) | Prevents regression on edge cases |

### Test File Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleMyTool, myToolMetadata } from './myTool.js';

// Mock the EP client — unit tests must not make real API calls
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    someMethod: vi.fn(),
  },
}));

import { epClient } from '../clients/europeanParliamentClient.js';

describe('myTool', () => {
  describe('handleMyTool', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns valid ToolResult for valid input', async () => {
      // Arrange
      const mockData = { data: [{ id: '1', title: 'Test' }], total: 1 };
      vi.mocked(epClient.someMethod).mockResolvedValue(mockData);

      // Act
      const result = await handleMyTool({ subjectId: 'ENVI', limit: 10 });

      // Assert — MCP protocol compliance
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      // Assert — data integrity
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.total).toBe(1);
      expect(parsed.data).toHaveLength(1);
    });

    it('throws descriptive error when API fails', async () => {
      vi.mocked(epClient.someMethod).mockRejectedValue(new Error('Network timeout'));

      await expect(handleMyTool({ subjectId: 'ENVI' }))
        .rejects.toThrow('Failed to fetch data: Network timeout');
    });

    it('throws ZodError for empty required string', async () => {
      await expect(handleMyTool({ subjectId: '' }))
        .rejects.toThrow();  // ZodError from schema.parse
    });

    it('throws ZodError when required field is missing', async () => {
      await expect(handleMyTool({}))
        .rejects.toThrow();
    });

    it('applies default limit when not provided', async () => {
      vi.mocked(epClient.someMethod).mockResolvedValue({ data: [], total: 0 });

      await handleMyTool({ subjectId: 'ENVI' });

      expect(epClient.someMethod).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      );
    });

    it('respects maximum limit boundary', async () => {
      vi.mocked(epClient.someMethod).mockResolvedValue({ data: [], total: 0 });

      await handleMyTool({ subjectId: 'ENVI', limit: 100 });

      expect(epClient.someMethod).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });
  });

  describe('myToolMetadata', () => {
    it('has correct tool name', () => {
      expect(myToolMetadata.name).toBe('my_tool');
    });

    it('has non-empty description', () => {
      expect(myToolMetadata.description.length).toBeGreaterThan(20);
    });

    it('has valid inputSchema type', () => {
      expect(myToolMetadata.inputSchema.type).toBe('object');
    });
  });
});
```

### Testing with Mock Data

Use shared fixtures from `tests/fixtures/mockEPData.ts`:

```typescript
import { mockMEPs, mockPlenarySessions } from '../../tests/fixtures/mockEPData.js';

vi.mocked(epClient.getMEPs).mockResolvedValue({
  data: mockMEPs,
  total: mockMEPs.length,
});
```

### Asserting MCP Response Structure

```typescript
import { parseMCPResponse, parsePaginatedMCPResponse } from '../../tests/helpers/testUtils.js';

// For paginated tools (most tools)
const result = await handleGetMEPs({ limit: 5 });
const data = parsePaginatedMCPResponse<MEP>(result.content);
expect(data.length).toBeGreaterThan(0);

// For single-entity tools
const result = await handleGetMEPDetails({ id: '12345' });
const mep = parseMCPResponse(result.content);
expect(mep.id).toBe('12345');
```

## Integration Tests

Integration tests validate interaction with the real European Parliament API.

### Configuration

```env
# .env.test
EP_API_URL=https://data.europarl.europa.eu/api/v2
EP_INTEGRATION_TESTS=false   # Set to 'true' to run against real API
EP_SAVE_FIXTURES=false        # Set to 'true' to capture API responses as fixtures
```

### Features Tested

- ✅ Real API data fetching for all 46 tools
- ✅ Caching behavior and hit-rate effectiveness
- ✅ Rate limiting compliance (no 429 responses)
- ✅ Error handling (network errors, invalid parameters)
- ✅ Data validation (required fields, correct types)
- ✅ Response time SLA (<2s P99 uncached)

### Example

```typescript
import { describe, it, expect } from 'vitest';
import { epClient } from './setup.js';
import { retry, measureTime } from '../helpers/testUtils.js';

describe('EP API Integration — getMEPs', () => {
  it('fetches real MEP data within SLA', async () => {
    const [result, duration] = await measureTime(() =>
      retry(() => epClient.getMEPs({ country: 'SE', limit: 10 }))
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(2000);  // 2s P99 SLA
  });
}, 30000);
```

## E2E Tests

E2E tests validate complete workflows using an actual MCP client connecting to the
server via stdio transport.

### MCP Test Client

```typescript
import { MCPTestClient } from './mcpClient.js';

const client = new MCPTestClient();
await client.connect();

// Call a tool
const response = await client.callTool('get_meps', { limit: 10 });

// List available tools (should return 46)
const tools = await client.listTools();
expect(tools.length).toBe(46);

// Read a resource
const resource = await client.readResource('ep://meps');

// Get a prompt
const prompt = await client.getPrompt('mep_briefing', { mepId: '12345' });

await client.disconnect();
```

### Features Tested

- ✅ MCP protocol compliance (tool listing, call, error)
- ✅ All 46 MCP tools respond without crashing
- ✅ Tool input validation rejects malformed arguments
- ✅ All 9 MCP resources are readable
- ✅ All 7 MCP prompts return structured messages
- ✅ Complete user workflows (MEP research, legislation tracking)
- ✅ Client recovery from tool errors

## Performance Tests

### Performance Targets

| Metric | Target |
|--------|--------|
| Cached response time | < 200ms (P95) |
| Uncached API response | < 2 000ms (P99) |
| Concurrent requests | 10+ without errors |
| Cache hit rate | ≥ 80% on repeated queries |
| Memory stability | No leaks on 100 sequential requests |

### Example

```typescript
import { describe, it, expect } from 'vitest';
import { handleGetMEPs } from '../../src/tools/getMEPs.js';
import { measureTime } from '../helpers/testUtils.js';

describe('Performance — getMEPs cached', () => {
  it('cached response under 200ms', async () => {
    // Warm cache
    await handleGetMEPs({ limit: 10 });

    // Measure cached request
    const [, duration] = await measureTime(() =>
      handleGetMEPs({ limit: 10 })
    );

    expect(duration).toBeLessThan(200);
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on every push and PR:

```yaml
# .github/workflows/ci.yml (abbreviated)
- name: Run unit tests with coverage
  run: npm run test:coverage

- name: Run E2E tests
  run: npm run test:e2e

- name: Run performance tests
  run: npm run test:performance
```

Integration tests run on a daily schedule to catch API changes:

```yaml
schedule:
  - cron: '0 2 * * *'
```

### Coverage Upload

Coverage reports are published to GitHub Pages via `docs:coverage` script and
available at **https://hack23.github.io/European-Parliament-MCP-Server/coverage/**.

## Security Testing

All tests validate security controls per [Hack23 ISMS policies](https://github.com/Hack23/ISMS-PUBLIC):

| Control | What is tested |
|---------|---------------|
| Input Validation | Zod schema rejects invalid/empty/oversized inputs |
| Rate Limiting | Server enforces 100 req/15 min; 101st request is throttled |
| Error Sanitization | Error messages don't contain stack traces or internal URLs |
| Audit Logging | `AuditLogger.log()` is called for personal data access |
| HTTPS | All API calls use `https://` — HTTP is rejected |

### Security-Critical Coverage (95%+)

Files requiring 95%+ coverage:
- `src/utils/rateLimiter.ts`
- `src/utils/auditLogger.ts`
- `src/schemas/europeanParliament.ts`

## ISMS Compliance

Testing aligns with [Hack23 ISMS policies](https://github.com/Hack23/ISMS-PUBLIC):

| Policy Reference | Requirement | Implementation |
|-----------------|-------------|---------------|
| ISO 27001 A.14.2.8 | System security testing | Security test suite covering all controls |
| NIST CSF 2.0 ID.RA-5 | Vulnerability identification | `npm audit` + CodeQL in CI |
| CIS Control 18.3 | Secure application testing | Zod validation tests in all tool tests |

## Troubleshooting

### Integration Tests Failing

- Check `EP_INTEGRATION_TESTS` environment variable is `true`
- Verify network connectivity: `curl https://data.europarl.europa.eu/api/v2/meps?limit=1`
- Check rate limits — wait 15 minutes after hitting 429 errors
- Review API status at https://data.europarl.europa.eu/en/developer-corner

### E2E Tests Failing

- Ensure TypeScript builds successfully: `npm run build`
- Verify server starts: `node dist/index.js` (should wait for MCP input silently)
- Check that Vitest E2E config points to the correct server binary

### Performance Tests Failing

- Run tests in isolation: `npm run test:performance`
- Clear Node.js module cache between runs
- Ensure no background processes are consuming CPU/network

### Coverage Below Threshold

- Run `npm run test:coverage` and open `coverage/index.html`
- Find untested branches in the tool handler's `try/catch` block
- Add tests for API error scenarios and edge-case inputs

## Best Practices

1. **Isolation** — Unit tests mock all external dependencies (`vi.mock(...)`)
2. **Determinism** — Use fixed mock data; never call real APIs in unit tests
3. **Coverage** — Write tests for all branches including error paths
4. **Assertions** — Assert specific values, not just `toBeTruthy()`
5. **Cleanup** — Call `vi.clearAllMocks()` in `beforeEach`
6. **Timeouts** — Set explicit timeouts for async integration tests (30 000 ms)
7. **Documentation** — Describe test purpose in `it()` description strings

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage)
- [MCP SDK Documentation](https://modelcontextprotocol.io/)
- [European Parliament API](https://data.europarl.europa.eu/)
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
- [docs/TOOL_DEVELOPMENT.md](./TOOL_DEVELOPMENT.md) — Tool test patterns

## Test Structure

```
tests/
├── integration/           # Integration tests with real EP API
│   ├── setup.ts          # Test environment setup
│   ├── epApi.integration.test.ts
│   └── tools.integration.test.ts
├── e2e/                  # End-to-end MCP client tests
│   ├── mcpClient.ts      # MCP test client harness
│   ├── mepQueries.e2e.test.ts
│   ├── plenarySession.e2e.test.ts
│   └── fullWorkflow.e2e.test.ts
├── performance/          # Performance benchmarks
│   ├── benchmarks.test.ts
│   ├── loadTest.test.ts
│   └── cachePerformance.test.ts
├── fixtures/             # Test data and fixtures
│   └── mockEPData.ts
└── helpers/              # Test utilities
    └── testUtils.ts
```

## Running Tests

### All Tests

```bash
# Run all test suites
npm run test:all

# Run with coverage
npm run test:coverage
```

### Unit Tests

```bash
# Run unit tests only
npm run test:unit

# Watch mode
npm test
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Enable real API tests (use with caution - hits real API)
EP_INTEGRATION_TESTS=true npm run test:integration
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run specific E2E test file
npm run test:e2e tests/e2e/mepQueries.e2e.test.ts
```

### Performance Tests

```bash
# Run performance benchmarks
npm run test:performance
```

## Integration Tests

Integration tests validate interaction with the real European Parliament API.

### Configuration

Integration tests use environment variables from `.env.test`:

```env
EP_API_URL=https://data.europarl.europa.eu/api/v2
EP_INTEGRATION_TESTS=false  # Set to 'true' to run against real API
```

### Features Tested

- ✅ Real API data fetching
- ✅ Caching behavior and effectiveness
- ✅ Rate limiting compliance
- ✅ Error handling (network errors, invalid parameters)
- ✅ Data validation (required fields, correct types)
- ✅ Performance (response times, concurrent requests)

### Example

```typescript
import { describe, it, expect } from 'vitest';
import { epClient } from './setup.js';
import { retry, measureTime } from '../helpers/testUtils.js';

describe('EP API Integration', () => {
  it('should fetch real MEPs data', async () => {
    const result = await retry(async () => {
      return epClient.getMEPs({ country: 'SE', limit: 10 });
    });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  }, 30000);
});
```

## E2E Tests

E2E tests validate complete workflows using an actual MCP client connecting to the server via stdio transport.

### MCP Test Client

The `MCPTestClient` class provides a test harness for E2E testing:

```typescript
import { MCPTestClient } from './mcpClient.js';

const client = new MCPTestClient();
await client.connect();

// Call a tool
const response = await client.callTool('get_meps', { limit: 10 });

// List available tools
const tools = await client.listTools();

await client.disconnect();
```

### Features Tested

- ✅ MCP protocol compliance
- ✅ All 20 MCP tools functionality
- ✅ Tool input validation
- ✅ Tool error handling
- ✅ Complete user workflows
- ✅ Client recovery from errors

### Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MCPTestClient } from './mcpClient.js';
import { parsePaginatedMCPResponse, validateMCPResponse } from '../helpers/testUtils.js';

describe('MEP Query E2E Tests', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    client = new MCPTestClient();
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  it('should retrieve MEPs via MCP client', async () => {
    const response = await client.callTool('get_meps', { limit: 5 });
    
    validateMCPResponse(response);
    const data = parsePaginatedMCPResponse(response.content);
    
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
```

## Performance Tests

Performance tests validate that the server meets performance requirements.

### Performance Targets

- **Cached Response Time**: <200ms
- **Concurrent Requests**: Handle 10+ concurrent requests efficiently
- **Throughput**: 5+ requests/second
- **Cache Hit Rate**: 80%+
- **Memory**: No leaks on repeated requests

### Example

```typescript
import { describe, it, expect } from 'vitest';
import { handleGetMEPs } from '../../src/tools/getMEPs.js';
import { measureTime } from '../helpers/testUtils.js';

describe('Performance Benchmarks', () => {
  it('should respond in <200ms (cached)', async () => {
    // Warm up cache
    await handleGetMEPs({ limit: 10 });

    // Measure cached request
    const [, duration] = await measureTime(async () => {
      return handleGetMEPs({ limit: 10 });
    });

    expect(duration).toBeLessThan(200);
  });
});
```

## Writing Tests

### Test Patterns

All tests follow consistent patterns:

1. **Input Validation** - Test valid and invalid inputs
2. **Response Format** - Validate MCP-compliant responses
3. **Error Handling** - Test error scenarios gracefully
4. **Business Logic** - Verify correct data processing
5. **Security** - Test rate limiting, input sanitization, audit logging

### Test Utilities

#### Retry with Exponential Backoff

```typescript
import { retry } from '../helpers/testUtils.js';

const result = await retry(
  async () => epClient.getMEPs({ limit: 10 }),
  3,  // max retries
  1000  // base delay ms
);
```

#### Measure Execution Time

```typescript
import { measureTime } from '../helpers/testUtils.js';

const [result, duration] = await measureTime(async () => {
  return handleGetMEPs({ limit: 10 });
});

console.log(`Took ${duration.toFixed(2)}ms`);
```

#### Parse MCP Responses

```typescript
import { parseMCPResponse, parsePaginatedMCPResponse } from '../helpers/testUtils.js';

// For paginated responses (most tools)
const data = parsePaginatedMCPResponse<MEP>(response.content);

// For non-paginated responses
const singleItem = parseMCPResponse(response.content);
```

### Test Fixtures

Use mock data from `tests/fixtures/mockEPData.ts`:

```typescript
import { mockMEPs, mockPlenarySessions } from '../fixtures/mockEPData.js';

// Use in tests
expect(result).toEqual(mockMEPs);
```

## CI/CD Integration

### GitHub Actions Workflow

Integration and E2E tests run in CI via `.github/workflows/integration-tests.yml`:

```yaml
- name: Run integration tests
  run: npm run test:integration
  env:
    EP_INTEGRATION_TESTS: 'false'  # Skip real API in CI

- name: Run E2E tests
  run: npm run test:e2e

- name: Run performance tests
  run: npm run test:performance
```

### Test Caching

- Test dependencies are cached using `npm ci`
- Built artifacts are cached between runs
- Coverage reports are uploaded to Codecov

### Scheduled Tests

Integration tests run daily at 2 AM UTC to catch API changes:

```yaml
schedule:
  - cron: '0 2 * * *'
```

## Security Testing

All tests validate security controls:

- **Input Validation**: Reject invalid parameters
- **Rate Limiting**: Enforce 100 req/15min limit
- **Audit Logging**: Log all data access (GDPR compliance)
- **Error Messages**: Don't expose internal details
- **HTTPS**: Validate secure connections

## ISMS Compliance

Testing aligns with [Hack23 ISMS policies](https://github.com/Hack23/ISMS-PUBLIC):

- **ISO 27001 A.14.2.8**: System security testing
- **NIST CSF 2.0 ID.RA-5**: Vulnerability identification
- **CIS Control 18.3**: Secure application testing

## Troubleshooting

### Integration Tests Failing

- Check `EP_INTEGRATION_TESTS` environment variable
- Verify network connectivity to EP API
- Check rate limits not exceeded
- Review API endpoint availability

### E2E Tests Failing

- Ensure server builds successfully: `npm run build`
- Check MCP server starts: `node dist/index.js`
- Verify stdio transport communication
- Review server logs in test output

### Performance Tests Failing

- Clear cache before running: delete `node_modules/.cache`
- Run tests in isolation: `npm run test:performance`
- Check system resources (CPU, memory)
- Verify no background processes interfering

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up resources in `afterEach`/`afterAll`
3. **Timeouts**: Use appropriate timeouts for async operations
4. **Mocking**: Mock external dependencies in unit tests
5. **Real Data**: Use real API in integration tests (with rate limiting)
6. **Assertions**: Make specific assertions, not just `toBeTruthy()`
7. **Documentation**: Document test purpose and expected behavior

## Contributing

When adding new features:

1. Write unit tests first (TDD)
2. Add integration tests if touching API client
3. Add E2E tests if adding new MCP tools
4. Update performance tests if affecting performance
5. Ensure 80%+ coverage maintained
6. Run full test suite before committing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [MCP SDK Documentation](https://modelcontextprotocol.io/)
- [European Parliament API](https://data.europarl.europa.eu/)
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
