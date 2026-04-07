/**
 * Integration Tests: get_mep_details Tool
 *
 * Validates the getMEPDetails tool contract against the real European Parliament API.
 * Error-handling and caching are covered by unit tests — this file only smoke-tests
 * real API responses.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { handleGetMEPDetails } from '../../../src/tools/getMEPDetails.js';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_mep_details Integration Tests', () => {
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
  }, 60000);

  it('should fetch and validate MEP details from real API', async (ctx) => {
    if (!testMEPId) { ctx.skip(); return; }
    const result = await retryOrSkip(async () => {
      return handleGetMEPDetails({ id: testMEPId! });
    }, 'fetch MEP details');
    if (!result) { ctx.skip(); return; }

    validateMCPStructure(result);
    const textContent = result.content[0];
    expect(textContent).toBeDefined();
    const mep = JSON.parse(textContent!.text) as Record<string, unknown>;

    // Required fields
    expect(typeof mep['id']).toBe('string');
    expect(typeof mep['name']).toBe('string');
    expect(typeof mep['country']).toBe('string');
    expect(mep['id']).toBe(testMEPId);

    // Country code format
    const country = mep['country'] as string;
    if (country !== 'Unknown') {
      expect(country).toMatch(/^[A-Z]{2,3}$/);
    }
  }, 60000);

  it('should handle PII fields appropriately (GDPR)', async (ctx) => {
    if (!testMEPId) { ctx.skip(); return; }
    const result = await retryOrSkip(async () => {
      return handleGetMEPDetails({ id: testMEPId! });
    }, 'GDPR PII handling');
    if (!result) { ctx.skip(); return; }

    validateMCPStructure(result);
    const mep = JSON.parse(result.content[0]!.text) as Record<string, unknown>;

    if (mep['email']) {
      expect(typeof mep['email']).toBe('string');
      expect(mep['email'] as string).toMatch(/@/);
    }
    if (mep['phone']) {
      expect(typeof mep['phone']).toBe('string');
    }
  }, 60000);
});
