# Testing Guide

Comprehensive testing documentation for the European Parliament MCP Server.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [Performance Tests](#performance-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)

## Overview

This project implements a comprehensive testing strategy across four layers:

1. **Unit Tests** - Test individual functions and modules (`src/**/*.test.ts`)
2. **Integration Tests** - Test integration with real European Parliament API (`tests/integration/`)
3. **E2E Tests** - Test complete workflows via MCP client (`tests/e2e/`)
4. **Performance Tests** - Validate performance requirements (`tests/performance/`)

### Test Coverage Goals

- **Overall Coverage**: 80%+ (lines, statements, functions)
- **Security-Critical Code**: 95%+ coverage
- **Branch Coverage**: 70%+
- **Integration Tests**: All API client methods
- **E2E Tests**: All 20 MCP tools

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
