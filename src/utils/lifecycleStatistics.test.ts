/**
 * Tests for the lifecycle statistics utility.
 *
 * Covers pure helpers (median, percentile, normalizeStageKey, daysBetween,
 * sortEventsChronologically), the model builder, the lookup helper, and
 * the cached `getLifecycleStatistics` entry point with mocked EP client.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  median,
  percentile,
  daysBetween,
  normalizeStageKey,
  lifecycleKey,
  sortEventsChronologically,
  buildLifecycleStatistics,
  lookupStageStatistics,
  getLifecycleStatistics,
  resetLifecycleStatisticsCache,
  fetchEventsBounded,
  CORPUS_SIZE,
} from './lifecycleStatistics.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';
import type { EPEvent, Procedure } from '../types/europeanParliament.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProcedures: vi.fn(),
    getProcedureEvents: vi.fn(),
  },
}));

function event(id: string, date: string, type: string): EPEvent {
  return { id, title: `Event ${id}`, date, endDate: '', type, location: '', organizer: '', status: '' };
}

function procedure(id: string, type: string = 'COD'): Procedure {
  return {
    id,
    title: `Procedure ${id}`,
    reference: `2024/0000(${type})`,
    type,
    subjectMatter: '',
    stage: '',
    status: 'Ongoing',
    dateInitiated: '2024-01-01',
    dateLastActivity: '2024-06-01',
    responsibleCommittee: '',
    rapporteur: '',
    documents: [],
  };
}

describe('lifecycleStatistics - pure helpers', () => {
  describe('median', () => {
    it('returns 0 for empty input', () => {
      expect(median([])).toBe(0);
    });
    it('returns the single value for a 1-element array', () => {
      expect(median([42])).toBe(42);
    });
    it('returns the middle element for odd-length arrays', () => {
      expect(median([1, 5, 9])).toBe(5);
    });
    it('uses lower median (deterministic) for even-length arrays', () => {
      // [2, 4] → lower median = 2 (tie-stable)
      expect(median([2, 4])).toBe(2);
    });
    it('is independent of insertion order', () => {
      expect(median([9, 1, 5, 3, 7])).toBe(median([7, 1, 9, 3, 5]));
    });
  });

  describe('percentile', () => {
    it('returns 0 for empty input', () => {
      expect(percentile([], 95)).toBe(0);
    });
    it('returns the minimum (sorted[0]) when percentile<=0', () => {
      expect(percentile([3, 1, 2], 0)).toBe(1);
    });
    it('returns the maximum for p100', () => {
      expect(percentile([10, 20, 30, 40], 100)).toBe(40);
    });
    it('computes p95 deterministically (nearest-rank)', () => {
      const samples = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      // ceil(0.95 * 10) = 10 → 100
      expect(percentile(samples, 95)).toBe(100);
    });
    it('is independent of insertion order', () => {
      expect(percentile([5, 1, 4, 2, 3], 95)).toBe(percentile([1, 2, 3, 4, 5], 95));
    });
  });

  describe('daysBetween', () => {
    it('returns 0 when either date is empty', () => {
      expect(daysBetween('', '2024-01-01')).toBe(0);
      expect(daysBetween('2024-01-01', '')).toBe(0);
    });
    it('returns 0 for invalid input', () => {
      expect(daysBetween('not-a-date', '2024-01-01')).toBe(0);
    });
    it('computes positive day delta', () => {
      expect(daysBetween('2024-01-01', '2024-01-31')).toBe(30);
    });
    it('clamps negative deltas to 0', () => {
      expect(daysBetween('2024-02-01', '2024-01-01')).toBe(0);
    });
  });

  describe('normalizeStageKey', () => {
    it('returns empty for empty input', () => {
      expect(normalizeStageKey('')).toBe('');
    });
    it('uppercases short codes', () => {
      expect(normalizeStageKey('referral')).toBe('REFERRAL');
    });
    it('strips URI prefix', () => {
      expect(normalizeStageKey('def/ep-activities/COM_VOTE')).toBe('COM_VOTE');
    });
    it('trims whitespace', () => {
      expect(normalizeStageKey('  REFERRAL  ')).toBe('REFERRAL');
    });
  });

  describe('lifecycleKey', () => {
    it('joins type and stage with delimiter', () => {
      expect(lifecycleKey('COD', 'REFERRAL')).toBe('COD::REFERRAL');
    });
  });

  describe('sortEventsChronologically', () => {
    it('sorts ascending by date', () => {
      const sorted = sortEventsChronologically([
        event('B', '2024-06-01', 'COM_VOTE'),
        event('A', '2024-01-01', 'REFERRAL'),
      ]);
      expect(sorted.map(e => e.id)).toEqual(['A', 'B']);
    });
    it('breaks ties on event id (deterministic)', () => {
      const sorted = sortEventsChronologically([
        event('B', '2024-01-01', 'X'),
        event('A', '2024-01-01', 'Y'),
      ]);
      expect(sorted.map(e => e.id)).toEqual(['A', 'B']);
    });
    it('drops events with invalid or empty dates', () => {
      const sorted = sortEventsChronologically([
        event('A', '', 'REFERRAL'),
        event('B', 'not-a-date', 'COM_VOTE'),
        event('C', '2024-01-01', 'EP_ADOPTION'),
      ]);
      expect(sorted.map(e => e.id)).toEqual(['C']);
    });
  });
});

describe('lifecycleStatistics - buildLifecycleStatistics', () => {
  it('returns an empty model for empty input', () => {
    const model = buildLifecycleStatistics([], new Map());
    expect(model.byTypeAndStage.size).toBe(0);
    expect(model.corpusSize).toBe(0);
    expect(model.totalObservations).toBe(0);
  });

  it('skips procedures with fewer than 2 events', () => {
    const procs = [procedure('P1')];
    const events = new Map<string, EPEvent[]>([['P1', [event('E1', '2024-01-01', 'REFERRAL')]]]);
    const model = buildLifecycleStatistics(procs, events);
    expect(model.corpusSize).toBe(0);
  });

  it('builds per-(type, stage) median and p95 from event timelines', () => {
    const procs = [procedure('P1'), procedure('P2'), procedure('P3'), procedure('P4')];
    const eventsMap = new Map<string, EPEvent[]>();
    // 4 COD procedures, each with REFERRAL → COM_VOTE → EP_ADOPTION.
    // Dwell at REFERRAL: 10, 20, 30, 40 days. Median = 20 (lower), p95 = 40.
    const dwells = [10, 20, 30, 40];
    for (let i = 0; i < 4; i++) {
      const dwell = dwells[i] ?? 0;
      const comVoteDate = new Date(
        new Date('2024-01-01').getTime() + dwell * 24 * 3600 * 1000
      ).toISOString().slice(0, 10);
      eventsMap.set(`P${String(i + 1)}`, [
        event('R', '2024-01-01', 'REFERRAL'),
        event('CV', comVoteDate, 'COM_VOTE'),
        event('EA', '2024-06-01', 'EP_ADOPTION'),
      ]);
    }
    const model = buildLifecycleStatistics(procs, eventsMap);
    expect(model.corpusSize).toBe(4);
    const referralStats = model.byTypeAndStage.get('COD::REFERRAL');
    expect(referralStats).toBeDefined();
    expect(referralStats?.sampleSize).toBe(4);
    expect(referralStats?.medianDwellDays).toBe(20);
    expect(referralStats?.p95DwellDays).toBe(40);
  });

  it('classifies procedures with empty type as UNKNOWN', () => {
    const proc: Procedure = { ...procedure('PX'), type: '' };
    const eventsMap = new Map<string, EPEvent[]>([
      ['PX', [
        event('A', '2024-01-01', 'REFERRAL'),
        event('B', '2024-02-01', 'COM_VOTE'),
      ]],
    ]);
    const model = buildLifecycleStatistics([proc], eventsMap);
    expect(model.byTypeAndStage.has('UNKNOWN::REFERRAL')).toBe(true);
  });

  it('iterates byTypeAndStage in sorted key order (deterministic)', () => {
    const procs = [procedure('P1', 'NLE'), procedure('P2', 'COD')];
    const eventsMap = new Map<string, EPEvent[]>();
    eventsMap.set('P1', [event('A', '2024-01-01', 'B_STAGE'), event('B', '2024-02-01', 'X')]);
    eventsMap.set('P2', [event('A', '2024-01-01', 'A_STAGE'), event('B', '2024-02-01', 'X')]);
    const model = buildLifecycleStatistics(procs, eventsMap);
    const keys = [...model.byTypeAndStage.keys()];
    expect(keys).toEqual([...keys].sort());
  });
});

describe('lifecycleStatistics - lookupStageStatistics', () => {
  it('returns undefined for empty inputs', () => {
    const model = buildLifecycleStatistics([], new Map());
    expect(lookupStageStatistics(model, '', '')).toBeUndefined();
    expect(lookupStageStatistics(model, 'COD', '')).toBeUndefined();
  });

  it('returns the exact (type, stage) cell when available', () => {
    const procs = [procedure('P1'), procedure('P2'), procedure('P3')];
    const eventsMap = new Map<string, EPEvent[]>();
    for (let i = 0; i < 3; i++) {
      eventsMap.set(`P${String(i + 1)}`, [
        event('A', '2024-01-01', 'REFERRAL'),
        event('B', '2024-02-01', 'COM_VOTE'),
      ]);
    }
    const model = buildLifecycleStatistics(procs, eventsMap);
    const stats = lookupStageStatistics(model, 'COD', 'REFERRAL');
    expect(stats?.sampleSize).toBe(3);
  });

  it('normalises URI-style stage keys before lookup', () => {
    const procs = [procedure('P1'), procedure('P2')];
    const eventsMap = new Map<string, EPEvent[]>([
      ['P1', [event('A', '2024-01-01', 'REFERRAL'), event('B', '2024-02-01', 'COM_VOTE')]],
      ['P2', [event('A', '2024-01-01', 'REFERRAL'), event('B', '2024-02-01', 'COM_VOTE')]],
    ]);
    const model = buildLifecycleStatistics(procs, eventsMap);
    const stats = lookupStageStatistics(model, 'COD', 'def/ep-activities/REFERRAL');
    expect(stats).toBeDefined();
  });
});

describe('lifecycleStatistics - fetchEventsBounded', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips failed fetches without aborting the whole batch', async () => {
    vi.mocked(epClientModule.epClient.getProcedureEvents).mockImplementation(
      async (id: string) => {
        if (id === 'P-FAIL') return Promise.reject(new Error('500'));
        return Promise.resolve({
          data: [event('E', '2024-01-01', 'REFERRAL')],
          total: 1, limit: 50, offset: 0, hasMore: false,
        });
      }
    );
    const procs = [procedure('P-OK1'), procedure('P-FAIL'), procedure('P-OK2')];
    const results = await fetchEventsBounded(procs);
    expect(results.has('P-OK1')).toBe(true);
    expect(results.has('P-OK2')).toBe(true);
    expect(results.has('P-FAIL')).toBe(false);
  });

  it('respects the concurrency bound', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    vi.mocked(epClientModule.epClient.getProcedureEvents).mockImplementation(
      async () => {
        inFlight++;
        if (inFlight > maxInFlight) maxInFlight = inFlight;
        await new Promise<void>(resolve => { setTimeout(resolve, 5); });
        inFlight--;
        return Promise.resolve({ data: [], total: 0, limit: 50, offset: 0, hasMore: false });
      }
    );
    const procs = Array.from({ length: 20 }, (_, i) => procedure(`P-${String(i)}`));
    await fetchEventsBounded(procs, 4);
    expect(maxInFlight).toBeLessThanOrEqual(4);
  });
});

describe('lifecycleStatistics - getLifecycleStatistics caching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetLifecycleStatisticsCache();
  });

  it('memoises the model within the cache TTL', async () => {
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
      data: [procedure('P1')], total: 1, limit: CORPUS_SIZE, offset: 0, hasMore: false,
    });
    vi.mocked(epClientModule.epClient.getProcedureEvents).mockResolvedValue({
      data: [event('A', '2024-01-01', 'REFERRAL'), event('B', '2024-02-01', 'COM_VOTE')],
      total: 2, limit: 50, offset: 0, hasMore: false,
    });
    const a = await getLifecycleStatistics();
    const b = await getLifecycleStatistics();
    // Same instance returned without an additional getProcedures call.
    expect(a).toBe(b);
    expect(vi.mocked(epClientModule.epClient.getProcedures)).toHaveBeenCalledTimes(1);
  });

  it('forceRefresh bypasses the cache', async () => {
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
      data: [procedure('P1')], total: 1, limit: CORPUS_SIZE, offset: 0, hasMore: false,
    });
    vi.mocked(epClientModule.epClient.getProcedureEvents).mockResolvedValue({
      data: [], total: 0, limit: 50, offset: 0, hasMore: false,
    });
    await getLifecycleStatistics();
    await getLifecycleStatistics({ forceRefresh: true });
    expect(vi.mocked(epClientModule.epClient.getProcedures)).toHaveBeenCalledTimes(2);
  });

  it('resetLifecycleStatisticsCache clears memoisation', async () => {
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
      data: [procedure('P1')], total: 1, limit: CORPUS_SIZE, offset: 0, hasMore: false,
    });
    vi.mocked(epClientModule.epClient.getProcedureEvents).mockResolvedValue({
      data: [], total: 0, limit: 50, offset: 0, hasMore: false,
    });
    await getLifecycleStatistics();
    resetLifecycleStatisticsCache();
    await getLifecycleStatistics();
    expect(vi.mocked(epClientModule.epClient.getProcedures)).toHaveBeenCalledTimes(2);
  });
});
