/**
 * Tests for get_committee_documents MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetCommitteeDocuments, getCommitteeDocumentsToolMetadata } from './getCommitteeDocuments.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCommitteeDocuments: vi.fn(),
    getCommitteeDocumentById: vi.fn()
  }
}));

describe('get_committee_documents Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock for list endpoint
    vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue({
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
    vi.mocked(epClientModule.epClient.getCommitteeDocumentById).mockResolvedValue({
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
      const result = await handleGetCommitteeDocuments({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid limit', async () => {
      const result = await handleGetCommitteeDocuments({ limit: 25 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid offset', async () => {
      const result = await handleGetCommitteeDocuments({ offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetCommitteeDocuments({ limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetCommitteeDocuments({ limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetCommitteeDocuments({ offset: -1 })).rejects.toThrow();
    });

    it('should reject non-number limit', async () => {
      await expect(handleGetCommitteeDocuments({ limit: 'ten' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetCommitteeDocuments({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetCommitteeDocuments({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetCommitteeDocuments({});
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
    it('should call getCommitteeDocumentById when docId is provided', async () => {
      const result = await handleGetCommitteeDocuments({ docId: 'doc-1' });

      expect(epClientModule.epClient.getCommitteeDocumentById).toHaveBeenCalledWith('doc-1');
      expect(epClientModule.epClient.getCommitteeDocuments).not.toHaveBeenCalled();
      expect(result).toHaveProperty('content');
    });

    it('should return single document data as valid JSON', async () => {
      const result = await handleGetCommitteeDocuments({ docId: 'doc-1' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      expect(data).toHaveProperty('id', 'doc-1');
      expect(data).toHaveProperty('type', 'REPORT');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocuments)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetCommitteeDocuments({})).rejects.toThrow('API unavailable');
    });

    it('should propagate errors from single document lookup', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocumentById)
        .mockRejectedValueOnce(new Error('Document not found'));

      await expect(handleGetCommitteeDocuments({ docId: 'bad-id' })).rejects.toThrow('Document not found');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetCommitteeDocuments({ limit: -5 })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass limit and offset to client', async () => {
      await handleGetCommitteeDocuments({ limit: 20, offset: 5 });

      expect(epClientModule.epClient.getCommitteeDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20, offset: 5 })
      );
    });

    it('should pass default values when not specified', async () => {
      await handleGetCommitteeDocuments({});

      expect(epClientModule.epClient.getCommitteeDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50, offset: 0 })
      );
    });

    it('should pass year filter when specified', async () => {
      await handleGetCommitteeDocuments({ year: 2024 });

      expect(epClientModule.epClient.getCommitteeDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2024 })
      );
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getCommitteeDocumentsToolMetadata).toHaveProperty('name', 'get_committee_documents');
    });

    it('should export tool metadata with description', () => {
      expect(getCommitteeDocumentsToolMetadata).toHaveProperty('description');
      expect(getCommitteeDocumentsToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getCommitteeDocumentsToolMetadata).toHaveProperty('inputSchema');
      expect(getCommitteeDocumentsToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getCommitteeDocumentsToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define limit, offset, and docId properties in schema', () => {
      const props = getCommitteeDocumentsToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
      expect(props).toHaveProperty('docId');
    });
  });
});
