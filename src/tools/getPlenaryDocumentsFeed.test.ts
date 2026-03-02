/**
 * Tests for get_plenary_documents_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetPlenaryDocumentsFeed, getPlenaryDocumentsFeedToolMetadata } from './getPlenaryDocumentsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getPlenaryDocumentsFeed: vi.fn(),
  }
}));

describe('get_plenary_documents_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getPlenaryDocumentsFeed).mockResolvedValue({
      data: [{ id: 'pdoc-1', type: 'PlenaryDocument' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetPlenaryDocumentsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetPlenaryDocumentsFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept startDate with custom timeframe', async () => {
      const result = await handleGetPlenaryDocumentsFeed({ timeframe: 'custom', startDate: '2024-03-01' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetPlenaryDocumentsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetPlenaryDocumentsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetPlenaryDocumentsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetPlenaryDocumentsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getPlenaryDocumentsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getPlenaryDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetPlenaryDocumentsFeed({})).rejects.toThrow('API unavailable');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getPlenaryDocumentsFeedToolMetadata).toHaveProperty('name', 'get_plenary_documents_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getPlenaryDocumentsFeedToolMetadata).toHaveProperty('description');
      expect(getPlenaryDocumentsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getPlenaryDocumentsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getPlenaryDocumentsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getPlenaryDocumentsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
