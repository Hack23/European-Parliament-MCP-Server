/**
 * Tests for get_procedures_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetProceduresFeed, getProceduresFeedToolMetadata } from './getProceduresFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProceduresFeed: vi.fn(),
  }
}));

describe('get_procedures_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getProceduresFeed).mockResolvedValue({
      data: [{ id: 'proc-1', type: 'Procedure' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetProceduresFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetProceduresFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept processType parameter', async () => {
      const result = await handleGetProceduresFeed({ processType: 'COD' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetProceduresFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetProceduresFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetProceduresFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetProceduresFeed({ timeframe: 'one-day' });

      expect(epClientModule.epClient.getProceduresFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'one-day' })
      );
    });

    it('should pass processType to client when provided', async () => {
      await handleGetProceduresFeed({ processType: 'COD' });

      expect(epClientModule.epClient.getProceduresFeed).toHaveBeenCalledWith(
        expect.objectContaining({ processType: 'COD' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getProceduresFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetProceduresFeed({})).rejects.toThrow('API unavailable');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getProceduresFeedToolMetadata).toHaveProperty('name', 'get_procedures_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getProceduresFeedToolMetadata).toHaveProperty('description');
      expect(getProceduresFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getProceduresFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getProceduresFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getProceduresFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
