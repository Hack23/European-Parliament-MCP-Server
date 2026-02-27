/**
 * Tests for get_meeting_plenary_session_documents MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetMeetingPlenarySessionDocuments, getMeetingPlenarySessionDocumentsToolMetadata } from './getMeetingPlenarySessionDocuments.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMeetingPlenarySessionDocuments: vi.fn()
  }
}));

describe('get_meeting_plenary_session_documents Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getMeetingPlenarySessionDocuments).mockResolvedValue({
      data: [
        {
          id: 'doc-1',
          title: 'Session Document 1',
          type: 'REPORT',
          date: '2024-01-15',
          reference: 'A9-0001/2024',
          url: 'https://europarl.europa.eu/doc/doc-1'
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept valid sittingId with defaults', async () => {
      const result = await handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid limit with sittingId', async () => {
      const result = await handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1', limit: 25 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid offset with sittingId', async () => {
      const result = await handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1', offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject missing sittingId', async () => {
      await expect(handleGetMeetingPlenarySessionDocuments({})).rejects.toThrow();
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1', limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1', limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1', offset: -1 })).rejects.toThrow();
    });

    it('should reject non-number limit', async () => {
      await expect(handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1', limit: 'ten' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1' });
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
      vi.mocked(epClientModule.epClient.getMeetingPlenarySessionDocuments)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1' })).rejects.toThrow('API unavailable');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1', limit: -5 })).rejects.toThrow();
    });

    it('should throw when required sittingId is missing', async () => {
      await expect(handleGetMeetingPlenarySessionDocuments({})).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass sittingId, limit and offset to client', async () => {
      await handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1', limit: 20, offset: 5 });

      expect(epClientModule.epClient.getMeetingPlenarySessionDocuments).toHaveBeenCalledWith('sitting-1', {
        limit: 20,
        offset: 5
      });
    });

    it('should pass default pagination values when not specified', async () => {
      await handleGetMeetingPlenarySessionDocuments({ sittingId: 'sitting-1' });

      expect(epClientModule.epClient.getMeetingPlenarySessionDocuments).toHaveBeenCalledWith('sitting-1', {
        limit: 50,
        offset: 0
      });
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getMeetingPlenarySessionDocumentsToolMetadata).toHaveProperty('name', 'get_meeting_plenary_session_documents');
    });

    it('should export tool metadata with description', () => {
      expect(getMeetingPlenarySessionDocumentsToolMetadata).toHaveProperty('description');
      expect(getMeetingPlenarySessionDocumentsToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getMeetingPlenarySessionDocumentsToolMetadata).toHaveProperty('inputSchema');
      expect(getMeetingPlenarySessionDocumentsToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getMeetingPlenarySessionDocumentsToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define sittingId, limit and offset properties in schema', () => {
      const props = getMeetingPlenarySessionDocumentsToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('sittingId');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });

    it('should require sittingId in schema', () => {
      expect(getMeetingPlenarySessionDocumentsToolMetadata.inputSchema).toHaveProperty('required');
      expect(getMeetingPlenarySessionDocumentsToolMetadata.inputSchema.required).toContain('sittingId');
    });
  });
});
