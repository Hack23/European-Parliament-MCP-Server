/**
 * Tests for detect_voting_anomalies MCP tool.
 *
 * Covers the DOCEO-RCV anomaly pipeline: clean MEP (no anomalies), defection
 * burst, abstention spike, cross-party alignment shift, low-coverage LOW
 * confidence path, and empty DOCEO fallback.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleDetectVotingAnomalies, clearDoceoCorpusCache } from './detectVotingAnomalies.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';
import * as doceoClientModule from '../clients/ep/doceoClient.js';
import type { LatestVoteRecord } from '../clients/ep/doceoXmlParser.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn(),
    getCurrentMEPs: vi.fn(),
  },
}));

vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn(),
  },
}));

const emptyDoceoResponse = {
  data: [] as LatestVoteRecord[],
  total: 0,
  datesAvailable: [],
  datesUnavailable: [],
  source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
  limit: 100,
  offset: 0,
  hasMore: false,
};

/** Build a DOCEO RCV record skeleton. */
function rcv(opts: {
  id: string;
  date: string;
  mep: 'FOR' | 'AGAINST' | 'ABSTAIN' | 'ABSENT';
  /** Home-group breakdown (EPP majority FOR by default). */
  home?: { for: number; against: number; abstain: number };
  /** Optional other-group breakdowns (canonical short codes). */
  others?: Record<string, { for: number; against: number; abstain: number }>;
}): LatestVoteRecord {
  const mepVotes: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'> = {};
  if (opts.mep !== 'ABSENT') mepVotes['MEP-1'] = opts.mep;
  return {
    id: opts.id,
    date: opts.date,
    sittingDate: opts.date,
    term: 10,
    subject: `Subject ${opts.id}`,
    reference: `REF-${opts.id}`,
    votesFor: 100,
    votesAgainst: 50,
    abstentions: 5,
    result: 'ADOPTED',
    mepVotes,
    groupBreakdown: {
      EPP: opts.home ?? { for: 100, against: 5, abstain: 1 },
      ...(opts.others ?? {}),
    },
    sourceUrl: 'https://www.europarl.europa.eu/doceo/test.xml',
    dataSource: 'RCV',
  };
}

/** Build N RCV records on a given week (Monday-based dates), MEP voting `position`. */
function weekVotes(weekMonday: string, count: number, position: 'FOR' | 'AGAINST' | 'ABSTAIN' | 'ABSENT', idPrefix: string): LatestVoteRecord[] {
  const records: LatestVoteRecord[] = [];
  for (let i = 0; i < count; i += 1) {
    records.push(rcv({ id: `${idPrefix}-${String(i)}`, date: weekMonday, mep: position }));
  }
  return records;
}

describe('detect_voting_anomalies Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the multi-week DOCEO corpus cache between tests so per-test mocks
    // are honoured. The cache key is `${scope}|${from}|${to}` and the default
    // period is identical across tests, so without this clear earlier results
    // leak into later assertions.
    clearDoceoCorpusCache();

    vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
      id: 'MEP-1',
      name: 'Test MEP',
      country: 'SE',
      politicalGroup: 'EPP',
      committees: ['AGRI'],
      active: true,
      termStart: '2019-07-02',
    });

    vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
      data: [
        {
          id: 'MEP-1',
          name: 'Test MEP',
          country: 'SE',
          politicalGroup: 'EPP',
          committees: ['AGRI'],
          active: true,
          termStart: '2019-07-02',
        },
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false,
    });

    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue(emptyDoceoResponse);
  });

  describe('Input Validation', () => {
    it('accepts empty args', async () => {
      const result = await handleDetectVotingAnomalies({});
      expect(result).toHaveProperty('content');
    });

    it('accepts specific mepId', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      expect(result).toHaveProperty('content');
    });

    it('accepts groupId filter', async () => {
      const result = await handleDetectVotingAnomalies({ groupId: 'EPP' });
      expect(result).toHaveProperty('content');
    });

    it('rejects when both mepId and groupId are provided', async () => {
      await expect(handleDetectVotingAnomalies({ mepId: 'MEP-1', groupId: 'EPP' }))
        .rejects.toThrow();
    });

    it('accepts sensitivity threshold', async () => {
      const result = await handleDetectVotingAnomalies({ sensitivityThreshold: 0.5 });
      expect(result).toHaveProperty('content');
    });

    it('rejects invalid sensitivity threshold', async () => {
      await expect(handleDetectVotingAnomalies({ sensitivityThreshold: 2.0 }))
        .rejects.toThrow();
    });
  });

  describe('Response Structure', () => {
    it('returns MCP-compliant response with dataQualityWarnings array', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });

    it('returns valid JSON with summary/computedAttributes/dataSource', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data).toHaveProperty('anomalies');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
      expect(data).toHaveProperty('dataSource');
      expect(data).toHaveProperty('rcvVotesInspected');
    });

    it('sets target scope for single MEP', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { targetScope: string };
      expect(data.targetScope).toContain('MEP');
    });

    it('sets target scope for all MEPs', async () => {
      const result = await handleDetectVotingAnomalies({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { targetScope: string };
      expect(data.targetScope).toBe('All MEPs');
    });
  });

  describe('Empty DOCEO fallback', () => {
    it('returns LOW confidence with data-quality warning when DOCEO is empty', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        dataSource: string;
        dataAvailable?: boolean;
        dataQualityWarnings: string[];
        summary: { totalAnomalies: number };
      };
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.dataSource).toBe('DOCEO');
      expect(data.dataAvailable).toBe(false);
      expect(data.dataQualityWarnings.length).toBeGreaterThan(0);
      expect(data.summary.totalAnomalies).toBe(0);
    });

    it('returns LOW confidence + warning when DOCEO rejects', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(new Error('network'));
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        dataSource: string;
        dataAvailable?: boolean;
        dataQualityWarnings: string[];
      };
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.dataSource).toBe('DOCEO');
      expect(data.dataAvailable).toBe(false);
      expect(data.dataQualityWarnings.some(w => w.includes('DOCEO RCV source unavailable'))).toBe(true);
    });
  });

  describe('Clean MEP', () => {
    it('detects no anomalies when MEP votes with home-group majority every week', async () => {
      // Three weeks, 20 FOR votes per week, EPP majority FOR.
      const records = [
        ...weekVotes('2026-01-05', 20, 'FOR', 'w1'),
        ...weekVotes('2026-01-12', 20, 'FOR', 'w2'),
        ...weekVotes('2026-01-19', 20, 'FOR', 'w3'),
      ];
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: records,
        total: records.length,
      });
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        summary: { totalAnomalies: number };
        confidenceLevel: string;
        rcvVotesInspected: number;
      };
      expect(data.summary.totalAnomalies).toBe(0);
      expect(data.confidenceLevel).toBe('HIGH');
      expect(data.rcvVotesInspected).toBe(60);
    });
  });

  describe('Defection burst', () => {
    it('emits PARTY_DEFECTION anomalies for an outlier week', async () => {
      // Four quiet weeks (mostly aligned) plus one burst week (mostly defection)
      // — z ≥ 1.5 requires enough quiet samples to drive stdev down.
      const records = [
        ...weekVotes('2025-12-15', 20, 'FOR', 'w0'),
        ...weekVotes('2025-12-22', 20, 'FOR', 'w-1'),
        ...weekVotes('2026-01-05', 20, 'FOR', 'w1'),
        ...weekVotes('2026-01-12', 20, 'FOR', 'w2'),
        // Burst: vote AGAINST while EPP majority is FOR → defection.
        ...weekVotes('2026-01-19', 20, 'AGAINST', 'burst'),
      ];
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: records,
        total: records.length,
      });
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        anomalies: { type: string; evidenceVoteIds: string[] }[];
        summary: { totalAnomalies: number };
        confidenceLevel: string;
      };
      const defection = data.anomalies.filter(a => a.type === 'PARTY_DEFECTION');
      expect(defection.length).toBeGreaterThan(0);
      expect(defection[0]?.evidenceVoteIds.length).toBeGreaterThan(0);
      expect(data.confidenceLevel).toBe('HIGH');
      // WoW shift should also be detected (0% → 100% defection rate).
      const shift = data.anomalies.filter(a => a.type === 'ALIGNMENT_SHIFT');
      expect(shift.length).toBeGreaterThan(0);
    });
  });

  describe('Abstention spike', () => {
    it('emits ABSTENTION_SPIKE for an outlier week', async () => {
      const records = [
        ...weekVotes('2025-12-15', 20, 'FOR', 'w0'),
        ...weekVotes('2025-12-22', 20, 'FOR', 'w-1'),
        ...weekVotes('2026-01-05', 20, 'FOR', 'w1'),
        ...weekVotes('2026-01-12', 20, 'FOR', 'w2'),
        ...weekVotes('2026-01-19', 20, 'ABSTAIN', 'spike'),
      ];
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: records,
        total: records.length,
      });
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        anomalies: { type: string; evidenceVoteIds: string[] }[];
      };
      const spike = data.anomalies.filter(a => a.type === 'ABSTENTION_SPIKE');
      expect(spike.length).toBeGreaterThan(0);
      expect(spike[0]?.evidenceVoteIds.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-party alignment shift', () => {
    it('emits CROSS_PARTY_ALIGNMENT_SHIFT when MEP votes with a non-home group majority in a week', async () => {
      // Three weeks of "normal" votes plus a sub-window where MEP votes AGAINST
      // while EPP majority is FOR and S&D majority is AGAINST → cross-party match.
      const normalHome = { for: 100, against: 5, abstain: 1 };
      const otherSnD = { for: 5, against: 100, abstain: 1 };
      const flip = (id: string, date: string): LatestVoteRecord =>
        rcv({ id, date, mep: 'AGAINST', home: normalHome, others: { 'S&D': otherSnD } });
      const records: LatestVoteRecord[] = [
        ...weekVotes('2026-01-05', 10, 'FOR', 'w1'),
        ...weekVotes('2026-01-12', 10, 'FOR', 'w2'),
      ];
      for (let i = 0; i < 10; i += 1) records.push(flip(`cp-${String(i)}`, '2026-01-19'));
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: records,
        total: records.length,
      });
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        anomalies: { type: string; evidenceVoteIds: string[]; description: string }[];
      };
      const cpas = data.anomalies.filter(a => a.type === 'CROSS_PARTY_ALIGNMENT_SHIFT');
      expect(cpas.length).toBeGreaterThan(0);
      expect(cpas[0]?.evidenceVoteIds.length).toBe(10);
    });
  });

  describe('Low coverage', () => {
    it('reports LOW confidence and a coverage warning for <10 RCVs', async () => {
      const records = weekVotes('2026-01-05', 5, 'FOR', 'low');
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: records,
        total: records.length,
      });
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        rcvVotesInspected: number;
        dataQualityWarnings: string[];
      };
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.rcvVotesInspected).toBe(5);
      expect(data.dataQualityWarnings.some(w => w.includes('Fewer than 10'))).toBe(true);
    });

    it('reports MEDIUM confidence in the 10–49 band', async () => {
      const records = [
        ...weekVotes('2026-01-05', 10, 'FOR', 'm1'),
        ...weekVotes('2026-01-12', 10, 'FOR', 'm2'),
        ...weekVotes('2026-01-19', 10, 'FOR', 'm3'),
      ];
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: records,
        total: records.length,
      });
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        rcvVotesInspected: number;
      };
      expect(data.confidenceLevel).toBe('MEDIUM');
      expect(data.rcvVotesInspected).toBe(30);
    });
  });

  describe('Determinism / monotonicity', () => {
    it('returns the same result for the same input (idempotent under input order)', async () => {
      const records = [
        ...weekVotes('2026-01-05', 20, 'FOR', 'w1'),
        ...weekVotes('2026-01-12', 20, 'AGAINST', 'w2'),
      ];
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: records,
        total: records.length,
      });
      const a = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const reversed = [...records].reverse();
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: reversed,
        total: reversed.length,
      });
      const b = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const ad = JSON.parse(a.content[0]?.text ?? '{}') as { summary: { totalAnomalies: number } };
      const bd = JSON.parse(b.content[0]?.text ?? '{}') as { summary: { totalAnomalies: number } };
      expect(ad.summary.totalAnomalies).toBe(bd.summary.totalAnomalies);
    });

    it('detects ≥ as many anomalies at lower sensitivity threshold', async () => {
      const records = [
        ...weekVotes('2026-01-05', 20, 'FOR', 'w1'),
        ...weekVotes('2026-01-12', 20, 'FOR', 'w2'),
        ...weekVotes('2026-01-19', 5, 'AGAINST', 'mild'),
        ...weekVotes('2026-01-19', 15, 'FOR', 'mild-for'),
      ];
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: records,
        total: records.length,
      });
      const low = await handleDetectVotingAnomalies({ mepId: 'MEP-1', sensitivityThreshold: 0.1 });
      const high = await handleDetectVotingAnomalies({ mepId: 'MEP-1', sensitivityThreshold: 0.9 });
      const lowD = JSON.parse(low.content[0]?.text ?? '{}') as { summary: { totalAnomalies: number } };
      const highD = JSON.parse(high.content[0]?.text ?? '{}') as { summary: { totalAnomalies: number } };
      expect(lowD.summary.totalAnomalies).toBeGreaterThanOrEqual(highD.summary.totalAnomalies);
    });
  });

  describe('Error Handling', () => {
    it('wraps EP API errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockRejectedValueOnce(new Error('Not found'));
      await expect(handleDetectVotingAnomalies({ mepId: '999999' })).rejects.toThrow('Failed to detect voting anomalies');
    });
  });

  describe('Multi-week DOCEO baseline', () => {
    /**
     * Helper: mock `getLatestVotes` to return a *different* slice of records
     * depending on the `weekStart` parameter, mirroring real DOCEO behaviour
     * where each plenary week's XML carries unique vote IDs and sittingDates.
     */
    function mockPerWeek(
      byWeekStart: Record<string, LatestVoteRecord[]>
    ): void {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockImplementation(async (params) => {
        const week = params?.weekStart ?? '';
        const records = byWeekStart[week] ?? [];
        return await Promise.resolve({
          ...emptyDoceoResponse,
          data: records,
          total: records.length,
          datesAvailable: records.length > 0 ? [week] : [],
        });
      });
    }

    it('aggregates votes across a 3-week window and reports weeksInspected', async () => {
      mockPerWeek({
        '2026-01-05': weekVotes('2026-01-05', 20, 'FOR', 'w1'),
        '2026-01-12': weekVotes('2026-01-12', 20, 'FOR', 'w2'),
        '2026-01-19': weekVotes('2026-01-19', 20, 'FOR', 'w3'),
      });
      const result = await handleDetectVotingAnomalies({
        mepId: 'MEP-1',
        dateFrom: '2026-01-05',
        dateTo: '2026-01-19',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        weeksInspected: number;
        weeksTruncated?: boolean;
        rcvVotesInspected: number;
        confidenceLevel: string;
      };
      expect(data.weeksInspected).toBe(3);
      expect(data.weeksTruncated).toBeUndefined();
      expect(data.rcvVotesInspected).toBe(60);
      // 60 votes inspected across 3 weeks → HIGH per new ladder.
      expect(data.confidenceLevel).toBe('HIGH');
      // The DOCEO client should have been invoked once per plenary week.
      expect(vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('truncates windows wider than 26 weeks and surfaces weeksTruncated warning', async () => {
      // Empty fixture is fine; we only care about the cap behaviour and the warning.
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: weekVotes('2026-06-01', 5, 'FOR', 'late'),
        total: 5,
      });
      const result = await handleDetectVotingAnomalies({
        mepId: 'MEP-1',
        dateFrom: '2025-01-01',
        dateTo: '2026-06-30',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        weeksTruncated?: boolean;
        dataQualityWarnings: string[];
      };
      expect(data.weeksTruncated).toBe(true);
      expect(data.dataQualityWarnings.some(w => w.includes('26-week cap'))).toBe(true);
      // Exactly 26 weekly calls under the cap (the helper enforces breadth-first).
      expect(vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mock.calls.length).toBe(26);
    });

    it('deduplicates vote IDs across overlapping weekly fetches', async () => {
      // Return the SAME 5-record fixture for every weekStart anchor — the
      // dedup-by-id contract should collapse the duplicates to one set in the
      // final corpus regardless of how many weekly fetches contributed.
      const overlapping = weekVotes('2026-01-05', 5, 'FOR', 'dup');
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: overlapping,
        total: overlapping.length,
      });
      const result = await handleDetectVotingAnomalies({
        mepId: 'MEP-1',
        dateFrom: '2026-01-05',
        dateTo: '2026-01-26',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        rcvVotesInspected: number;
        weeksInspected: number;
      };
      // Dedup → 5 unique records (not 5 × number-of-weekly-calls).
      expect(data.rcvVotesInspected).toBe(5);
      // All deduplicated records share a single sittingDate → 1 ISO week.
      expect(data.weeksInspected).toBe(1);
    });

    it('survives partial weekly fetch failures and returns the recoverable corpus', async () => {
      // First weekly call rejects, the rest succeed.
      let callIndex = 0;
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockImplementation(async () => {
        callIndex += 1;
        if (callIndex === 1) {
          return await Promise.reject(new Error('transient network error'));
        }
        return await Promise.resolve({
          ...emptyDoceoResponse,
          data: weekVotes(`2026-01-${String(5 + callIndex).padStart(2, '0')}`, 10, 'FOR', `w${String(callIndex)}`),
          total: 10,
        });
      });
      const result = await handleDetectVotingAnomalies({
        mepId: 'MEP-1',
        dateFrom: '2026-01-05',
        dateTo: '2026-01-26',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataAvailable?: boolean;
        rcvVotesInspected: number;
      };
      // The fetch loop should NOT bail on the single failed week — the
      // recoverable weeks contribute their records to the corpus.
      expect(data.dataAvailable).not.toBe(false);
      expect(data.rcvVotesInspected).toBeGreaterThan(0);
    });

    it('caches the corpus by `${scope}|${from}|${to}` for back-to-back calls', async () => {
      mockPerWeek({
        '2026-01-05': weekVotes('2026-01-05', 5, 'FOR', 'c1'),
        '2026-01-12': weekVotes('2026-01-12', 5, 'FOR', 'c2'),
      });
      const args = { mepId: 'MEP-1', dateFrom: '2026-01-05', dateTo: '2026-01-12' };
      await handleDetectVotingAnomalies(args);
      const callsAfterFirst = vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mock.calls.length;
      await handleDetectVotingAnomalies(args);
      const callsAfterSecond = vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mock.calls.length;
      // No additional DOCEO traffic on the cache hit.
      expect(callsAfterSecond).toBe(callsAfterFirst);
    });

    it('caps confidence at MEDIUM when fewer than 3 weeks contribute votes (no multi-week dispersion)', async () => {
      // 60 RCVs but all in a single sittingDate week → coverage alone says
      // HIGH, but the new ladder requires ≥3 contributing weeks.
      mockPerWeek({
        '2026-01-05': weekVotes('2026-01-05', 60, 'FOR', 'mono'),
      });
      const result = await handleDetectVotingAnomalies({
        mepId: 'MEP-1',
        dateFrom: '2026-01-05',
        dateTo: '2026-01-12',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        weeksInspected: number;
        dataQualityWarnings: string[];
      };
      expect(data.weeksInspected).toBe(1);
      expect(data.confidenceLevel).toBe('MEDIUM');
      expect(data.dataQualityWarnings.some(w => w.includes('plenary week'))).toBe(true);
    });
  });
});
