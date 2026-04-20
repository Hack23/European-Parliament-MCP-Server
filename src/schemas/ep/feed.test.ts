/**
 * Tests for feed schema validation rules.
 *
 * Verifies the custom superRefine validation that requires startDate
 * when timeframe is "custom".
 */

import { describe, it, expect } from 'vitest';
import {
  GetMEPsFeedSchema,
  GetDocumentsFeedSchema,
  GetPlenaryDocumentsFeedSchema,
  GetCommitteeDocumentsFeedSchema,
  GetPlenarySessionDocumentsFeedSchema,
  GetParliamentaryQuestionsFeedSchema,
  GetCorporateBodiesFeedSchema,
  GetControlledVocabulariesFeedSchema,
} from './feed.js';

describe('Feed schema validation', () => {
  describe('BaseFeedParamsSchema superRefine', () => {
    it('should accept custom timeframe with valid startDate', () => {
      const result = GetMEPsFeedSchema.safeParse({
        timeframe: 'custom',
        startDate: '2024-06-01',
      });
      expect(result.success).toBe(true);
    });

    it('should reject custom timeframe without startDate', () => {
      const result = GetMEPsFeedSchema.safeParse({
        timeframe: 'custom',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.includes('startDate'));
        expect(issue).toBeDefined();
        expect(issue?.message).toContain('startDate is required');
      }
    });

    it('should reject custom timeframe with empty startDate', () => {
      const result = GetMEPsFeedSchema.safeParse({
        timeframe: 'custom',
        startDate: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept non-custom timeframe without startDate', () => {
      const result = GetMEPsFeedSchema.safeParse({
        timeframe: 'one-week',
      });
      expect(result.success).toBe(true);
    });

    it('should accept today timeframe without startDate', () => {
      const result = GetMEPsFeedSchema.safeParse({
        timeframe: 'today',
      });
      expect(result.success).toBe(true);
    });

    it('should default timeframe to one-week', () => {
      const result = GetMEPsFeedSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeframe).toBe('one-week');
      }
    });
  });

  describe('FixedWindowFeedSchema (Group A — informational-only params)', () => {
    // Regression: issue #379 — fixed-window feed tools must accept the
    // common feed parameters so consumers that model all feeds with a
    // single shape do not hard-fail with INVALID_PARAMS at runtime.
    const fixedWindowSchemas = [
      ['GetDocumentsFeedSchema', GetDocumentsFeedSchema],
      ['GetPlenaryDocumentsFeedSchema', GetPlenaryDocumentsFeedSchema],
      ['GetCommitteeDocumentsFeedSchema', GetCommitteeDocumentsFeedSchema],
      ['GetPlenarySessionDocumentsFeedSchema', GetPlenarySessionDocumentsFeedSchema],
      ['GetParliamentaryQuestionsFeedSchema', GetParliamentaryQuestionsFeedSchema],
      ['GetCorporateBodiesFeedSchema', GetCorporateBodiesFeedSchema],
      ['GetControlledVocabulariesFeedSchema', GetControlledVocabulariesFeedSchema],
    ] as const;

    for (const [name, schema] of fixedWindowSchemas) {
      it(`${name}: accepts empty object`, () => {
        expect(schema.safeParse({}).success).toBe(true);
      });

      it(`${name}: accepts timeframe/startDate/limit/offset as informational-only`, () => {
        const result = schema.safeParse({
          timeframe: 'one-week',
          startDate: '2026-01-01',
          limit: 20,
          offset: 0,
        });
        expect(result.success).toBe(true);
      });

      it(`${name}: silently ignores unknown extra keys (forward-compatible)`, () => {
        const result = schema.safeParse({ unknownFutureKey: 'value' });
        expect(result.success).toBe(true);
      });

      it(`${name}: validates limit bounds when provided`, () => {
        expect(schema.safeParse({ limit: 0 }).success).toBe(false);
        expect(schema.safeParse({ limit: 101 }).success).toBe(false);
        expect(schema.safeParse({ limit: 50 }).success).toBe(true);
      });

      it(`${name}: validates offset bounds when provided`, () => {
        expect(schema.safeParse({ offset: -1 }).success).toBe(false);
        expect(schema.safeParse({ offset: 0 }).success).toBe(true);
      });

      it(`${name}: validates startDate format when provided`, () => {
        expect(schema.safeParse({ startDate: 'not-a-date' }).success).toBe(false);
        expect(schema.safeParse({ startDate: '2026-01-01' }).success).toBe(true);
      });
    }
  });
});
