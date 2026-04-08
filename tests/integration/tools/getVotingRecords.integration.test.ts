/**
 * Integration Tests: get_voting_records Tool
 *
 * Smoke-tests the getVotingRecords tool against the real European Parliament API.
 * Error-handling, caching, and data-consistency are covered by unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect } from 'vitest';
import { handleGetVotingRecords } from '../../../src/tools/getVotingRecords.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateVotingRecordStructure } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_voting_records Integration Tests', () => {
  it('should fetch voting records with valid structure', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGetVotingRecords({ limit: 10 });
    }, 'basic retrieval');
    if (!result) { ctx.skip(); return; }

    const response = validatePaginatedResponse(result);
    expect(response.data).toBeDefined();

    response.data.forEach((record: unknown) => {
      validateVotingRecordStructure(record);
    });
  }, 90000);
});
