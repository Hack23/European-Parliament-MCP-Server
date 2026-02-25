/**
 * Integration Test Setup
 * 
 * Sets up test environment for integration tests with real European Parliament API
 * or a mock client when EP_USE_MOCK=true.
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { beforeAll, afterAll } from 'vitest';
import { EuropeanParliamentClient } from '../../src/clients/europeanParliamentClient.js';
import { RateLimiter } from '../../src/utils/rateLimiter.js';
import { createMockEPClient } from '../helpers/mockEPClient.js';

let epClient: EuropeanParliamentClient | ReturnType<typeof createMockEPClient>;
let rateLimiter: RateLimiter;

/**
 * Whether the mock EP client is being used instead of the real one.
 * Set EP_USE_MOCK=true to use synthetic data for integration tests.
 */
const isMockClient = process.env.EP_USE_MOCK === 'true';

/**
 * Initialize test environment before all tests
 */
beforeAll(async () => {
  if (isMockClient) {
    // Use mock client with synthetic data — no real API calls
    epClient = createMockEPClient();
    rateLimiter = new RateLimiter({ tokensPerInterval: 1000, interval: 'minute' });
    console.log('[Integration Tests] Mock EP Client initialized (EP_USE_MOCK=true)');
  } else {
    // Use test environment variables or defaults (must include trailing slash)
    const baseURL = process.env.EP_API_URL || 'https://data.europarl.europa.eu/api/v2/';

    // Create rate limiter for testing (more permissive for faster tests)
    rateLimiter = new RateLimiter({
      tokensPerInterval: 50,
      interval: 'minute'
    });

    // Initialize EP client
    epClient = new EuropeanParliamentClient({
      baseURL,
      cacheTTL: 900000, // 15 minutes
      maxCacheSize: 500,
      rateLimiter
    });

    console.log('[Integration Tests] Real EP Client initialized');
  }
});

/**
 * Clean up test environment after all tests
 */
afterAll(async () => {
  // Cleanup resources if needed
  console.log('[Integration Tests] Cleanup complete');
});

/**
 * Export client for use in tests
 */
export { epClient, rateLimiter };

/**
 * Check if integration tests should run
 * 
 * Integration tests are disabled by default and only run when
 * explicitly enabled via EP_INTEGRATION_TESTS=true to avoid
 * accidental real API calls and rate limit issues.
 */
export function shouldRunIntegrationTests(): boolean {
  return process.env.EP_INTEGRATION_TESTS === 'true';
}

/**
 * Check if the mock EP client is active
 * 
 * When true, tests use synthetic fixture data instead of real API responses.
 * Enable via EP_USE_MOCK=true environment variable.
 */
export function useMockClient(): boolean {
  return isMockClient;
}
