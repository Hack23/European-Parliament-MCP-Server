---
name: testing-mcp-tools
description: Testing patterns for MCP tools, integration tests, mocking European Parliament API, and achieving 80%+ coverage
license: MIT
---

# Testing MCP Tools Skill

## Context

This skill applies when:
- Writing unit tests for MCP tools, resources, and prompts
- Testing European Parliament API integrations
- Mocking external API calls
- Writing integration tests for MCP server
- Achieving 80%+ code coverage target
- Testing error handling and edge cases
- Validating Zod schema validation
- Performance testing for response times
- Testing GDPR compliance features

This project uses Vitest as the test framework with a coverage target of 80% line coverage and 70% branch coverage.

## Rules

1. **Test All MCP Handlers**: Every tool, resource, and prompt must have tests
2. **Mock External APIs**: Never call real European Parliament API in tests
3. **Test Input Validation**: Verify Zod schema validation with valid/invalid inputs
4. **Test Error Paths**: Test all error scenarios and exception handling
5. **Achieve Coverage Target**: 80% line coverage, 70% branch coverage minimum
6. **Use Descriptive Names**: Test names should describe what is being tested
7. **Arrange-Act-Assert**: Structure tests with clear AAA pattern
8. **Test Response Structure**: Verify MCP-compliant response formats
9. **Test Edge Cases**: Empty inputs, max lengths, boundary conditions
10. **Integration Tests**: Test full MCP request/response cycle

## Examples

### ✅ Good Pattern: Testing MCP Tool

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSearchMEPs } from './search-meps';

describe('MCP Tool: search_meps', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });
  
  it('should validate input schema', async () => {
    const invalidRequest = {
      params: {
        name: 'search_meps',
        arguments: {
          country: 'USA',  // Invalid: not EU country
          limit: 200,      // Invalid: exceeds max (100)
        },
      },
    };
    
    await expect(handleSearchMEPs(invalidRequest)).rejects.toThrow();
  });
  
  it('should return MCP-compliant response structure', async () => {
    // Mock API
    vi.mock('./api', () => ({
      searchMEPs: vi.fn().mockResolvedValue([
        { id: 1, fullName: 'Test MEP', country: 'DE' },
      ]),
    }));
    
    const validRequest = {
      params: {
        name: 'search_meps',
        arguments: {
          country: 'DE',
          limit: 10,
        },
      },
    };
    
    const response = await handleSearchMEPs(validRequest);
    
    // Verify MCP response structure
    expect(response).toHaveProperty('content');
    expect(Array.isArray(response.content)).toBe(true);
    expect(response.content[0]).toHaveProperty('type', 'text');
    expect(response.content[0]).toHaveProperty('text');
    
    // Verify response content
    const data = JSON.parse(response.content[0].text);
    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('meps');
    expect(Array.isArray(data.meps)).toBe(true);
  });
  
  it('should handle API errors gracefully', async () => {
    // Mock API failure
    vi.mock('./api', () => ({
      searchMEPs: vi.fn().mockRejectedValue(new Error('API Error')),
    }));
    
    const request = {
      params: {
        name: 'search_meps',
        arguments: { country: 'DE' },
      },
    };
    
    await expect(handleSearchMEPs(request)).rejects.toThrow('Failed to search MEPs');
    // Verify internal error is NOT exposed
  });
  
  it('should reject invalid characters in country code', async () => {
    const request = {
      params: {
        name: 'search_meps',
        arguments: {
          country: '<script>alert("xss")</script>',
        },
      },
    };
    
    await expect(handleSearchMEPs(request)).rejects.toThrow();
  });
  
  it('should apply default values for optional parameters', async () => {
    vi.mock('./api', () => ({
      searchMEPs: vi.fn().mockResolvedValue([]),
    }));
    
    const request = {
      params: {
        name: 'search_meps',
        arguments: {
          country: 'DE',
          // limit not provided - should default to 20
        },
      },
    };
    
    await handleSearchMEPs(request);
    
    const apiMock = await import('./api');
    expect(apiMock.searchMEPs).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20 })
    );
  });
});
```

### ✅ Good Pattern: Mocking European Parliament API

```typescript
import { vi } from 'vitest';

/**
 * Mock European Parliament API responses
 */
export function mockEPAPI() {
  // Mock fetch globally
  global.fetch = vi.fn();
  
  return {
    mockMEP(id: number, data: Partial<MEP> = {}) {
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify({
          id,
          fullName: 'Test MEP',
          country: 'DE',
          partyGroup: 'PPE',
          active: true,
          ...data,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    },
    
    mockAPIError(status: number = 500) {
      (global.fetch as any).mockResolvedValueOnce(
        new Response(null, { status })
      );
    },
    
    mockRateLimit(retryAfter: number = 60) {
      (global.fetch as any).mockResolvedValueOnce(
        new Response(null, {
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() },
        })
      );
    },
  };
}

// Usage in tests
describe('EP API Integration', () => {
  it('should handle rate limiting', async () => {
    const api = mockEPAPI();
    
    // First call returns rate limit
    api.mockRateLimit(1);
    
    // Second call succeeds
    api.mockMEP(12345);
    
    const mep = await fetchMEPWithRetry(12345);
    
    expect(mep.id).toBe(12345);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

### ✅ Good Pattern: Testing Zod Schemas

```typescript
import { describe, it, expect } from 'vitest';
import { MEPSchema } from './schemas';

describe('MEPSchema', () => {
  it('should validate valid MEP data', () => {
    const validMEP = {
      id: 12345,
      fullName: 'Jane Doe',
      country: 'DE',
      partyGroup: 'PPE',
      active: true,
      termStart: '2019-07-02',
      committees: [],
    };
    
    const result = MEPSchema.parse(validMEP);
    expect(result.id).toBe(12345);
  });
  
  it('should reject invalid country code', () => {
    const invalidMEP = {
      id: 12345,
      fullName: 'Jane Doe',
      country: 'USA', // Not EU country
      partyGroup: 'PPE',
      active: true,
      termStart: '2019-07-02',
    };
    
    expect(() => MEPSchema.parse(invalidMEP)).toThrow();
  });
  
  it('should apply default values', () => {
    const mepWithoutDefaults = {
      id: 12345,
      fullName: 'Jane Doe',
      country: 'DE',
      partyGroup: 'PPE',
      active: true,
      termStart: '2019-07-02',
      // committees not provided
    };
    
    const result = MEPSchema.parse(mepWithoutDefaults);
    expect(result.committees).toEqual([]);
  });
  
  it('should transform and normalize data', () => {
    const mepWithWhitespace = {
      id: 12345,
      fullName: '  Jane Doe  ',
      country: 'DE',
      partyGroup: 'PPE',
      active: true,
      termStart: '2019-07-02',
    };
    
    const result = MEPSchema.parse(mepWithWhitespace);
    expect(result.fullName).toBe('Jane Doe'); // Trimmed
  });
});
```

### ✅ Good Pattern: Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EuropeanParliamentMCPServer } from './server';

describe('MCP Server Integration', () => {
  let server: EuropeanParliamentMCPServer;
  
  beforeAll(async () => {
    server = new EuropeanParliamentMCPServer();
    await server.start();
  });
  
  afterAll(async () => {
    await server.shutdown();
  });
  
  it('should list available tools', async () => {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    };
    
    const response = await server.handleRequest(request);
    
    expect(response.result).toHaveProperty('tools');
    expect(Array.isArray(response.result.tools)).toBe(true);
    expect(response.result.tools.length).toBeGreaterThan(0);
  });
  
  it('should execute tool and return result', async () => {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'search_meps',
        arguments: {
          country: 'DE',
          limit: 5,
        },
      },
    };
    
    const response = await server.handleRequest(request);
    
    expect(response.result).toHaveProperty('content');
    expect(Array.isArray(response.result.content)).toBe(true);
  });
});
```

### ✅ Good Pattern: Performance Testing

```typescript
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('should respond to MEP requests in <200ms', async () => {
    const startTime = performance.now();
    
    await getMEP(12345);
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(200);
  });
  
  it('should achieve >80% cache hit rate', async () => {
    // Warm cache
    await getCachedMEP(12345);
    
    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      await getCachedMEP(12345);
    }
    
    const stats = getCacheStats('mep');
    const hitRate = stats.hits / (stats.hits + stats.misses);
    
    expect(hitRate).toBeGreaterThan(0.8);
  });
});
```

## Anti-Patterns

### ❌ Bad: Calling Real API
```typescript
// NEVER - slow and unreliable!
it('should fetch MEP', async () => {
  const mep = await fetch('https://data.europarl.europa.eu/api/v2/meps/12345');
  expect(mep).toBeDefined();
});
```

### ❌ Bad: No Assertions
```typescript
// NEVER - test doesn't verify anything!
it('should process MEP', async () => {
  await processMEP(12345);
  // No assertions!
});
```

### ❌ Bad: Testing Implementation
```typescript
// NEVER - test behavior, not implementation!
it('should call internal function', async () => {
  const spy = vi.spyOn(internal, 'helperFunction');
  await publicAPI();
  expect(spy).toHaveBeenCalled(); // Testing internals!
});
```

## Coverage Requirements

Target: **80% line coverage, 70% branch coverage**

```json
{
  "vitest": {
    "coverage": {
      "statements": 80,
      "branches": 70,
      "functions": 80,
      "lines": 80
    }
  }
}
```

## ISMS Compliance

- **SC-002**: Test security validations
- **AU-002**: Test audit logging
- **PE-001**: Performance testing

Reference: [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
