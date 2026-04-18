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
  lastSuccessfulProbe: string;
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

    it('should emit uniform envelope with status="unavailable" by default', () => {
      const result = buildEmptyFeedResponse();
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('unavailable');
      expect(env.items).toEqual([]);
      expect(env.itemCount).toBe(0);
      expect(typeof env.reason).toBe('string');
      expect(env.reason ?? '').not.toBe('');
      expect(typeof env.lastSuccessfulProbe).toBe('string');
      expect(() => new Date(env.lastSuccessfulProbe).toISOString()).not.toThrow();
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

    it('should accept an explicit "degraded" status', () => {
      const result = buildEmptyFeedResponse('partial outage', 'degraded');
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('degraded');
      expect(env.reason).toBe('partial outage');
    });
  });

  describe('buildFeedSuccessResponse — uniform contract', () => {
    it('should emit status="operational" with no reason field', () => {
      const result = buildFeedSuccessResponse({ data: [], '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.status).toBe('operational');
      expect(env.reason).toBeUndefined();
      expect(typeof env.lastSuccessfulProbe).toBe('string');
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

    it('should default items to [] when upstream payload has no data array', () => {
      const result = buildFeedSuccessResponse({ '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.items).toEqual([]);
      expect(env.itemCount).toBe(0);
    });

    it('should attach an empty dataQualityWarnings array on success', () => {
      const result = buildFeedSuccessResponse({ data: [{ id: 'x' }], '@context': [] });
      const env = parseEnvelope(result.content[0]?.text);

      expect(env.dataQualityWarnings).toEqual([]);
    });

    it('should not set isError flag', () => {
      const result = buildFeedSuccessResponse({ data: [], '@context': [] });
      expect(result.isError).toBeUndefined();
    });

    it('should be safe with null/undefined input', () => {
      const env1 = parseEnvelope(buildFeedSuccessResponse(null).content[0]?.text);
      const env2 = parseEnvelope(buildFeedSuccessResponse(undefined).content[0]?.text);

      expect(env1.status).toBe('operational');
      expect(env1.items).toEqual([]);
      expect(env1.itemCount).toBe(0);
      expect(env2.status).toBe('operational');
      expect(env2.items).toEqual([]);
    });
  });
});
