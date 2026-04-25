/**
 * Tests for get_adopted_texts_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetAdoptedTextsFeed, getAdoptedTextsFeedToolMetadata } from './getAdoptedTextsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getAdoptedTextsFeed: vi.fn(),
  }
}));

describe('get_adopted_texts_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getAdoptedTextsFeed).mockResolvedValue({
      data: [{ id: 'text-1', type: 'AdoptedText' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetAdoptedTextsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetAdoptedTextsFeed({ timeframe: 'one-month' });
      expect(result).toHaveProperty('content');
    });

    it('should accept workType parameter', async () => {
      const result = await handleGetAdoptedTextsFeed({ workType: 'RESOLUTION' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetAdoptedTextsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetAdoptedTextsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetAdoptedTextsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetAdoptedTextsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getAdoptedTextsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });

    it('should pass workType to client when provided', async () => {
      await handleGetAdoptedTextsFeed({ workType: 'RESOLUTION' });

      expect(epClientModule.epClient.getAdoptedTextsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ workType: 'RESOLUTION' })
      );
    });

    it('should pass startDate to client with custom timeframe', async () => {
      await handleGetAdoptedTextsFeed({ timeframe: 'custom', startDate: '2024-01-01' });

      expect(epClientModule.epClient.getAdoptedTextsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'custom', startDate: '2024-01-01' })
      );
    });

    it('should not pass startDate when not provided', async () => {
      await handleGetAdoptedTextsFeed({ timeframe: 'one-week' });

      const callArgs = vi.mocked(epClientModule.epClient.getAdoptedTextsFeed).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('startDate');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getAdoptedTextsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetAdoptedTextsFeed({})).rejects.toThrow('Failed to retrieve adopted texts feed');
    });

    it('should return empty feed on upstream 404', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getAdoptedTextsFeed)
        .mockRejectedValueOnce(new APIError('Not Found', 404));

      const result = await handleGetAdoptedTextsFeed({});

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
      expect(getAdoptedTextsFeedToolMetadata).toHaveProperty('name', 'get_adopted_texts_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getAdoptedTextsFeedToolMetadata).toHaveProperty('description');
      expect(getAdoptedTextsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getAdoptedTextsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getAdoptedTextsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getAdoptedTextsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });

  describe('Freshness fallback (Defect #7 — feed returns no current-year items)', () => {
    /**
     * Regression for the Hack23/euparliamentmonitor 2026-04-24 propositions
     * audit Defect #7 / breaking audit §1.2: the EP `/adopted-texts/feed`
     * endpoint has been observed returning historical backfill (TA-9-2024,
     * TA-10-2025) under `timeframe: today` for ≥ 8 consecutive days, with no
     * current-year items reaching consumers. The tool now augments the feed
     * payload with `/adopted-texts?year={currentYear}` whenever the feed
     * itself has no current-year items.
     */
    const currentYear = new Date().getUTCFullYear();

    beforeEach(() => {
      // Augment the existing mock with `getAdoptedTexts` (used by the
      // freshness-fallback path). Re-mock for isolation.
      vi.mocked(epClientModule.epClient.getAdoptedTextsFeed).mockReset();
    });

    it('should NOT trigger the fallback when the feed already has current-year items', async () => {
      vi.mocked(epClientModule.epClient.getAdoptedTextsFeed).mockResolvedValue({
        data: [
          { id: `TA-10-${String(currentYear)}-0001`, dateAdopted: `${String(currentYear)}-04-08`,
            title: 'Fresh', reference: '', type: '', procedureReference: '', subjectMatter: '' },
        ],
        '@context': [],
      });
      // getAdoptedTexts mock will throw if called — we don't expect it to be.
      const fakeClient = epClientModule.epClient as unknown as {
        getAdoptedTexts?: ReturnType<typeof vi.fn>;
      };
      fakeClient.getAdoptedTexts = vi.fn().mockRejectedValue(new Error('should not be called'));

      const result = await handleGetAdoptedTextsFeed({ timeframe: 'today' });
      const parsed = JSON.parse(result.content[0].text) as {
        dataQualityWarnings: string[];
      };
      expect(parsed.dataQualityWarnings.some((w) => w.startsWith('FRESHNESS_FALLBACK'))).toBe(false);
      expect(fakeClient.getAdoptedTexts).not.toHaveBeenCalled();
    });

    it('should augment with /adopted-texts?year={currentYear} when feed has no current-year items', async () => {
      // Feed returns historical backfill (no current-year items)
      vi.mocked(epClientModule.epClient.getAdoptedTextsFeed).mockResolvedValue({
        data: [
          { id: 'TA-9-2024-0314', dateAdopted: '2024-03-13',
            title: 'Old text', reference: '', type: '', procedureReference: '', subjectMatter: '' },
        ],
        '@context': [],
      });
      const augmentedItem = {
        id: `TA-10-${String(currentYear)}-0010`,
        dateAdopted: `${String(currentYear)}-04-20`,
        title: 'Augmented current-year item',
        reference: '',
        type: '',
        procedureReference: '',
        subjectMatter: '',
      };
      const fakeClient = epClientModule.epClient as unknown as {
        getAdoptedTexts: ReturnType<typeof vi.fn>;
      };
      fakeClient.getAdoptedTexts = vi.fn().mockResolvedValue({
        data: [augmentedItem],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false,
      });

      const result = await handleGetAdoptedTextsFeed({ timeframe: 'today' });
      const parsed = JSON.parse(result.content[0].text) as {
        items: Array<{ id: string }>;
        dataQualityWarnings: string[];
      };
      // Augmented item must appear before the legacy backfill
      expect(parsed.items[0]?.id).toBe(augmentedItem.id);
      expect(parsed.items.some((i) => i.id === 'TA-9-2024-0314')).toBe(true);
      expect(parsed.dataQualityWarnings.some((w) => w.startsWith('FRESHNESS_FALLBACK'))).toBe(true);
      expect(fakeClient.getAdoptedTexts).toHaveBeenCalledWith(
        expect.objectContaining({ year: currentYear }),
      );
    });

    it('should surface FRESHNESS_FALLBACK_FAILED when both feed and fallback are empty', async () => {
      vi.mocked(epClientModule.epClient.getAdoptedTextsFeed).mockResolvedValue({
        data: [],
        '@context': [],
      });
      const fakeClient = epClientModule.epClient as unknown as {
        getAdoptedTexts: ReturnType<typeof vi.fn>;
      };
      fakeClient.getAdoptedTexts = vi.fn().mockRejectedValue(new Error('upstream 502'));

      const result = await handleGetAdoptedTextsFeed({ timeframe: 'today' });
      const parsed = JSON.parse(result.content[0].text) as {
        dataQualityWarnings: string[];
      };
      expect(parsed.dataQualityWarnings.some((w) => w.startsWith('FRESHNESS_FALLBACK_FAILED'))).toBe(true);
    });
  });
});
