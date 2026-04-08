/**
 * Integration Tests: analyze_voting_patterns Tool
 *
 * Smoke-tests the analyzeVotingPatterns tool against the real European Parliament API.
 * Handles both the dataAvailable:false path (EP API doesn't expose voting stats on
 * /meps/{id}) and the full analysis path. Error-handling and caching are covered by
 * unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { handleAnalyzeVotingPatterns } from '../../../src/tools/analyzeVotingPatterns.js';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('analyze_voting_patterns Integration Tests', () => {
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

  it('should analyze voting patterns or indicate data unavailability', async (ctx) => {
    if (!testMEPId) { ctx.skip(); return; }
    const result = await retryOrSkip(async () => {
      return handleAnalyzeVotingPatterns({
        mepId: testMEPId!,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
    }, 'analyze voting patterns');
    if (!result) { ctx.skip(); return; }

    validateMCPStructure(result);
    const textContent = result.content[0];
    expect(textContent).toBeDefined();

    const analysis = JSON.parse(textContent!.text) as Record<string, unknown>;

    // Core fields present in both response paths
    expect(typeof analysis['mepId']).toBe('string');
    expect(typeof analysis['mepName']).toBe('string');
    expect(analysis['mepId']).toBe(testMEPId);

    // EP API /meps/{id} may not expose voting stats — validate both paths
    if (analysis['dataAvailable'] === false) {
      expect(analysis).toHaveProperty('message');
      expect(analysis).toHaveProperty('dataAvailability');
      expect(analysis['dataAvailability']).toBe('UNAVAILABLE');
      expect(analysis['confidenceLevel']).toBe('LOW');
    } else {
      expect(analysis).toHaveProperty('statistics');
      expect(analysis).toHaveProperty('period');
    }
  }, 90000);
});
