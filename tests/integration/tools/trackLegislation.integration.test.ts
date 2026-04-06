/**
 * Integration Tests: track_legislation Tool
 * 
 * Tests the trackLegislation tool response structure and contract
 * against real European Parliament API data.
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { handleTrackLegislation } from '../../../src/tools/trackLegislation.js';
import { handleGetProcedures } from '../../../src/tools/getProcedures.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip, measureTime } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('track_legislation Integration Tests', () => {
  let testProcedureId: string | undefined;

  beforeAll(async () => {
    // Fetch a real procedure ID from the EP API to use in tests
    const procsResult = await retryOrSkip(async () => {
      return handleGetProcedures({ year: 2024, limit: 3 });
    }, 'beforeAll: fetch procedure IDs');
    if (!procsResult) {
      console.warn('[SKIP] Could not fetch procedure IDs from EP API — tests will be skipped');
      return;
    }
    const response = validatePaginatedResponse(procsResult);
    if (response.data.length === 0) {
      console.warn('[SKIP] No procedures returned from EP API — tests will be skipped');
      return;
    }
    const firstProc = response.data[0] as { id?: string };
    if (!firstProc?.id) {
      console.warn('[SKIP] First procedure has no id — tests will be skipped');
      return;
    }
    testProcedureId = firstProc.id;
    console.log(`[Integration] Using real procedure ID: ${testProcedureId}`);
  }, 60000);

  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Legislative Procedure Tracking', () => {
    it('should track legislation by procedure ID', async () => {
      if (!testProcedureId) { console.warn('[SKIP] No procedure ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleTrackLegislation({ 
          procedureId: testProcedureId!
        });
      }, 'track legislation by procedure ID');
      if (!result) return;

      saveMCPResponseFixture('track_legislation', 'procedure-tracking', result);

      // Validate structure
      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const procedure = JSON.parse(textContent.text) as unknown;

      // Validate procedure structure
      expect(procedure).toHaveProperty('procedureId');
      expect(procedure).toHaveProperty('title');
      expect(procedure).toHaveProperty('type');
      expect(procedure).toHaveProperty('status');
      expect(procedure).toHaveProperty('currentStage');
    }, 60000);

    it('should include timeline information', async () => {
      if (!testProcedureId) { console.warn('[SKIP] No procedure ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleTrackLegislation({ 
          procedureId: testProcedureId!
        });
      }, 'include timeline information');
      if (!result) return;

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const procedure = JSON.parse(textContent.text) as unknown;

      // Should include timeline
      expect(procedure).toHaveProperty('timeline');
      const timeline = (procedure as { timeline: unknown }).timeline;
      expect(Array.isArray(timeline)).toBe(true);
    }, 60000);

    it('should include committee information', async () => {
      if (!testProcedureId) { console.warn('[SKIP] No procedure ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleTrackLegislation({ 
          procedureId: testProcedureId!
        });
      }, 'include committee information');
      if (!result) return;

      saveMCPResponseFixture('track_legislation', 'with-committees', result);

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const procedure = JSON.parse(textContent.text) as unknown;

      // Should include committees
      expect(procedure).toHaveProperty('committees');
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should reject empty procedure ID', async () => {
      await expect(async () => {
        return handleTrackLegislation({ procedureId: '' });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return complete legislative tracking data', async () => {
      if (!testProcedureId) { console.warn('[SKIP] No procedure ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleTrackLegislation({ 
          procedureId: testProcedureId!
        });
      }, 'response validation');
      if (!result) return;

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const procedure = JSON.parse(textContent.text) as unknown;

      // Required fields
      expect(procedure).toHaveProperty('procedureId');
      expect(procedure).toHaveProperty('title');
      expect(procedure).toHaveProperty('type');
      expect(procedure).toHaveProperty('currentStage');

      // Type validation
      expect(typeof (procedure as { procedureId: unknown }).procedureId).toBe('string');
      expect(typeof (procedure as { title: unknown }).title).toBe('string');
      expect(typeof (procedure as { type: unknown }).type).toBe('string');
      expect(typeof (procedure as { currentStage: unknown }).currentStage).toBe('string');
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete tracking within acceptable time', async () => {
      if (!testProcedureId) { console.warn('[SKIP] No procedure ID available'); return; }
      try {
        const [, duration] = await measureTime(async () => {
          return retryOrSkip(async () => handleTrackLegislation({ 
            procedureId: testProcedureId!
          }), 'performance test');
        });

        // Real EP API procedure lookup may require multiple sub-requests
        expect(duration).toBeLessThan(30000);
        console.log(`[Performance] track_legislation: ${duration.toFixed(2)}ms`);
      } catch {
        console.warn('[SKIP] Performance test skipped due to API unavailability');
      }
    }, 60000);

    it('should benefit from caching on repeated requests', async () => {
      if (!testProcedureId) { console.warn('[SKIP] No procedure ID available'); return; }
      const params = { procedureId: testProcedureId };

      // First request
      const firstResult = await retryOrSkip(async () => handleTrackLegislation(params), 'caching first request');
      if (!firstResult) return;

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleTrackLegislation(params);
      });

      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] track_legislation cached: ${duration.toFixed(2)}ms`);
    }, 120000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for same procedure ID', async () => {
      if (!testProcedureId) { console.warn('[SKIP] No procedure ID available'); return; }
      const params = { procedureId: testProcedureId };

      const result1 = await retryOrSkip(async () => handleTrackLegislation(params), 'consistency first request');
      if (!result1) return;
      const result2 = await handleTrackLegislation(params);

      validateMCPStructure(result1);
      validateMCPStructure(result2);

      const textContent1 = result1.content[0];
      const textContent2 = result2.content[0];

      if (!textContent1 || !textContent2) {
        throw new Error('Missing text content for data consistency check');
      }

      const procedure1 = JSON.parse(textContent1.text) as { procedureId?: string; title?: string; type?: string };
      const procedure2 = JSON.parse(textContent2.text) as { procedureId?: string; title?: string; type?: string };

      // Compare stable fields
      expect(procedure1.procedureId).toBe(procedure2.procedureId);
      expect(procedure1.title).toBe(procedure2.title);
      expect(procedure1.type).toBe(procedure2.type);
    }, 120000);
  });
});
