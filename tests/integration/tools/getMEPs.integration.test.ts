/**
 * Integration Tests: get_meps Tool
 * 
 * Tests the getMEPs tool against real European Parliament API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * Compliance: ISO 27001 (AU-2), NIST CSF 2.0 (DE.CM-6), CIS Controls v8.1 (8.11)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateMEPStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_meps Integration Tests', () => {
  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Country Filtering', () => {
    it('should fetch Swedish MEPs from real API', async () => {
      const result = await retry(async () => {
        return handleGetMEPs({ country: 'SE', limit: 10 });
      });

      // Save as fixture
      saveMCPResponseFixture('get_meps', 'swedish-meps', result);

      // Validate structure
      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();
      expect(response.total).toBeGreaterThan(0);

      // Validate each MEP
      response.data.forEach((mep: unknown) => {
        validateMEPStructure(mep);
        expect((mep as { country: string }).country).toBe('SE');
      });
    }, 30000);

    it('should fetch German MEPs from real API', async () => {
      const result = await retry(async () => {
        return handleGetMEPs({ country: 'DE', limit: 10 });
      });

      saveMCPResponseFixture('get_meps', 'german-meps', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();
      expect(response.total).toBeGreaterThan(0);

      response.data.forEach((mep: unknown) => {
        validateMEPStructure(mep);
        expect((mep as { country: string }).country).toBe('DE');
      });
    }, 30000);
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const page1 = await retry(async () => {
        return handleGetMEPs({ limit: 5, offset: 0 });
      });
      
      const page2 = await retry(async () => {
        return handleGetMEPs({ limit: 5, offset: 5 });
      });

      saveMCPResponseFixture('get_meps', 'pagination-page1', page1);
      saveMCPResponseFixture('get_meps', 'pagination-page2', page2);

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
      expect(response1.limit).toBe(5);
      expect(response2.limit).toBe(5);
    }, 60000);

    it('should respect limit parameter', async () => {
      const result = await retry(async () => {
        return handleGetMEPs({ limit: 3 });
      });

      const response = validatePaginatedResponse(result);
      expect(response.data.length).toBeLessThanOrEqual(3);
      expect(response.limit).toBe(3);
    }, 30000);
  });

  describe('Active Status Filtering', () => {
    it('should fetch only active MEPs by default', async () => {
      const result = await retry(async () => {
        return handleGetMEPs({ limit: 10 });
      });

      saveMCPResponseFixture('get_meps', 'active-meps', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // All MEPs should be active
      response.data.forEach((mep: unknown) => {
        validateMEPStructure(mep);
        if ('active' in (mep as object)) {
          expect((mep as { active: boolean }).active).toBe(true);
        }
      });
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should reject invalid country codes', async () => {
      await expect(async () => {
        // @ts-expect-error - Testing invalid country code
        return handleGetMEPs({ country: 'INVALID' });
      }).rejects.toThrow();
    }, 10000);

    it('should reject negative offset', async () => {
      await expect(async () => {
        return handleGetMEPs({ offset: -1 });
      }).rejects.toThrow();
    }, 10000);

    it('should reject limit exceeding maximum', async () => {
      await expect(async () => {
        return handleGetMEPs({ limit: 200 });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return valid MEP data with required fields', async () => {
      const result = await retry(async () => {
        return handleGetMEPs({ limit: 5 });
      });

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((mep: unknown) => {
        // Required fields
        expect(mep).toHaveProperty('id');
        expect(mep).toHaveProperty('name');
        expect(mep).toHaveProperty('country');

        // Country code format
        expect((mep as { country: string }).country).toMatch(/^[A-Z]{2}$/);

        // Optional fields should have correct types if present
        if ('politicalGroup' in (mep as object)) {
          expect(typeof (mep as { politicalGroup: unknown }).politicalGroup).toBe('string');
        }
        if ('active' in (mep as object)) {
          expect(typeof (mep as { active: unknown }).active).toBe('boolean');
        }
      });
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => handleGetMEPs({ limit: 10 }));
      });

      // First request should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] get_meps request: ${duration.toFixed(2)}ms`);
    }, 30000);

    it('should handle repeated requests efficiently', async () => {
      const params = { country: 'FR', limit: 5 };

      // First request
      await retry(async () => handleGetMEPs(params));

      // Measure second request (should benefit from caching)
      const [, duration] = await measureTime(async () => {
        return handleGetMEPs(params);
      });

      // Cached request should be fast
      expect(duration).toBeLessThan(1000);
      console.log(`[Performance] get_meps cached request: ${duration.toFixed(2)}ms`);
    }, 60000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for identical requests', async () => {
      const params = { country: 'IT', limit: 5 };

      const result1 = await retry(async () => handleGetMEPs(params));
      const result2 = await handleGetMEPs(params);

      expect(result1.content[0]?.text).toBe(result2.content[0]?.text);
    }, 60000);
  });
});
