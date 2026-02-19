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
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateVotingRecordStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_voting_records Integration Tests', () => {
  let testSessionId: string;

  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use a stable hard-coded sessionId for testing since getVotingRecords uses mock data
    if (!testSessionId) {
      testSessionId = 'PLENARY-2024-01';
    }
  });

  describe('Basic Retrieval', () => {
    it('should return voting records matching the expected contract', async () => {
      const result = await retry(async () => {
        return handleGetVotingRecords({ limit: 10 });
      });

      saveMCPResponseFixture('get_voting_records', 'recent-votes', result);

      // Validate structure
      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // Validate each voting record
      response.data.forEach((record: unknown) => {
        validateVotingRecordStructure(record);
      });
    }, 30000);
  });

  describe('Session Filtering', () => {
    it('should filter voting records by session ID', async () => {
      const result = await retry(async () => {
        return handleGetVotingRecords({ 
          sessionId: testSessionId,
          limit: 10 
        });
      });

      saveMCPResponseFixture('get_voting_records', 'filtered-by-session', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // All records should belong to the specified session
      response.data.forEach((record: unknown) => {
        validateVotingRecordStructure(record);
        expect((record as { sessionId: string }).sessionId).toBe(testSessionId);
      });
    }, 30000);
  });

  describe('Date Range Filtering', () => {
    it('should filter voting records by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const result = await retry(async () => {
        return handleGetVotingRecords({ 
          dateFrom: startDate,
          dateTo: endDate,
          limit: 10 
        });
      });

      saveMCPResponseFixture('get_voting_records', 'date-range-2024', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((record: unknown) => {
        validateVotingRecordStructure(record);
        const recordDate = (record as { date: string }).date;
        // Parse dates to timestamps for reliable comparison
        const recordTimestamp = Date.parse(recordDate);
        const startTimestamp = Date.parse(startDate);
        const endTimestamp = Date.parse(endDate);
        expect(recordTimestamp >= startTimestamp).toBe(true);
        expect(recordTimestamp <= endTimestamp).toBe(true);
      });
    }, 30000);
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const page1 = await retry(async () => {
        return handleGetVotingRecords({ limit: 5, offset: 0 });
      });
      
      const page2 = await retry(async () => {
        return handleGetVotingRecords({ limit: 5, offset: 5 });
      });

      const response1 = validatePaginatedResponse(page1);
      const response2 = validatePaginatedResponse(page2);

      // Note: epClient.getVotingRecords currently returns a fixed mock record,
      // so we only validate pagination metadata and basic data presence here.
      expect(Array.isArray(response1.data)).toBe(true);
      expect(Array.isArray(response2.data)).toBe(true);

      // Pagination metadata
      expect(response1.offset).toBe(0);
      expect(response2.offset).toBe(5);
    }, 60000);
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
      const result = await retry(async () => {
        return handleGetVotingRecords({ limit: 5 });
      });

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
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => handleGetVotingRecords({ limit: 10 }));
      });

      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] get_voting_records request: ${duration.toFixed(2)}ms`);
    }, 30000);

    it('should benefit from caching on repeated requests', async () => {
      const params = { limit: 5 };

      // First request
      await retry(async () => handleGetVotingRecords(params));

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleGetVotingRecords(params);
      });

      expect(duration).toBeLessThan(1000);
      console.log(`[Performance] get_voting_records cached: ${duration.toFixed(2)}ms`);
    }, 60000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for identical requests', async () => {
      const params = { limit: 5 };

      const result1 = await retry(async () => handleGetVotingRecords(params));
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
    }, 60000);
  });
});
