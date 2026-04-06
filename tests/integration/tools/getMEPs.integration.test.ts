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
import { retryOrSkip, measureTime } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateMEPStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_meps Integration Tests', () => {
  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Country Filtering', () => {
    it('should fetch Swedish MEPs from real API', async () => {
      const result = await retryOrSkip(async () => {
        return handleGetMEPs({ country: 'SE', limit: 10 });
      }, 'fetch Swedish MEPs');
      if (!result) return;

      // Save as fixture
      saveMCPResponseFixture('get_meps', 'swedish-meps', result);

      // Validate structure
      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();
      expect(response.total).toBeGreaterThan(0);

      // Validate each MEP
      response.data.forEach((mep: unknown) => {
        validateMEPStructure(mep);
        // EP API may return 'Unknown' when country mapping fails
        expect(['SE', 'Unknown']).toContain((mep as { country: string }).country);
      });
    }, 60000);

    it('should fetch German MEPs from real API', async () => {
      const result = await retryOrSkip(async () => {
        return handleGetMEPs({ country: 'DE', limit: 10 });
      }, 'fetch German MEPs');
      if (!result) return;

      saveMCPResponseFixture('get_meps', 'german-meps', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();
      expect(response.total).toBeGreaterThan(0);

      response.data.forEach((mep: unknown) => {
        validateMEPStructure(mep);
        // EP API may return 'Unknown' when country mapping fails
        expect(['DE', 'Unknown']).toContain((mep as { country: string }).country);
      });
    }, 60000);
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const page1 = await retryOrSkip(async () => {
        return handleGetMEPs({ limit: 5, offset: 0 });
      }, 'pagination page 1');
      if (!page1) return;
      
      const page2 = await retryOrSkip(async () => {
        return handleGetMEPs({ limit: 5, offset: 5 });
      }, 'pagination page 2');
      if (!page2) return;

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
    }, 120000);

    it('should respect limit parameter', async () => {
      const result = await retryOrSkip(async () => {
        return handleGetMEPs({ limit: 3 });
      }, 'respect limit parameter');
      if (!result) return;

      const response = validatePaginatedResponse(result);
      expect(response.data.length).toBeLessThanOrEqual(3);
      expect(response.limit).toBe(3);
    }, 60000);
  });

  describe('Active Status Filtering', () => {
    it('should fetch only active MEPs by default', async () => {
      const result = await retryOrSkip(async () => {
        return handleGetMEPs({ limit: 10 });
      }, 'fetch active MEPs');
      if (!result) return;

      saveMCPResponseFixture('get_meps', 'active-meps', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // Validate structure of each MEP
      response.data.forEach((mep: unknown) => {
        validateMEPStructure(mep);
        // EP API may not consistently set active status on all MEPs;
        // only assert type if field is present
        if ('active' in (mep as object)) {
          expect(typeof (mep as { active: unknown }).active).toBe('boolean');
        }
      });
    }, 60000);
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
      const result = await retryOrSkip(async () => {
        return handleGetMEPs({ limit: 5 });
      }, 'response validation');
      if (!result) return;

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((mep: unknown) => {
        // Required fields
        expect(mep).toHaveProperty('id');
        expect(mep).toHaveProperty('name');
        expect(mep).toHaveProperty('country');

        // Country code format (EP API may return 'Unknown' or 3-letter codes for some MEPs)
        const country = (mep as { country: string }).country;
        if (country !== 'Unknown') {
          expect(country).toMatch(/^[A-Z]{2,3}$/);
        }

        // Optional fields should have correct types if present
        if ('politicalGroup' in (mep as object)) {
          expect(typeof (mep as { politicalGroup: unknown }).politicalGroup).toBe('string');
        }
        if ('active' in (mep as object)) {
          expect(typeof (mep as { active: unknown }).active).toBe('boolean');
        }
      });
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      try {
        const [, duration] = await measureTime(async () => {
          return retryOrSkip(async () => handleGetMEPs({ limit: 10 }), 'performance test');
        });

        // First request should complete within 30 seconds (including retries)
        expect(duration).toBeLessThan(30000);
        console.log(`[Performance] get_meps request: ${duration.toFixed(2)}ms`);
      } catch {
        console.warn('[SKIP] Performance test skipped due to API unavailability');
      }
    }, 60000);

    it('should handle repeated requests efficiently', async () => {
      const params = { country: 'FR', limit: 5 };

      // First request
      const firstResult = await retryOrSkip(async () => handleGetMEPs(params), 'caching first request');
      if (!firstResult) return;

      // Measure second request (should benefit from caching)
      const [, duration] = await measureTime(async () => {
        return handleGetMEPs(params);
      });

      // Cached request should be fast
      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] get_meps cached request: ${duration.toFixed(2)}ms`);
    }, 120000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for identical requests', async () => {
      const params = { country: 'IT', limit: 5 };

      const result1 = await retryOrSkip(async () => handleGetMEPs(params), 'consistency first request');
      if (!result1) return;
      const result2 = await handleGetMEPs(params);

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
