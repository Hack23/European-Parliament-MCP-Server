/**
 * Tests for get_corporate_bodies_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetCorporateBodiesFeed, getCorporateBodiesFeedToolMetadata } from './getCorporateBodiesFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCorporateBodiesFeed: vi.fn(),
  }
}));

describe('get_corporate_bodies_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getCorporateBodiesFeed).mockResolvedValue({
      data: [{ id: 'cb-1', type: 'CorporateBody' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetCorporateBodiesFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetCorporateBodiesFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept startDate with custom timeframe', async () => {
      const result = await handleGetCorporateBodiesFeed({ timeframe: 'custom', startDate: '2024-03-01' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetCorporateBodiesFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetCorporateBodiesFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetCorporateBodiesFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetCorporateBodiesFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getCorporateBodiesFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getCorporateBodiesFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetCorporateBodiesFeed({})).rejects.toThrow('API unavailable');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getCorporateBodiesFeedToolMetadata).toHaveProperty('name', 'get_corporate_bodies_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getCorporateBodiesFeedToolMetadata).toHaveProperty('description');
      expect(getCorporateBodiesFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getCorporateBodiesFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getCorporateBodiesFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getCorporateBodiesFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
