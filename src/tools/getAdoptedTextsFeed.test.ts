/**
 * Tests for get_adopted_texts_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetAdoptedTextsFeed, getAdoptedTextsFeedToolMetadata } from './getAdoptedTextsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getAdoptedTextsFeed: vi.fn(),
  }
}));

describe('get_adopted_texts_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getAdoptedTextsFeed).mockResolvedValue({
      data: [{ id: 'text-1', type: 'AdoptedText' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetAdoptedTextsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetAdoptedTextsFeed({ timeframe: 'one-month' });
      expect(result).toHaveProperty('content');
    });

    it('should accept workType parameter', async () => {
      const result = await handleGetAdoptedTextsFeed({ workType: 'RESOLUTION' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetAdoptedTextsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetAdoptedTextsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetAdoptedTextsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetAdoptedTextsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getAdoptedTextsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });

    it('should pass workType to client when provided', async () => {
      await handleGetAdoptedTextsFeed({ workType: 'RESOLUTION' });

      expect(epClientModule.epClient.getAdoptedTextsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ workType: 'RESOLUTION' })
      );
    });

    it('should pass startDate to client with custom timeframe', async () => {
      await handleGetAdoptedTextsFeed({ timeframe: 'custom', startDate: '2024-01-01' });

      expect(epClientModule.epClient.getAdoptedTextsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'custom', startDate: '2024-01-01' })
      );
    });

    it('should not pass startDate when not provided', async () => {
      await handleGetAdoptedTextsFeed({ timeframe: 'one-week' });

      const callArgs = vi.mocked(epClientModule.epClient.getAdoptedTextsFeed).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('startDate');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getAdoptedTextsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetAdoptedTextsFeed({})).rejects.toThrow('Failed to retrieve adopted texts feed');
    });

    it('should return empty feed on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getAdoptedTextsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetAdoptedTextsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        feed: unknown[];
        dataQualityWarning: string;
      };
      expect(parsed.feed).toEqual([]);
      expect(parsed.dataQualityWarning).toContain('404');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getAdoptedTextsFeedToolMetadata).toHaveProperty('name', 'get_adopted_texts_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getAdoptedTextsFeedToolMetadata).toHaveProperty('description');
      expect(getAdoptedTextsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getAdoptedTextsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getAdoptedTextsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getAdoptedTextsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
