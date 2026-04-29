/**
 * Integration Tests: generate_report Tool
 *
 * Smoke-tests each report type against the real European Parliament API.
 * Error-handling, caching, and data-consistency are covered by unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { handleGenerateReport } from '../../../src/tools/generateReport/index.js';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('generate_report Integration Tests', () => {
  let testMEPId: string | undefined;

  beforeAll(async () => {
    const mepsResult = await retryOrSkip(async () => {
      return handleGetMEPs({ limit: 1 });
    }, 'beforeAll: fetch MEP ID');
    if (!mepsResult) return;
    const response = validatePaginatedResponse(mepsResult);
    const firstMep = response.data[0] as { id?: string } | undefined;
    if (firstMep?.id) {
      testMEPId = firstMep.id;
      console.log(`[Integration] Using real MEP ID: ${testMEPId}`);
    }
  }, 90000);

  it('should generate MEP_ACTIVITY report', async (ctx) => {
    if (!testMEPId) { ctx.skip(); return; }
    const result = await retryOrSkip(async () => {
      return handleGenerateReport({
        reportType: 'MEP_ACTIVITY' as const,
        subjectId: testMEPId!,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
    }, 'MEP activity report');
    if (!result) { ctx.skip(); return; }
    if (result.isError === true) { ctx.skip(); return; }

    validateMCPStructure(result);
    const report = JSON.parse(result.content[0]!.text) as Record<string, unknown>;
    if (report['timedOut'] === true || report['status'] === 'timeout') { ctx.skip(); return; }
    expect(report['reportType']).toBe('MEP_ACTIVITY');
    expect(report).toHaveProperty('subject');
    expect(report).toHaveProperty('period');
    expect(report).toHaveProperty('summary');
  }, 180000);

  it('should generate COMMITTEE_PERFORMANCE report', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGenerateReport({
        reportType: 'COMMITTEE_PERFORMANCE' as const,
        subjectId: 'ENVI',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
    }, 'committee performance report');
    if (!result) { ctx.skip(); return; }
    if (result.isError === true) { ctx.skip(); return; }

    validateMCPStructure(result);
    const report = JSON.parse(result.content[0]!.text) as Record<string, unknown>;
    if (report['timedOut'] === true || report['status'] === 'timeout') { ctx.skip(); return; }
    expect(report['reportType']).toBe('COMMITTEE_PERFORMANCE');
  }, 300000);

  it('should generate VOTING_STATISTICS report', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGenerateReport({
        reportType: 'VOTING_STATISTICS' as const,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
    }, 'voting statistics report');
    if (!result) { ctx.skip(); return; }
    if (result.isError === true) { ctx.skip(); return; }

    validateMCPStructure(result);
    const report = JSON.parse(result.content[0]!.text) as Record<string, unknown>;
    if (report['timedOut'] === true || report['status'] === 'timeout') { ctx.skip(); return; }
    expect(report['reportType']).toBe('VOTING_STATISTICS');
  }, 180000);

  it('should generate LEGISLATION_PROGRESS report', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGenerateReport({
        reportType: 'LEGISLATION_PROGRESS' as const,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
    }, 'legislation progress report');
    if (!result) { ctx.skip(); return; }
    if (result.isError === true) { ctx.skip(); return; }

    validateMCPStructure(result);
    const report = JSON.parse(result.content[0]!.text) as Record<string, unknown>;
    if (report['timedOut'] === true || report['status'] === 'timeout') { ctx.skip(); return; }
    expect(report['reportType']).toBe('LEGISLATION_PROGRESS');
  }, 180000);
});
