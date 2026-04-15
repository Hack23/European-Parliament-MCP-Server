/**
 * Tests for get_plenary_session_documents_feed MCP tool (fixed-window feed)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetPlenarySessionDocumentsFeed, getPlenarySessionDocumentsFeedToolMetadata } from './getPlenarySessionDocumentsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getPlenarySessionDocumentsFeed: vi.fn(),
  }
}));

describe('get_plenary_session_documents_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getPlenarySessionDocumentsFeed).mockResolvedValue({
      data: [{ id: 'item-1', type: 'Item' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments (fixed-window feed has no params)', async () => {
      const result = await handleGetPlenarySessionDocumentsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetPlenarySessionDocumentsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetPlenarySessionDocumentsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should call client with no arguments (fixed-window feed)', async () => {
      await handleGetPlenarySessionDocumentsFeed({});
      expect(epClientModule.epClient.getPlenarySessionDocumentsFeed).toHaveBeenCalledWith();
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetPlenarySessionDocumentsFeed({})).rejects.toThrow('Failed to retrieve plenary session documents feed');
    });

    it('should return empty feed on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetPlenarySessionDocumentsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        dataQualityWarnings: string[];
      };
      expect(parsed.data).toEqual([]);
      expect(parsed.dataQualityWarnings.length).toBeGreaterThan(0);
    });

    it('should handle error-in-body response', async () => {
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentsFeed).mockResolvedValue({
        '@id': 'https://data.europarl.europa.eu/eli/dl/test',
        'error': '404 Not Found from POST ...',
        '@context': { error: {} },
      } as unknown as { data: unknown[]; '@context': unknown[] });

      const result = await handleGetPlenarySessionDocumentsFeed({});

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
      expect(getPlenarySessionDocumentsFeedToolMetadata).toHaveProperty('name', 'get_plenary_session_documents_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getPlenarySessionDocumentsFeedToolMetadata).toHaveProperty('description');
      expect(getPlenarySessionDocumentsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with empty inputSchema (fixed-window feed)', () => {
      expect(getPlenarySessionDocumentsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getPlenarySessionDocumentsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getPlenarySessionDocumentsFeedToolMetadata.inputSchema.properties).toEqual({});
    });
  });
});
