/**
 * Integration Tests: get_parliamentary_questions Tool
 *
 * Smoke-tests the getParliamentaryQuestions tool against the real European Parliament API.
 * Error-handling, caching, and data-consistency are covered by unit tests.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect } from 'vitest';
import { handleGetParliamentaryQuestions } from '../../../src/tools/getParliamentaryQuestions.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateParliamentaryQuestionStructure } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_parliamentary_questions Integration Tests', () => {
  it('should fetch parliamentary questions with valid structure', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGetParliamentaryQuestions({ limit: 10 });
    }, 'basic retrieval');
    if (!result) { ctx.skip(); return; }

    const response = validatePaginatedResponse(result);
    expect(response.data).toBeDefined();

    response.data.forEach((question: unknown) => {
      validateParliamentaryQuestionStructure(question);
    });
  }, 60000);

  it('should filter by question type', async (ctx) => {
    const result = await retryOrSkip(async () => {
      return handleGetParliamentaryQuestions({
        type: 'WRITTEN' as const,
        limit: 10
      });
    }, 'filter written questions');
    if (!result) { ctx.skip(); return; }

    const response = validatePaginatedResponse(result);
    expect(response.data).toBeDefined();

    response.data.forEach((question: unknown) => {
      validateParliamentaryQuestionStructure(question);
      expect((question as { type: string }).type).toBeDefined();
    });
  }, 60000);
});
