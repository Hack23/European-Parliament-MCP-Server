---
name: testing-mcp-tools
description: "Writes unit and integration tests for MCP tool handlers using Vitest, mocks European Parliament API responses, validates Zod schemas, and enforces 80%+ line coverage. Use when writing tests for MCP tools, improving test coverage, mocking the EP API, or debugging test failures."
license: MIT
---

# Testing MCP Tools Skill

## Rules

1. **Mock External APIs**: Never call the real European Parliament API in tests — use the mock factory pattern
2. **Test MCP Response Structure**: Every handler test must verify `{ content: [{ type: "text", text }] }` format
3. **Coverage Target**: 80% line coverage, 70% branch coverage minimum
4. **Test Input Validation**: Verify Zod schema rejects invalid inputs (bad country codes, out-of-range limits, XSS payloads)
5. **Integration Tests**: Test the full MCP request/response cycle — `tools/list` and `tools/call` through the server

## Workflow

1. Run `vitest --coverage` to identify uncovered MCP handlers
2. For each uncovered handler, write tests: valid input → expected response, invalid input → Zod rejection, API error → safe error message
3. Mock EP API calls using the mock factory pattern (see example below)
4. Verify MCP-compliant response structure in every test: `{ content: [{ type: "text", text }] }`
5. Run `vitest --coverage` again — confirm 80% line / 70% branch thresholds pass

## Examples

### Testing MCP Tool

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSearchMEPs } from './search-meps';

describe('MCP Tool: search_meps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate input schema and reject invalid arguments', async () => {
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
    vi.mock('./api', () => ({
      searchMEPs: vi.fn().mockResolvedValue([
        { id: 1, fullName: 'Test MEP', country: 'DE' },
      ]),
    }));

    const validRequest = {
      params: {
        name: 'search_meps',
        arguments: { country: 'DE', limit: 10 },
      },
    };

    const response = await handleSearchMEPs(validRequest);

    // Verify MCP response structure
    expect(response).toHaveProperty('content');
    expect(response.content[0]).toHaveProperty('type', 'text');
    expect(response.content[0]).toHaveProperty('text');

    const data = JSON.parse(response.content[0].text);
    expect(data).toHaveProperty('meps');
    expect(Array.isArray(data.meps)).toBe(true);
  });

  it('should handle API errors without exposing internals', async () => {
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
  });
});
```

### Mocking European Parliament API

```typescript
import { vi } from 'vitest';

export function mockEPAPI() {
  global.fetch = vi.fn();

  return {
    mockMEP(id: number, data: Partial<MEP> = {}) {
      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify({
          id, fullName: 'Test MEP', country: 'DE',
          partyGroup: 'PPE', active: true, ...data,
        }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      );
    },

    mockAPIError(status: number = 500) {
      (global.fetch as any).mockResolvedValueOnce(new Response(null, { status }));
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
```

## Anti-Patterns

- Never call the real EP API in tests — use the mock factory
- Always assert on response structure, not just that the call succeeded
- Test behavior (inputs → outputs), not internal implementation details

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
