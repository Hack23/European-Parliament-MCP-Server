/**
 * Tests for feed utility helpers (isUpstream404, isErrorInBody,
 * buildEmptyFeedResponse, buildFeedSuccessResponse).
 */

import { describe, it, expect } from 'vitest';
import {
  isUpstream404,
  isErrorInBody,
  buildEmptyFeedResponse,
  buildFeedSuccessResponse,
} from './feedUtils.js';
import { APIError } from '../../clients/ep/baseClient.js';

interface FeedEnvelope {
  status: 'operational' | 'degraded' | 'unavailable';
  generatedAt: string;
  items: unknown[];
  itemCount: number;
  reason?: string;
  data?: unknown[];
  '@context'?: unknown[];
  dataQualityWarnings: string[];
}

function parseEnvelope(text: string | undefined): FeedEnvelope {
  return JSON.parse(text ?? '{}') as FeedEnvelope;
}

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

  describe('isErrorInBody', () => {
    it('should return true for HTTP 200 body with error string and no data array', () => {
      expect(isErrorInBody({ error: '404 Not Found from POST …' })).toBe(true);
    });

    it('should return false when error string is empty', () => {
      expect(isErrorInBody({ error: '' })).toBe(false);
    });

    it('should return false when data is an array (even with error field)', () => {
      expect(isErrorInBody({ error: 'transient', data: [] })).toBe(false);
    });

    it('should return false when no error field is present', () => {
      expect(isErrorInBody({ data: [] })).toBe(false);
    });
  });

  describe('buildEmptyFeedResponse — uniform contract', () => {
    it('should return MCP-compliant response with content', () => {
      const result = buildEmptyFeedResponse();
      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should not set isError flag (errors are signalled in-band)', () => {
      const result = buildEmptyFeedResponse();
      expect(result.isError).toBeUndefined();
    });

    it('should always emit status="unavailable"', () => {
      const result = buildEmptyFeedResponse();
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('unavailable');
      expect(env.items).toEqual([]);
      expect(env.itemCount).toBe(0);
      expect(typeof env.reason).toBe('string');
      expect(env.reason ?? '').not.toBe('');
      expect(typeof env.generatedAt).toBe('string');
      expect(() => new Date(env.generatedAt).toISOString()).not.toThrow();
    });

    it('should preserve legacy data / @context / dataQualityWarnings fields', () => {
      const result = buildEmptyFeedResponse();
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.data).toEqual([]);
      expect(env['@context']).toEqual([]);
      expect(Array.isArray(env.dataQualityWarnings)).toBe(true);
      expect(env.dataQualityWarnings[0]).toBe(env.reason);
    });

    it('should propagate the supplied reason into both reason and dataQualityWarnings', () => {
      const reason = 'EP API enrichment step failed (Easter recess)';
      const result = buildEmptyFeedResponse(reason);
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.reason).toBe(reason);
      expect(env.dataQualityWarnings[0]).toBe(reason);
    });
  });

  describe('buildFeedSuccessResponse — uniform contract', () => {
    it('should emit status="unavailable" with a reason when the upstream payload has no data', () => {
      const result = buildFeedSuccessResponse({ data: [], '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('unavailable');
      expect(env.items).toEqual([]);
      expect(env.itemCount).toBe(0);
      expect(typeof env.reason).toBe('string');
      expect(env.reason ?? '').not.toBe('');
      expect(typeof env.generatedAt).toBe('string');
    });

    it('should emit status="operational" with no reason when items are present and no warnings', () => {
      const result = buildFeedSuccessResponse({ data: [{ id: 'x' }], '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('operational');
      expect(env.reason).toBeUndefined();
      expect(typeof env.generatedAt).toBe('string');
    });

    it('should expose items as alias for data and itemCount as data.length', () => {
      const data = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const result = buildFeedSuccessResponse({ data, '@context': ['ctx'] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.items).toEqual(data);
      expect(env.itemCount).toBe(3);
      expect(env.data).toEqual(data);
      expect(env['@context']).toEqual(['ctx']);
    });

    it('should normalize data to the same array as items when source has no data array', () => {
      const result = buildFeedSuccessResponse({ '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.items).toEqual([]);
      expect(env.data).toEqual([]);
      expect(env.itemCount).toBe(0);
      expect(env.status).toBe('unavailable');
    });

    it('should normalize data to [] when source.data is non-array', () => {
      const result = buildFeedSuccessResponse({ data: 'not-an-array', '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.items).toEqual([]);
      expect(env.data).toEqual([]);
      expect(env.itemCount).toBe(0);
      expect(env.status).toBe('unavailable');
    });

    it('should preserve existing dataQualityWarnings from upstream payload', () => {
      const result = buildFeedSuccessResponse({
        data: [{ id: 'x' }],
        '@context': [],
        dataQualityWarnings: ['stale cache'],
      });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.dataQualityWarnings).toEqual(['stale cache']);
      expect(env.status).toBe('degraded');
      expect(env.reason).toBe('stale cache');
    });

    it('should derive status="degraded" when explicit warnings are passed', () => {
      const result = buildFeedSuccessResponse(
        { data: [{ id: 'x' }], '@context': [] },
        ['partial enrichment failure'],
      );
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('degraded');
      expect(env.dataQualityWarnings).toEqual(['partial enrichment failure']);
    });

    it('should merge upstream warnings with explicit warnings', () => {
      const result = buildFeedSuccessResponse(
        {
          data: [{ id: 'x' }],
          '@context': [],
          dataQualityWarnings: ['upstream warn'],
        },
        ['handler warn'],
      );
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('degraded');
      expect(env.dataQualityWarnings).toEqual(['upstream warn', 'handler warn']);
    });

    it('should attach an empty dataQualityWarnings array when none supplied and items present', () => {
      const result = buildFeedSuccessResponse({ data: [{ id: 'x' }], '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.dataQualityWarnings).toEqual([]);
      expect(env.status).toBe('operational');
    });

    it('should surface empty-feed reason in dataQualityWarnings when items are empty', () => {
      const result = buildFeedSuccessResponse({ data: [], '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('unavailable');
      expect(env.dataQualityWarnings.length).toBe(1);
      expect(env.dataQualityWarnings[0]).toBe(env.reason);
    });

    it('should use a custom empty reason when provided via the third argument', () => {
      const customReason = 'procedures/feed had no updates for one-week — use get_procedures as fallback';
      const ctx = ['https://example.org/ctx'];
      const result = buildFeedSuccessResponse({ data: [], '@context': ctx }, [], customReason);
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('unavailable');
      expect(env.reason).toBe(customReason);
      expect(env.dataQualityWarnings[0]).toBe(customReason);
      // Upstream @context must be preserved
      expect(env['@context']).toEqual(ctx);
    });

    it('should fall back to shared EMPTY_FEED_REASON when customEmptyReason is omitted', () => {
      const result = buildFeedSuccessResponse({ data: [], '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('unavailable');
      // Should not be the custom message — it was not provided
      expect(env.reason).toContain('no data');
    });

    it('should be safe with null/undefined input (treated as empty / unavailable)', () => {
      const env1 = parseEnvelope(buildFeedSuccessResponse(null).content[0]?.text);
      const env2 = parseEnvelope(buildFeedSuccessResponse(undefined).content[0]?.text);

      expect(env1.status).toBe('unavailable');
      expect(env1.items).toEqual([]);
      expect(env1.data).toEqual([]);
      expect(env1.itemCount).toBe(0);
      expect(env2.status).toBe('unavailable');
      expect(env2.items).toEqual([]);
      expect(env2.data).toEqual([]);
    });
  });
});
