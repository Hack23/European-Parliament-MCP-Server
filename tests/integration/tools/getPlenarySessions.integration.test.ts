/**
 * Integration Tests: get_plenary_sessions Tool
 *
 * Smoke-tests the getPlenarySessions tool against the real European Parliament API.
 * Error-handling, caching, and data-consistency are covered by unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect } from 'vitest';
import { handleGetPlenarySessions } from '../../../src/tools/getPlenarySessions.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validatePlenarySessionStructure } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_plenary_sessions Integration Tests', () => {
  it('should fetch plenary sessions with valid structure', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGetPlenarySessions({ limit: 10 });
    }, 'fetch plenary sessions');
    if (!result) { ctx.skip(); return; }

    const response = validatePaginatedResponse(result);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.total).toBeGreaterThan(0);

    response.data.forEach((session: unknown) => {
      validatePlenarySessionStructure(session);
    });
  }, 60000);
});
