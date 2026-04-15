/**
 * Tests for get_documents_feed MCP tool (fixed-window feed)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetDocumentsFeed, getDocumentsFeedToolMetadata } from './getDocumentsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getDocumentsFeed: vi.fn(),
  }
}));

describe('get_documents_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getDocumentsFeed).mockResolvedValue({
      data: [{ id: 'item-1', type: 'Item' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments (fixed-window feed has no params)', async () => {
      const result = await handleGetDocumentsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetDocumentsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetDocumentsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should call client with no arguments (fixed-window feed)', async () => {
      await handleGetDocumentsFeed({});
      expect(epClientModule.epClient.getDocumentsFeed).toHaveBeenCalledWith();
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetDocumentsFeed({})).rejects.toThrow('Failed to retrieve documents feed');
    });

    it('should return empty feed on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getDocumentsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetDocumentsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        dataQualityWarnings: string[];
      };
      expect(parsed.data).toEqual([]);
      expect(parsed.dataQualityWarnings.length).toBeGreaterThan(0);
    });

    it('should handle error-in-body response', async () => {
      vi.mocked(epClientModule.epClient.getDocumentsFeed).mockResolvedValue({
        '@id': 'https://data.europarl.europa.eu/eli/dl/test',
        'error': '404 Not Found from POST ...',
        '@context': { error: {} },
      } as unknown as { data: unknown[]; '@context': unknown[] });

      const result = await handleGetDocumentsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        dataQualityWarnings: string[];
      };
      expect(parsed.data).toEqual([]);
      expect(parsed.dataQualityWarnings[0]).toContain('error-in-body');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getDocumentsFeedToolMetadata).toHaveProperty('name', 'get_documents_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getDocumentsFeedToolMetadata).toHaveProperty('description');
      expect(getDocumentsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with empty inputSchema (fixed-window feed)', () => {
      expect(getDocumentsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getDocumentsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getDocumentsFeedToolMetadata.inputSchema.properties).toEqual({});
    });
  });
});
