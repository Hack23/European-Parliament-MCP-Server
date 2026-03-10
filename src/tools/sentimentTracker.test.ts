/**
 * Tests for sentiment_tracker MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSentimentTracker } from './sentimentTracker.js';
import * as mepFetcherModule from '../utils/mepFetcher.js';

// Mock the MEP fetcher utility
vi.mock('../utils/mepFetcher.js', () => ({
  fetchAllCurrentMEPs: vi.fn()
}));

const makeMEPList = (count: number, group: string) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${group}-MEP-${String(i)}`,
    name: `MEP ${String(i)} ${group}`,
    country: 'DE',
    politicalGroup: group,
    committees: [],
    active: true as const,
    termStart: '2019-07-02'
  }));

describe('sentiment_tracker Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Build a full parliament for in-memory grouping.
    // The tool calls fetchAllCurrentMEPs() once to get all MEPs.
    const allMeps = [
      ...makeMEPList(180, 'EPP'),
      ...makeMEPList(136, 'S&D'),
      ...makeMEPList(77, 'Renew'),
      ...makeMEPList(53, 'Greens/EFA'),
      ...makeMEPList(78, 'ECR'),
      ...makeMEPList(49, 'ID'),
      ...makeMEPList(37, 'GUE/NGL'),
      ...makeMEPList(44, 'NI')
    ];

    vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue(allMeps);
  });

  describe('Input Validation', () => {
    it('should accept empty params', async () => {
      const result = await handleSentimentTracker({});
      expect(result).toHaveProperty('content');
    });

    it('should accept groupId param', async () => {
      const result = await handleSentimentTracker({ groupId: 'EPP' });
      expect(result).toHaveProperty('content');
    });

    it('should accept timeframe param', async () => {
      const result = await handleSentimentTracker({ timeframe: 'last_year' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe', async () => {
      await expect(handleSentimentTracker({ timeframe: 'last_decade' })).rejects.toThrow();
    });

    it('should reject empty groupId', async () => {
      await expect(handleSentimentTracker({ groupId: '' })).rejects.toThrow();
    });
  });

  describe('Response Structure', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleSentimentTracker({});
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleSentimentTracker({});
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
    });

    it('should include required fields', async () => {
      const result = await handleSentimentTracker({});
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('groupSentiments');
      expect(data).toHaveProperty('polarizationIndex');
      expect(data).toHaveProperty('consensusTopics');
      expect(data).toHaveProperty('divisiveTopics');
      expect(data).toHaveProperty('sentimentShifts');
      expect(data).toHaveProperty('overallParliamentSentiment');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('dataAvailable');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('dataFreshness');
      expect(data).toHaveProperty('sourceAttribution');
      expect(data).toHaveProperty('methodology');
    });

    it('should include computedAttributes fields', async () => {
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('mostPositiveGroup');
      expect(data.computedAttributes).toHaveProperty('mostNegativeGroup');
      expect(data.computedAttributes).toHaveProperty('highestVolatility');
      expect(data.computedAttributes).toHaveProperty('trendingSentiment');
      expect(data.computedAttributes).toHaveProperty('bimodalityIndex');
    });

    it('should return sentiment scores in -1 to 1 range', async () => {
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupSentiments: { sentimentScore: number }[];
      };

      for (const g of data.groupSentiments) {
        expect(g.sentimentScore).toBeGreaterThanOrEqual(-1);
        expect(g.sentimentScore).toBeLessThanOrEqual(1);
      }
    });

    it('should return polarizationIndex in 0-1 range', async () => {
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { polarizationIndex: number };
      expect(data.polarizationIndex).toBeGreaterThanOrEqual(0);
      expect(data.polarizationIndex).toBeLessThanOrEqual(1);
    });

    it('should have correct sourceAttribution', async () => {
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { sourceAttribution: string };
      expect(data.sourceAttribution).toBe('European Parliament Open Data Portal - data.europarl.europa.eu');
    });

  });

  describe('dataAvailable: false scenario', () => {
    it('should return dataAvailable false when no MEPs returned', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue([]);

      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataAvailable: boolean;
        confidenceLevel: string;
      };

      expect(data.dataAvailable).toBe(false);
      expect(data.confidenceLevel).toBe('LOW');
    });
  });

  describe('Error Handling', () => {
    it('should return error response on API failure', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockRejectedValue(new Error('API Error'));

      const result = await handleSentimentTracker({});
      expect(result.isError).toBe(true);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockRejectedValue('string error');

      const result = await handleSentimentTracker({});
      expect(result.isError).toBe(true);
    });
  });

  describe('Single Group Analysis', () => {
    it('should return only one group sentiment when groupId specified', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue(makeMEPList(100, 'EPP'));

      const result = await handleSentimentTracker({ groupId: 'EPP' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupSentiments: unknown[];
      };

      expect(data.groupSentiments).toHaveLength(1);
    });
  });
});
