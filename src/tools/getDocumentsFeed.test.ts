/**
 * Tests for get_documents_feed MCP tool
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
      data: [{ id: 'doc-1', type: 'Document' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetDocumentsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetDocumentsFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept startDate with custom timeframe', async () => {
      const result = await handleGetDocumentsFeed({ timeframe: 'custom', startDate: '2024-03-01' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetDocumentsFeed({ timeframe: 'invalid' })).rejects.toThrow();
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
    it('should pass timeframe to client', async () => {
      await handleGetDocumentsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getDocumentsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });

    it('should pass startDate to client when provided', async () => {
      await handleGetDocumentsFeed({ timeframe: 'custom', startDate: '2024-06-01' });

      expect(epClientModule.epClient.getDocumentsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'custom', startDate: '2024-06-01' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetDocumentsFeed({})).rejects.toThrow('API unavailable');
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

    it('should export tool metadata with inputSchema', () => {
      expect(getDocumentsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getDocumentsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getDocumentsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
