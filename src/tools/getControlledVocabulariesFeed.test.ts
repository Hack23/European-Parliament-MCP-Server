/**
 * Tests for get_controlled_vocabularies_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetControlledVocabulariesFeed, getControlledVocabulariesFeedToolMetadata } from './getControlledVocabulariesFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getControlledVocabulariesFeed: vi.fn(),
  }
}));

describe('get_controlled_vocabularies_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getControlledVocabulariesFeed).mockResolvedValue({
      data: [{ id: 'voc-1', type: 'Vocabulary' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetControlledVocabulariesFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetControlledVocabulariesFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept startDate with custom timeframe', async () => {
      const result = await handleGetControlledVocabulariesFeed({ timeframe: 'custom', startDate: '2024-03-01' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetControlledVocabulariesFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetControlledVocabulariesFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetControlledVocabulariesFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetControlledVocabulariesFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getControlledVocabulariesFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getControlledVocabulariesFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetControlledVocabulariesFeed({})).rejects.toThrow('API unavailable');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getControlledVocabulariesFeedToolMetadata).toHaveProperty('name', 'get_controlled_vocabularies_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getControlledVocabulariesFeedToolMetadata).toHaveProperty('description');
      expect(getControlledVocabulariesFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getControlledVocabulariesFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getControlledVocabulariesFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getControlledVocabulariesFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
