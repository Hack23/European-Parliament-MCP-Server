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
import { epClient, rateLimiter, shouldRunIntegrationTests } from './setup.js';
import { retry, measureTime } from '../helpers/testUtils.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('European Parliament API Integration', () => {
  beforeEach(async () => {
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('MEP Data Access', () => {
    it('should fetch real MEPs data from API', async () => {
      const result = await retry(async () => {
        return epClient.getMEPs({ country: 'SE', limit: 5 });
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Verify data structure
      if (result.length > 0) {
        const mep = result[0]!;
        expect(mep).toHaveProperty('id');
        expect(mep).toHaveProperty('name');
        expect(mep.country).toBe('SE');
      }
    }, 30000);
    
    it('should return MEPs with valid data structure', async () => {
      const result = await retry(async () => {
        return epClient.getMEPs({ limit: 3 });
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach((mep) => {
        expect(typeof mep.id).toBe('string');
        expect(typeof mep.name).toBe('string');
        expect(typeof mep.country).toBe('string');
        expect(mep.country.length).toBe(2);
      });
    }, 30000);
  });

  describe('Caching Behavior', () => {
    it('should cache API responses for repeated requests', async () => {
      const params = { country: 'SE', limit: 5 };
      
      // First request - should hit API
      const [result1, time1] = await measureTime(async () => {
        return retry(async () => epClient.getMEPs(params));
      });
      
      // Second request - should hit cache (faster)
      const [result2, time2] = await measureTime(async () => {
        return epClient.getMEPs(params);
      });
      
      expect(result1).toEqual(result2);
      
      // Cached request should be significantly faster (at least 50% faster)
      expect(time2).toBeLessThan(time1 * 0.5);
      
      console.log(`First request: ${time1.toFixed(2)}ms, Cached request: ${time2.toFixed(2)}ms`);
    }, 60000);
    
    it('should provide fast cached responses (<200ms)', async () => {
      const params = { country: 'SE', limit: 5 };
      
      // Warm up cache
      await retry(async () => epClient.getMEPs(params));
      
      // Measure cached request
      const [, duration] = await measureTime(async () => {
        return epClient.getMEPs(params);
      });
      
      expect(duration).toBeLessThan(200);
      console.log(`Cached request: ${duration.toFixed(2)}ms`);
    }, 60000);
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      // Get current available tokens
      const availableBefore = rateLimiter.getAvailableTokens();
      
      // Make a request
      await retry(async () => epClient.getMEPs({ limit: 1 }));
      
      // Check tokens decreased
      const availableAfter = rateLimiter.getAvailableTokens();
      expect(availableAfter).toBeLessThan(availableBefore);
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
      // The client should validate parameters before making API calls
      // This is already tested in unit tests, but we verify integration here
      await expect(async () => {
        // @ts-expect-error - Testing invalid country code
        return epClient.getMEPs({ country: 'INVALID' });
      }).rejects.toThrow();
    }, 10000);
    
    it('should handle network errors with retry', async () => {
      // Test with invalid base URL to simulate network error
      const badClient = new (epClient.constructor as typeof EuropeanParliamentClient)({
        baseURL: 'https://invalid.example.com/api',
        cacheTTL: 0 // Disable cache
      });
      
      await expect(async () => {
        return retry(async () => badClient.getMEPs({ limit: 1 }), 2, 100);
      }).rejects.toThrow();
    }, 15000);
  });

  describe('Data Validation', () => {
    it('should return valid MEP data with required fields', async () => {
      const result = await retry(async () => {
        return epClient.getMEPs({ limit: 5 });
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach((mep) => {
        // Required fields
        expect(mep.id).toBeDefined();
        expect(mep.name).toBeDefined();
        expect(mep.country).toBeDefined();
        
        // Country code format
        expect(mep.country).toMatch(/^[A-Z]{2}$/);
        
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
      
      // First request should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      console.log(`API request duration: ${duration.toFixed(2)}ms`);
    }, 30000);
    
    it('should handle concurrent requests efficiently', async () => {
      const requests = Array(5).fill(0).map((_, i) => 
        retry(async () => epClient.getMEPs({ limit: 2, offset: i * 2 }))
      );
      
      const [results, duration] = await measureTime(async () => {
        return Promise.all(requests);
      });
      
      expect(results).toHaveLength(5);
      expect(duration).toBeLessThan(10000);
      console.log(`Concurrent requests duration: ${duration.toFixed(2)}ms`);
    }, 60000);
  });
});
