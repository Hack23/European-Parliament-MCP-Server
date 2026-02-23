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

Tests integration with the real European Parliament API:
- API client functionality
- Caching behavior
- Rate limiting
- Error handling
- Data validation

**Configuration**: Set `EP_INTEGRATION_TESTS=true` to run against real API (disabled in CI by default).

### E2E Tests (`tests/e2e/`)

Tests complete user workflows via MCP client:
- All 20 MCP tools
- MCP protocol compliance
- Tool input validation
- Error handling
- Client recovery

**Requires**: Built server (`npm run build`)

### Performance Tests (`tests/performance/`)

Validates performance requirements:
- Response time (<200ms cached)
- Concurrent request handling
- Throughput (5+ req/s)
- Cache effectiveness (80%+ hit rate)
- Memory usage

## Environment Variables

Create `.env.test` for test configuration:

```env
# European Parliament API
EP_API_URL=https://data.europarl.europa.eu/api/v2
EP_INTEGRATION_TESTS=false

# Test configuration
NODE_ENV=test
TEST_RATE_LIMIT_TOKENS=50
TEST_RATE_LIMIT_INTERVAL=minute
TEST_CACHE_TTL=900000
TEST_CACHE_MAX_SIZE=500
```

## Test Utilities

### Fixtures (`tests/fixtures/`)

Mock data for testing without hitting real API:

```typescript
import { mockMEPs, mockPlenarySessions } from './fixtures/mockEPData.js';
```

### Helpers (`tests/helpers/`)

Test utilities for common operations:

```typescript
import {
  retry,
  measureTime,
  waitFor,
  parseMCPResponse,
  parsePaginatedMCPResponse,
  validateMCPResponse
} from './helpers/testUtils.js';
```

## Writing Tests

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { epClient } from './setup.js';
import { retry } from '../helpers/testUtils.js';

describe('EP API Integration', () => {
  it('should fetch MEPs data', async () => {
    const result = await retry(async () => {
      return epClient.getMEPs({ country: 'SE', limit: 10 });
    });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  }, 30000);
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
});
```

### Performance Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { handleGetMEPs } from '../../src/tools/getMEPs.js';
import { measureTime } from '../helpers/testUtils.js';

describe('Performance', () => {
  it('should respond in <200ms (cached)', async () => {
    await handleGetMEPs({ limit: 10 }); // warm cache
    
    const [, duration] = await measureTime(async () => {
      return handleGetMEPs({ limit: 10 });
    });

    expect(duration).toBeLessThan(200);
  });
});
```

## CI/CD Integration

Tests run in GitHub Actions via `.github/workflows/integration-tests.yml`:

- Runs on: pull requests, pushes to main, daily schedule
- Environment: Node.js 24.x, Ubuntu latest
- Artifacts: Coverage reports, test results
- Integration: Codecov for coverage reporting

## Coverage Requirements

- **Overall**: 80%+ (lines, statements, functions)
- **Branches**: 70%+
- **Security-Critical**: 95%+ (tools, utils, schemas)

Current coverage: **80.05%** statements ✅

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
2. Verify network connectivity
3. Check rate limits not exceeded
4. Review EP API status

### E2E Tests Failing

1. Rebuild server: `npm run build`
2. Verify server starts: `node dist/index.js`
3. Check stdio transport communication
4. Review server logs in test output

### Performance Tests Failing

1. Clear caches: `rm -rf node_modules/.cache`
2. Run in isolation: `npm run test:performance`
3. Check system resources
4. Verify no background processes

## Support

For issues or questions:
- Open an issue: [GitHub Issues](https://github.com/Hack23/European-Parliament-MCP-Server/issues)
- Review docs: [docs/](../docs/)
- Check ISMS: [Hack23 ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC)
