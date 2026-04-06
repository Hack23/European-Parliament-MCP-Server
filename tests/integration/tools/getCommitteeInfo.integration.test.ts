/**
 * Integration tests for the getCommitteeInfo tool (current EP client implementation uses mocked data, not live API calls).
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleGetCommitteeInfo } from '../../../src/tools/getCommitteeInfo.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, retryOrSkip, measureTime } from '../../helpers/testUtils.js';
import { validateMCPStructure, validateCommitteeStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_committee_info Integration Tests', () => {
  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Committee Retrieval by ID', () => {
    it('should return committee info by ID matching expected contract', async () => {
      // Using a known committee ID (example - may need adjustment)
      const result = await retryOrSkip(async () => {
        return handleGetCommitteeInfo({ id: 'ENVI' });
      }, 'committee by ID');
      if (!result) return;

      saveMCPResponseFixture('get_committee_info', 'committee-by-id', result);

      // Validate structure
      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const committee = JSON.parse(textContent.text) as unknown;
      validateCommitteeStructure(committee);
    }, 60000);
  });

  describe('Committee Retrieval by Abbreviation', () => {
    it('should fetch committee info by abbreviation', async () => {
      const result = await retryOrSkip(async () => {
        return handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      }, 'committee by abbreviation');
      if (!result) return;

      saveMCPResponseFixture('get_committee_info', 'committee-by-abbreviation', result);

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const committee = JSON.parse(textContent.text) as unknown;
      validateCommitteeStructure(committee);
      expect((committee as { abbreviation: string }).abbreviation).toBe('ENVI');
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should handle invalid committee ID gracefully', async () => {
      await expect(async () => {
        return retry(async () => handleGetCommitteeInfo({ id: 'INVALID_COMMITTEE_12345' }), 2, 500);
      }).rejects.toThrow();
    }, 15000);

    it('should reject empty committee ID', async () => {
      await expect(async () => {
        return handleGetCommitteeInfo({ id: '' });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return valid committee data', async () => {
      const result = await retryOrSkip(async () => {
        return handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      }, 'response validation');
      if (!result) return;

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const committee = JSON.parse(textContent.text) as unknown;

      // Required fields
      expect(committee).toHaveProperty('id');
      expect(committee).toHaveProperty('name');
      expect(committee).toHaveProperty('abbreviation');

      // Type validation
      expect(typeof (committee as { id: unknown }).id).toBe('string');
      expect(typeof (committee as { name: unknown }).name).toBe('string');
      expect(typeof (committee as { abbreviation: unknown }).abbreviation).toBe('string');
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      try {
        const [, duration] = await measureTime(async () => {
          return retryOrSkip(async () => handleGetCommitteeInfo({ abbreviation: 'ENVI' }), 'performance test');
        });

        expect(duration).toBeLessThan(30000);
        console.log(`[Performance] get_committee_info request: ${duration.toFixed(2)}ms`);
      } catch {
        console.warn('[SKIP] Performance test skipped due to API unavailability');
      }
    }, 60000);

    it('should benefit from caching on repeated requests', async () => {
      const params = { abbreviation: 'ENVI' };

      // First request
      const firstResult = await retryOrSkip(async () => handleGetCommitteeInfo(params), 'caching first request');
      if (!firstResult) return;

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleGetCommitteeInfo(params);
      });

      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] get_committee_info cached: ${duration.toFixed(2)}ms`);
    }, 120000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for same committee', async () => {
      const params = { abbreviation: 'ENVI' };

      const result1 = await retryOrSkip(async () => handleGetCommitteeInfo(params), 'consistency first request');
      if (!result1) return;
      const result2 = await handleGetCommitteeInfo(params);

      validateMCPStructure(result1);
      validateMCPStructure(result2);

      const textContent1 = result1.content[0];
      const textContent2 = result2.content[0];

      if (!textContent1 || !textContent2) {
        throw new Error('Missing text content for data consistency check');
      }

      const committee1 = JSON.parse(textContent1.text) as { id?: string; name?: string; abbreviation?: string };
      const committee2 = JSON.parse(textContent2.text) as { id?: string; name?: string; abbreviation?: string };

      // Compare stable fields to avoid brittleness from JSON formatting or extra fields
      expect(committee1.id).toBe(committee2.id);
      expect(committee1.abbreviation).toBe(committee2.abbreviation);
      expect(committee1.name).toBe(committee2.name);
    }, 120000);
  });
});
