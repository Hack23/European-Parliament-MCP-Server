/**
 * Unit tests for src/utils/votingBaseline.ts.
 */

import { describe, it, expect } from 'vitest';
import {
  bucketByWeek,
  classifyMepVote,
  computeBaseline,
  coverageConfidence,
  findCrossPartyAlignmentWindows,
  findOutlierWeeks,
  findWoWShifts,
  isoWeekStart,
  iteratePlenaryWeeks,
  MAX_PLENARY_WEEKS,
  resolveGroupBreakdownRow,
  resolveGroupMajority,
  zScore,
} from './votingBaseline.js';
import type { LatestVoteRecord } from '../clients/ep/doceoXmlParser.js';

function vote(opts: {
  id: string;
  date: string;
  mepVotes?: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>;
  groupBreakdown?: Record<string, { for: number; against: number; abstain: number }>;
}): LatestVoteRecord {
  return {
    id: opts.id,
    date: opts.date,
    sittingDate: opts.date,
    term: 10,
    subject: '',
    reference: '',
    votesFor: 0,
    votesAgainst: 0,
    abstentions: 0,
    result: 'ADOPTED',
    ...(opts.mepVotes !== undefined ? { mepVotes: opts.mepVotes } : {}),
    ...(opts.groupBreakdown !== undefined ? { groupBreakdown: opts.groupBreakdown } : {}),
    sourceUrl: 'https://www.europarl.europa.eu/doceo/test.xml',
    dataSource: 'RCV',
  };
}

describe('votingBaseline.resolveGroupMajority', () => {
  it('returns null for missing or all-zero rows', () => {
    expect(resolveGroupMajority(undefined)).toBe(null);
    expect(resolveGroupMajority({ for: 0, against: 0, abstain: 0 })).toBe(null);
  });

  it('returns the plurality position', () => {
    expect(resolveGroupMajority({ for: 50, against: 10, abstain: 5 })).toBe('FOR');
    expect(resolveGroupMajority({ for: 10, against: 50, abstain: 5 })).toBe('AGAINST');
    expect(resolveGroupMajority({ for: 5, against: 10, abstain: 50 })).toBe('ABSTAIN');
  });

  it('breaks ties alphabetically (ABSTAIN < AGAINST < FOR)', () => {
    expect(resolveGroupMajority({ for: 5, against: 5, abstain: 5 })).toBe('ABSTAIN');
    expect(resolveGroupMajority({ for: 5, against: 5, abstain: 0 })).toBe('AGAINST');
  });
});

describe('votingBaseline.resolveGroupBreakdownRow', () => {
  it('matches canonical key directly', () => {
    const row = { for: 1, against: 2, abstain: 3 };
    expect(resolveGroupBreakdownRow({ EPP: row }, 'EPP')).toBe(row);
  });

  it('matches via normalization (raw → canonical)', () => {
    const row = { for: 1, against: 2, abstain: 3 };
    expect(resolveGroupBreakdownRow({ 'Verts/ALE': row }, 'Greens/EFA')).toBe(row);
  });

  it('returns undefined when no match', () => {
    expect(resolveGroupBreakdownRow(undefined, 'EPP')).toBeUndefined();
    expect(resolveGroupBreakdownRow({}, 'EPP')).toBeUndefined();
  });
});

describe('votingBaseline.classifyMepVote', () => {
  it('reports absent when the MEP is not on the roll', () => {
    const c = classifyMepVote(vote({ id: 'v1', date: '2026-01-05' }), 'MEP-1', 'EPP');
    expect(c.alignment).toBe('absent');
    expect(c.mepPosition).toBe(null);
  });

  it('reports abstained when the MEP voted ABSTAIN', () => {
    const c = classifyMepVote(
      vote({ id: 'v1', date: '2026-01-05', mepVotes: { 'MEP-1': 'ABSTAIN' }, groupBreakdown: { EPP: { for: 50, against: 5, abstain: 1 } } }),
      'MEP-1',
      'EPP'
    );
    expect(c.alignment).toBe('abstained');
    expect(c.mepPosition).toBe('ABSTAIN');
    expect(c.groupMajority).toBe('FOR');
  });

  it('reports defected when the MEP voted against the group majority', () => {
    const c = classifyMepVote(
      vote({ id: 'v1', date: '2026-01-05', mepVotes: { 'MEP-1': 'AGAINST' }, groupBreakdown: { EPP: { for: 50, against: 5, abstain: 1 } } }),
      'MEP-1',
      'EPP'
    );
    expect(c.alignment).toBe('defected');
  });

  it('reports aligned when the MEP voted with the group majority', () => {
    const c = classifyMepVote(
      vote({ id: 'v1', date: '2026-01-05', mepVotes: { 'MEP-1': 'FOR' }, groupBreakdown: { EPP: { for: 50, against: 5, abstain: 1 } } }),
      'MEP-1',
      'EPP'
    );
    expect(c.alignment).toBe('aligned');
  });

  it('reports aligned conservatively when home-group context is missing', () => {
    const c = classifyMepVote(
      vote({ id: 'v1', date: '2026-01-05', mepVotes: { 'MEP-1': 'FOR' }, groupBreakdown: {} }),
      'MEP-1',
      'EPP'
    );
    expect(c.alignment).toBe('aligned');
    expect(c.groupMajority).toBe(null);
  });

  it('lists non-home groups whose majority matched the MEP position', () => {
    const c = classifyMepVote(
      vote({
        id: 'v1',
        date: '2026-01-05',
        mepVotes: { 'MEP-1': 'AGAINST' },
        groupBreakdown: {
          EPP: { for: 50, against: 5, abstain: 1 },
          'S&D': { for: 5, against: 60, abstain: 1 },
          'The Left': { for: 2, against: 40, abstain: 1 },
        },
      }),
      'MEP-1',
      'EPP'
    );
    expect(c.alignment).toBe('defected');
    expect(c.matchingOtherGroups).toEqual(['S&D', 'The Left']);
  });

  it('skips matchingOtherGroups for abstain/absent', () => {
    const c = classifyMepVote(
      vote({
        id: 'v1', date: '2026-01-05',
        mepVotes: { 'MEP-1': 'ABSTAIN' },
        groupBreakdown: { 'S&D': { for: 0, against: 0, abstain: 100 } },
      }),
      'MEP-1', 'EPP'
    );
    expect(c.matchingOtherGroups).toEqual([]);
  });
});

describe('votingBaseline.isoWeekStart', () => {
  it('returns the Monday of the ISO week', () => {
    expect(isoWeekStart('2026-01-07')).toBe('2026-01-05'); // Wed → Mon Jan 5
    expect(isoWeekStart('2026-01-05')).toBe('2026-01-05'); // Mon → Mon
    expect(isoWeekStart('2026-01-04')).toBe('2025-12-29'); // Sun → previous Mon
  });

  it('passes through invalid date strings', () => {
    expect(isoWeekStart('')).toBe('');
    expect(isoWeekStart('not-a-date')).toBe('not-a-date');
  });
});

describe('votingBaseline.bucketByWeek', () => {
  it('groups votes by ISO week and computes rates', () => {
    const classified = [
      // Week of 2026-01-05: 5 FOR + 1 AGAINST + 1 ABSTAIN = 6 decisive, 1 defection, 1 abstain
      ...new Array<number>(5).fill(0).map((_, i) => ({
        voteId: `a${String(i)}`, sittingDate: '2026-01-05',
        alignment: 'aligned' as const, groupMajority: 'FOR' as const,
        mepPosition: 'FOR' as const, matchingOtherGroups: [],
      })),
      {
        voteId: 'd1', sittingDate: '2026-01-06',
        alignment: 'defected' as const, groupMajority: 'FOR' as const,
        mepPosition: 'AGAINST' as const, matchingOtherGroups: ['S&D'],
      },
      {
        voteId: 'ab1', sittingDate: '2026-01-07',
        alignment: 'abstained' as const, groupMajority: 'FOR' as const,
        mepPosition: 'ABSTAIN' as const, matchingOtherGroups: [],
      },
      {
        voteId: 'abs1', sittingDate: '2026-01-08',
        alignment: 'absent' as const, groupMajority: null,
        mepPosition: null, matchingOtherGroups: [],
      },
    ];
    const buckets = bucketByWeek(classified);
    expect(buckets).toHaveLength(1);
    const w = buckets[0];
    if (w === undefined) return;
    expect(w.weekStart).toBe('2026-01-05');
    expect(w.voted).toBe(7);
    expect(w.decisive).toBe(6);
    expect(w.defections).toBe(1);
    expect(w.abstentions).toBe(1);
    expect(w.crossPartyAlignments).toBe(1);
    expect(w.defectionRate).toBeCloseTo(100 / 6, 1);
  });

  it('orders buckets chronologically', () => {
    const buckets = bucketByWeek([
      { voteId: 'a', sittingDate: '2026-01-19', alignment: 'aligned', groupMajority: 'FOR', mepPosition: 'FOR', matchingOtherGroups: [] },
      { voteId: 'b', sittingDate: '2026-01-05', alignment: 'aligned', groupMajority: 'FOR', mepPosition: 'FOR', matchingOtherGroups: [] },
    ]);
    expect(buckets.map(b => b.weekStart)).toEqual(['2026-01-05', '2026-01-19']);
  });
});

describe('votingBaseline.computeBaseline / zScore', () => {
  it('returns zeros for empty input', () => {
    expect(computeBaseline([])).toEqual({ mean: 0, stdev: 0 });
  });

  it('returns mean only for single-point series', () => {
    expect(computeBaseline([5])).toEqual({ mean: 5, stdev: 0 });
  });

  it('computes sample standard deviation (ddof=1)', () => {
    const b = computeBaseline([1, 2, 3, 4, 5]);
    expect(b.mean).toBe(3);
    expect(b.stdev).toBeCloseTo(Math.sqrt(2.5));
  });

  it('zScore returns 0 when stdev is 0', () => {
    expect(zScore(10, { mean: 5, stdev: 0 })).toBe(0);
  });
});

describe('votingBaseline.findOutlierWeeks', () => {
  it('detects outlier weeks above z-threshold', () => {
    const buckets = bucketByWeek([
      ...new Array<number>(20).fill(0).map((_, i) => ({ voteId: `w1-${String(i)}`, sittingDate: '2025-12-15', alignment: 'aligned' as const, groupMajority: 'FOR' as const, mepPosition: 'FOR' as const, matchingOtherGroups: [] })),
      ...new Array<number>(20).fill(0).map((_, i) => ({ voteId: `w2-${String(i)}`, sittingDate: '2025-12-22', alignment: 'aligned' as const, groupMajority: 'FOR' as const, mepPosition: 'FOR' as const, matchingOtherGroups: [] })),
      ...new Array<number>(20).fill(0).map((_, i) => ({ voteId: `w3-${String(i)}`, sittingDate: '2026-01-05', alignment: 'aligned' as const, groupMajority: 'FOR' as const, mepPosition: 'FOR' as const, matchingOtherGroups: [] })),
      ...new Array<number>(20).fill(0).map((_, i) => ({ voteId: `w4-${String(i)}`, sittingDate: '2026-01-12', alignment: 'aligned' as const, groupMajority: 'FOR' as const, mepPosition: 'FOR' as const, matchingOtherGroups: [] })),
      ...new Array<number>(20).fill(0).map((_, i) => ({ voteId: `w5-${String(i)}`, sittingDate: '2026-01-19', alignment: 'defected' as const, groupMajority: 'FOR' as const, mepPosition: 'AGAINST' as const, matchingOtherGroups: [] })),
    ]);
    const outliers = findOutlierWeeks(buckets, 'defectionRate', 1.5);
    expect(outliers.length).toBeGreaterThan(0);
    expect(outliers[0]?.value).toBe(100);
    expect(outliers[0]?.voteIds.length).toBe(20);
  });

  it('returns empty when series is too short or constant', () => {
    expect(findOutlierWeeks([], 'defectionRate')).toEqual([]);
    const oneBucket = bucketByWeek([
      { voteId: 'a', sittingDate: '2026-01-05', alignment: 'aligned', groupMajority: 'FOR', mepPosition: 'FOR', matchingOtherGroups: [] },
    ]);
    expect(findOutlierWeeks(oneBucket, 'defectionRate')).toEqual([]);
  });
});

describe('votingBaseline.findWoWShifts', () => {
  it('detects week-over-week defection-rate jumps', () => {
    const buckets = bucketByWeek([
      ...new Array<number>(20).fill(0).map((_, i) => ({ voteId: `w1-${String(i)}`, sittingDate: '2026-01-05', alignment: 'aligned' as const, groupMajority: 'FOR' as const, mepPosition: 'FOR' as const, matchingOtherGroups: [] })),
      ...new Array<number>(20).fill(0).map((_, i) => ({ voteId: `w2-${String(i)}`, sittingDate: '2026-01-12', alignment: 'defected' as const, groupMajority: 'FOR' as const, mepPosition: 'AGAINST' as const, matchingOtherGroups: [] })),
    ]);
    const shifts = findWoWShifts(buckets, 20);
    expect(shifts).toHaveLength(1);
    expect(shifts[0]?.delta).toBe(100);
    expect(shifts[0]?.voteIds.length).toBe(40);
  });

  it('ignores negative deltas', () => {
    const buckets = bucketByWeek([
      ...new Array<number>(10).fill(0).map((_, i) => ({ voteId: `w1-${String(i)}`, sittingDate: '2026-01-05', alignment: 'defected' as const, groupMajority: 'FOR' as const, mepPosition: 'AGAINST' as const, matchingOtherGroups: [] })),
      ...new Array<number>(10).fill(0).map((_, i) => ({ voteId: `w2-${String(i)}`, sittingDate: '2026-01-12', alignment: 'aligned' as const, groupMajority: 'FOR' as const, mepPosition: 'FOR' as const, matchingOtherGroups: [] })),
    ]);
    expect(findWoWShifts(buckets, 20)).toEqual([]);
  });
});

describe('votingBaseline.findCrossPartyAlignmentWindows', () => {
  it('detects windows where cross-party alignment exceeds the threshold', () => {
    const buckets = bucketByWeek(
      new Array<number>(10).fill(0).map((_, i) => ({
        voteId: `cp-${String(i)}`,
        sittingDate: '2026-01-19',
        alignment: 'defected' as const,
        groupMajority: 'FOR' as const,
        mepPosition: 'AGAINST' as const,
        matchingOtherGroups: ['S&D'],
      }))
    );
    const windows = findCrossPartyAlignmentWindows(buckets, 0.6);
    expect(windows).toHaveLength(1);
    expect(windows[0]?.sharePercent).toBe(100);
    expect(windows[0]?.decisive).toBe(10);
  });

  it('skips windows below the minimum decisive sample size', () => {
    const buckets = bucketByWeek([
      { voteId: 'a', sittingDate: '2026-01-19', alignment: 'defected', groupMajority: 'FOR', mepPosition: 'AGAINST', matchingOtherGroups: ['S&D'] },
      { voteId: 'b', sittingDate: '2026-01-19', alignment: 'defected', groupMajority: 'FOR', mepPosition: 'AGAINST', matchingOtherGroups: ['S&D'] },
    ]);
    expect(findCrossPartyAlignmentWindows(buckets, 0.6)).toEqual([]);
  });
});

describe('votingBaseline.coverageConfidence', () => {
  it('maps RCV inspection counts to confidence levels', () => {
    expect(coverageConfidence(0)).toBe('LOW');
    expect(coverageConfidence(9)).toBe('LOW');
    expect(coverageConfidence(10)).toBe('MEDIUM');
    expect(coverageConfidence(49)).toBe('MEDIUM');
    expect(coverageConfidence(50)).toBe('HIGH');
    expect(coverageConfidence(500)).toBe('HIGH');
  });
});

describe('votingBaseline.iteratePlenaryWeeks', () => {
  it('returns the Mondays of every plenary week intersecting [from, to]', () => {
    // 2026-01-05 is a Monday; 2026-01-26 is the start of the 4th week.
    const weeks = iteratePlenaryWeeks('2026-01-05', '2026-01-26');
    expect(weeks).toEqual(['2026-01-05', '2026-01-12', '2026-01-19', '2026-01-26']);
  });

  it('aligns mid-week start/end to the containing ISO-week Mondays', () => {
    // 2026-01-07 (Wed) — week starts 2026-01-05.
    // 2026-01-23 (Fri) — week starts 2026-01-19.
    const weeks = iteratePlenaryWeeks('2026-01-07', '2026-01-23');
    expect(weeks).toEqual(['2026-01-05', '2026-01-12', '2026-01-19']);
  });

  it('returns a single week when from and to fall in the same ISO week', () => {
    expect(iteratePlenaryWeeks('2026-01-07', '2026-01-09')).toEqual(['2026-01-05']);
  });

  it('returns an empty array for malformed bounds, reversed range, or empty inputs', () => {
    expect(iteratePlenaryWeeks('', '2026-01-09')).toEqual([]);
    expect(iteratePlenaryWeeks('2026-01-05', '')).toEqual([]);
    expect(iteratePlenaryWeeks('not-a-date', '2026-01-09')).toEqual([]);
    expect(iteratePlenaryWeeks('2026-01-26', '2026-01-05')).toEqual([]);
  });

  it('caps the enumeration at MAX_PLENARY_WEEKS for windows >6 months', () => {
    // 2025-01-01 → 2026-06-30 spans ~78 weeks → cap at 26.
    const weeks = iteratePlenaryWeeks('2025-01-01', '2026-06-30');
    expect(weeks.length).toBe(MAX_PLENARY_WEEKS);
  });

  it('returned weeks are strictly chronological and spaced 7 days apart', () => {
    const weeks = iteratePlenaryWeeks('2026-01-05', '2026-03-30');
    for (let i = 1; i < weeks.length; i += 1) {
      const prev = Date.parse(`${weeks[i - 1]}T00:00:00Z`);
      const curr = Date.parse(`${weeks[i]}T00:00:00Z`);
      expect(curr - prev).toBe(7 * 24 * 3_600_000);
    }
  });
});

describe('votingBaseline multi-week dispersion contract', () => {
  it('bucketByWeek produces ≥2 buckets for a multi-week corpus', () => {
    const buckets = bucketByWeek([
      { voteId: 'a', sittingDate: '2026-01-05', alignment: 'aligned', groupMajority: 'FOR', mepPosition: 'FOR', matchingOtherGroups: [] },
      { voteId: 'b', sittingDate: '2026-01-12', alignment: 'aligned', groupMajority: 'FOR', mepPosition: 'FOR', matchingOtherGroups: [] },
      { voteId: 'c', sittingDate: '2026-01-19', alignment: 'aligned', groupMajority: 'FOR', mepPosition: 'FOR', matchingOtherGroups: [] },
    ]);
    expect(buckets.length).toBeGreaterThanOrEqual(2);
  });

  it('computeBaseline.stdev > 0 for a dispersed weekly defection-rate series', () => {
    // Simulate three weeks with materially different defection rates — the
    // failure mode this issue was opened to fix is a single-week sample that
    // yields stdev = 0 and zero outliers regardless of the data.
    const baseline = computeBaseline([0, 50, 25]);
    expect(baseline.stdev).toBeGreaterThan(0);
  });

  it('computeBaseline.stdev === 0 for a constant (single-week-equivalent) series', () => {
    // Regression guard: this is exactly the degenerate baseline the legacy
    // single-week fetch produced — confirms the contract before/after.
    expect(computeBaseline([42, 42, 42]).stdev).toBe(0);
  });
});
