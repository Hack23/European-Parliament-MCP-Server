/**
 * Integration Tests: track_legislation Tool
 * 
 * Tests the trackLegislation tool response structure and contract
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * Note: This tool currently returns mock data for MVP. These tests validate the
 * response structure and contract that will be maintained when real EP API
 * integration is implemented. Performance and caching tests validate the tool's
 * behavior patterns regardless of data source.
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleTrackLegislation } from '../../../src/tools/trackLegislation.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validateMCPStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('track_legislation Integration Tests', () => {
  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Legislative Procedure Tracking', () => {
    it('should track legislation by procedure ID', async () => {
      const result = await retry(async () => {
        return handleTrackLegislation({ 
          procedureId: '2024/0001(COD)'
        });
      });

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
      expect((procedure as { procedureId: string }).procedureId).toBe('2024/0001(COD)');
    }, 30000);

    it('should include timeline information', async () => {
      const result = await retry(async () => {
        return handleTrackLegislation({ 
          procedureId: '2024/0002(COD)'
        });
      });

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
    }, 30000);

    it('should include committee information', async () => {
      const result = await retry(async () => {
        return handleTrackLegislation({ 
          procedureId: '2024/0003(COD)'
        });
      });

      saveMCPResponseFixture('track_legislation', 'with-committees', result);

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const procedure = JSON.parse(textContent.text) as unknown;

      // Should include committees
      expect(procedure).toHaveProperty('committees');
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should reject empty procedure ID', async () => {
      await expect(async () => {
        return handleTrackLegislation({ procedureId: '' });
      }).rejects.toThrow();
    }, 10000);

    it('should accept procedure ID without type suffix (current behavior)', async () => {
      const result = await handleTrackLegislation({
        // Note: TrackLegislationSchema currently only validates length, not format
        // This test asserts the accepted MVP behavior until stricter validation is added.
        // @ts-expect-error - Deliberately using a procedureId without type suffix
        procedureId: '2024/0003'
      });
      // Ensure a valid MCP response structure is still returned
      validateMCPStructure(result);
    }, 30000);
  });

  describe('Response Validation', () => {
    it('should return complete legislative tracking data', async () => {
      const result = await retry(async () => {
        return handleTrackLegislation({ 
          procedureId: '2024/0010(COD)'
        });
      });

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
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete tracking within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => handleTrackLegislation({ 
          procedureId: '2024/0020(COD)'
        }));
      });

      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] track_legislation: ${duration.toFixed(2)}ms`);
    }, 30000);

    it('should benefit from caching on repeated requests', async () => {
      const params = { procedureId: '2024/0030(COD)' };

      // First request
      await retry(async () => handleTrackLegislation(params));

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleTrackLegislation(params);
      });

      expect(duration).toBeLessThan(1000);
      console.log(`[Performance] track_legislation cached: ${duration.toFixed(2)}ms`);
    }, 60000);
  });

  describe('Data Consistency', () => {
    it('should return consistent data for same procedure ID', async () => {
      const params = { procedureId: '2024/0040(COD)' };

      const result1 = await retry(async () => handleTrackLegislation(params));
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
    }, 60000);
  });
});
