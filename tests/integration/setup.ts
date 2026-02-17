/**
 * Integration Test Setup
 * 
 * Sets up test environment for integration tests with real European Parliament API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { beforeAll, afterAll } from 'vitest';
import { EuropeanParliamentClient } from '../../src/clients/europeanParliamentClient.js';
import { RateLimiter } from '../../src/utils/rateLimiter.js';

let epClient: EuropeanParliamentClient;
let rateLimiter: RateLimiter;

/**
 * Initialize test environment before all tests
 */
beforeAll(async () => {
  // Use test environment variables or defaults
  const baseURL = process.env.EP_API_URL || 'https://data.europarl.europa.eu/api/v2';
  
  // Create rate limiter for testing (more permissive for faster tests)
  rateLimiter = new RateLimiter({
    tokensPerInterval: 50,
    interval: 'minute'
  });
  
  // Initialize EP client with caching enabled
  epClient = new EuropeanParliamentClient({
    baseURL,
    cacheEnabled: true,
    cacheTTL: 900000, // 15 minutes
    maxCacheSize: 500,
    rateLimiter
  });
  
  console.log('[Integration Tests] EP Client initialized');
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
 * Integration tests are skipped in CI unless explicitly enabled
 * to avoid hitting real API and rate limits
 */
export function shouldRunIntegrationTests(): boolean {
  return process.env.EP_INTEGRATION_TESTS === 'true' || 
         process.env.CI !== 'true';
}
