/**
 * Tests for sentiment_tracker MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleSentimentTracker,
  clearSentimentTrackerDoceoCache,
} from './sentimentTracker.js';
import * as mepFetcherModule from '../utils/mepFetcher.js';
import * as doceoClientModule from '../clients/ep/doceoClient.js';
import type { LatestVoteRecord } from '../clients/ep/doceoXmlParser.js';

vi.mock('../utils/mepFetcher.js', () => ({
  fetchAllCurrentMEPs: vi.fn()
}));

vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn()
  }
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

interface VoteFixture {
  id?: string;
  date: string;
  subject?: string;
  breakdown: Record<string, { for: number; against: number; abstain: number }>;
}

const buildVote = (f: VoteFixture): LatestVoteRecord => ({
  id: f.id ?? `v-${f.date}-${Math.random().toString(36).slice(2)}`,
  date: f.date,
  term: 10,
  subject: f.subject ?? `Subject ${f.date}`,
  reference: '',
  votesFor: 0,
  votesAgainst: 0,
  abstentions: 0,
  result: 'ADOPTED',
  groupBreakdown: f.breakdown,
  sourceUrl: 'https://www.europarl.europa.eu/doceo/document/PV-10.xml',
  dataSource: 'RCV',
  sittingDate: f.date,
});

const mockDoceoResponse = (votes: LatestVoteRecord[]) => ({
  data: votes,
  total: votes.length,
  datesAvailable: [...new Set(votes.map(v => v.date))],
  datesUnavailable: [],
  source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
  limit: 100,
  offset: 0,
  hasMore: false,
});

/**
 * Helper that sets up the DOCEO mock so the first call returns `votes` and
 * any subsequent calls (from the multi-week iteration loop) return empty.
 * This mirrors realistic DOCEO behaviour where each plenary week is fetched
 * separately and most older weeks return no records.
 */
const mockDoceoOnce = (votes: LatestVoteRecord[]): void => {
  vi.mocked(doceoClientModule.doceoClient.getLatestVotes)
    .mockReset()
    .mockResolvedValueOnce(mockDoceoResponse(votes))
    .mockResolvedValue(mockDoceoResponse([]));
};

const todayMinusDays = (days: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
};

describe('sentiment_tracker Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSentimentTrackerDoceoCache();
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockReset();
    // Default: empty DOCEO response → fallback path
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue(mockDoceoResponse([]));

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
    vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: allMeps, complete: true });
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
    it('should include dataQualityWarnings array in response', async () => {
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });

    it('should return MCP-compliant response', async () => {
      const result = await handleSentimentTracker({});
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleSentimentTracker({});
      expect(() => JSON.parse(result.content[0]?.text ?? '{}') as unknown).not.toThrow();
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
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [], complete: true });

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

    it('should fall back to seat-share path when DOCEO call rejects', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(new Error('DOCEO down'));
      const result = await handleSentimentTracker({ timeframe: 'last_quarter' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        methodology: string;
        dataQualityWarnings: string[];
      };
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.methodology).toContain('FALLBACK PATH');
      expect(data.dataQualityWarnings.some(w => w.includes('DOCEO RCV coverage insufficient'))).toBe(true);
    });
  });

  describe('Single Group Analysis', () => {
    it('should return only one group sentiment when groupId specified', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: makeMEPList(100, 'EPP'), complete: true });

      const result = await handleSentimentTracker({ groupId: 'EPP' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupSentiments: unknown[];
      };
      expect(data.groupSentiments).toHaveLength(1);
    });
  });

  describe('Fallback path (no DOCEO coverage)', () => {
    it('should report LOW confidence and seat-share methodology when DOCEO returns empty', async () => {
      const result = await handleSentimentTracker({ timeframe: 'last_month' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        methodology: string;
        dataQualityWarnings: string[];
      };
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.methodology).toContain('FALLBACK PATH');
      expect(data.dataQualityWarnings.some(w => w.includes('seat-share proxy'))).toBe(true);
    });

    it('should not surface DOCEO topics when coverage is insufficient', async () => {
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        consensusTopics: string[];
        divisiveTopics: string[];
      };
      expect(data.consensusTopics).toHaveLength(0);
      expect(data.divisiveTopics).toHaveLength(0);
    });
  });

  describe('DOCEO-backed scoring (timeframe drives window)', () => {
    /**
     * Build N high-cohesion votes (EPP unanimous FOR) spanning a date range.
     * Each vote yields cohesion == 1.0 for EPP.
     */
    const buildHighCohesionVotes = (n: number, daysAgoStart: number): LatestVoteRecord[] =>
      Array.from({ length: n }, (_, i) => buildVote({
        date: todayMinusDays(daysAgoStart + i),
        subject: `Vote ${String(i)} of ${String(n)} - daily cooperation`,
        breakdown: {
          EPP: { for: 180, against: 0, abstain: 0 },
          'S&D': { for: 100, against: 30, abstain: 6 },
        },
      }));

    it('should reach HIGH confidence when DOCEO has ≥40 RCVs in window', async () => {
      mockDoceoOnce(buildHighCohesionVotes(50, 1));
      const result = await handleSentimentTracker({ timeframe: 'last_quarter' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        methodology: string;
        groupSentiments: { groupId: string; cohesionProxy: number }[];
      };
      expect(data.confidenceLevel).toBe('HIGH');
      expect(data.methodology).not.toContain('FALLBACK');
      const epp = data.groupSentiments.find(g => g.groupId === 'EPP');
      expect(epp?.cohesionProxy).toBeCloseTo(1.0, 2);
    });

    it('should reach MEDIUM confidence with 10–39 RCVs', async () => {
      mockDoceoOnce(buildHighCohesionVotes(15, 1));
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { confidenceLevel: string };
      expect(data.confidenceLevel).toBe('MEDIUM');
    });

    it('should exclude DOCEO votes older than the last_month cutoff', async () => {
      // 15 in-window votes + 50 old votes (>30 days ago)
      const inWindow = buildHighCohesionVotes(15, 1);
      const oldVotes = buildHighCohesionVotes(50, 100).map(v => ({ ...v, sittingDate: todayMinusDays(120), date: todayMinusDays(120) }));
      mockDoceoOnce([...inWindow, ...oldVotes]);
      const result = await handleSentimentTracker({ timeframe: 'last_month' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        methodology: string;
      };
      // Only the 15 in-window RCVs should count → MEDIUM, not HIGH
      expect(data.confidenceLevel).toBe('MEDIUM');
      expect(data.methodology).toMatch(/15 DOCEO RCVs inspected/);
    });

    it('should pass weekStart hints derived from current Monday when iterating', async () => {
      mockDoceoOnce(buildHighCohesionVotes(50, 1));
      await handleSentimentTracker({ timeframe: 'last_quarter' });
      const callArgs = vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mock.calls[0]?.[0];
      expect(callArgs).toBeDefined();
      expect(callArgs?.weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(callArgs?.includeIndividualVotes).toBe(false);
      expect(callArgs?.limit).toBe(100);
    });
  });

  describe('Trend classification', () => {
    /**
     * Build votes that yield different cohesion in the first vs second half
     * of the window for the EPP group, so half-window delta drives the trend.
     */
    const buildHalfWindowVotes = (
      firstHalfCohesion: 'high' | 'low',
      secondHalfCohesion: 'high' | 'low',
      perHalf = 6
    ): LatestVoteRecord[] => {
      const buildHalf = (
        cohesion: 'high' | 'low',
        startDayAgo: number
      ): LatestVoteRecord[] => Array.from({ length: perHalf }, (_, i) => {
        const high = cohesion === 'high';
        return buildVote({
          date: todayMinusDays(startDayAgo - i),
          breakdown: {
            EPP: high
              ? { for: 180, against: 0, abstain: 0 }   // cohesion 1.0
              : { for: 80, against: 90, abstain: 10 }, // cohesion 0.5
            'S&D': { for: 100, against: 30, abstain: 6 },
          },
        });
      });
      // First half = older dates (larger daysAgo), second half = newer dates
      return [
        ...buildHalf(firstHalfCohesion, 25),
        ...buildHalf(secondHalfCohesion, 10),
      ];
    };

    it('should classify EPP trend as IMPROVING when cohesion rises across halves', async () => {
      mockDoceoOnce(buildHalfWindowVotes('low', 'high'));
      const result = await handleSentimentTracker({ timeframe: 'last_month' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupSentiments: { groupId: string; trend: string }[];
      };
      expect(data.groupSentiments.find(g => g.groupId === 'EPP')?.trend).toBe('IMPROVING');
    });

    it('should classify EPP trend as DECLINING when cohesion falls across halves', async () => {
      mockDoceoOnce(buildHalfWindowVotes('high', 'low'));
      const result = await handleSentimentTracker({ timeframe: 'last_month' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupSentiments: { groupId: string; trend: string }[];
      };
      expect(data.groupSentiments.find(g => g.groupId === 'EPP')?.trend).toBe('DECLINING');
    });

    it('should classify EPP trend as STABLE when cohesion is consistent across halves', async () => {
      mockDoceoOnce(buildHalfWindowVotes('high', 'high'));
      const result = await handleSentimentTracker({ timeframe: 'last_month' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupSentiments: { groupId: string; trend: string }[];
      };
      expect(data.groupSentiments.find(g => g.groupId === 'EPP')?.trend).toBe('STABLE');
    });

    it('should classify EPP trend as VOLATILE when sub-window cohesion variance > 0.1', async () => {
      // last_year uses 4 sub-windows; alternate 6-vote blocks of high/low
      // cohesion to drive bucket means apart: variance ≈ 0.11 (> threshold 0.1).
      const votes: LatestVoteRecord[] = [];
      const cohesionPattern: ('high' | 'low')[] = [
        ...Array.from({ length: 6 }, () => 'high' as const),
        ...Array.from({ length: 6 }, () => 'low' as const),
        ...Array.from({ length: 6 }, () => 'high' as const),
        ...Array.from({ length: 6 }, () => 'low' as const),
      ];
      cohesionPattern.forEach((band, idx) => {
        votes.push(buildVote({
          date: todayMinusDays(300 - idx * 10),
          breakdown: {
            EPP: band === 'high'
              ? { for: 180, against: 0, abstain: 0 }
              : { for: 60, against: 60, abstain: 60 }, // cohesion ≈ 0.33
            'S&D': { for: 100, against: 30, abstain: 6 },
          },
        }));
      });
      mockDoceoOnce(votes);
      const result = await handleSentimentTracker({ timeframe: 'last_year' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupSentiments: { groupId: string; trend: string; volatility: number }[];
      };
      const epp = data.groupSentiments.find(g => g.groupId === 'EPP');
      expect(epp?.trend).toBe('VOLATILE');
      expect(epp?.volatility).toBeGreaterThan(0);
    });
  });

  describe('Consensus / divisive topics from DOCEO', () => {
    it('should populate consensusTopics from high-cohesion vote subjects', async () => {
      // Use mostly-shared subject so the special one survives the 10-cap dedup
      const votes: LatestVoteRecord[] = Array.from({ length: 12 }, (_, i) => buildVote({
        date: todayMinusDays(1 + i),
        subject: i === 0 ? 'Ukraine humanitarian aid' : 'Procedural agenda item',
        breakdown: {
          EPP: { for: 180, against: 0, abstain: 0 }, // cohesion 1.0 → consensus
          'S&D': { for: 136, against: 0, abstain: 0 },
        },
      }));
      mockDoceoOnce(votes);
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        consensusTopics: string[];
      };
      expect(data.consensusTopics).toContain('Ukraine humanitarian aid');
    });

    it('should populate divisiveTopics from low-cohesion vote subjects (≤0.55)', async () => {
      const votes: LatestVoteRecord[] = Array.from({ length: 12 }, (_, i) => buildVote({
        date: todayMinusDays(1 + i),
        subject: i === 0 ? 'Migration enforcement directive' : `Routine vote ${String(i)}`,
        breakdown: i === 0
          ? {
              // EPP split: 80/90/10 → cohesion 0.5 ≤ 0.55 → divisive
              EPP: { for: 80, against: 90, abstain: 10 },
              'S&D': { for: 100, against: 30, abstain: 6 },
            }
          : {
              EPP: { for: 180, against: 0, abstain: 0 },
              'S&D': { for: 136, against: 0, abstain: 0 },
            },
      }));
      mockDoceoOnce(votes);
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        divisiveTopics: string[];
      };
      expect(data.divisiveTopics).toContain('Migration enforcement directive');
    });
  });

  describe('polarizationIndex from DOCEO cohesion', () => {
    it('should be near 0 when all analyzed groups have high cohesion', async () => {
      const votes: LatestVoteRecord[] = Array.from({ length: 12 }, (_, i) => buildVote({
        date: todayMinusDays(1 + i),
        breakdown: {
          EPP: { for: 180, against: 0, abstain: 0 },
          'S&D': { for: 136, against: 0, abstain: 0 },
          Renew: { for: 77, against: 0, abstain: 0 },
        },
      }));
      mockDoceoOnce(votes);
      const result = await handleSentimentTracker({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { polarizationIndex: number };
      // 1 - 1.0 = 0 (allow rounding tolerance)
      expect(data.polarizationIndex).toBeLessThanOrEqual(0.05);
    });

    it('should rise (monotonic property) as group cohesion drops', async () => {
      const buildVotesAtCohesion = (forCount: number): LatestVoteRecord[] =>
        Array.from({ length: 12 }, (_, i) => buildVote({
          date: todayMinusDays(1 + i),
          breakdown: {
            EPP: { for: forCount, against: 180 - forCount, abstain: 0 },
            'S&D': { for: forCount, against: 136 - forCount, abstain: 0 },
          },
        }));

      const lowDispersionVotes = buildVotesAtCohesion(180); // cohesion 1.0
      const highDispersionVotes = buildVotesAtCohesion(90); // cohesion 0.5

      mockDoceoOnce(lowDispersionVotes);
      const result1 = await handleSentimentTracker({});
      const polLow = (JSON.parse(result1.content[0]?.text ?? '{}') as { polarizationIndex: number }).polarizationIndex;

      clearSentimentTrackerDoceoCache();
      mockDoceoOnce(highDispersionVotes);
      const result2 = await handleSentimentTracker({});
      const polHigh = (JSON.parse(result2.content[0]?.text ?? '{}') as { polarizationIndex: number }).polarizationIndex;

      expect(polHigh).toBeGreaterThan(polLow);
    });
  });

  describe('Sentiment score bounds with DOCEO blend', () => {
    it('should keep sentimentScore in [-1, +1] across timeframes', async () => {
      const votes: LatestVoteRecord[] = Array.from({ length: 50 }, (_, i) => buildVote({
        date: todayMinusDays(1 + (i % 30)),
        breakdown: {
          EPP: { for: 180, against: 0, abstain: 0 },
          'S&D': { for: 1, against: 134, abstain: 1 },
        },
      }));
      mockDoceoOnce(votes);

      for (const tf of ['last_month', 'last_quarter', 'last_year'] as const) {
        clearSentimentTrackerDoceoCache();
        const result = await handleSentimentTracker({ timeframe: tf });
        const data = JSON.parse(result.content[0]?.text ?? '{}') as {
          groupSentiments: { sentimentScore: number }[];
        };
        for (const g of data.groupSentiments) {
          expect(g.sentimentScore).toBeGreaterThanOrEqual(-1);
          expect(g.sentimentScore).toBeLessThanOrEqual(1);
        }
      }
    });
  });
});
