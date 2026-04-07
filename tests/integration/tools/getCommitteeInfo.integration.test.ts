/**
 * Integration Tests: get_committee_info Tool
 *
 * Smoke-tests the getCommitteeInfo tool against the real European Parliament API.
 * Error-handling, caching, and data-consistency are covered by unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect } from 'vitest';
import { handleGetCommitteeInfo } from '../../../src/tools/getCommitteeInfo.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validateMCPStructure, validateCommitteeStructure } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_committee_info Integration Tests', () => {
  it('should fetch committee by abbreviation with valid structure', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGetCommitteeInfo({ abbreviation: 'ENVI' });
    }, 'committee by abbreviation');
    if (!result) { ctx.skip(); return; }

    validateMCPStructure(result);
    const textContent = result.content[0];
    expect(textContent).toBeDefined();

    const committee = JSON.parse(textContent!.text) as unknown;
    validateCommitteeStructure(committee);
    expect((committee as { abbreviation: string }).abbreviation).toBe('ENVI');
  }, 60000);
});
