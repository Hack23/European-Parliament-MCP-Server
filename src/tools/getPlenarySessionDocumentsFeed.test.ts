/**
 * Tests for get_plenary_session_documents_feed MCP tool
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
      data: [{ id: 'psdoc-1', type: 'PlenarySessionDocument' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetPlenarySessionDocumentsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetPlenarySessionDocumentsFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept startDate with custom timeframe', async () => {
      const result = await handleGetPlenarySessionDocumentsFeed({ timeframe: 'custom', startDate: '2024-03-01' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetPlenarySessionDocumentsFeed({ timeframe: 'invalid' })).rejects.toThrow();
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
    it('should pass timeframe to client', async () => {
      await handleGetPlenarySessionDocumentsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getPlenarySessionDocumentsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetPlenarySessionDocumentsFeed({})).rejects.toThrow('API unavailable');
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

    it('should export tool metadata with inputSchema', () => {
      expect(getPlenarySessionDocumentsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getPlenarySessionDocumentsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getPlenarySessionDocumentsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
