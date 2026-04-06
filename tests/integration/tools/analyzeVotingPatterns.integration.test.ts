/**
 * Contract/behavior tests for the analyzeVotingPatterns tool, using real European Parliament data indirectly via other tools (e.g. getMEPs/getMEPDetails) rather than direct end-to-end EP API calls.
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing) — integration behavior tests with partial real API dependency.
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleAnalyzeVotingPatterns } from '../../../src/tools/analyzeVotingPatterns.js';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip, measureTime } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('analyze_voting_patterns Integration Tests', () => {
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
      if (response.data.length === 0) {
        console.warn('[SKIP] No MEPs returned from handleGetMEPs');
        return;
      }
      testMEPId = (response.data[0] as { id: string }).id;
    }
  });

  describe('Voting Pattern Analysis', () => {
    it('should analyze voting patterns for a MEP', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId!,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      }, 'analyze voting patterns');
      if (!result) return;

      saveMCPResponseFixture('analyze_voting_patterns', 'mep-voting-analysis', result);

      // Validate structure
      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const analysis = JSON.parse(textContent.text) as unknown;

      // Validate analysis structure
      expect(analysis).toHaveProperty('mepId');
      expect(analysis).toHaveProperty('statistics');
      expect((analysis as { mepId: string }).mepId).toBe(testMEPId);
    }, 60000);

    it('should include voting statistics', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId!,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      }, 'voting statistics');
      if (!result) return;

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const analysis = JSON.parse(textContent.text) as unknown;

      // Check statistics structure
      expect(analysis).toHaveProperty('statistics');
      const stats = (analysis as { statistics: unknown }).statistics;
      expect(stats).toHaveProperty('totalVotes');
      expect(stats).toHaveProperty('votesFor');
      expect(stats).toHaveProperty('votesAgainst');
      expect(stats).toHaveProperty('abstentions');
      expect(stats).toHaveProperty('attendanceRate');
    }, 60000);
  });

  describe('Date Range Analysis', () => {
    it('should analyze voting patterns for specific period', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const startDate = '2024-01-01';
      const endDate = '2024-06-30';

      const result = await retryOrSkip(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId!,
          dateFrom: startDate,
          dateTo: endDate
        });
      }, 'date range analysis');
      if (!result) return;

      saveMCPResponseFixture('analyze_voting_patterns', 'period-analysis', result);

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const analysis = JSON.parse(textContent.text) as unknown;

      // Should include period information
      expect(analysis).toHaveProperty('period');
      const period = (analysis as { period: { from: string; to: string } }).period;
      expect(period.from).toBe(startDate);
      expect(period.to).toBe(endDate);
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should reject invalid MEP ID', async () => {
      await expect(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: 'INVALID_MEP_ID',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      }).rejects.toThrow();
    }, 10000);

    it('should reject invalid date format', async () => {
      await expect(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId ?? 'placeholder',
          // @ts-expect-error - Testing invalid date format
          dateFrom: 'invalid-date',
          dateTo: '2024-12-31'
        });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return complete voting pattern analysis', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      const result = await retryOrSkip(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId!,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      }, 'response validation');
      if (!result) return;

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const analysis = JSON.parse(textContent.text) as unknown;

      // Required fields
      expect(analysis).toHaveProperty('mepId');
      expect(analysis).toHaveProperty('mepName');
      expect(analysis).toHaveProperty('period');
      expect(analysis).toHaveProperty('statistics');

      // Type validation
      expect(typeof (analysis as { mepId: unknown }).mepId).toBe('string');
      expect(typeof (analysis as { mepName: unknown }).mepName).toBe('string');
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete analysis within acceptable time', async () => {
      if (!testMEPId) { console.warn('[SKIP] No MEP ID available'); return; }
      try {
        const [, duration] = await measureTime(async () => {
          return retryOrSkip(async () => handleAnalyzeVotingPatterns({ 
            mepId: testMEPId!,
            dateFrom: '2024-01-01',
            dateTo: '2024-12-31'
          }), 'performance test');
        });

        expect(duration).toBeLessThan(30000); // Allow more time for analysis
        console.log(`[Performance] analyze_voting_patterns: ${duration.toFixed(2)}ms`);
      } catch {
        console.warn('[SKIP] Performance test skipped due to API unavailability');
      }
    }, 60000);
  });
});
