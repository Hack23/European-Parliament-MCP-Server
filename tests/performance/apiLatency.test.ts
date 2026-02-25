/**
 * EP API Endpoint Latency Benchmarks
 *
 * Tests response latency for all major EP API tool handlers using mocked client.
 * No real EP API calls are made — all data is synthetic.
 *
 * ISMS Policy: PE-001 (Performance Standards)
 * Target: <200ms per handler call (CI: <500ms)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { measureTime, getTestTimeout, waitFor } from '../helpers/testUtils.js';
import {
  setupEPApiMocks,
  teardownEPApiMocks,
  buildPaginatedEPApiResponse,
  createMockFetch,
  createRateLimitingMockFetch,
  createTimeoutMockFetch
} from '../helpers/epApiMock.js';
import { mepFixtures, mepDetailsFixtures } from '../fixtures/mepFixtures.js';
import { plenaryFixtures } from '../fixtures/plenaryFixtures.js';
import { votingFixtures } from '../fixtures/votingFixtures.js';
import { documentFixtures } from '../fixtures/documentFixtures.js';
import { committeeFixtures } from '../fixtures/committeeFixtures.js';
import { questionFixtures } from '../fixtures/questionFixtures.js';

// Detect CI environment and set adaptive thresholds
const isCI = process.env.CI === 'true';
const LATENCY_THRESHOLD_MS = isCI ? 500 : 200;

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

// Mock the EP client module before importing handlers
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
        Promise.resolve(paginated(mepFixtures.slice(0, 2), params.limit ?? 10, params.offset ?? 0))
    ),
    getOutgoingMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(mepFixtures.slice(0, 2), params.limit ?? 10, params.offset ?? 0))
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
const { handleGetCommitteeInfo } = await import('../../src/tools/getCommitteeInfo.js');
const { handleGetParliamentaryQuestions } = await import('../../src/tools/getParliamentaryQuestions.js');

describe('EP API Endpoint Latency Benchmarks', () => {
  beforeEach(() => {
    setupEPApiMocks();
  });

  afterEach(() => {
    teardownEPApiMocks();
  });

  describe('Core Tool Latency', () => {
    it(`get_meps should respond in <${LATENCY_THRESHOLD_MS}ms`, async () => {
      const [, duration] = await measureTime(() =>
        handleGetMEPs({ limit: 10 })
      );
      expect(duration).toBeLessThan(LATENCY_THRESHOLD_MS);
      console.log(`  get_meps: ${duration.toFixed(2)}ms`);
    });

    it(`get_mep_details should respond in <${LATENCY_THRESHOLD_MS}ms`, async () => {
      const [, duration] = await measureTime(() =>
        handleGetMEPDetails({ id: 'mep-test-001' })
      );
      expect(duration).toBeLessThan(LATENCY_THRESHOLD_MS);
      console.log(`  get_mep_details: ${duration.toFixed(2)}ms`);
    });

    it(`get_plenary_sessions should respond in <${LATENCY_THRESHOLD_MS}ms`, async () => {
      const [, duration] = await measureTime(() =>
        handleGetPlenarySessions({ limit: 10 })
      );
      expect(duration).toBeLessThan(LATENCY_THRESHOLD_MS);
      console.log(`  get_plenary_sessions: ${duration.toFixed(2)}ms`);
    });

    it(`get_voting_records should respond in <${LATENCY_THRESHOLD_MS}ms`, async () => {
      const [, duration] = await measureTime(() =>
        handleGetVotingRecords({ limit: 10 })
      );
      expect(duration).toBeLessThan(LATENCY_THRESHOLD_MS);
      console.log(`  get_voting_records: ${duration.toFixed(2)}ms`);
    });

    it(`search_documents should respond in <${LATENCY_THRESHOLD_MS}ms`, async () => {
      const [, duration] = await measureTime(() =>
        handleSearchDocuments({ keyword: 'climate', limit: 10 })
      );
      expect(duration).toBeLessThan(LATENCY_THRESHOLD_MS);
      console.log(`  search_documents: ${duration.toFixed(2)}ms`);
    });

    it(`get_committee_info should respond in <${LATENCY_THRESHOLD_MS}ms`, async () => {
      const [, duration] = await measureTime(() =>
        handleGetCommitteeInfo({ abbreviation: 'ENVI' })
      );
      expect(duration).toBeLessThan(LATENCY_THRESHOLD_MS);
      console.log(`  get_committee_info: ${duration.toFixed(2)}ms`);
    });

    it(`get_parliamentary_questions should respond in <${LATENCY_THRESHOLD_MS}ms`, async () => {
      const [, duration] = await measureTime(() =>
        handleGetParliamentaryQuestions({ limit: 10 })
      );
      expect(duration).toBeLessThan(LATENCY_THRESHOLD_MS);
      console.log(`  get_parliamentary_questions: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Latency Distribution', () => {
    it('should have consistent latency across repeated calls', async () => {
      const runs = 10;
      const durations: number[] = [];

      for (let i = 0; i < runs; i++) {
        const [, duration] = await measureTime(() =>
          handleGetMEPs({ limit: 5 })
        );
        durations.push(duration);
      }

      const avg = durations.reduce((a, b) => a + b, 0) / runs;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      const p95 = durations.sort((a, b) => a - b)[Math.floor(runs * 0.95)] ?? max;

      console.log(`  get_meps latency: avg=${avg.toFixed(2)}ms, p95=${p95.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms`);

      // p95 should still be within threshold
      expect(p95).toBeLessThan(LATENCY_THRESHOLD_MS);
      // Max should not be wildly higher than average
      expect(max).toBeLessThan(LATENCY_THRESHOLD_MS * 3);
    });

    it('should maintain low latency under parallel load', async () => {
      const parallelRequests = 5;
      const latencies: number[] = [];

      await Promise.all(
        Array(parallelRequests).fill(0).map(async (_, i) => {
          const [, duration] = await measureTime(() =>
            handleGetMEPs({ limit: 5, offset: i * 5 })
          );
          latencies.push(duration);
        })
      );

      const maxLatency = Math.max(...latencies);
      console.log(`  Parallel max latency: ${maxLatency.toFixed(2)}ms`);
      expect(maxLatency).toBeLessThan(LATENCY_THRESHOLD_MS * 2);
    });

    it('should complete request within configured timeout', async () => {
      // Use getTestTimeout to allow CI overrides
      const testTimeout = getTestTimeout(LATENCY_THRESHOLD_MS * 10);

      let completed = false;
      const [, duration] = await measureTime(async () => {
        const result = await handleGetMEPs({ limit: 5 });
        completed = true;
        return result;
      });

      // Use waitFor as a polling check that the call completed
      await waitFor(() => completed, testTimeout);

      expect(completed).toBe(true);
      expect(duration).toBeLessThan(testTimeout);
      console.log(`  Completed in: ${duration.toFixed(2)}ms (timeout: ${testTimeout}ms)`);
    });
  });

  describe('EP API Mock Utilities', () => {
    it('should build a valid paginated EP API response', () => {
      const data = [{ id: 'mep-1', name: 'Test MEP' }];
      const response = buildPaginatedEPApiResponse(data, 100);

      expect(response['@context']).toBe('https://data.europarl.europa.eu/api/v2/context.jsonld');
      expect(response.data).toEqual(data);
      expect(response.total).toBe(100);
      expect(response.hasMore).toBe(false);
    });

    it('should create a mock fetch that returns synthetic data', async () => {
      const mockFetch = createMockFetch({
        '/meps': () => ({ data: mepFixtures, total: mepFixtures.length })
      });

      const response = await mockFetch(
        'https://data.europarl.europa.eu/api/v2/meps',
        {} as RequestInit
      );
      expect(response.status).toBe(200);

      const body = await response.json() as { data: typeof mepFixtures };
      expect(body.data).toEqual(mepFixtures);
    });

    it('should create a rate-limiting mock fetch', async () => {
      const mockFetch = createRateLimitingMockFetch(2);

      // First 2 calls succeed
      const r1 = await mockFetch('https://data.europarl.europa.eu/api/v2/meps', {});
      const r2 = await mockFetch('https://data.europarl.europa.eu/api/v2/meps', {});
      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);

      // 3rd call gets rate limited
      const r3 = await mockFetch('https://data.europarl.europa.eu/api/v2/meps', {});
      expect(r3.status).toBe(429);
    });

    it('should create a timeout mock fetch that rejects', async () => {
      // Very short timeout to test the rejection quickly
      const mockFetch = createTimeoutMockFetch(10);

      await expect(
        mockFetch('https://data.europarl.europa.eu/api/v2/meps', {})
      ).rejects.toThrow(/timeout/i);
    }, 5000);
  });
});
