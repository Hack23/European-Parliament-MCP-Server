/**
 * EP API Mock Server Helper
 *
 * Provides utilities for mocking the European Parliament API in tests.
 * Wraps vi.mock patterns and response builders for consistent test setup.
 *
 * ISMS Policy: SC-002 (Secure Testing), DP-001 (GDPR Compliance)
 */

import { vi } from 'vitest';
import { mepFixtures } from '../fixtures/mepFixtures.js';
import { plenaryFixtures } from '../fixtures/plenaryFixtures.js';
import { votingFixtures } from '../fixtures/votingFixtures.js';
import { documentFixtures } from '../fixtures/documentFixtures.js';

/**
 * Generic EP API JSON-LD style response builder.
 * Wraps data in the EP API response envelope format.
 */
export function buildEPApiResponse<T>(data: T[]): {
  '@context': string;
  '@id': string;
  data: T[];
  total: number;
} {
  return {
    '@context': 'https://data.europarl.europa.eu/api/v2/context.jsonld',
    '@id': 'https://data.europarl.europa.eu/api/v2/meps',
    data,
    total: data.length
  };
}

/**
 * Build a paginated EP API response
 */
export function buildPaginatedEPApiResponse<T>(
  data: T[],
  total?: number
): {
  '@context': string;
  data: T[];
  total: number;
  hasMore: boolean;
} {
  return {
    '@context': 'https://data.europarl.europa.eu/api/v2/context.jsonld',
    data,
    total: total ?? data.length,
    hasMore: false
  };
}

/**
 * Build an EP API error response
 */
export function buildEPApiErrorResponse(
  status: number,
  message: string
): { status: number; error: string; message: string } {
  return { status, error: 'API Error', message };
}

/**
 * Mock response factories for each major EP API endpoint
 */
export const mockResponses = {
  /** MEP list response */
  mepList: () => buildEPApiResponse(mepFixtures),

  /** Plenary sessions response */
  plenarySessions: () => buildEPApiResponse(plenaryFixtures),

  /** Voting records response */
  votingRecords: () => buildEPApiResponse(votingFixtures),

  /** Documents response */
  documents: () => buildEPApiResponse(documentFixtures),

  /** Empty list response */
  emptyList: () => buildEPApiResponse([]),

  /** Rate limit error */
  rateLimitError: () => buildEPApiErrorResponse(429, 'Too Many Requests'),

  /** Not found error */
  notFoundError: (id: string) =>
    buildEPApiErrorResponse(404, `Resource not found: ${id}`),

  /** Internal server error */
  serverError: () =>
    buildEPApiErrorResponse(500, 'Internal Server Error')
};

/**
 * Creates a mock fetch function that simulates EP API responses.
 * Use with vi.spyOn(global, 'fetch') or vi.mock.
 *
 * @example
 * ```typescript
 * const mockFetch = createMockFetch({
 *   '/meps': () => ({ data: mepFixtures }),
 *   '/sessions': () => ({ data: plenaryFixtures })
 * });
 * vi.spyOn(global, 'fetch').mockImplementation(mockFetch);
 * ```
 */
export function createMockFetch(
  routes: Record<string, () => unknown> = {}
): typeof fetch {
  return vi.fn().mockImplementation(async (url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;

    // Find matching route
    for (const [path, handler] of Object.entries(routes)) {
      if (urlStr.includes(path)) {
        const body = handler();
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Default: return empty list
    return new Response(
      JSON.stringify(buildEPApiResponse([])),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as unknown as typeof fetch;
}

/**
 * Creates a mock fetch that returns rate limit errors after N successful calls
 */
export function createRateLimitingMockFetch(
  successfulCallsBeforeLimit: number
): typeof fetch {
  let callCount = 0;
  return vi.fn().mockImplementation(async () => {
    callCount++;
    if (callCount > successfulCallsBeforeLimit) {
      return new Response(
        JSON.stringify(mockResponses.rateLimitError()),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify(buildEPApiResponse(mepFixtures)),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as unknown as typeof fetch;
}

/**
 * Creates a mock fetch that simulates network timeout
 */
export function createTimeoutMockFetch(delayMs = 30000): typeof fetch {
  return vi.fn().mockImplementation(async () => {
    return new Promise<Response>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Network timeout after ${delayMs}ms`));
      }, delayMs);
    });
  }) as unknown as typeof fetch;
}

/**
 * Setup standard EP API mocks for a test file.
 * Call in beforeEach / beforeAll.
 */
export function setupEPApiMocks(): void {
  vi.clearAllMocks();
}

/**
 * Teardown EP API mocks. Call in afterEach / afterAll.
 */
export function teardownEPApiMocks(): void {
  vi.restoreAllMocks();
}
