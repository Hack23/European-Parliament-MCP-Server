/**
 * Integration Tests: track_legislation Tool
 *
 * Smoke-tests the trackLegislation tool against the real European Parliament API.
 * Error-handling, caching, and data-consistency are covered by unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { handleTrackLegislation } from '../../../src/tools/trackLegislation.js';
import { handleGetProcedures } from '../../../src/tools/getProcedures.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validateMCPStructure, validatePaginatedResponse } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('track_legislation Integration Tests', () => {
  let testProcedureId: string | undefined;

  beforeAll(async () => {
    const procsResult = await retryOrSkip(async () => {
      return handleGetProcedures({ year: 2024, limit: 3 });
    }, 'beforeAll: fetch procedure IDs');
    if (!procsResult) return;
    const response = validatePaginatedResponse(procsResult);
    const firstProc = response.data[0] as { id?: string } | undefined;
    if (firstProc?.id) {
      testProcedureId = firstProc.id;
      console.log(`[Integration] Using real procedure ID: ${testProcedureId}`);
    }
  }, 90000);

  it('should track legislation with full procedure structure', async (ctx) => {
    if (!testProcedureId) { ctx.skip(); return; }
    const result = await retryOrSkip(async () => {
      return handleTrackLegislation({ procedureId: testProcedureId! });
    }, 'track legislation');
    if (!result) { ctx.skip(); return; }

    validateMCPStructure(result);
    const textContent = result.content[0];
    expect(textContent).toBeDefined();

    const procedure = JSON.parse(textContent!.text) as Record<string, unknown>;

    // Required fields
    expect(typeof procedure['procedureId']).toBe('string');
    expect(typeof procedure['title']).toBe('string');
    expect(typeof procedure['type']).toBe('string');
    expect(typeof procedure['status']).toBe('string');

    // Timeline
    expect(procedure).toHaveProperty('timeline');
    expect(Array.isArray(procedure['timeline'])).toBe(true);

    // Committees
    expect(procedure).toHaveProperty('committees');
  }, 90000);
});
