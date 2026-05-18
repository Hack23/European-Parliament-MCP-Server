/**
 * Tests for src/utils/doceoMepAggregator.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  computeMepVotingActivityFromDoceo,
  clearDoceoMepAggregatorCache,
} from './doceoMepAggregator.js';
import * as doceoClientModule from '../clients/ep/doceoClient.js';
import type { LatestVoteRecord } from '../clients/ep/doceoXmlParser.js';
import type { LatestVotesResponse } from '../clients/ep/doceoClient.js';

vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn(),
  },
}));

const baseVote: LatestVoteRecord = {
  id: 'RCV-10-2026-05-15-001',
  date: '2026-05-15',
  term: 10,
  subject: 'Test vote',
  reference: 'A10-0001/2026',
  votesFor: 300,
  votesAgainst: 200,
  abstentions: 50,
  result: 'ADOPTED',
  mepVotes: {
    'MEP-1': 'FOR',
    'MEP-2': 'AGAINST',
    'MEP-3': 'ABSTAIN',
  },
  groupBreakdown: {
    EPP: { for: 150, against: 10, abstain: 5 },
    'S&D': { for: 5, against: 120, abstain: 8 },
  },
  sourceUrl: 'https://www.europarl.europa.eu/doceo/test.xml',
  dataSource: 'RCV',
  sittingDate: '2026-05-15',
};

const emptyResponse: LatestVotesResponse = {
  data: [],
  total: 0,
  datesAvailable: [],
  datesUnavailable: [],
  source: { type: 'DOCEO_XML', term: 10, urls: [] },
  limit: 100,
  offset: 0,
  hasMore: false,
};

describe('computeMepVotingActivityFromDoceo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearDoceoMepAggregatorCache();
  });

  it('aggregates FOR/AGAINST/ABSTAIN counts for the requested MEP', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [
        baseVote,
        { ...baseVote, id: 'v2', mepVotes: { 'MEP-1': 'AGAINST' } },
        { ...baseVote, id: 'v3', mepVotes: { 'MEP-1': 'ABSTAIN' } },
      ],
      total: 3,
    });

    const result = await computeMepVotingActivityFromDoceo('MEP-1', { politicalGroup: 'EPP' });
    expect(result).not.toBeNull();
    expect(result?.dataSource).toBe('DOCEO');
    expect(result?.stats.totalVotes).toBe(3);
    expect(result?.stats.votesFor).toBe(1);
    expect(result?.stats.votesAgainst).toBe(1);
    expect(result?.stats.abstentions).toBe(1);
    expect(result?.stats.rcvVotesInspected).toBe(3);
    expect(result?.stats.attendanceRate).toBe(100);
  });

  it('computes loyalty score from group majority alignment', async () => {
    // Vote 1: MEP-1 FOR, EPP majority FOR → agree
    // Vote 2: MEP-1 AGAINST, EPP majority FOR → disagree
    // Decisive votes considered: 2; agreements: 1 → 50%
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [
        baseVote,
        { ...baseVote, id: 'v2', mepVotes: { 'MEP-1': 'AGAINST' } },
      ],
      total: 2,
    });

    const result = await computeMepVotingActivityFromDoceo('MEP-1', { politicalGroup: 'EPP' });
    expect(result?.stats.loyaltyScore).toBe(50);
  });

  it('returns null loyaltyScore when political group is not provided', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [baseVote],
      total: 1,
    });

    const result = await computeMepVotingActivityFromDoceo('MEP-1');
    expect(result?.stats.loyaltyScore).toBeNull();
  });

  it('filters votes outside the requested date range', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [
        { ...baseVote, sittingDate: '2026-04-01', date: '2026-04-01' },
        { ...baseVote, sittingDate: '2026-05-15', date: '2026-05-15' },
        { ...baseVote, sittingDate: '2026-06-01', date: '2026-06-01' },
      ],
      total: 3,
    });

    const result = await computeMepVotingActivityFromDoceo('MEP-1', {
      dateFrom: '2026-05-01',
      dateTo: '2026-05-31',
    });
    expect(result?.stats.rcvVotesInspected).toBe(1);
  });

  it('skips non-RCV records (e.g. VOT data)', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [
        baseVote,
        { ...baseVote, id: 'vot1', dataSource: 'VOT', mepVotes: { 'MEP-1': 'FOR' } },
      ],
      total: 2,
    });

    const result = await computeMepVotingActivityFromDoceo('MEP-1');
    expect(result?.stats.rcvVotesInspected).toBe(1);
  });

  it('returns null when DOCEO call rejects', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(new Error('Network'));
    const result = await computeMepVotingActivityFromDoceo('MEP-1');
    expect(result).toBeNull();
  });

  it('caches results by (mepId, dateFrom, dateTo)', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [baseVote],
      total: 1,
    });

    const first = await computeMepVotingActivityFromDoceo('MEP-1', { dateFrom: '2026-01-01' });
    const second = await computeMepVotingActivityFromDoceo('MEP-1', { dateFrom: '2026-01-01' });

    expect(first?.cacheHit).toBe(false);
    expect(second?.cacheHit).toBe(true);
    expect(vi.mocked(doceoClientModule.doceoClient.getLatestVotes)).toHaveBeenCalledTimes(1);
  });

  it('uses separate cache entries for different MEPs', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [baseVote],
      total: 1,
    });

    await computeMepVotingActivityFromDoceo('MEP-1');
    await computeMepVotingActivityFromDoceo('MEP-2');

    expect(vi.mocked(doceoClientModule.doceoClient.getLatestVotes)).toHaveBeenCalledTimes(2);
  });

  it('uses separate cache entries for different politicalGroup values', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [baseVote],
      total: 1,
    });

    const withGroup = await computeMepVotingActivityFromDoceo('MEP-1', { politicalGroup: 'EPP' });
    const withoutGroup = await computeMepVotingActivityFromDoceo('MEP-1');

    // Different politicalGroup → different cache key → two DOCEO fetches.
    expect(vi.mocked(doceoClientModule.doceoClient.getLatestVotes)).toHaveBeenCalledTimes(2);
    expect(withGroup?.cacheHit).toBe(false);
    expect(withoutGroup?.cacheHit).toBe(false);
  });

  it('returns null when DOCEO call exceeds the configured timeout', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockImplementation(
      async (params: { abortSignal?: AbortSignal } = {}) => {
        const signal = params.abortSignal;
        return new Promise<LatestVotesResponse>((resolve, reject) => {
          const onAbort = (): void => {
            if (signal !== undefined) signal.removeEventListener('abort', onAbort);
            reject(new Error('aborted'));
          };
          if (signal !== undefined) signal.addEventListener('abort', onAbort);
          setTimeout(() => { resolve(emptyResponse); }, 5_000);
        });
      }
    );

    const result = await computeMepVotingActivityFromDoceo('MEP-1', { timeoutMs: 25 });
    expect(result).toBeNull();
  });

  it('reports zero attendanceRate when no DOCEO RCV votes were inspected', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue(emptyResponse);
    const result = await computeMepVotingActivityFromDoceo('MEP-1');
    expect(result?.stats.attendanceRate).toBe(0);
    expect(result?.stats.totalVotes).toBe(0);
    expect(result?.rcvVotesInspected).toBe(0);
  });

  it('passes weekStart derived from dateTo to the DOCEO client', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue(emptyResponse);

    await computeMepVotingActivityFromDoceo('MEP-1', {
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });

    expect(vi.mocked(doceoClientModule.doceoClient.getLatestVotes)).toHaveBeenCalledWith(
      expect.objectContaining({ weekStart: '2024-12-31' })
    );
  });

  it('passes weekStart derived from dateFrom when only dateFrom is set', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue(emptyResponse);

    await computeMepVotingActivityFromDoceo('MEP-1', { dateFrom: '2024-05-01' });

    expect(vi.mocked(doceoClientModule.doceoClient.getLatestVotes)).toHaveBeenCalledWith(
      expect.objectContaining({ weekStart: '2024-05-01' })
    );
  });

  it('returns totalVotes 0 when MEP is absent from all RCV rolls', async () => {
    // rcvVotesInspected > 0 but the MEP never appears in mepVotes.
    const voteWithoutMep = { ...baseVote, mepVotes: { 'OTHER-MEP': 'FOR' as const } };
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [voteWithoutMep, voteWithoutMep],
      total: 2,
    });

    const result = await computeMepVotingActivityFromDoceo('MEP-1');
    expect(result).not.toBeNull();
    // rcvVotesInspected counts the inspected records, but totalVotes is 0.
    expect(result?.rcvVotesInspected).toBe(2);
    expect(result?.stats.totalVotes).toBe(0);
  });

  it('computes loyalty from raw DOCEO group labels (e.g. RE for Renew, Verts/ALE for Greens/EFA)', async () => {
    // Simulate a DOCEO breakdown using the short raw label 'RE' for the Renew group.
    const voteWithRawLabel = {
      ...baseVote,
      mepVotes: { 'MEP-1': 'FOR' as const },
      groupBreakdown: {
        // Raw DOCEO label that normalizes to 'Renew'.
        RE: { for: 100, against: 10, abstain: 5 },
      },
    };
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [voteWithRawLabel],
      total: 1,
    });

    // MEP belongs to the Renew group (full EP API label → normalizes to 'Renew').
    const result = await computeMepVotingActivityFromDoceo('MEP-1', {
      politicalGroup: 'Renew Europe Group',
    });
    // MEP-1 voted FOR; RE majority is FOR → 100% loyalty.
    expect(result?.stats.loyaltyScore).toBe(100);
  });

  it('normalizes political group labels before computing loyalty', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...emptyResponse,
      data: [baseVote],
      total: 1,
    });

    // Pass the full EPP label that should normalize to 'EPP'.
    const result = await computeMepVotingActivityFromDoceo('MEP-1', {
      politicalGroup: "Group of the European People's Party (Christian Democrats)",
    });
    // MEP-1 voted FOR, EPP majority FOR → 100% loyalty.
    expect(result?.stats.loyaltyScore).toBe(100);
  });
});
