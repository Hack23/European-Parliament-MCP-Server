/**
 * Tests for get_committee_documents_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetCommitteeDocumentsFeed, getCommitteeDocumentsFeedToolMetadata } from './getCommitteeDocumentsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCommitteeDocumentsFeed: vi.fn(),
  }
}));

describe('get_committee_documents_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getCommitteeDocumentsFeed).mockResolvedValue({
      data: [{ id: 'cdoc-1', type: 'CommitteeDocument' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetCommitteeDocumentsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetCommitteeDocumentsFeed({ timeframe: 'one-month' });
      expect(result).toHaveProperty('content');
    });

    it('should accept startDate with custom timeframe', async () => {
      const result = await handleGetCommitteeDocumentsFeed({ timeframe: 'custom', startDate: '2024-03-01' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetCommitteeDocumentsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetCommitteeDocumentsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetCommitteeDocumentsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetCommitteeDocumentsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getCommitteeDocumentsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetCommitteeDocumentsFeed({})).rejects.toThrow('API unavailable');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getCommitteeDocumentsFeedToolMetadata).toHaveProperty('name', 'get_committee_documents_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getCommitteeDocumentsFeedToolMetadata).toHaveProperty('description');
      expect(getCommitteeDocumentsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getCommitteeDocumentsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getCommitteeDocumentsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getCommitteeDocumentsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
