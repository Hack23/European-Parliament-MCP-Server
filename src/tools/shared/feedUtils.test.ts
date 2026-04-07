/**
 * Tests for feed utility helpers (isUpstream404, buildEmptyFeedResponse).
 */

import { describe, it, expect } from 'vitest';
import { isUpstream404, buildEmptyFeedResponse } from './feedUtils.js';
import { APIError } from '../../clients/ep/baseClient.js';

describe('feedUtils', () => {
  describe('isUpstream404', () => {
    it('should return true for APIError with statusCode 404', () => {
      const error = new APIError('Not Found', 404);
      expect(isUpstream404(error)).toBe(true);
    });

    it('should return false for APIError with statusCode 500', () => {
      const error = new APIError('Server Error', 500);
      expect(isUpstream404(error)).toBe(false);
    });

    it('should return false for APIError with no statusCode', () => {
      const error = new APIError('Unknown');
      expect(isUpstream404(error)).toBe(false);
    });

    it('should return false for generic Error', () => {
      const error = new Error('Not Found');
      expect(isUpstream404(error)).toBe(false);
    });

    it('should return false for non-Error values', () => {
      expect(isUpstream404('not found')).toBe(false);
      expect(isUpstream404(null)).toBe(false);
      expect(isUpstream404(undefined)).toBe(false);
      expect(isUpstream404(404)).toBe(false);
    });
  });

  describe('buildEmptyFeedResponse', () => {
    it('should return MCP-compliant response with empty feed', () => {
      const result = buildEmptyFeedResponse();

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should not set isError flag', () => {
      const result = buildEmptyFeedResponse();
      expect(result.isError).toBeUndefined();
    });

    it('should contain valid JSON with data array and dataQualityWarnings', () => {
      const result = buildEmptyFeedResponse();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        '@context': unknown[];
        dataQualityWarnings: string[];
      };

      expect(parsed.data).toEqual([]);
      expect(parsed['@context']).toEqual([]);
      expect(Array.isArray(parsed.dataQualityWarnings)).toBe(true);
      expect(parsed.dataQualityWarnings[0]).toContain('404');
      expect(parsed.dataQualityWarnings[0]).toContain('no updates');
    });
  });
});
