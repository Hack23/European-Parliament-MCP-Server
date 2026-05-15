/**
 * Tests for get_external_documents_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetExternalDocumentsFeed, getExternalDocumentsFeedToolMetadata } from './getExternalDocumentsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getExternalDocumentsFeed: vi.fn(),
  }
}));

interface ExternalDocumentsFeedResponse {
  status: string;
  items: unknown[];
  itemCount: number;
  reason?: string;
  data: unknown[];
  '@context': unknown;
  dataQualityWarnings: string[];
  dataQualityDiagnostics?: {
    endpoint: string;
    requestedWindow: {
      timeframe: string;
      startDate?: string;
      workType?: string;
    };
    emptyResultAmbiguity: string;
    freshnessStatus: string;
    fallbackTool: string;
    fallbackArguments: {
      limit: number;
    };
  };
}

describe('get_external_documents_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getExternalDocumentsFeed).mockResolvedValue({
      data: [{ id: 'edoc-1', type: 'ExternalDocument' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetExternalDocumentsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetExternalDocumentsFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept workType parameter', async () => {
      const result = await handleGetExternalDocumentsFeed({ workType: 'REPORT' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetExternalDocumentsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetExternalDocumentsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetExternalDocumentsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should mark active-window non-empty results as operational', async () => {
      const result = await handleGetExternalDocumentsFeed({ timeframe: 'one-week' });

      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as ExternalDocumentsFeedResponse;
      expect(parsed.status).toBe('operational');
      expect(parsed.itemCount).toBe(1);
      expect(parsed.items).toEqual([{ id: 'edoc-1', type: 'ExternalDocument' }]);
      expect(parsed.data).toEqual(parsed.items);
      expect(parsed.dataQualityWarnings).toEqual([]);
      expect(parsed.reason).toBeUndefined();
      expect(parsed.dataQualityDiagnostics).toBeUndefined();
    });

    it('should mark zero-item active-window results as unavailable with freshness diagnostics', async () => {
      vi.mocked(epClientModule.epClient.getExternalDocumentsFeed).mockResolvedValueOnce({
        data: [],
        '@context': ['external-documents-context']
      });

      const result = await handleGetExternalDocumentsFeed({
        timeframe: 'one-week',
        startDate: '2026-05-01',
        workType: 'REPORT',
      });

      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as ExternalDocumentsFeedResponse;
      expect(parsed.status).toBe('unavailable');
      expect(parsed.itemCount).toBe(0);
      expect(parsed.data).toEqual([]);
      expect(parsed['@context']).toEqual(['external-documents-context']);
      expect(parsed.reason).toContain('feed freshness/ordering lag');
      expect(parsed.dataQualityWarnings).toContain(parsed.reason);
      expect(parsed.dataQualityDiagnostics).toEqual({
        endpoint: 'external-documents/feed',
        requestedWindow: {
          timeframe: 'one-week',
          startDate: '2026-05-01',
          workType: 'REPORT',
        },
        emptyResultAmbiguity: 'true-empty-or-feed-freshness-lag',
        freshnessStatus: 'unknown',
        fallbackTool: 'get_external_documents',
        fallbackArguments: { limit: 20 },
      });
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetExternalDocumentsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getExternalDocumentsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });

    it('should pass workType to client when provided', async () => {
      await handleGetExternalDocumentsFeed({ workType: 'REPORT' });

      expect(epClientModule.epClient.getExternalDocumentsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ workType: 'REPORT' })
      );
    });

    it('should pass startDate to client with custom timeframe', async () => {
      await handleGetExternalDocumentsFeed({ timeframe: 'custom', startDate: '2024-03-15' });

      expect(epClientModule.epClient.getExternalDocumentsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'custom', startDate: '2024-03-15' })
      );
    });

    it('should not pass startDate when not provided', async () => {
      await handleGetExternalDocumentsFeed({ timeframe: 'one-week' });

      const callArgs = vi.mocked(epClientModule.epClient.getExternalDocumentsFeed).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('startDate');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getExternalDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetExternalDocumentsFeed({})).rejects.toThrow('Failed to retrieve external documents feed');
    });

    it('should return empty feed on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getExternalDocumentsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetExternalDocumentsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        dataQualityDiagnostics: ExternalDocumentsFeedResponse['dataQualityDiagnostics'];
        dataQualityWarnings: string[];
      };
      expect(parsed.data).toEqual([]);
      expect(parsed.dataQualityWarnings[0]).toContain('zero items');
      expect(parsed.dataQualityDiagnostics?.emptyResultAmbiguity).toBe('true-empty-or-feed-freshness-lag');
      expect(parsed.dataQualityDiagnostics?.fallbackTool).toBe('get_external_documents');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getExternalDocumentsFeedToolMetadata).toHaveProperty('name', 'get_external_documents_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getExternalDocumentsFeedToolMetadata).toHaveProperty('description');
      expect(getExternalDocumentsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getExternalDocumentsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getExternalDocumentsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getExternalDocumentsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
