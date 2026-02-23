/**
 * Validates the generateReport tool MCP integration, including selected flows that use the real European Parliament API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * Note: Only some report generators call live EP API endpoints; many statistics and sections in generated reports are synthetic/mock for testing purposes
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleGenerateReport } from '../../../src/tools/generateReport.js';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('generate_report Integration Tests', () => {
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
      if (response.data.length > 0) {
        testMEPId = (response.data[0] as { id: string }).id;
      }
    }

    // Ensure we have a valid MEP ID before running tests that depend on it
    if (!testMEPId) {
      throw new Error(
        'Failed to retrieve a MEP ID for integration tests: handleGetMEPs returned no data.'
      );
    }
  });

  describe('MEP Activity Report', () => {
    it('should generate MEP activity report', async () => {
      const result = await retry(async () => {
        return handleGenerateReport({ 
          reportType: 'MEP_ACTIVITY' as const,
          subjectId: testMEPId,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      });

      saveMCPResponseFixture('generate_report', 'mep-activity-report', result);

      // Validate structure
      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const report = JSON.parse(textContent.text) as unknown;

      // Validate report structure
      expect(report).toHaveProperty('reportType');
      expect(report).toHaveProperty('title');
      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('summary');
      expect((report as { reportType: string }).reportType).toBe('MEP_ACTIVITY');
    }, 30000);
  });

  describe('Committee Performance Report', () => {
    it('should generate committee performance report', async () => {
      const result = await retry(async () => {
        return handleGenerateReport({ 
          reportType: 'COMMITTEE_PERFORMANCE' as const,
          subjectId: 'ENVI',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      });

      saveMCPResponseFixture('generate_report', 'committee-performance-report', result);

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const report = JSON.parse(textContent.text) as unknown;

      expect(report).toHaveProperty('reportType');
      expect((report as { reportType: string }).reportType).toBe('COMMITTEE_PERFORMANCE');
    }, 30000);
  });

  describe('Voting Statistics Report', () => {
    it('should generate voting statistics report', async () => {
      const result = await retry(async () => {
        return handleGenerateReport({ 
          reportType: 'VOTING_STATISTICS' as const,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      });

      saveMCPResponseFixture('generate_report', 'voting-statistics-report', result);

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const report = JSON.parse(textContent.text) as unknown;

      expect(report).toHaveProperty('reportType');
      expect((report as { reportType: string }).reportType).toBe('VOTING_STATISTICS');
    }, 30000);
  });

  describe('Legislation Progress Report', () => {
    it('should generate legislation progress report', async () => {
      const result = await retry(async () => {
        return handleGenerateReport({ 
          reportType: 'LEGISLATION_PROGRESS' as const,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      });

      saveMCPResponseFixture('generate_report', 'legislation-progress-report', result);

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const report = JSON.parse(textContent.text) as unknown;

      expect(report).toHaveProperty('reportType');
      expect((report as { reportType: string }).reportType).toBe('LEGISLATION_PROGRESS');
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should reject invalid report type', async () => {
      await expect(async () => {
        return handleGenerateReport({ 
          // @ts-expect-error - Testing invalid report type
          reportType: 'INVALID_TYPE',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      }).rejects.toThrow();
    }, 10000);

    it('should reject invalid date format', async () => {
      await expect(async () => {
        return handleGenerateReport({ 
          reportType: 'VOTING_STATISTICS' as const,
          // @ts-expect-error - Testing invalid date format
          dateFrom: 'invalid-date',
          dateTo: '2024-12-31'
        });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return complete report structure', async () => {
      const result = await retry(async () => {
        return handleGenerateReport({ 
          reportType: 'VOTING_STATISTICS' as const,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });
      });

      validateMCPStructure(result);
      const textContent = result.content[0];
      if (!textContent) {
        throw new Error('No text content');
      }

      const report = JSON.parse(textContent.text) as unknown;

      // Required fields
      expect(report).toHaveProperty('reportType');
      expect(report).toHaveProperty('title');
      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('generatedAt');

      // Type validation
      expect(typeof (report as { reportType: unknown }).reportType).toBe('string');
      expect(typeof (report as { title: unknown }).title).toBe('string');
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete report generation within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => handleGenerateReport({ 
          reportType: 'VOTING_STATISTICS' as const,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        }));
      });

      expect(duration).toBeLessThan(10000); // Allow more time for report generation
      console.log(`[Performance] generate_report: ${duration.toFixed(2)}ms`);
    }, 40000);
  });

  describe('Data Consistency', () => {
    it('should return consistent reports for same parameters', async () => {
      const params = { 
        reportType: 'VOTING_STATISTICS' as const,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      };

      const result1 = await retry(async () => handleGenerateReport(params));
      const result2 = await handleGenerateReport(params);

      // Reports should have same structure (content may differ due to timestamps)
      const report1 = JSON.parse(result1.content[0]?.text ?? '{}') as { reportType: string };
      const report2 = JSON.parse(result2.content[0]?.text ?? '{}') as { reportType: string };

      expect(report1.reportType).toBe(report2.reportType);
    }, 60000);
  });
});
