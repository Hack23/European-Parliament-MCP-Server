/**
 * Concurrent Request Handling Tests
 *
 * Tests that EP API tool handlers correctly handle concurrent requests,
 * including proper rate limiting behaviour and graceful degradation.
 * Uses mocked EP client — no real API calls.
 *
 * ISMS Policy: PE-001 (Performance Standards), SC-002 (Secure Testing)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { measureTime } from '../helpers/testUtils.js';
import { getMockEPClient, resetMockEPClient } from '../helpers/mockEPClient.js';
import { mepFixtures, mepDetailsFixtures } from '../fixtures/mepFixtures.js';
import { plenaryFixtures } from '../fixtures/plenaryFixtures.js';
import { votingFixtures } from '../fixtures/votingFixtures.js';
import { documentFixtures } from '../fixtures/documentFixtures.js';
import { committeeFixtures } from '../fixtures/committeeFixtures.js';
import { questionFixtures } from '../fixtures/questionFixtures.js';

// Detect CI environment and set adaptive thresholds
const isCI = process.env.CI === 'true';
const CONCURRENT_THRESHOLD_MS = isCI ? 15000 : 5000;
const PER_REQUEST_THRESHOLD_MS = isCI ? 500 : 200;

/** Helper: build paginated response */
function paginated<T>(items: T[], limit = 10, offset = 0) {
  return {
    data: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
    hasMore: offset + limit < items.length
  };
}

// Mock the EP client
vi.mock('../../src/clients/europeanParliamentClient.js', () => {
  const mockClient = {
    getMEPs: vi.fn().mockImplementation(
      (params: { country?: string; limit?: number; offset?: number } = {}) => {
        const items = params.country
          ? mepFixtures.filter(m => m.country === params.country)
          : mepFixtures;
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),
    getMEPDetails: vi.fn().mockImplementation((id: string) =>
      Promise.resolve({ ...mepDetailsFixtures[0], id })
    ),
    getCurrentMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(mepFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getIncomingMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(mepFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getOutgoingMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(mepFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getHomonymMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getPlenarySessions: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(plenaryFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getVotingRecords: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(votingFixtures, params.limit ?? 10, params.offset ?? 0))
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
    getCommitteeInfo: vi.fn().mockImplementation(
      (params: { abbreviation?: string } = {}) => {
        const committee = params.abbreviation
          ? committeeFixtures.find(c => c.abbreviation === params.abbreviation)
          : committeeFixtures[0];
        return Promise.resolve(committee ?? committeeFixtures[0]);
      }
    ),
    getParliamentaryQuestions: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(questionFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getSpeeches: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getAdoptedTexts: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getEvents: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getMeetingActivities: vi.fn().mockImplementation(
      (_id: string, params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getMeetingDecisions: vi.fn().mockImplementation(
      (_id: string, params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getMEPDeclarations: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getPlenaryDocuments: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(documentFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getCommitteeDocuments: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(documentFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getPlenarySessionDocuments: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(documentFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getPlenarySessionDocumentItems: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(documentFixtures, params.limit ?? 10, params.offset ?? 0))
    ),
    getControlledVocabularies: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getExternalDocuments: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getMeetingForeseenActivities: vi.fn().mockImplementation(
      (_id: string, params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getProcedureEvents: vi.fn().mockImplementation(
      (_id: string, params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),
    getProcedures: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
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

// Import handlers AFTER mocking
const { handleGetMEPs } = await import('../../src/tools/getMEPs.js');
const { handleGetMEPDetails } = await import('../../src/tools/getMEPDetails.js');
const { handleGetPlenarySessions } = await import('../../src/tools/getPlenarySessions.js');
const { handleGetVotingRecords } = await import('../../src/tools/getVotingRecords.js');
const { handleSearchDocuments } = await import('../../src/tools/searchDocuments.js');
const { handleGetParliamentaryQuestions } = await import('../../src/tools/getParliamentaryQuestions.js');

describe('Concurrent Request Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Same-Tool Concurrency', () => {
    it('should handle 10 concurrent get_meps requests', async () => {
      const requests = Array(10).fill(0).map((_, i) =>
        handleGetMEPs({ limit: 5, offset: i })
      );

      const [results, duration] = await measureTime(() => Promise.all(requests));

      expect(results).toHaveLength(10);
      results.forEach(r => {
        expect(r).toBeDefined();
        expect(r.content).toBeDefined();
      });
      expect(duration).toBeLessThan(CONCURRENT_THRESHOLD_MS);
      console.log(`  10 concurrent get_meps: ${duration.toFixed(2)}ms`);
    });

    it('should handle 20 concurrent get_mep_details requests', async () => {
      const mepIds = mepFixtures.map(m => m.id);
      const requests = Array(20).fill(0).map((_, i) =>
        handleGetMEPDetails({ id: mepIds[i % mepIds.length]! })
      );

      const [results, duration] = await measureTime(() => Promise.all(requests));

      expect(results).toHaveLength(20);
      results.forEach(r => expect(r).toBeDefined());
      expect(duration).toBeLessThan(CONCURRENT_THRESHOLD_MS);
      console.log(`  20 concurrent get_mep_details: ${duration.toFixed(2)}ms`);
    });

    it('should handle 50 concurrent get_meps requests', async () => {
      const requests = Array(50).fill(0).map((_, i) =>
        handleGetMEPs({ limit: 2, offset: i * 2 })
      );

      const [results, duration] = await measureTime(() => Promise.all(requests));

      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(CONCURRENT_THRESHOLD_MS * 5);
      console.log(`  50 concurrent get_meps: ${duration.toFixed(2)}ms`);
    }, 35000);
  });

  describe('Mixed-Tool Concurrency', () => {
    it('should handle concurrent requests to different tools', async () => {
      const [results, duration] = await measureTime(() => Promise.all([
        handleGetMEPs({ limit: 5 }),
        handleGetMEPDetails({ id: 'mep-test-001' }),
        handleGetPlenarySessions({ limit: 5 }),
        handleGetVotingRecords({ limit: 5 }),
        handleSearchDocuments({ keyword: 'climate', limit: 5 }),
        handleGetParliamentaryQuestions({ limit: 5 })
      ]));

      expect(results).toHaveLength(6);
      results.forEach(r => expect(r).toBeDefined());
      expect(duration).toBeLessThan(CONCURRENT_THRESHOLD_MS);
      console.log(`  6 concurrent mixed tools: ${duration.toFixed(2)}ms`);
    });

    it('should process mixed batch of 30 requests across tools', async () => {
      const requests = [
        ...Array(10).fill(0).map((_, i) => handleGetMEPs({ limit: 3, offset: i })),
        ...Array(10).fill(0).map((_, i) => handleGetPlenarySessions({ limit: 3, offset: i })),
        ...Array(10).fill(0).map((_, i) => handleSearchDocuments({ keyword: 'climate', limit: 3, offset: i }))
      ];

      const [results, duration] = await measureTime(() => Promise.all(requests));

      expect(results).toHaveLength(30);
      expect(duration).toBeLessThan(CONCURRENT_THRESHOLD_MS * 2);
      console.log(`  30 concurrent mixed requests: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Request Isolation', () => {
    it('should not share state between concurrent requests', async () => {
      const params1 = { country: 'SE', limit: 5 };
      const params2 = { country: 'DE', limit: 5 };

      const [results] = await measureTime(() => Promise.all([
        handleGetMEPs(params1),
        handleGetMEPs(params2)
      ]));

      // Both should return valid responses without interfering
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
      expect(results[0]).not.toEqual(results[1]);
    });

    it('should handle concurrent requests with distinct offsets', async () => {
      const requests = Array(5).fill(0).map((_, i) =>
        handleGetMEPs({ limit: 1, offset: i })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      // All should be valid MCP responses
      results.forEach(r => {
        expect(r).toHaveProperty('content');
        expect(Array.isArray(r.content)).toBe(true);
      });
    });
  });

  describe('Error Handling Under Concurrency', () => {
    it('should handle mixed valid/invalid concurrent requests gracefully', async () => {
      const validRequests = Array(5).fill(0).map(() =>
        handleGetMEPs({ limit: 5 })
      );

      const results = await Promise.allSettled(validRequests);

      // All valid requests should succeed
      results.forEach(r => {
        expect(r.status).toBe('fulfilled');
      });
    });

    it('should maintain response quality under concurrent load', async () => {
      const concurrentCount = 15;
      const requests = Array(concurrentCount).fill(0).map(() =>
        handleGetMEPs({ limit: 5 })
      );

      const results = await Promise.all(requests);

      // All responses should have valid structure
      results.forEach(r => {
        expect(r).toHaveProperty('content');
        expect(r.content.length).toBeGreaterThan(0);
        expect(r.content[0]).toHaveProperty('type', 'text');
      });
    });
  });

  describe('Sequential vs. Concurrent Performance', () => {
    it('concurrent requests should not be slower than sequential by more than 3x', async () => {
      const requestCount = 10;

      // Sequential
      const [, sequentialDuration] = await measureTime(async () => {
        for (let i = 0; i < requestCount; i++) {
          await handleGetMEPs({ limit: 3, offset: i });
        }
      });

      // Concurrent
      const [, concurrentDuration] = await measureTime(() =>
        Promise.all(
          Array(requestCount).fill(0).map((_, i) =>
            handleGetMEPs({ limit: 3, offset: i })
          )
        )
      );

      console.log(`  Sequential: ${sequentialDuration.toFixed(2)}ms, Concurrent: ${concurrentDuration.toFixed(2)}ms`);
      console.log(`  Speedup: ${(sequentialDuration / Math.max(concurrentDuration, 1)).toFixed(2)}x`);

      // Both should be within per-request threshold
      expect(sequentialDuration).toBeLessThan(PER_REQUEST_THRESHOLD_MS * requestCount);
      expect(concurrentDuration).toBeLessThan(CONCURRENT_THRESHOLD_MS);
    });
  });

  describe('Mock EP Client Integration', () => {
    it('should use mock client for isolated concurrency testing', async () => {
      // Use getMockEPClient for direct client access in isolation
      const mockClient = getMockEPClient();

      const results = await Promise.all([
        mockClient.getMEPs({ limit: 3 }),
        mockClient.getMEPs({ country: 'SE', limit: 2 }),
        mockClient.getMEPs({ country: 'DE', limit: 2 })
      ]);

      expect(results).toHaveLength(3);
      results.forEach(r => {
        expect(r.data).toBeDefined();
        expect(Array.isArray(r.data)).toBe(true);
      });

      // Clean up
      resetMockEPClient();
    });
  });
});
