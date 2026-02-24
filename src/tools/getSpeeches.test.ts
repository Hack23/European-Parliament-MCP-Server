/**
 * Tests for get_speeches MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetSpeeches, getSpeechesToolMetadata } from './getSpeeches.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getSpeeches: vi.fn()
  }
}));

describe('get_speeches Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getSpeeches).mockResolvedValue({
      data: [
        {
          id: 'speech/001',
          title: 'Debate on AI regulation',
          speakerId: 'person/124936',
          speakerName: 'Jane Andersson',
          date: '2024-03-15',
          type: 'DEBATE_SPEECH',
          language: 'en',
          text: 'We must ensure AI is regulated responsibly.',
          sessionReference: 'event/MTG-PL-2024-03-15'
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetSpeeches({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid date range', async () => {
      const result = await handleGetSpeeches({
        dateFrom: '2024-01-01',
        dateTo: '2024-06-30'
      });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid limit and offset', async () => {
      const result = await handleGetSpeeches({ limit: 25, offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetSpeeches({ limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetSpeeches({ limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetSpeeches({ offset: -1 })).rejects.toThrow();
    });

    it('should reject invalid date format', async () => {
      await expect(handleGetSpeeches({ dateFrom: '01-01-2024' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetSpeeches({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetSpeeches({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response with speech data', async () => {
      const result = await handleGetSpeeches({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('offset');
      expect(data).toHaveProperty('hasMore');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getSpeeches)
        .mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(handleGetSpeeches({})).rejects.toThrow('Service unavailable');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetSpeeches({ limit: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass date filters to client when provided', async () => {
      await handleGetSpeeches({ dateFrom: '2024-01-01', dateTo: '2024-06-30', limit: 10, offset: 5 });

      expect(epClientModule.epClient.getSpeeches).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: '2024-01-01',
          dateTo: '2024-06-30',
          limit: 10,
          offset: 5
        })
      );
    });

    it('should not pass undefined date filters to client', async () => {
      await handleGetSpeeches({ limit: 20 });

      const callArgs = vi.mocked(epClientModule.epClient.getSpeeches).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('dateFrom');
      expect(callArgs).not.toHaveProperty('dateTo');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getSpeechesToolMetadata).toHaveProperty('name', 'get_speeches');
    });

    it('should export tool metadata with description', () => {
      expect(getSpeechesToolMetadata).toHaveProperty('description');
      expect(getSpeechesToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getSpeechesToolMetadata).toHaveProperty('inputSchema');
      expect(getSpeechesToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getSpeechesToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define dateFrom, dateTo, limit, offset in schema', () => {
      const props = getSpeechesToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('dateFrom');
      expect(props).toHaveProperty('dateTo');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });
  });
});
