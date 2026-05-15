/**
 * Tests for get_events_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetEventsFeed, getEventsFeedToolMetadata } from './getEventsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getEventsFeed: vi.fn(),
  }
}));

describe('get_events_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getEventsFeed).mockResolvedValue({
      data: [{ id: 'evt-1', type: 'Event' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetEventsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetEventsFeed({ timeframe: 'one-month' });
      expect(result).toHaveProperty('content');
    });

    it('should accept activityType parameter', async () => {
      const result = await handleGetEventsFeed({ activityType: 'PLENARY' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetEventsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetEventsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetEventsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetEventsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getEventsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });

    it('should pass activityType to client when provided', async () => {
      await handleGetEventsFeed({ activityType: 'COMMITTEE' });

      expect(epClientModule.epClient.getEventsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ activityType: 'COMMITTEE' })
      );
    });

    it('should pass startDate to client with custom timeframe', async () => {
      await handleGetEventsFeed({ timeframe: 'custom', startDate: '2024-06-01' });

      expect(epClientModule.epClient.getEventsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'custom', startDate: '2024-06-01' })
      );
    });

    it('should not pass startDate when not provided', async () => {
      await handleGetEventsFeed({ timeframe: 'one-week' });

      const callArgs = vi.mocked(epClientModule.epClient.getEventsFeed).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('startDate');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetEventsFeed({})).rejects.toThrow('Failed to retrieve events feed');
    });

    it('should return empty feed with NOT_FOUND metadata on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetEventsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        dataQualityWarnings: string[];
        errorCode?: string;
        retryable?: boolean;
        upstream?: { statusCode?: number; errorMessage?: string };
      };
      expect(parsed.data).toEqual([]);
      expect(parsed.dataQualityWarnings[0]).toContain('404');
      expect(parsed.errorCode).toBe('NOT_FOUND');
      expect(parsed.retryable).toBe(false);
      expect(parsed.upstream?.statusCode).toBe(404);
    });

    it('should normalize upstream timeouts into an unavailable feed envelope', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(new APIError('EP API request to events/feed timed out after 60000ms', 408));

      const result = await handleGetEventsFeed({ timeframe: 'one-month' });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        errorCode?: string;
        retryable?: boolean;
        reason?: string;
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.errorCode).toBe('UPSTREAM_TIMEOUT');
      expect(parsed.retryable).toBe(true);
      expect(parsed.reason).toContain('timed out');
    });

    it('should normalize upstream 5xx errors into a retryable feed envelope', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(new APIError('EP API request failed: 502 Bad Gateway', 502));

      const result = await handleGetEventsFeed({ timeframe: 'one-week' });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        errorCode?: string;
        retryable?: boolean;
        upstream?: { statusCode?: number; errorMessage?: string };
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.errorCode).toBe('UPSTREAM_ERROR');
      expect(parsed.retryable).toBe(true);
      expect(parsed.upstream?.statusCode).toBe(502);
      expect(parsed.upstream?.errorMessage).toContain('502');
    });

    it('should normalize upstream rate limits into a retryable feed envelope', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(new APIError('EP API request failed: 429', 429));

      const result = await handleGetEventsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        errorCode?: string;
        retryable?: boolean;
        upstream?: { statusCode?: number };
        reason?: string;
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.errorCode).toBe('RATE_LIMIT');
      expect(parsed.retryable).toBe(true);
      expect(parsed.upstream?.statusCode).toBe(429);
      expect(parsed.reason).toContain('EP API rate limit');
    });

    it('should normalize local rate-limit 429 without upstream metadata', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(
          new APIError('Rate limit exceeded. Retry after 5000ms', 429, {
            retryAfterMs: 5000,
            remainingTokens: 0,
          }),
        );

      const result = await handleGetEventsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        errorCode?: string;
        retryable?: boolean;
        retryAfterMs?: number;
        upstream?: { statusCode?: number };
        reason?: string;
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.errorCode).toBe('RATE_LIMIT');
      expect(parsed.retryable).toBe(true);
      expect(parsed.upstream).toBeUndefined();
      expect(parsed.retryAfterMs).toBe(5000);
      expect(parsed.reason).toContain('Local rate limit');
      expect(parsed.reason).toContain('5000ms');
    });

    it('should parse retryAfterMs from local rate-limit message when details missing', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(new APIError('Rate limit exceeded. Retry after 2500ms', 429));

      const result = await handleGetEventsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        errorCode?: string;
        retryAfterMs?: number;
        reason?: string;
      };
      expect(parsed.errorCode).toBe('RATE_LIMIT');
      expect(parsed.retryAfterMs).toBe(2500);
      expect(parsed.reason).toContain('2500ms');
    });

    it('should handle error-in-body response (HTTP 200 with upstream 404-in-body)', async () => {
      vi.mocked(epClientModule.epClient.getEventsFeed).mockResolvedValueOnce({
        '@id': 'https://data.europarl.europa.eu/eli/dl/event/ITRE-AM-786788-DEPOT-2026',
        'error': '404 Not Found from POST ...',
        '@context': { error: {} },
      } as unknown as { data: unknown[]; '@context': unknown[] });

      const result = await handleGetEventsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        data: unknown[];
        items: unknown[];
        dataQualityWarnings: string[];
        errorCode?: string;
        retryable?: boolean;
        upstream?: { statusCode?: number; errorMessage?: string };
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.data).toEqual([]);
      expect(parsed.items).toEqual([]);
      expect(parsed.dataQualityWarnings[0]).toContain('error-in-body');
      expect(parsed.errorCode).toBe('ENRICHMENT_FAILED');
      expect(parsed.retryable).toBe(true);
      expect(parsed.upstream?.statusCode).toBe(404);
      expect(parsed.upstream?.errorMessage).toContain('404');
    });
  });

  describe('Uniform feed envelope (Defect #5)', () => {
    interface FeedEnvelope {
      status: 'operational' | 'degraded' | 'unavailable';
      generatedAt: string;
      items: unknown[];
      itemCount: number;
      reason?: string;
      data?: unknown[];
      dataQualityWarnings: string[];
    }

    it('should emit status="operational" with items/itemCount on the success path', async () => {
      const result = await handleGetEventsFeed({});
      const env = JSON.parse(result.content[0]?.text ?? '{}') as FeedEnvelope;

      expect(env.status).toBe('operational');
      expect(env.items).toEqual([{ id: 'evt-1', type: 'Event' }]);
      expect(env.itemCount).toBe(1);
      expect(env.dataQualityWarnings).toEqual([]);
      expect(typeof env.generatedAt).toBe('string');
      expect(env.reason).toBeUndefined();
      // Backwards-compatible field still present
      expect(env.data).toEqual([{ id: 'evt-1', type: 'Event' }]);
    });

    it('should emit status="unavailable" with NOT_FOUND metadata on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetEventsFeed({});
      const env = JSON.parse(result.content[0]?.text ?? '{}') as FeedEnvelope & {
        errorCode?: string;
        retryable?: boolean;
        upstream?: { statusCode?: number };
      };

      expect(env.status).toBe('unavailable');
      expect(env.items).toEqual([]);
      expect(env.itemCount).toBe(0);
      expect(typeof env.reason).toBe('string');
      expect(env.reason ?? '').not.toBe('');
      expect(typeof env.generatedAt).toBe('string');
      expect(env.errorCode).toBe('NOT_FOUND');
      expect(env.retryable).toBe(false);
      expect(env.upstream?.statusCode).toBe(404);
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getEventsFeedToolMetadata).toHaveProperty('name', 'get_events_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getEventsFeedToolMetadata).toHaveProperty('description');
      expect(getEventsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with description containing slow endpoint warning', () => {
      expect(getEventsFeedToolMetadata.description).toContain('global EP request timeout');
      expect(getEventsFeedToolMetadata.description).toContain('get_events');
      expect(getEventsFeedToolMetadata.description).not.toContain('120-second');
      expect(getEventsFeedToolMetadata.description).not.toContain('get_plenary_sessions');
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getEventsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getEventsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getEventsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
