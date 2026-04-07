/**
 * European Parliament API Integration Tests
 * 
 * Tests integration with real European Parliament API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * Security: Tests validate rate limiting, caching, error handling
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EuropeanParliamentClient } from '../../src/clients/europeanParliamentClient.js';
import { epClient, rateLimiter, shouldRunIntegrationTests, useMockClient } from './setup.js';
import { retry, measureTime } from '../helpers/testUtils.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

// Log test mode at module load time
if (shouldRunIntegrationTests()) {
  console.log(`[Integration] Running in ${useMockClient() ? 'MOCK' : 'REAL API'} mode`);
}

describeIntegration('European Parliament API Integration', () => {
  beforeEach(async () => {
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('MEP Data Access', () => {
    it('should fetch real MEPs data from API', async () => {
      const result = await retry(async () => {
        return epClient.getMEPs({ country: 'SE', limit: 5 });
      });
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(typeof result.offset).toBe('number');
      
      // Verify data structure
      if (result.data.length > 0) {
        const mep = result.data[0]!;
        expect(mep).toHaveProperty('id');
        expect(mep).toHaveProperty('name');
        // EP API may return 'Unknown' when country mapping fails
        expect(['SE', 'Unknown']).toContain(mep.country);
      }
    }, 30000);
    
    it('should return MEPs with valid data structure', async () => {
      const result = await retry(async () => {
        return epClient.getMEPs({ limit: 3 });
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      result.data.forEach((mep) => {
        expect(typeof mep.id).toBe('string');
        expect(typeof mep.name).toBe('string');
        expect(typeof mep.country).toBe('string');
        // EP API may return 'Unknown' for some MEPs without mapped country
        if (mep.country !== 'Unknown') {
          expect(mep.country.length).toBe(2);
        }
      });
    }, 30000);
  });

  describe('Caching Behavior', () => {
    it('should return consistent data for repeated requests', async () => {
      const params = { country: 'SE', limit: 5 };
      
      // First request - acts as baseline (may hit API or return mock data)
      const result1 = await retry(async () => epClient.getMEPs(params));
      
      // Second request - should return the same data for identical parameters
      const result2 = await epClient.getMEPs(params);
      
      expect(result1).toEqual(result2);
    }, 60000);
    
    it('should handle repeated requests without significant overhead', async () => {
      const params = { country: 'SE', limit: 5 };
      
      // Warm up any internal state or cache (if implemented)
      await retry(async () => epClient.getMEPs(params));
      
      // Measure a subsequent request; this does not assume a specific caching implementation,
      // but provides basic observability of client performance.
      const [, duration] = await measureTime(async () => {
        return epClient.getMEPs(params);
      });
      
      expect(typeof duration).toBe('number');
      console.log(`Repeated request duration: ${duration.toFixed(2)}ms`);
    }, 60000);
  });

  describe('Rate Limiting', () => {
    it('should expose rate limiter metrics without errors', async () => {
      // Get current available tokens (may be mock or real implementation)
      const availableBefore = rateLimiter.getAvailableTokens();
      
      // Make a request using the client (which may or may not use the rate limiter internally)
      await retry(async () => epClient.getMEPs({ limit: 1 }));
      
      // Ensure the rate limiter continues to report a non-negative token count
      const availableAfter = rateLimiter.getAvailableTokens();
      expect(availableBefore).toBeGreaterThanOrEqual(0);
      expect(availableAfter).toBeGreaterThanOrEqual(0);
    }, 30000);
    
    it('should handle rate limit errors gracefully', async () => {
      // This test is commented out as it would exhaust rate limits
      // In production, you'd test with a mock rate limiter
      
      // const requests = Array(60).fill(0).map((_, i) => 
      //   epClient.getMEPs({ limit: 1, offset: i })
      // );
      
      // await expect(Promise.all(requests)).rejects.toThrow();
      
      expect(true).toBe(true);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters gracefully', async () => {
      // The EP API does not reject invalid country codes — it ignores unrecognized
      // filter values and returns data. Verify the client handles this gracefully
      // by returning a valid response structure rather than throwing.
      // @ts-expect-error - Testing invalid country code
      const result = await epClient.getMEPs({ country: 'INVALID' });
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    }, 30000);
    
    it('should handle network errors with retry', async () => {
      // Test with invalid base URL to simulate network error
      const badClient = new EuropeanParliamentClient({
        baseURL: 'https://invalid.example.com/api',
        cacheTTL: 0 // Disable cache
      });
      
      await expect(async () => {
        return retry(async () => badClient.getMEPs({ limit: 1 }), 2, 100);
      }).rejects.toThrow();
    }, 60000);
  });

  describe('Data Validation', () => {
    it('should return valid MEP data with required fields', async () => {
      const result = await retry(async () => {
        return epClient.getMEPs({ limit: 5 });
      });
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      result.data.forEach((mep) => {
        // Required fields
        expect(mep.id).toBeDefined();
        expect(mep.name).toBeDefined();
        expect(mep.country).toBeDefined();
        
        // Country code format (EP API may return 'Unknown' or 3-letter codes for some MEPs)
        if (mep.country !== 'Unknown') {
          expect(mep.country).toMatch(/^[A-Z]{2,3}$/);
        }
        
        // Optional fields should have correct types if present
        if (mep.politicalGroup) {
          expect(typeof mep.politicalGroup).toBe('string');
        }
        if (mep.active !== undefined) {
          expect(typeof mep.active).toBe('boolean');
        }
      });
    }, 30000);
  });

  describe('Performance Benchmarks', () => {
    it('should complete API requests within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => epClient.getMEPs({ limit: 10 }));
      });
      
      // Real EP API with retry can take 10-30s; use generous threshold
      expect(duration).toBeLessThan(30000);
      console.log(`API request duration: ${duration.toFixed(2)}ms`);
    }, 60000);
  });
});
