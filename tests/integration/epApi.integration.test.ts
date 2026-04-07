/**
 * European Parliament API Integration Tests
 *
 * Lean smoke tests validating real EP API response structure.
 * Uses retryOrSkip() so transient API failures (timeout, rate-limit)
 * are reported as skips rather than hard failures.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect } from 'vitest';
import { EuropeanParliamentClient } from '../../src/clients/europeanParliamentClient.js';
import { epClient, rateLimiter, shouldRunIntegrationTests, useMockClient } from './setup.js';
import { retryOrSkip } from '../helpers/testUtils.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

// Log test mode at module load time
if (shouldRunIntegrationTests()) {
  console.log(`[Integration] Running in ${useMockClient() ? 'MOCK' : 'REAL API'} mode`);
}

describeIntegration('European Parliament API Integration', () => {
  describe('MEP Data Access', () => {
    // retryOrSkip() returns undefined on transient failures (timeout, rate-limit, network).
    // Tests guard with `if (!result) { ctx.skip(); return; }` so flaky API issues
    // are reported as skips rather than hard failures.
    it('should fetch real MEPs data from API', async (ctx) => {
      const result = await retryOrSkip(
        () => epClient.getMEPs({ country: 'SE', limit: 5 }),
        'fetch SE MEPs'
      );
      if (!result) { ctx.skip(); return; }

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(typeof result.offset).toBe('number');

      if (result.data.length > 0) {
        const mep = result.data[0]!;
        expect(mep).toHaveProperty('id');
        expect(mep).toHaveProperty('name');
      }
    }, 60000);
  });

  describe('Rate Limiting', () => {
    it('should expose rate limiter metrics without errors', async (ctx) => {
      const availableBefore = rateLimiter.getAvailableTokens();
      expect(availableBefore).toBeGreaterThanOrEqual(0);

      const result = await retryOrSkip(
        () => epClient.getMEPs({ limit: 1 }),
        'rate limiter metrics'
      );
      if (!result) { ctx.skip(); return; }

      const availableAfter = rateLimiter.getAvailableTokens();
      expect(availableAfter).toBeGreaterThanOrEqual(0);
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters gracefully', async (ctx) => {
      // EP API ignores unrecognized filter values and returns data
      const result = await retryOrSkip(
        // @ts-expect-error - Testing invalid country code
        () => epClient.getMEPs({ country: 'INVALID' }),
        'invalid params'
      );
      if (!result) { ctx.skip(); return; }

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    }, 60000);

    it('should reject requests to unreachable hosts', async () => {
      const badClient = new EuropeanParliamentClient({
        baseURL: 'https://invalid.example.com/api',
        cacheTTL: 0
      });

      await expect(async () => {
        return badClient.getMEPs({ limit: 1 });
      }).rejects.toThrow();
    }, 30000);
  });

  describe('Data Validation', () => {
    it('should return valid MEP data with required fields', async (ctx) => {
      const result = await retryOrSkip(
        () => epClient.getMEPs({ limit: 5 }),
        'data validation'
      );
      if (!result) { ctx.skip(); return; }

      expect(Array.isArray(result.data)).toBe(true);

      result.data.forEach((mep) => {
        expect(mep.id).toBeDefined();
        expect(mep.name).toBeDefined();
        expect(mep.country).toBeDefined();

        if (mep.country !== 'Unknown') {
          expect(mep.country).toMatch(/^[A-Z]{2,3}$/);
        }
        if (mep.politicalGroup) {
          expect(typeof mep.politicalGroup).toBe('string');
        }
      });
    }, 60000);
  });
});
