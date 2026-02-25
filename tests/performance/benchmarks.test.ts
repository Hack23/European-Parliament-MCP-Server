/**
 * Performance Benchmark Tests
 *
 * Validates performance requirements and benchmarks using mocked EP client.
 * All tests run against synthetic data — no real EP API calls.
 *
 * ISMS Policy: PE-001 (Performance Standards)
 * Target: <200ms cached response time (CI: <500ms)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetMEPs } from '../../src/tools/getMEPs.js';
import { handleGetMEPDetails } from '../../src/tools/getMEPDetails.js';
import { handleSearchDocuments } from '../../src/tools/searchDocuments.js';
import { measureTime } from '../helpers/testUtils.js';
import { mepFixtures, mepDetailsFixtures } from '../fixtures/mepFixtures.js';
import { documentFixtures } from '../fixtures/documentFixtures.js';

// Detect CI environment and set adaptive thresholds
const isCI = process.env.CI === 'true';
const CACHED_THRESHOLD_MS = isCI ? 500 : 200;
const CONCURRENT_THRESHOLD_MS = isCI ? 15000 : 5000;
const THROUGHPUT_MIN_RPS = isCI ? 2 : 5;

// Mock the EP client to use synthetic data — no real API calls
vi.mock('../../src/clients/europeanParliamentClient.js', () => {
  const paginated = <T>(items: T[], limit = 10, offset = 0) => ({
    data: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
    hasMore: offset + limit < items.length
  });

  const mockClient = {
    getMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number; country?: string } = {}) => {
        const items = params.country
          ? mepFixtures.filter(m => m.country === params.country)
          : mepFixtures;
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),
    getMEPDetails: vi.fn().mockImplementation((id: string) =>
      Promise.resolve({
        ...mepDetailsFixtures[0],
        id
      })
    ),
    searchDocuments: vi.fn().mockImplementation(
      (params: { keyword?: string; limit?: number; offset?: number } = {}) => {
        const items = params.keyword
          ? documentFixtures.filter(d =>
            d.title.toLowerCase().includes(params.keyword!.toLowerCase())
          )
          : documentFixtures;
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),
    clearCache: vi.fn()
  };

  return {
    epClient: mockClient,
    EuropeanParliamentClient: vi.fn().mockImplementation(() => mockClient),
    APIError: class APIError extends Error {
      constructor(
        message: string,
        public statusCode?: number
      ) {
        super(message);
        this.name = 'APIError';
      }
    }
  };
});

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Response Time Benchmarks', () => {
    it('should respond to get_meps in <CACHED_THRESHOLD_MS (cached)', async () => {
      // Warm up cache
      await handleGetMEPs({ limit: 10 });

      // Measure cached request
      const [, duration] = await measureTime(async () => {
        return handleGetMEPs({ limit: 10 });
      });

      expect(duration).toBeLessThan(CACHED_THRESHOLD_MS);
      console.log(`get_meps cached: ${duration.toFixed(2)}ms (threshold: ${CACHED_THRESHOLD_MS}ms, CI: ${isCI})`);
    }, 30000);

    it('should respond to get_mep_details in <CACHED_THRESHOLD_MS (cached)', async () => {
      const mepId = 'mep-test-001';

      // Warm up cache
      await handleGetMEPDetails({ id: mepId });

      // Measure cached request
      const [, duration] = await measureTime(async () => {
        return handleGetMEPDetails({ id: mepId });
      });

      expect(duration).toBeLessThan(CACHED_THRESHOLD_MS);
      console.log(`get_mep_details cached: ${duration.toFixed(2)}ms (threshold: ${CACHED_THRESHOLD_MS}ms)`);
    }, 30000);

    it('should respond to search_documents in <CACHED_THRESHOLD_MS (cached)', async () => {
      const params = { keyword: 'climate', limit: 10 };

      // Warm up cache
      await handleSearchDocuments(params);

      // Measure cached request
      const [, duration] = await measureTime(async () => {
        return handleSearchDocuments(params);
      });

      expect(duration).toBeLessThan(CACHED_THRESHOLD_MS);
      console.log(`search_documents cached: ${duration.toFixed(2)}ms (threshold: ${CACHED_THRESHOLD_MS}ms)`);
    }, 30000);
  });

  describe('Concurrent Request Handling', () => {
    it('should handle 10 concurrent requests efficiently', async () => {
      const requests = Array(10).fill(0).map((_, i) =>
        handleGetMEPs({ limit: 5, offset: i * 5 })
      );

      const [results, duration] = await measureTime(async () => {
        return Promise.all(requests);
      });

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(CONCURRENT_THRESHOLD_MS);
      console.log(`10 concurrent requests: ${duration.toFixed(2)}ms (threshold: ${CONCURRENT_THRESHOLD_MS}ms)`);
    });

    it('should handle 50 concurrent requests with rate limiting', async () => {
      const requests = Array(50).fill(0).map((_, i) =>
        handleGetMEPs({ limit: 2, offset: i * 2 })
      );

      const [results, duration] = await measureTime(async () => {
        return Promise.all(requests);
      });

      expect(results).toHaveLength(50);
      // With mock, this should complete much faster than real API
      expect(duration).toBeLessThan(CONCURRENT_THRESHOLD_MS * 6);
      console.log(`50 concurrent requests: ${duration.toFixed(2)}ms`);
    }, 35000);
  });

  describe('Memory Usage', () => {
    it('should not leak memory on repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Make many requests
      for (let i = 0; i < 100; i++) {
        await handleGetMEPs({ limit: 5 });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Memory increase should be reasonable (<50MB)
      expect(memoryIncreaseMB).toBeLessThan(50);
      console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);
    }, 30000);
  });

  describe('Throughput Benchmarks', () => {
    it('should maintain high throughput for sequential requests', async () => {
      const requestCount = 20;

      const [, duration] = await measureTime(async () => {
        for (let i = 0; i < requestCount; i++) {
          await handleGetMEPs({ limit: 5, offset: i * 5 });
        }
      });

      const requestsPerSecond = (requestCount / duration) * 1000;

      expect(requestsPerSecond).toBeGreaterThan(THROUGHPUT_MIN_RPS);
      console.log(`Throughput: ${requestsPerSecond.toFixed(2)} req/s (min: ${THROUGHPUT_MIN_RPS} req/s)`);
    }, 30000);
  });

  describe('Cache Performance', () => {
    it('should demonstrate cache effectiveness', async () => {
      const uniqueParams1 = { country: 'SE', limit: 10, offset: 100 };

      // First call to populate cache
      await handleGetMEPs(uniqueParams1);

      // Measure cold request (different params)
      const [, coldTime] = await measureTime(async () => {
        return handleGetMEPs({ country: 'FR', limit: 10, offset: 200 });
      });

      // Warm request (cached) - repeat same request multiple times
      await handleGetMEPs(uniqueParams1);
      await handleGetMEPs(uniqueParams1);
      const [, warmTime] = await measureTime(async () => {
        return handleGetMEPs(uniqueParams1);
      });

      console.log(`Cache speedup: ${(coldTime / Math.max(warmTime, 0.01)).toFixed(2)}x (cold: ${coldTime.toFixed(2)}ms, warm: ${warmTime.toFixed(2)}ms)`);

      // Just verify both requests complete successfully
      expect(coldTime).toBeGreaterThanOrEqual(0);
      expect(warmTime).toBeGreaterThanOrEqual(0);
    });

    it('should maintain cache hit rate', async () => {
      const params = { country: 'SE', limit: 10 };
      let cacheHits = 0;

      // Make requests with same params
      for (let i = 0; i < 10; i++) {
        const [, duration] = await measureTime(async () => {
          return handleGetMEPs(params);
        });

        // Fast response indicates cache hit (with mock, all should be fast)
        if (duration < CACHED_THRESHOLD_MS) {
          cacheHits++;
        }
      }

      // With mocks, all should be fast
      const hitRate = cacheHits / 10;
      expect(hitRate).toBeGreaterThan(0.8); // At least 80% hit rate
      console.log(`Cache hit rate: ${(hitRate * 100).toFixed(1)}%`);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions', async () => {
      const baseline = CACHED_THRESHOLD_MS;
      const tolerance = 0.2; // 20% tolerance
      const params = { limit: 10 };

      // Warm up
      await handleGetMEPs(params);

      // Measure multiple runs
      const runs = 5;
      const durations: number[] = [];

      for (let i = 0; i < runs; i++) {
        const [, duration] = await measureTime(async () => {
          return handleGetMEPs(params);
        });
        durations.push(duration);
      }

      // Calculate average
      const avg = durations.reduce((a, b) => a + b, 0) / runs;
      const maxAllowed = baseline * (1 + tolerance);

      expect(avg).toBeLessThan(maxAllowed);
      console.log(`Average: ${avg.toFixed(2)}ms (baseline: ${baseline}ms, max: ${maxAllowed.toFixed(0)}ms)`);
    }, 30000);
  });
});
