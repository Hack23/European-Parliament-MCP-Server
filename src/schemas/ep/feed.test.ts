/**
 * Tests for feed schema validation rules.
 *
 * Verifies the custom superRefine validation that requires startDate
 * when timeframe is "custom".
 */

import { describe, it, expect } from 'vitest';
import { GetMEPsFeedSchema } from './feed.js';

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
});
