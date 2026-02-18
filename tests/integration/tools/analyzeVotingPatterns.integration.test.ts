/**
 * Integration Tests: analyze_voting_patterns Tool
 * 
 * Tests the analyzeVotingPatterns tool against real European Parliament API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleAnalyzeVotingPatterns } from '../../../src/tools/analyzeVotingPatterns.js';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('analyze_voting_patterns Integration Tests', () => {
  let testMEPId: string;

  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get a real MEP ID if not already set
    if (!testMEPId) {
      const mepsResult = await retry(async () => {
        return handleGetMEPs({ limit: 1 });
      });
      const response = validatePaginatedResponse(mepsResult);
      if (response.data.length > 0) {
        testMEPId = (response.data[0] as { id: string }).id;
      }
    }
  });

  describe('Voting Pattern Analysis', () => {
    it('should analyze voting patterns for a MEP', async () => {
      const result = await retry(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      });

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
    }, 30000);

    it('should include voting statistics', async () => {
      const result = await retry(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      });

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
    }, 30000);
  });

  describe('Date Range Analysis', () => {
    it('should analyze voting patterns for specific period', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-06-30';

      const result = await retry(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId,
          dateFrom: startDate,
          dateTo: endDate
        });
      });

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
    }, 30000);
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
          mepId: testMEPId,
          // @ts-expect-error - Testing invalid date format
          dateFrom: 'invalid-date',
          dateTo: '2024-12-31'
        });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return complete voting pattern analysis', async () => {
      const result = await retry(async () => {
        return handleAnalyzeVotingPatterns({ 
          mepId: testMEPId,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      });

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
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete analysis within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => handleAnalyzeVotingPatterns({ 
          mepId: testMEPId,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        }));
      });

      expect(duration).toBeLessThan(10000); // Allow more time for analysis
      console.log(`[Performance] analyze_voting_patterns: ${duration.toFixed(2)}ms`);
    }, 40000);
  });
});
