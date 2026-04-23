/**
 * Tests for get_procedures_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetProceduresFeed, getProceduresFeedToolMetadata } from './getProceduresFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProceduresFeed: vi.fn(),
    getProcedures: vi.fn(),
  }
}));

describe('get_procedures_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getProceduresFeed).mockResolvedValue({
      data: [{ id: 'proc-1', type: 'Procedure' }],
      '@context': []
    });
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
      data: [{ id: 'proc-fallback', type: 'Procedure' }],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false,
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetProceduresFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetProceduresFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept processType parameter', async () => {
      const result = await handleGetProceduresFeed({ processType: 'COD' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetProceduresFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetProceduresFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetProceduresFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetProceduresFeed({ timeframe: 'one-day' });

      expect(epClientModule.epClient.getProceduresFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'one-day' })
      );
    });

    it('should pass processType to client when provided', async () => {
      await handleGetProceduresFeed({ processType: 'COD' });

      expect(epClientModule.epClient.getProceduresFeed).toHaveBeenCalledWith(
        expect.objectContaining({ processType: 'COD' })
      );
    });

    it('should pass startDate to client with custom timeframe', async () => {
      await handleGetProceduresFeed({ timeframe: 'custom', startDate: '2024-02-01' });

      expect(epClientModule.epClient.getProceduresFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'custom', startDate: '2024-02-01' })
      );
    });

    it('should not pass startDate when not provided', async () => {
      await handleGetProceduresFeed({ timeframe: 'one-week' });

      const callArgs = vi.mocked(epClientModule.epClient.getProceduresFeed).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('startDate');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getProceduresFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetProceduresFeed({})).rejects.toThrow('Failed to retrieve procedures feed');
    });

    it('should return empty feed on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getProceduresFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetProceduresFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        data: unknown[];
        dataQualityWarnings: string[];
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.data).toEqual([]);
    });

    it('should handle error-in-body response (HTTP 200 with upstream 404-in-body)', async () => {
      vi.mocked(epClientModule.epClient.getProceduresFeed).mockResolvedValueOnce({
        '@id': 'https://data.europarl.europa.eu/eli/dl/proc/2026-2033',
        'error': '404 Not Found from POST ...',
        '@context': { error: {} },
      } as unknown as { data: unknown[]; '@context': unknown[] });

      const result = await handleGetProceduresFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        data: unknown[];
        items: unknown[];
        dataQualityWarnings: string[];
      };
      // Degraded fallback succeeds (getProcedures mock returns data)
      expect(parsed.status).toBe('degraded');
      expect(parsed.data).not.toEqual([]);
      expect(parsed.items).not.toEqual([]);
    });

    it('should return ENRICHMENT_FAILED errorCode when error-in-body and fallback also fails', async () => {
      vi.mocked(epClientModule.epClient.getProceduresFeed).mockResolvedValueOnce({
        '@id': 'https://data.europarl.europa.eu/eli/dl/proc/2026-2033',
        'error': '502 Bad Gateway from POST ...',
        '@context': { error: {} },
      } as unknown as { data: unknown[]; '@context': unknown[] });
      vi.mocked(epClientModule.epClient.getProcedures).mockRejectedValueOnce(new Error('network error'));

      const result = await handleGetProceduresFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        errorCode: string;
        retryable: boolean;
        upstream: { statusCode?: number; errorMessage?: string };
        data: unknown[];
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.errorCode).toBe('ENRICHMENT_FAILED');
      expect(parsed.retryable).toBe(true);
      expect(parsed.upstream?.statusCode).toBe(502);
      expect(parsed.upstream?.errorMessage).toContain('502');
      expect(parsed.data).toEqual([]);
    });

    it('should surface degraded fallback data with ENRICHMENT_FAILED warning when enrichment fails', async () => {
      vi.mocked(epClientModule.epClient.getProceduresFeed).mockResolvedValueOnce({
        'error': '503 Service Unavailable',
        '@context': {},
      } as unknown as { data: unknown[]; '@context': unknown[] });
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValueOnce({
        data: [{ id: 'fallback-proc-1' }, { id: 'fallback-proc-2' }],
        total: 2,
        limit: 50,
        offset: 0,
        hasMore: false,
      });

      const result = await handleGetProceduresFeed({
        timeframe: 'one-week',
        processType: 'COD',
      });

      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        data: unknown[];
        items: unknown[];
        '@context': unknown[];
        dataQualityWarnings: string[];
      };
      expect(parsed.status).toBe('degraded');
      expect(parsed.items.length).toBeGreaterThan(0);
      expect(parsed.dataQualityWarnings[0]).toContain('ENRICHMENT_FAILED');
      expect(parsed.dataQualityWarnings[0]).toContain('Degraded mode');
      // Warning should list the caller-supplied filters that are NOT applied in degraded mode
      expect(parsed.dataQualityWarnings[0]).toContain('timeframe="one-week"');
      expect(parsed.dataQualityWarnings[0]).toContain('processType="COD"');
      // @context should be present (injected as default empty array when /procedures omits it)
      expect(Array.isArray(parsed['@context'])).toBe(true);
    });

    it('should return UPSTREAM_TIMEOUT errorCode and retryable=true on timeout', async () => {
      const { TimeoutError } = await import('../utils/timeout.js');
      vi.mocked(epClientModule.epClient.getProceduresFeed)
        .mockRejectedValueOnce(new TimeoutError('Request timed out after 120000ms'));

      const result = await handleGetProceduresFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        errorCode: string;
        retryable: boolean;
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.errorCode).toBe('UPSTREAM_TIMEOUT');
      expect(parsed.retryable).toBe(true);
    });

    it('should return RATE_LIMIT errorCode with upstream.statusCode=429 on HTTP 429', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getProceduresFeed)
        .mockRejectedValueOnce(new APIError('Too Many Requests', 429));

      const result = await handleGetProceduresFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        errorCode: string;
        retryable: boolean;
        upstream: { statusCode?: number; errorMessage?: string };
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.errorCode).toBe('RATE_LIMIT');
      expect(parsed.retryable).toBe(true);
      expect(parsed.upstream?.statusCode).toBe(429);
      expect(parsed.upstream?.errorMessage).toBe('Too Many Requests');
    });

    it('should return unavailable with descriptive reason when data array is empty', async () => {
      vi.mocked(epClientModule.epClient.getProceduresFeed).mockResolvedValueOnce({
        data: [],
        '@context': ['https://example.org/ctx']
      });

      const result = await handleGetProceduresFeed({ timeframe: 'one-week' });

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        status: string;
        data: unknown[];
        items: unknown[];
        dataQualityWarnings: string[];
        reason: string;
        '@context': unknown[];
      };
      expect(parsed.status).toBe('unavailable');
      expect(parsed.data).toEqual([]);
      expect(parsed.items).toEqual([]);
      // Reason must mention the timeframe and the correct fallback (no year parameter)
      expect(parsed.reason).toContain('one-week');
      expect(parsed.reason).toContain('get_procedures');
      expect(parsed.reason).not.toContain('year');
      expect(parsed.dataQualityWarnings[0]).toContain('one-week');
      // Upstream @context must be preserved
      expect(parsed['@context']).toEqual(['https://example.org/ctx']);
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getProceduresFeedToolMetadata).toHaveProperty('name', 'get_procedures_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getProceduresFeedToolMetadata).toHaveProperty('description');
      expect(getProceduresFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with description containing slow endpoint warning', () => {
      expect(getProceduresFeedToolMetadata.description).toContain('120 seconds');
      expect(getProceduresFeedToolMetadata.description).toContain('get_procedures');
    });

    it('should export tool metadata with description documenting unavailable response', () => {
      expect(getProceduresFeedToolMetadata.description).toContain('unavailable');
      expect(getProceduresFeedToolMetadata.description).toContain('recess');
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getProceduresFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getProceduresFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getProceduresFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
