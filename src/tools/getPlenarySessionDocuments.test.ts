/**
 * Tests for get_plenary_session_documents MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetPlenarySessionDocuments, getPlenarySessionDocumentsToolMetadata } from './getPlenarySessionDocuments.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getPlenarySessionDocuments: vi.fn(),
    getPlenarySessionDocumentById: vi.fn()
  }
}));

describe('get_plenary_session_documents Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock for list endpoint
    vi.mocked(epClientModule.epClient.getPlenarySessionDocuments).mockResolvedValue({
      data: [
        {
          id: 'doc-1',
          type: 'REPORT',
          title: 'Test',
          date: '2024-01-01',
          authors: [],
          status: 'ADOPTED'
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });

    // Setup default mock for single document lookup
    vi.mocked(epClientModule.epClient.getPlenarySessionDocumentById).mockResolvedValue({
      id: 'doc-1',
      type: 'REPORT',
      title: 'Test',
      date: '2024-01-01',
      authors: [],
      status: 'ADOPTED'
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetPlenarySessionDocuments({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid limit', async () => {
      const result = await handleGetPlenarySessionDocuments({ limit: 25 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid offset', async () => {
      const result = await handleGetPlenarySessionDocuments({ offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetPlenarySessionDocuments({ limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetPlenarySessionDocuments({ limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetPlenarySessionDocuments({ offset: -1 })).rejects.toThrow();
    });

    it('should reject non-number limit', async () => {
      await expect(handleGetPlenarySessionDocuments({ limit: 'ten' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetPlenarySessionDocuments({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetPlenarySessionDocuments({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetPlenarySessionDocuments({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('offset');
      expect(data).toHaveProperty('hasMore');
    });
  });

  describe('Single Document Lookup', () => {
    it('should call getPlenarySessionDocumentById when docId is provided', async () => {
      const result = await handleGetPlenarySessionDocuments({ docId: 'doc-1' });

      expect(epClientModule.epClient.getPlenarySessionDocumentById).toHaveBeenCalledWith('doc-1');
      expect(epClientModule.epClient.getPlenarySessionDocuments).not.toHaveBeenCalled();
      expect(result).toHaveProperty('content');
    });

    it('should return single document data as valid JSON', async () => {
      const result = await handleGetPlenarySessionDocuments({ docId: 'doc-1' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      expect(data).toHaveProperty('id', 'doc-1');
      expect(data).toHaveProperty('type', 'REPORT');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getPlenarySessionDocuments)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetPlenarySessionDocuments({})).rejects.toThrow('API unavailable');
    });

    it('should propagate errors from single document lookup', async () => {
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentById)
        .mockRejectedValueOnce(new Error('Document not found'));

      await expect(handleGetPlenarySessionDocuments({ docId: 'bad-id' })).rejects.toThrow('Document not found');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetPlenarySessionDocuments({ limit: -5 })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass limit and offset to client', async () => {
      await handleGetPlenarySessionDocuments({ limit: 20, offset: 5 });

      expect(epClientModule.epClient.getPlenarySessionDocuments).toHaveBeenCalledWith({
        limit: 20,
        offset: 5
      });
    });

    it('should pass default values when not specified', async () => {
      await handleGetPlenarySessionDocuments({});

      expect(epClientModule.epClient.getPlenarySessionDocuments).toHaveBeenCalledWith({
        limit: 50,
        offset: 0
      });
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getPlenarySessionDocumentsToolMetadata).toHaveProperty('name', 'get_plenary_session_documents');
    });

    it('should export tool metadata with description', () => {
      expect(getPlenarySessionDocumentsToolMetadata).toHaveProperty('description');
      expect(getPlenarySessionDocumentsToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getPlenarySessionDocumentsToolMetadata).toHaveProperty('inputSchema');
      expect(getPlenarySessionDocumentsToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getPlenarySessionDocumentsToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define limit, offset, and docId properties in schema', () => {
      const props = getPlenarySessionDocumentsToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
      expect(props).toHaveProperty('docId');
    });
  });
});
