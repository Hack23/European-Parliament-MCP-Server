/**
 * Integration Tests: search_documents Tool
 *
 * Smoke-tests the searchDocuments tool against the real European Parliament API.
 * Error-handling, caching, and data-consistency are covered by unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect } from 'vitest';
import { handleSearchDocuments } from '../../../src/tools/searchDocuments.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateDocumentStructure } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('search_documents Integration Tests', () => {
  it('should search documents by keyword with valid structure', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleSearchDocuments({
        keyword: 'climate',
        limit: 10
      });
    }, 'search documents by keyword');
    if (!result) { ctx.skip(); return; }

    const response = validatePaginatedResponse(result);
    expect(response.data).toBeDefined();

    response.data.forEach((document: unknown) => {
      validateDocumentStructure(document);
    });
  }, 60000);
});
