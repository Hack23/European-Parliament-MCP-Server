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
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getExternalDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetExternalDocumentsFeed({})).rejects.toThrow('API unavailable');
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
