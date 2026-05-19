/**
 * Tests for detect_voting_anomalies MCP tool.
 *
 * Covers the DOCEO-RCV anomaly pipeline: clean MEP (no anomalies), defection
 * burst, abstention spike, cross-party alignment shift, low-coverage LOW
 * confidence path, and empty DOCEO fallback.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleDetectVotingAnomalies } from './detectVotingAnomalies.js';
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
        dataQualityWarnings: string[];
        summary: { totalAnomalies: number };
      };
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.dataSource).toBe('NONE');
      expect(data.dataQualityWarnings.length).toBeGreaterThan(0);
      expect(data.summary.totalAnomalies).toBe(0);
    });

    it('returns LOW confidence + warning when DOCEO rejects', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(new Error('network'));
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        dataSource: string;
        dataQualityWarnings: string[];
      };
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.dataSource).toBe('NONE');
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
});
