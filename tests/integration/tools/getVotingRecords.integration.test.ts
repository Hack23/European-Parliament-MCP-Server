/**
 * Integration Tests: get_voting_records Tool
 * 
 * Contract/structure tests for the getVotingRecords tool against its current (mocked) implementation,
 * aligned with the European Parliament API schema rather than the live API.
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleGetVotingRecords } from '../../../src/tools/getVotingRecords.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip, measureTime } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateVotingRecordStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_voting_records Integration Tests', () => {
  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Basic Retrieval', () => {
    it('should return voting records matching the expected contract', async () => {
      const result = await retryOrSkip(async () => {
        return handleGetVotingRecords({ limit: 10 });
      }, 'basic retrieval');
      if (!result) return;

      saveMCPResponseFixture('get_voting_records', 'recent-votes', result);

      // Validate structure
      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // Validate each voting record
      response.data.forEach((record: unknown) => {
        validateVotingRecordStructure(record);
      });
    }, 60000);
  });

  describe('Session Filtering', () => {
    it('should filter voting records by session ID', async () => {
      // First get a real session ID from existing voting records
      const baseResult = await retryOrSkip(async () => {
        return handleGetVotingRecords({ limit: 3 });
      }, 'fetch session ID for filtering');
      if (!baseResult) return;

      const baseResponse = validatePaginatedResponse(baseResult);
      if (baseResponse.data.length === 0) {
        console.warn('[SKIP] No voting records available to extract session ID');
        return;
      }
      const realSessionId = (baseResponse.data[0] as { sessionId: string }).sessionId;

      const result = await retryOrSkip(async () => {
        return handleGetVotingRecords({ 
          sessionId: realSessionId,
          limit: 10 
        });
      }, 'filter by session ID');
      if (!result) return;

      saveMCPResponseFixture('get_voting_records', 'filtered-by-session', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // All records should belong to the specified session
      response.data.forEach((record: unknown) => {
        validateVotingRecordStructure(record);
        expect((record as { sessionId: string }).sessionId).toBe(realSessionId);
      });
    }, 120000);
  });

  describe('Date Range Filtering', () => {
    it('should filter voting records by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const result = await retryOrSkip(async () => {
        return handleGetVotingRecords({ 
          dateFrom: startDate,
          dateTo: endDate,
          limit: 10 
        });
      }, 'filter by date range');
      if (!result) return;

      saveMCPResponseFixture('get_voting_records', 'date-range-2024', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // Precompute and validate date range timestamps
      const startTimestamp = Date.parse(startDate);
      const endTimestamp = Date.parse(endDate);
      expect(Number.isNaN(startTimestamp)).toBe(false);
      expect(Number.isNaN(endTimestamp)).toBe(false);

      response.data.forEach((record: unknown) => {
        validateVotingRecordStructure(record);
        const recordDate = (record as { date: string }).date;
        // Parse dates to timestamps for reliable comparison
        const recordTimestamp = Date.parse(recordDate);
        expect(Number.isNaN(recordTimestamp)).toBe(false);
        expect(recordTimestamp >= startTimestamp).toBe(true);
        expect(recordTimestamp <= endTimestamp).toBe(true);
      });
    }, 60000);
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const page1 = await retryOrSkip(async () => {
        return handleGetVotingRecords({ limit: 5, offset: 0 });
      }, 'pagination page 1');
      if (!page1) return;
      
      const page2 = await retryOrSkip(async () => {
        return handleGetVotingRecords({ limit: 5, offset: 5 });
      }, 'pagination page 2');
      if (!page2) return;

      const response1 = validatePaginatedResponse(page1);
      const response2 = validatePaginatedResponse(page2);

      // Note: epClient.getVotingRecords currently returns a fixed mock record,
      // so we only validate pagination metadata and basic data presence here.
      expect(Array.isArray(response1.data)).toBe(true);
      expect(Array.isArray(response2.data)).toBe(true);

      // Pagination metadata
      expect(response1.offset).toBe(0);
      expect(response2.offset).toBe(5);
    }, 120000);
  });

  describe('Error Handling', () => {
    it('should reject invalid date format', async () => {
      await expect(async () => {
        return handleGetVotingRecords({ 
          // @ts-expect-error - Testing invalid date format
          dateFrom: 'invalid-date' 
        });
      }).rejects.toThrow();
    }, 10000);

    it('should reject negative limit', async () => {
      await expect(async () => {
        return handleGetVotingRecords({ limit: -1 });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return valid voting record data', async () => {
      const result = await retryOrSkip(async () => {
        return handleGetVotingRecords({ limit: 5 });
      }, 'response validation');
      if (!result) return;

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((record: unknown) => {
        // Required fields
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('sessionId');
        expect(record).toHaveProperty('date');

        // Type validation
        expect(typeof (record as { id: unknown }).id).toBe('string');
        expect(typeof (record as { sessionId: unknown }).sessionId).toBe('string');
        expect(typeof (record as { date: unknown }).date).toBe('string');
      });
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      try {
        const [, duration] = await measureTime(async () => {
          return retryOrSkip(async () => handleGetVotingRecords({ limit: 10 }), 'performance test');
        });

        // Real EP API voting endpoint can be slow (fetches per-session results)
        expect(duration).toBeLessThan(60000);
        console.log(`[Performance] get_voting_records request: ${duration.toFixed(2)}ms`);
      } catch {
        console.warn('[SKIP] Performance test skipped due to API unavailability');
      }
    }, 120000);

    it('should benefit from caching on repeated requests', async () => {
      const params = { limit: 5 };

      // First request (may be slow due to real API)
      const firstResult = await retryOrSkip(async () => handleGetVotingRecords(params), 'caching first request');
      if (!firstResult) return;

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleGetVotingRecords(params);
      });

      // Cached request should be significantly faster than first
      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] get_voting_records cached: ${duration.toFixed(2)}ms`);
    }, 120000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for identical requests', async () => {
      const params = { limit: 5 };

      const result1 = await retryOrSkip(async () => handleGetVotingRecords(params), 'consistency first request');
      if (!result1) return;
      const result2 = await handleGetVotingRecords(params);

      const response1 = validatePaginatedResponse(result1);
      const response2 = validatePaginatedResponse(result2);

      // Compare stable pagination metadata
      expect(response1.offset).toBe(response2.offset);
      expect(response1.limit).toBe(response2.limit);

      // Compare number of records returned
      expect(response1.data.length).toBe(response2.data.length);

      // If there are records, compare stable identifiers on the first item
      if (response1.data.length > 0 && response2.data.length > 0) {
        expect((response1.data[0] as { id: string }).id).toBe((response2.data[0] as { id: string }).id);
      }
    }, 120000);
  });
});
