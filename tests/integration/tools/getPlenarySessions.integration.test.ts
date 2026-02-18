/**
 * Integration Tests: get_plenary_sessions Tool
 * 
 * Tests the getPlenarySessions tool against real European Parliament API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleGetPlenarySessions } from '../../../src/tools/getPlenarySessions.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validatePlenarySessionStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_plenary_sessions Integration Tests', () => {
  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Basic Retrieval', () => {
    it('should fetch plenary sessions from real API', async () => {
      const result = await retry(async () => {
        return handleGetPlenarySessions({ limit: 10 });
      });

      saveMCPResponseFixture('get_plenary_sessions', 'recent-sessions', result);

      // Validate structure
      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();
      expect(response.total).toBeGreaterThan(0);

      // Validate each session
      response.data.forEach((session: unknown) => {
        validatePlenarySessionStructure(session);
      });
    }, 30000);
  });

  describe('Date Range Filtering', () => {
    it('should filter sessions by start date', async () => {
      const startDate = '2024-01-01';
      const result = await retry(async () => {
        return handleGetPlenarySessions({ 
          startDate,
          limit: 10 
        });
      });

      saveMCPResponseFixture('get_plenary_sessions', 'filtered-by-start-date', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // All sessions should be on or after start date
      response.data.forEach((session: unknown) => {
        validatePlenarySessionStructure(session);
        const sessionDate = (session as { date: string }).date;
        expect(sessionDate >= startDate).toBe(true);
      });
    }, 30000);

    it('should filter sessions by end date', async () => {
      const endDate = '2025-12-31';
      const result = await retry(async () => {
        return handleGetPlenarySessions({ 
          endDate,
          limit: 10 
        });
      });

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // All sessions should be on or before end date
      response.data.forEach((session: unknown) => {
        const sessionDate = (session as { date: string }).date;
        expect(sessionDate <= endDate).toBe(true);
      });
    }, 30000);

    it('should filter sessions by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const result = await retry(async () => {
        return handleGetPlenarySessions({ 
          startDate,
          endDate,
          limit: 10 
        });
      });

      saveMCPResponseFixture('get_plenary_sessions', 'date-range-2024', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((session: unknown) => {
        const sessionDate = (session as { date: string }).date;
        expect(sessionDate >= startDate).toBe(true);
        expect(sessionDate <= endDate).toBe(true);
      });
    }, 30000);
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const page1 = await retry(async () => {
        return handleGetPlenarySessions({ limit: 5, offset: 0 });
      });
      
      const page2 = await retry(async () => {
        return handleGetPlenarySessions({ limit: 5, offset: 5 });
      });

      const response1 = validatePaginatedResponse(page1);
      const response2 = validatePaginatedResponse(page2);

      // Pages should have different data
      if (response1.data.length > 0 && response2.data.length > 0) {
        expect((response1.data[0] as { id: string }).id).not.toBe(
          (response2.data[0] as { id: string }).id
        );
      }

      // Pagination metadata
      expect(response1.offset).toBe(0);
      expect(response2.offset).toBe(5);
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should reject invalid date format', async () => {
      await expect(async () => {
        return handleGetPlenarySessions({ 
          // @ts-expect-error - Testing invalid date format (expected 'YYYY-MM-DD')
          startDate: '2024/01/01' 
        });
      }).rejects.toThrow();
    }, 10000);

    it('should reject negative offset', async () => {
      await expect(async () => {
        return handleGetPlenarySessions({ offset: -1 });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return valid session data with required fields', async () => {
      const result = await retry(async () => {
        return handleGetPlenarySessions({ limit: 5 });
      });

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((session: unknown) => {
        // Required fields
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('date');

        // Date format validation
        expect((session as { date: string }).date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => handleGetPlenarySessions({ limit: 10 }));
      });

      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] get_plenary_sessions request: ${duration.toFixed(2)}ms`);
    }, 30000);

    it('should benefit from caching on repeated requests', async () => {
      const params = { limit: 5 };

      // First request
      await retry(async () => handleGetPlenarySessions(params));

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleGetPlenarySessions(params);
      });

      expect(duration).toBeLessThan(1000);
      console.log(`[Performance] get_plenary_sessions cached: ${duration.toFixed(2)}ms`);
    }, 60000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for identical requests', async () => {
      const params = { startDate: '2024-01-01', limit: 5 };

      const result1 = await retry(async () => handleGetPlenarySessions(params));
      const result2 = await handleGetPlenarySessions(params);

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
