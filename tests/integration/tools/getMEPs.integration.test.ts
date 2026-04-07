/**
 * Integration Tests: get_meps Tool
 *
 * Smoke-tests the getMEPs tool against the real European Parliament API.
 * Error-handling, caching, and data-consistency are covered by unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect } from 'vitest';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateMEPStructure } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_meps Integration Tests', () => {
  it('should fetch MEPs with valid structure', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGetMEPs({ limit: 5 });
    }, 'fetch MEPs');
    if (!result) { ctx.skip(); return; }

    const response = validatePaginatedResponse(result);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.total).toBeGreaterThan(0);

    response.data.forEach((mep: unknown) => {
      validateMEPStructure(mep);
    });
  }, 60000);

  it('should filter MEPs by country', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGetMEPs({ country: 'SE', limit: 10 });
    }, 'fetch Swedish MEPs');
    if (!result) { ctx.skip(); return; }

    const response = validatePaginatedResponse(result);
    expect(response.data.length).toBeGreaterThan(0);

    response.data.forEach((mep: unknown) => {
      validateMEPStructure(mep);
      expect(['SE', 'Unknown']).toContain((mep as { country: string }).country);
    });
  }, 60000);

  it('should paginate correctly', async (ctx) => {
    const page1 = await retryOrSkip(async () => {
      return handleGetMEPs({ limit: 5, offset: 0 });
    }, 'pagination page 1');
    if (!page1) { ctx.skip(); return; }

    const page2 = await retryOrSkip(async () => {
      return handleGetMEPs({ limit: 5, offset: 5 });
    }, 'pagination page 2');
    if (!page2) { ctx.skip(); return; }

    const response1 = validatePaginatedResponse(page1);
    const response2 = validatePaginatedResponse(page2);

    expect(response1.offset).toBe(0);
    expect(response2.offset).toBe(5);
    expect(response1.limit).toBe(5);
    expect(response2.limit).toBe(5);

    if (response1.data.length > 0 && response2.data.length > 0) {
      expect((response1.data[0] as { id: string }).id).not.toBe(
        (response2.data[0] as { id: string }).id
      );
    }
  }, 120000);
});
