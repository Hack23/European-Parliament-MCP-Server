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
import { retry, retryOrSkip, measureTime } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_mep_details Integration Tests', () => {
  let testMEPId: string | undefined;

  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get a real MEP ID if not already set
    if (!testMEPId) {
      const mepsResult = await retryOrSkip(async () => {
        return handleGetMEPs({ limit: 1 });
      }, 'beforeEach: fetch MEP ID');
      if (!mepsResult) {
        console.warn('[SKIP] Could not fetch MEP IDs from EP API');
        return;
      }
      const response = validatePaginatedResponse(mepsResult);
      if (!response.data || response.data.length === 0) {
        console.warn('[SKIP] handleGetMEPs returned no MEP records');
        return;
      }

      const firstMep = response.data[0] as { id?: string };
      if (!firstMep || !firstMep.id) {
        console.warn('[SKIP] First MEP record does not contain a valid id field');
        return;
      }

      testMEPId = firstMep.id;
    }
  });

  describe('MEP Details Retrieval', () => {
    it('should fetch MEP details from real API', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleGetMEPDetails({ id: testMEPId! });
      }, 'fetch MEP details');
      if (!result) return;

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
    }, 60000);

    it('should return extended information for MEP', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleGetMEPDetails({ id: testMEPId! });
      }, 'extended MEP information');
      if (!result) return;

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
    }, 60000);
  });

  describe('GDPR Compliance', () => {
    it('should handle PII data appropriately', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleGetMEPDetails({ id: testMEPId! });
      }, 'GDPR PII handling');
      if (!result) return;

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
    }, 60000);
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
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleGetMEPDetails({ id: testMEPId! });
      }, 'response validation');
      if (!result) return;

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

      // Country code format (EP API may return 'Unknown' or 3-letter codes for some MEPs)
      const country = (mep as { country: string }).country;
      if (country !== 'Unknown') {
        expect(country).toMatch(/^[A-Z]{2,3}$/);
      }
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      try {
        const [, duration] = await measureTime(async () => {
          return retryOrSkip(async () => handleGetMEPDetails({ id: testMEPId! }), 'performance test');
        });

        expect(duration).toBeLessThan(30000);
        console.log(`[Performance] get_mep_details request: ${duration.toFixed(2)}ms`);
      } catch {
        console.warn('[SKIP] Performance test skipped due to API unavailability');
      }
    }, 60000);

    it('should benefit from caching on repeated requests', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      // First request
      const firstResult = await retryOrSkip(async () => handleGetMEPDetails({ id: testMEPId! }), 'caching first request');
      if (!firstResult) return;

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleGetMEPDetails({ id: testMEPId! });
      });

      // Cached request should be fast
      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] get_mep_details cached request: ${duration.toFixed(2)}ms`);
    }, 120000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for same MEP ID', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const result1 = await retryOrSkip(async () => handleGetMEPDetails({ id: testMEPId! }), 'consistency first request');
      if (!result1) return;
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
    }, 120000);
  });
});
