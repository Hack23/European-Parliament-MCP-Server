/**
 * Tests for get_committee_documents_feed MCP tool (fixed-window feed)
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
      data: [{ id: 'item-1', type: 'Item' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments (fixed-window feed has no params)', async () => {
      const result = await handleGetCommitteeDocumentsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept informational-only common feed params without throwing INVALID_PARAMS', async () => {
      // Regression: issue #379 — all feed tools must accept the common
      // { timeframe, startDate, limit, offset } shape so consumers that model
      // "feeds" with a single type do not hard-fail on fixed-window feeds.
      const result = await handleGetCommitteeDocumentsFeed({
        timeframe: 'one-week',
        startDate: '2026-01-01',
        limit: 20,
        offset: 0,
      });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should silently ignore unknown extra keys (forward-compatible)', async () => {
      const result = await handleGetCommitteeDocumentsFeed({ unknownKey: 'future-param' } as unknown);
      expect(result).toHaveProperty('content');
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
    it('should call client with no arguments (fixed-window feed)', async () => {
      await handleGetCommitteeDocumentsFeed({});
      expect(epClientModule.epClient.getCommitteeDocumentsFeed).toHaveBeenCalledWith();
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocumentsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetCommitteeDocumentsFeed({})).rejects.toThrow('Failed to retrieve committee documents feed');
    });

    it('should return empty feed on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getCommitteeDocumentsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetCommitteeDocumentsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        dataQualityWarnings: string[];
      };
      expect(parsed.data).toEqual([]);
      expect(parsed.dataQualityWarnings.length).toBeGreaterThan(0);
    });

    it('should handle error-in-body response', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocumentsFeed).mockResolvedValue({
        '@id': 'https://data.europarl.europa.eu/eli/dl/test',
        'error': '404 Not Found from POST ...',
        '@context': { error: {} },
      } as unknown as { data: unknown[]; '@context': unknown[] });

      const result = await handleGetCommitteeDocumentsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        dataQualityWarnings: string[];
      };
      expect(parsed.data).toEqual([]);
      expect(parsed.dataQualityWarnings[0]).toContain('error-in-body');
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

    it('should export tool metadata with informational-only parameters (fixed-window feed)', () => {
      expect(getCommitteeDocumentsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getCommitteeDocumentsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      const props = getCommitteeDocumentsFeedToolMetadata.inputSchema.properties as Record<string, unknown>;
      expect(props).toHaveProperty('timeframe');
      expect(props).toHaveProperty('startDate');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });
  });
});
