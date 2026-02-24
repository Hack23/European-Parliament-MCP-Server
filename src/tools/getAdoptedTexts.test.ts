/**
 * Tests for get_adopted_texts MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetAdoptedTexts, getAdoptedTextsToolMetadata } from './getAdoptedTexts.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getAdoptedTexts: vi.fn()
  }
}));

describe('get_adopted_texts Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue({
      data: [
        {
          id: 'TA-9-2024-0001',
          title: 'European Artificial Intelligence Act',
          reference: 'P9_TA(2024)0001',
          type: 'LEGISLATIVE_RESOLUTION',
          dateAdopted: '2024-03-13',
          procedureReference: '2023/0123(COD)',
          subjectMatter: 'Internal market'
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
      const result = await handleGetAdoptedTexts({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid year filter', async () => {
      const result = await handleGetAdoptedTexts({ year: 2024 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid limit and offset', async () => {
      const result = await handleGetAdoptedTexts({ limit: 25, offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject year below minimum', async () => {
      await expect(handleGetAdoptedTexts({ year: 1989 })).rejects.toThrow();
    });

    it('should reject year above maximum', async () => {
      await expect(handleGetAdoptedTexts({ year: 2041 })).rejects.toThrow();
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetAdoptedTexts({ limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetAdoptedTexts({ limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetAdoptedTexts({ offset: -1 })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetAdoptedTexts({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetAdoptedTexts({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response with adopted text data', async () => {
      const result = await handleGetAdoptedTexts({});
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
      vi.mocked(epClientModule.epClient.getAdoptedTexts)
        .mockRejectedValueOnce(new Error('Connection refused'));

      await expect(handleGetAdoptedTexts({})).rejects.toThrow('Connection refused');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetAdoptedTexts({ year: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass year filter to client when provided', async () => {
      await handleGetAdoptedTexts({ year: 2024, limit: 10 });

      expect(epClientModule.epClient.getAdoptedTexts).toHaveBeenCalledWith(
        expect.objectContaining({
          year: 2024,
          limit: 10,
          offset: 0
        })
      );
    });

    it('should not pass undefined year to client', async () => {
      await handleGetAdoptedTexts({ limit: 20 });

      const callArgs = vi.mocked(epClientModule.epClient.getAdoptedTexts).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('year');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getAdoptedTextsToolMetadata).toHaveProperty('name', 'get_adopted_texts');
    });

    it('should export tool metadata with description', () => {
      expect(getAdoptedTextsToolMetadata).toHaveProperty('description');
      expect(getAdoptedTextsToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getAdoptedTextsToolMetadata).toHaveProperty('inputSchema');
      expect(getAdoptedTextsToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getAdoptedTextsToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define year, limit, offset in schema', () => {
      const props = getAdoptedTextsToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('year');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });
  });
});
