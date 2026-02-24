/**
 * Tests for get_controlled_vocabularies MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetControlledVocabularies, getControlledVocabulariesToolMetadata } from './getControlledVocabularies.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getControlledVocabularies: vi.fn(),
    getControlledVocabularyById: vi.fn()
  }
}));

describe('get_controlled_vocabularies Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock for list endpoint
    vi.mocked(epClientModule.epClient.getControlledVocabularies).mockResolvedValue({
      data: [
        {
          id: 'voc-1',
          label: 'Test Vocabulary'
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });

    // Setup default mock for single vocabulary lookup
    vi.mocked(epClientModule.epClient.getControlledVocabularyById).mockResolvedValue({
      id: 'voc-1',
      label: 'Test Vocabulary'
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetControlledVocabularies({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid limit', async () => {
      const result = await handleGetControlledVocabularies({ limit: 25 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid offset', async () => {
      const result = await handleGetControlledVocabularies({ offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetControlledVocabularies({ limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetControlledVocabularies({ limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetControlledVocabularies({ offset: -1 })).rejects.toThrow();
    });

    it('should reject non-number limit', async () => {
      await expect(handleGetControlledVocabularies({ limit: 'ten' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetControlledVocabularies({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetControlledVocabularies({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetControlledVocabularies({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('offset');
      expect(data).toHaveProperty('hasMore');
    });
  });

  describe('Single Vocabulary Lookup', () => {
    it('should call getControlledVocabularyById when vocId is provided', async () => {
      const result = await handleGetControlledVocabularies({ vocId: 'voc-1' });

      expect(epClientModule.epClient.getControlledVocabularyById).toHaveBeenCalledWith('voc-1');
      expect(epClientModule.epClient.getControlledVocabularies).not.toHaveBeenCalled();
      expect(result).toHaveProperty('content');
    });

    it('should return single vocabulary data as valid JSON', async () => {
      const result = await handleGetControlledVocabularies({ vocId: 'voc-1' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      expect(data).toHaveProperty('id', 'voc-1');
      expect(data).toHaveProperty('label', 'Test Vocabulary');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getControlledVocabularies)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetControlledVocabularies({})).rejects.toThrow('API unavailable');
    });

    it('should propagate errors from single vocabulary lookup', async () => {
      vi.mocked(epClientModule.epClient.getControlledVocabularyById)
        .mockRejectedValueOnce(new Error('Vocabulary not found'));

      await expect(handleGetControlledVocabularies({ vocId: 'bad-id' })).rejects.toThrow('Vocabulary not found');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetControlledVocabularies({ limit: -5 })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass limit and offset to client', async () => {
      await handleGetControlledVocabularies({ limit: 20, offset: 5 });

      expect(epClientModule.epClient.getControlledVocabularies).toHaveBeenCalledWith({
        limit: 20,
        offset: 5
      });
    });

    it('should pass default values when not specified', async () => {
      await handleGetControlledVocabularies({});

      expect(epClientModule.epClient.getControlledVocabularies).toHaveBeenCalledWith({
        limit: 50,
        offset: 0
      });
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getControlledVocabulariesToolMetadata).toHaveProperty('name', 'get_controlled_vocabularies');
    });

    it('should export tool metadata with description', () => {
      expect(getControlledVocabulariesToolMetadata).toHaveProperty('description');
      expect(getControlledVocabulariesToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getControlledVocabulariesToolMetadata).toHaveProperty('inputSchema');
      expect(getControlledVocabulariesToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getControlledVocabulariesToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define limit, offset, and vocId properties in schema', () => {
      const props = getControlledVocabulariesToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
      expect(props).toHaveProperty('vocId');
    });
  });
});
