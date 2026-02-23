/**
 * Integration Tests: get_mep_details Tool
 * 
 * Tests the getMEPDetails tool against real European Parliament API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * GDPR Compliance: Tests handle PII appropriately per GDPR Article 5
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleGetMEPDetails } from '../../../src/tools/getMEPDetails.js';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_mep_details Integration Tests', () => {
  let testMEPId: string;

  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get a real MEP ID if not already set
    if (!testMEPId) {
      const mepsResult = await retry(async () => {
        return handleGetMEPs({ limit: 1 });
      });
      const response = validatePaginatedResponse(mepsResult);
      if (!response.data || response.data.length === 0) {
        throw new Error(
          'Integration setup failed: handleGetMEPs({ limit: 1 }) returned no MEP records, cannot initialize testMEPId',
        );
      }

      const firstMep = response.data[0] as { id?: string };
      if (!firstMep || !firstMep.id) {
        throw new Error(
          'Integration setup failed: first MEP record does not contain a valid id field, cannot initialize testMEPId',
        );
      }

      testMEPId = firstMep.id;
    }

    if (!testMEPId) {
      throw new Error(
        'Integration setup failed: testMEPId was not initialized before running get_mep_details integration tests',
      );
    }
  });

  describe('MEP Details Retrieval', () => {
    it('should fetch MEP details from real API', async () => {
      const result = await retry(async () => {
        return handleGetMEPDetails({ id: testMEPId });
      });

      saveMCPResponseFixture('get_mep_details', 'mep-details', result);

      // Validate structure
      validateMCPStructure(result);
      expect(result.content).toBeDefined();
      expect(result.content[0]).toBeDefined();

      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const mep = JSON.parse(textContent.text) as unknown;

      // Required fields
      expect(mep).toHaveProperty('id');
      expect(mep).toHaveProperty('name');
      expect(mep).toHaveProperty('country');

      expect((mep as { id: string }).id).toBe(testMEPId);
    }, 30000);

    it('should return extended information for MEP', async () => {
      const result = await retry(async () => {
        return handleGetMEPDetails({ id: testMEPId });
      });

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const mep = JSON.parse(textContent.text) as unknown;

      // Check for extended fields (may be optional)
      expect(mep).toHaveProperty('id');
      expect(mep).toHaveProperty('name');
      expect(mep).toHaveProperty('country');

      // Log available fields for inspection
      console.log('[MEP Details] Available fields:', Object.keys(mep as object));
    }, 30000);
  });

  describe('GDPR Compliance', () => {
    it('should handle PII data appropriately', async () => {
      const result = await retry(async () => {
        return handleGetMEPDetails({ id: testMEPId });
      });

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const mep = JSON.parse(textContent.text) as unknown;

      // PII fields should be properly typed if present
      if ('email' in (mep as object)) {
        const email = (mep as { email: unknown }).email;
        if (email) {
          expect(typeof email).toBe('string');
          // Email should be valid format
          expect(email as string).toMatch(/@/);
        }
      }

      if ('phone' in (mep as object)) {
        const phone = (mep as { phone: unknown }).phone;
        if (phone) {
          expect(typeof phone).toBe('string');
        }
      }
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid MEP ID gracefully', async () => {
      await expect(async () => {
        return retry(async () => handleGetMEPDetails({ id: 'INVALID_ID_12345' }), 2, 500);
      }).rejects.toThrow();
    }, 15000);

    it('should reject empty MEP ID', async () => {
      await expect(async () => {
        return handleGetMEPDetails({ id: '' });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return valid data structure', async () => {
      const result = await retry(async () => {
        return handleGetMEPDetails({ id: testMEPId });
      });

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const mep = JSON.parse(textContent.text) as unknown;

      // Required fields
      expect(typeof (mep as { id: unknown }).id).toBe('string');
      expect(typeof (mep as { name: unknown }).name).toBe('string');
      expect(typeof (mep as { country: unknown }).country).toBe('string');

      // Country code format (EP API may return 'Unknown' for some MEPs)
      const country = (mep as { country: string }).country;
      if (country !== 'Unknown') {
        expect(country).toMatch(/^[A-Z]{2}$/);
      }
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => handleGetMEPDetails({ id: testMEPId }));
      });

      // First request should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] get_mep_details request: ${duration.toFixed(2)}ms`);
    }, 30000);

    it('should benefit from caching on repeated requests', async () => {
      // First request
      await retry(async () => handleGetMEPDetails({ id: testMEPId }));

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleGetMEPDetails({ id: testMEPId });
      });

      // Cached request should be fast
      expect(duration).toBeLessThan(1000);
      console.log(`[Performance] get_mep_details cached request: ${duration.toFixed(2)}ms`);
    }, 60000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for same MEP ID', async () => {
      const result1 = await retry(async () => handleGetMEPDetails({ id: testMEPId }));
      const result2 = await handleGetMEPDetails({ id: testMEPId });

      validateMCPStructure(result1);
      validateMCPStructure(result2);

      const textContent1 = result1.content[0];
      const textContent2 = result2.content[0];

      if (!textContent1 || !textContent2) {
        throw new Error('Missing text content for data consistency check');
      }

      const mep1 = JSON.parse(textContent1.text) as { id?: string; name?: string; country?: string };
      const mep2 = JSON.parse(textContent2.text) as { id?: string; name?: string; country?: string };

      // Compare stable fields
      expect(mep1.id).toBe(mep2.id);
      expect(mep1.name).toBe(mep2.name);
      expect(mep1.country).toBe(mep2.country);
    }, 60000);
  });
});
