---
name: testing-strategy
description: Node.js testing with Vitest/Jest, MCP protocol testing, European Parliament API mocking, integration tests, and 80%+ coverage
license: MIT
---

# Testing Strategy Skill

## Context
This skill applies when:
- Writing unit tests for functions, classes, or modules
- Creating integration tests for MCP protocol handlers
- Mocking European Parliament API responses
- Testing input validation and error handling
- Writing tests for async/await code and Promises
- Implementing test fixtures and test data
- Measuring and improving code coverage
- Testing security controls and edge cases
- Debugging failing or flaky tests
- Setting up test infrastructure and CI/CD

Testing is mandatory for all code. We maintain 80%+ code coverage with fast, deterministic tests that catch regressions early. Tests serve as living documentation and enable confident refactoring.

## Rules

1. **Test Behavior, Not Implementation**: Focus on what code does (inputs/outputs), not how it does it
2. **80% Coverage Minimum**: Maintain 80%+ line coverage, 70%+ branch coverage
3. **Fast Tests**: Unit tests < 100ms, integration tests < 1s, full suite < 5min
4. **Deterministic Tests**: Tests must pass/fail consistently - no flakiness, no randomness
5. **AAA Pattern**: Arrange (setup), Act (execute), Assert (verify) - clear test structure
6. **One Assertion Per Test**: Test one behavior per test case (exceptions for related assertions)
7. **Mock External Dependencies**: Mock European Parliament API, file system, network calls
8. **Test Edge Cases**: Empty inputs, null values, boundary conditions, error paths
9. **Describe What, Not How**: Test names describe expected behavior, not implementation
10. **Use Type-Safe Mocks**: TypeScript mocks should match actual types
11. **Test Async Properly**: Use async/await, avoid callback hell, handle Promise rejections
12. **Test Security Controls**: Validate input validation, rate limiting, authentication, authorization
13. **Setup and Teardown**: Clean up resources, reset mocks, avoid test pollution
14. **Snapshot Tests Sparingly**: Only for stable data structures, not for debugging
15. **CI/CD Integration**: All tests must pass before merge, run on every commit

## Examples

### ✅ Good Pattern: Well-Structured Unit Test

```typescript
/**
 * Unit tests for InputValidationService
 * 
 * Test coverage:
 * - Valid inputs (happy path)
 * - Invalid inputs (error paths)
 * - Edge cases (empty, null, boundaries)
 * - Security validation (injection, XSS)
 * 
 * ISMS Policy: SC-002 (Secure Coding Standards - Testing Requirements)
 */
import { describe, it, expect } from 'vitest';
import { InputValidationService, ValidationError } from './InputValidationService';

describe('InputValidationService', () => {
  describe('validateSearchQuery', () => {
    it('should accept valid search query with all parameters', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: 'climate change',
        documentType: 'REPORT',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        limit: 20,
      };
      
      // Act
      const result = validator.validateSearchQuery(params);
      
      // Assert
      expect(result).toEqual({
        keywords: 'climate change',
        documentType: 'REPORT',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        limit: 20,
      });
    });
    
    it('should accept valid search query with minimal parameters', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: 'digital markets',
      };
      
      // Act
      const result = validator.validateSearchQuery(params);
      
      // Assert
      expect(result.keywords).toBe('digital markets');
      expect(result.documentType).toBeUndefined();
      expect(result.dateFrom).toBeUndefined();
      expect(result.dateTo).toBeUndefined();
      expect(result.limit).toBe(20); // Default value
    });
    
    it('should normalize keywords by trimming whitespace', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: '  climate   change  ',
      };
      
      // Act
      const result = validator.validateSearchQuery(params);
      
      // Assert
      expect(result.keywords).toBe('climate change');
    });
    
    it('should reject empty keywords', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: '',
      };
      
      // Act & Assert
      expect(() => validator.validateSearchQuery(params))
        .toThrow(ValidationError);
      expect(() => validator.validateSearchQuery(params))
        .toThrow('Keywords cannot be empty');
    });
    
    it('should reject keywords exceeding maximum length', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: 'a'.repeat(201), // 201 characters
      };
      
      // Act & Assert
      expect(() => validator.validateSearchQuery(params))
        .toThrow(ValidationError);
      expect(() => validator.validateSearchQuery(params))
        .toThrow('Keywords exceed maximum length');
    });
    
    it('should reject keywords with invalid characters', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: 'climate<script>alert("xss")</script>',
      };
      
      // Act & Assert
      expect(() => validator.validateSearchQuery(params))
        .toThrow(ValidationError);
      expect(() => validator.validateSearchQuery(params))
        .toThrow('Keywords contain invalid characters');
    });
    
    it('should reject invalid document type', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: 'climate change',
        documentType: 'INVALID_TYPE',
      };
      
      // Act & Assert
      expect(() => validator.validateSearchQuery(params))
        .toThrow(ValidationError);
      expect(() => validator.validateSearchQuery(params))
        .toThrow('Invalid document type');
    });
    
    it('should reject invalid date format', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: 'climate change',
        dateFrom: '01/01/2024', // Wrong format
      };
      
      // Act & Assert
      expect(() => validator.validateSearchQuery(params))
        .toThrow(ValidationError);
      expect(() => validator.validateSearchQuery(params))
        .toThrow('must be in ISO 8601 format');
    });
    
    it('should reject limit outside valid range', () => {
      // Arrange
      const validator = new InputValidationService();
      const params = {
        keywords: 'climate change',
        limit: 101, // Too high
      };
      
      // Act & Assert
      expect(() => validator.validateSearchQuery(params))
        .toThrow(ValidationError);
      expect(() => validator.validateSearchQuery(params))
        .toThrow('Limit must be between 1 and 100');
    });
    
    it('should reject non-object parameters', () => {
      // Arrange
      const validator = new InputValidationService();
      
      // Act & Assert
      expect(() => validator.validateSearchQuery(null))
        .toThrow('Invalid parameters object');
      expect(() => validator.validateSearchQuery('string'))
        .toThrow('Invalid parameters object');
      expect(() => validator.validateSearchQuery(123))
        .toThrow('Invalid parameters object');
    });
  });
});
```

### ✅ Good Pattern: Mocking European Parliament API

```typescript
/**
 * Integration tests for SearchHandler with API mocking
 * 
 * Testing approach:
 * - Mock European Parliament API responses
 * - Test MCP protocol integration
 * - Verify caching behavior
 * - Test error handling and retries
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchHandler } from './SearchHandler';
import * as europeanParliamentApi from './europeanParliamentApi';

// Mock the European Parliament API module
vi.mock('./europeanParliamentApi');

describe('SearchHandler', () => {
  let handler: SearchHandler;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Create fresh handler instance
    handler = new SearchHandler();
  });
  
  afterEach(() => {
    // Clean up resources
    vi.restoreAllMocks();
  });
  
  describe('handleSearch', () => {
    it('should return search results from European Parliament API', async () => {
      // Arrange
      const mockResults = {
        total: 42,
        documents: [
          {
            id: 'EP-20240101-00001',
            title: 'Climate Change Report',
            type: 'REPORT',
            date: '2024-01-01',
          },
          {
            id: 'EP-20240102-00002',
            title: 'Digital Markets Act',
            type: 'REGULATION',
            date: '2024-01-02',
          },
        ],
      };
      
      // Mock API response
      vi.mocked(europeanParliamentApi.search).mockResolvedValue(mockResults);
      
      const request = {
        method: 'tools/call',
        params: {
          name: 'search_documents',
          arguments: {
            keywords: 'climate change',
            limit: 10,
          },
        },
      };
      
      // Act
      const response = await handler.handleSearch(request);
      
      // Assert
      expect(europeanParliamentApi.search).toHaveBeenCalledOnce();
      expect(europeanParliamentApi.search).toHaveBeenCalledWith({
        keywords: 'climate change',
        limit: 10,
      });
      
      expect(response.content[0].text).toContain('Climate Change Report');
      expect(response.content[0].text).toContain('Digital Markets Act');
    });
    
    it('should use cached results for duplicate queries', async () => {
      // Arrange
      const mockResults = {
        total: 1,
        documents: [{ id: 'EP-20240101-00001', title: 'Test' }],
      };
      
      vi.mocked(europeanParliamentApi.search).mockResolvedValue(mockResults);
      
      const request = {
        method: 'tools/call',
        params: {
          name: 'search_documents',
          arguments: {
            keywords: 'test query',
          },
        },
      };
      
      // Act
      await handler.handleSearch(request);
      await handler.handleSearch(request); // Second call
      
      // Assert
      // API should only be called once (second call uses cache)
      expect(europeanParliamentApi.search).toHaveBeenCalledOnce();
    });
    
    it('should handle API errors gracefully', async () => {
      // Arrange
      const apiError = new Error('API connection failed');
      vi.mocked(europeanParliamentApi.search).mockRejectedValue(apiError);
      
      const request = {
        method: 'tools/call',
        params: {
          name: 'search_documents',
          arguments: {
            keywords: 'test',
          },
        },
      };
      
      // Act & Assert
      await expect(handler.handleSearch(request))
        .rejects
        .toThrow('API connection failed');
      
      expect(europeanParliamentApi.search).toHaveBeenCalledOnce();
    });
    
    it('should validate input before calling API', async () => {
      // Arrange
      const request = {
        method: 'tools/call',
        params: {
          name: 'search_documents',
          arguments: {
            keywords: '', // Invalid: empty keywords
          },
        },
      };
      
      // Act & Assert
      await expect(handler.handleSearch(request))
        .rejects
        .toThrow('Keywords cannot be empty');
      
      // API should never be called with invalid input
      expect(europeanParliamentApi.search).not.toHaveBeenCalled();
    });
    
    it('should handle timeout errors', async () => {
      // Arrange
      vi.mocked(europeanParliamentApi.search).mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );
      
      const request = {
        method: 'tools/call',
        params: {
          name: 'search_documents',
          arguments: {
            keywords: 'test',
          },
        },
      };
      
      // Act & Assert
      await expect(handler.handleSearch(request))
        .rejects
        .toThrow('Request timeout');
    });
  });
});
```

### ✅ Good Pattern: Testing Async Operations

```typescript
/**
 * Tests for async batch processing
 * 
 * Testing challenges:
 * - Multiple concurrent async operations
 * - Timeout handling
 * - Partial success scenarios
 * - Race conditions
 */
import { describe, it, expect, vi } from 'vitest';
import { fetchDocumentsBatch } from './batchProcessor';
import * as europeanParliamentApi from './europeanParliamentApi';

vi.mock('./europeanParliamentApi');

describe('fetchDocumentsBatch', () => {
  it('should fetch multiple documents concurrently', async () => {
    // Arrange
    const documentIds = ['EP-001', 'EP-002', 'EP-003'];
    
    vi.mocked(europeanParliamentApi.getDocument).mockImplementation(
      async (id: string) => ({
        id,
        title: `Document ${id}`,
        content: 'Test content',
      })
    );
    
    // Act
    const startTime = Date.now();
    const results = await fetchDocumentsBatch(documentIds);
    const duration = Date.now() - startTime;
    
    // Assert
    expect(results.size).toBe(3);
    expect(results.get('EP-001')?.title).toBe('Document EP-001');
    expect(results.get('EP-002')?.title).toBe('Document EP-002');
    expect(results.get('EP-003')?.title).toBe('Document EP-003');
    
    // Verify concurrent execution (should be much faster than sequential)
    expect(duration).toBeLessThan(500); // Concurrent execution
    
    // Verify API was called for each document
    expect(europeanParliamentApi.getDocument).toHaveBeenCalledTimes(3);
  });
  
  it('should handle partial failures gracefully', async () => {
    // Arrange
    const documentIds = ['EP-001', 'EP-002', 'EP-003'];
    
    vi.mocked(europeanParliamentApi.getDocument).mockImplementation(
      async (id: string) => {
        if (id === 'EP-002') {
          throw new Error('Document not found');
        }
        return {
          id,
          title: `Document ${id}`,
          content: 'Test content',
        };
      }
    );
    
    // Act
    const results = await fetchDocumentsBatch(documentIds);
    
    // Assert
    // Should return successful documents, ignore failures
    expect(results.size).toBe(2);
    expect(results.has('EP-001')).toBe(true);
    expect(results.has('EP-002')).toBe(false); // Failed
    expect(results.has('EP-003')).toBe(true);
  });
  
  it('should respect concurrency limit', async () => {
    // Arrange
    const documentIds = Array.from({ length: 50 }, (_, i) => `EP-${i}`);
    let concurrentCalls = 0;
    let maxConcurrentCalls = 0;
    
    vi.mocked(europeanParliamentApi.getDocument).mockImplementation(
      async (id: string) => {
        concurrentCalls++;
        maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 10));
        
        concurrentCalls--;
        
        return {
          id,
          title: `Document ${id}`,
          content: 'Test content',
        };
      }
    );
    
    // Act
    await fetchDocumentsBatch(documentIds, { concurrency: 10 });
    
    // Assert
    // Maximum concurrent calls should not exceed limit
    expect(maxConcurrentCalls).toBeLessThanOrEqual(10);
  });
  
  it('should handle timeout for slow requests', async () => {
    // Arrange
    const documentIds = ['EP-001', 'EP-002'];
    
    vi.mocked(europeanParliamentApi.getDocument).mockImplementation(
      async (id: string) => {
        if (id === 'EP-001') {
          // Simulate slow request
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return {
          id,
          title: `Document ${id}`,
          content: 'Test content',
        };
      }
    );
    
    // Act
    const results = await fetchDocumentsBatch(documentIds, { timeout: 500 });
    
    // Assert
    // EP-001 should timeout, EP-002 should succeed
    expect(results.size).toBe(1);
    expect(results.has('EP-001')).toBe(false); // Timed out
    expect(results.has('EP-002')).toBe(true);
  });
});
```

### ✅ Good Pattern: Testing Security Controls

```typescript
/**
 * Security-focused tests for rate limiting
 * 
 * Security test requirements:
 * - Verify rate limits are enforced
 * - Test burst protection
 * - Verify audit logging
 * - Test error handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimiter, RateLimitError } from './RateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  
  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });
  
  it('should allow requests under burst limit', async () => {
    // Arrange
    const clientId = 'test-client-1';
    
    // Act & Assert
    // First 10 requests should succeed (burst limit)
    for (let i = 0; i < 10; i++) {
      await expect(rateLimiter.checkLimit(clientId))
        .resolves
        .not.toThrow();
    }
  });
  
  it('should block requests exceeding burst limit', async () => {
    // Arrange
    const clientId = 'test-client-2';
    
    // Act
    // Fill up burst limit
    for (let i = 0; i < 10; i++) {
      await rateLimiter.checkLimit(clientId);
    }
    
    // Assert
    // 11th request should be blocked
    await expect(rateLimiter.checkLimit(clientId))
      .rejects
      .toThrow(RateLimitError);
  });
  
  it('should enforce sustained rate limit', async () => {
    // Arrange
    const clientId = 'test-client-3';
    
    // Act
    // Make 100 requests (sustained limit)
    for (let i = 0; i < 100; i++) {
      await rateLimiter.checkLimit(clientId);
      // Small delay to avoid burst limit
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    // Assert
    // 101st request should be blocked
    await expect(rateLimiter.checkLimit(clientId))
      .rejects
      .toThrow(RateLimitError);
  });
  
  it('should provide retry-after time in error', async () => {
    // Arrange
    const clientId = 'test-client-4';
    
    // Fill up burst limit
    for (let i = 0; i < 10; i++) {
      await rateLimiter.checkLimit(clientId);
    }
    
    // Act & Assert
    try {
      await rateLimiter.checkLimit(clientId);
      throw new Error('Expected RateLimitError');
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).retryAfter).toBeGreaterThan(0);
      expect((error as RateLimitError).retryAfter).toBeLessThanOrEqual(10);
    }
  });
  
  it('should isolate rate limits per client', async () => {
    // Arrange
    const client1 = 'test-client-5';
    const client2 = 'test-client-6';
    
    // Act
    // Fill up client1's burst limit
    for (let i = 0; i < 10; i++) {
      await rateLimiter.checkLimit(client1);
    }
    
    // Assert
    // Client1 should be blocked
    await expect(rateLimiter.checkLimit(client1))
      .rejects
      .toThrow(RateLimitError);
    
    // Client2 should still work
    await expect(rateLimiter.checkLimit(client2))
      .resolves
      .not.toThrow();
  });
  
  it('should reset rate limit after window expires', async () => {
    // Arrange
    const clientId = 'test-client-7';
    
    // Fill up burst limit
    for (let i = 0; i < 10; i++) {
      await rateLimiter.checkLimit(clientId);
    }
    
    // Verify blocked
    await expect(rateLimiter.checkLimit(clientId))
      .rejects
      .toThrow(RateLimitError);
    
    // Act
    // Wait for burst window to expire (10 seconds + buffer)
    await new Promise(resolve => setTimeout(resolve, 11000));
    
    // Assert
    // Should be able to make requests again
    await expect(rateLimiter.checkLimit(clientId))
      .resolves
      .not.toThrow();
  });
});
```

### ✅ Good Pattern: Test Fixtures and Factories

```typescript
/**
 * Test fixtures for European Parliament data
 * 
 * Benefits:
 * - Consistent test data across tests
 * - Easy to create variations
 * - Type-safe factories
 * - Reduces test setup boilerplate
 */

/**
 * Factory function for creating test documents
 */
export function createTestDocument(
  overrides?: Partial<Document>
): Document {
  return {
    id: overrides?.id ?? 'EP-20240101-00001',
    title: overrides?.title ?? 'Test Document',
    type: overrides?.type ?? 'REPORT',
    date: overrides?.date ?? '2024-01-01',
    author: overrides?.author ?? 'Committee on Environment',
    language: overrides?.language ?? 'en',
    content: overrides?.content ?? 'Test content',
    ...overrides,
  };
}

/**
 * Factory for creating search results
 */
export function createTestSearchResult(
  overrides?: Partial<SearchResult>
): SearchResult {
  return {
    total: overrides?.total ?? 10,
    documents: overrides?.documents ?? [
      createTestDocument({ id: 'EP-001' }),
      createTestDocument({ id: 'EP-002' }),
      createTestDocument({ id: 'EP-003' }),
    ],
    query: overrides?.query ?? 'test query',
    page: overrides?.page ?? 1,
    pageSize: overrides?.pageSize ?? 20,
    ...overrides,
  };
}

/**
 * Mock MCP request factory
 */
export function createMockMcpRequest(
  tool: string,
  args: Record<string, unknown>
): ToolRequest {
  return {
    method: 'tools/call',
    params: {
      name: tool,
      arguments: args,
    },
  };
}

// Usage in tests:
describe('SearchHandler', () => {
  it('should process search results correctly', async () => {
    // Arrange
    const mockResults = createTestSearchResult({
      total: 5,
      documents: [
        createTestDocument({ id: 'EP-001', title: 'Climate Report' }),
        createTestDocument({ id: 'EP-002', title: 'Digital Markets' }),
      ],
    });
    
    const request = createMockMcpRequest('search_documents', {
      keywords: 'climate',
    });
    
    // Act & Assert
    // ... rest of test
  });
});
```

### ❌ Bad Pattern: Testing Implementation Details

```typescript
// Bad: Testing private methods or internal state
describe('SearchHandler', () => {
  it('should call internal validateInput method', async () => {
    // Testing implementation, not behavior!
    const handler = new SearchHandler();
    const spy = vi.spyOn(handler as any, 'validateInput');
    
    await handler.handleSearch(request);
    
    expect(spy).toHaveBeenCalled(); // Brittle test!
  });
});

// Bad: Testing mock behavior instead of actual behavior
describe('SearchHandler', () => {
  it('should call the mock correctly', async () => {
    const mockFn = vi.fn();
    
    mockFn('test');
    
    // This tests the mock, not the actual code!
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});
```

### ❌ Bad Pattern: Flaky Tests with Timing Issues

```typescript
// Bad: Flaky test with arbitrary timeouts
it('should process request quickly', async () => {
  const start = Date.now();
  await processRequest();
  const duration = Date.now() - start;
  
  // Flaky: Depends on system load, CI speed, etc.
  expect(duration).toBeLessThan(100);
});

// Bad: Timing-dependent test
it('should debounce requests', async () => {
  handler.handleRequest(request1);
  
  // Flaky: What if first request takes longer?
  setTimeout(() => {
    handler.handleRequest(request2);
  }, 50);
  
  // Race condition!
});
```

### ❌ Bad Pattern: Not Cleaning Up

```typescript
// Bad: No cleanup between tests
describe('Cache', () => {
  const cache = new Cache(); // Shared state!
  
  it('should cache results', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });
  
  it('should return undefined for missing keys', () => {
    // Fails if previous test runs first!
    expect(cache.get('key')).toBeUndefined();
  });
});

// Bad: Not restoring mocks
it('should use mocked API', async () => {
  vi.spyOn(api, 'fetch').mockResolvedValue(mockData);
  
  await handler.process();
  
  // No vi.restoreAllMocks() - affects other tests!
});
```

### ❌ Bad Pattern: Unclear Test Names

```typescript
// Bad: Vague test names
it('works', () => { /* ... */ });
it('test 1', () => { /* ... */ });
it('should return true', () => { /* ... */ }); // When? Why?

// Good: Descriptive test names
it('should return search results when keywords are valid', () => { /* ... */ });
it('should throw ValidationError when keywords exceed 200 characters', () => { /* ... */ });
it('should cache results for 5 minutes', () => { /* ... */ });
```

## References

### Testing Frameworks
- [Vitest](https://vitest.dev/) - Fast unit test framework
- [Jest](https://jestjs.io/) - Popular JavaScript testing
- [Testing Library](https://testing-library.com/) - User-centric testing utilities
- [Supertest](https://github.com/ladjs/supertest) - HTTP assertion library

### Mocking
- [Vitest Mock Functions](https://vitest.dev/api/mock.html)
- [MSW](https://mswjs.io/) - Mock Service Worker for API mocking
- [Nock](https://github.com/nock/nock) - HTTP request mocking

### Coverage
- [c8](https://github.com/bcoe/c8) - Native V8 coverage
- [Istanbul/nyc](https://istanbul.js.org/) - Code coverage tooling
- [Codecov](https://codecov.io/) - Coverage reporting service

### Best Practices
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

### ISMS Policies
- [SC-002 Secure Coding Standards](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/SC-002.md)

## Remember

- **Test behavior, not implementation**: Focus on inputs/outputs, not internal logic
- **80% coverage minimum**: Maintain high coverage for confidence in changes
- **Fast tests**: Unit < 100ms, integration < 1s, suite < 5min
- **Deterministic**: No flakiness, randomness, or race conditions
- **AAA pattern**: Arrange, Act, Assert - clear structure
- **Mock external dependencies**: European Parliament API, file system, network
- **Test edge cases**: Empty, null, boundaries, errors
- **Clean up**: Reset mocks, clear state, avoid test pollution
- **Type-safe mocks**: Use TypeScript for mock type safety
- **Async properly**: Use async/await, handle Promise rejections
- **Security controls**: Test validation, rate limiting, authentication
- **Descriptive names**: Test names describe expected behavior clearly
- **CI/CD**: All tests pass before merge, run on every commit
- **Living documentation**: Tests serve as examples of correct usage
- **Refactoring confidence**: Good tests enable safe refactoring
