/**
 * Tests for get_meps_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetMEPsFeed, getMEPsFeedToolMetadata } from './getMEPsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPsFeed: vi.fn(),
  }
}));

describe('get_meps_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPsFeed).mockResolvedValue({
      data: [{ id: 'person/123', type: 'Person', label: 'Test MEP' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetMEPsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetMEPsFeed({ timeframe: 'one-week' });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid startDate', async () => {
      const result = await handleGetMEPsFeed({ timeframe: 'custom', startDate: '2024-01-01' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetMEPsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetMEPsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetMEPsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetMEPsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getMEPsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });

    it('should pass startDate to client when provided', async () => {
      await handleGetMEPsFeed({ timeframe: 'custom', startDate: '2024-06-01' });

      expect(epClientModule.epClient.getMEPsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'custom', startDate: '2024-06-01' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetMEPsFeed({})).rejects.toThrow('Failed to retrieve MEPs feed');
    });

    it('should return empty feed on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getMEPsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetMEPsFeed({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        dataQualityWarnings: string[];
      };
      expect(parsed.data).toEqual([]);
      expect(parsed.dataQualityWarnings[0]).toContain('no data');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getMEPsFeedToolMetadata).toHaveProperty('name', 'get_meps_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getMEPsFeedToolMetadata).toHaveProperty('description');
      expect(getMEPsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getMEPsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getMEPsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getMEPsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });

  describe('Oversized payload warning (Defect #9 — full-census dump)', () => {
    /**
     * Regression for the Hack23/euparliamentmonitor 2026-04-24 breaking-run
     * audit §1.5: the upstream `/meps/feed` was returning a 33.6 MB payload
     * (~700 MEPs) — a full-census dump rather than a delta of recent
     * mandate changes. We now surface an OVERSIZED_PAYLOAD warning in
     * `dataQualityWarnings` when the item count crosses 200 so consumers
     * can detect the failure mode mechanically.
     */
    function makeMeps(count: number): unknown[] {
      return Array.from({ length: count }, (_, i) => ({ id: `mep-${String(i)}` }));
    }

    it('should NOT add OVERSIZED_PAYLOAD warning when item count is small (delta)', async () => {
      vi.mocked(epClientModule.epClient.getMEPsFeed).mockResolvedValueOnce({
        data: makeMeps(5),
        '@context': [],
      });

      const result = await handleGetMEPsFeed({});
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataQualityWarnings: string[];
        status: string;
      };
      expect(parsed.dataQualityWarnings.some((w) => w.startsWith('OVERSIZED_PAYLOAD'))).toBe(false);
      expect(parsed.status).toBe('operational');
    });

    it('should NOT add OVERSIZED_PAYLOAD warning at the threshold boundary (200 items)', async () => {
      vi.mocked(epClientModule.epClient.getMEPsFeed).mockResolvedValueOnce({
        data: makeMeps(200),
        '@context': [],
      });

      const result = await handleGetMEPsFeed({});
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataQualityWarnings: string[];
      };
      expect(parsed.dataQualityWarnings.some((w) => w.startsWith('OVERSIZED_PAYLOAD'))).toBe(false);
    });

    it('should add OVERSIZED_PAYLOAD warning when item count exceeds threshold (full-census dump)', async () => {
      vi.mocked(epClientModule.epClient.getMEPsFeed).mockResolvedValueOnce({
        data: makeMeps(700),
        '@context': [],
      });

      const result = await handleGetMEPsFeed({});
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataQualityWarnings: string[];
        status: string;
      };
      const warn = parsed.dataQualityWarnings.find((w) => w.startsWith('OVERSIZED_PAYLOAD'));
      expect(warn).toBeDefined();
      expect(warn).toContain('700');
      expect(warn).toContain('200'); // threshold
      expect(warn).toContain('get_meps');
      expect(parsed.status).toBe('degraded');
    });
  });
});
