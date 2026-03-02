/**
 * Tests for get_mep_declarations_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetMEPDeclarationsFeed, getMEPDeclarationsFeedToolMetadata } from './getMEPDeclarationsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDeclarationsFeed: vi.fn(),
  }
}));

describe('get_mep_declarations_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPDeclarationsFeed).mockResolvedValue({
      data: [{ id: 'decl-1', type: 'Declaration' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetMEPDeclarationsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetMEPDeclarationsFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept workType parameter', async () => {
      const result = await handleGetMEPDeclarationsFeed({ workType: 'FINANCIAL' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetMEPDeclarationsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetMEPDeclarationsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetMEPDeclarationsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetMEPDeclarationsFeed({ timeframe: 'one-month' });

      expect(epClientModule.epClient.getMEPDeclarationsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'one-month' })
      );
    });

    it('should pass workType to client when provided', async () => {
      await handleGetMEPDeclarationsFeed({ workType: 'FINANCIAL' });

      expect(epClientModule.epClient.getMEPDeclarationsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ workType: 'FINANCIAL' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPDeclarationsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetMEPDeclarationsFeed({})).rejects.toThrow('API unavailable');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getMEPDeclarationsFeedToolMetadata).toHaveProperty('name', 'get_mep_declarations_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getMEPDeclarationsFeedToolMetadata).toHaveProperty('description');
      expect(getMEPDeclarationsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getMEPDeclarationsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getMEPDeclarationsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getMEPDeclarationsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
