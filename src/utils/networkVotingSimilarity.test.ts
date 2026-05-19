/**
 * Tests for src/utils/networkVotingSimilarity.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { computeNetworkVotingSimilarityFromDoceo } from './networkVotingSimilarity.js';
import * as doceoClientModule from '../clients/ep/doceoClient.js';

vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: { getLatestVotes: vi.fn() },
}));

const baseResp = {
  total: 0,
  datesAvailable: [],
  datesUnavailable: [],
  source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
  limit: 100,
  offset: 0,
  hasMore: false,
};

function rcv(
  id: string,
  mepVotes: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>
): {
  id: string; date: string; term: number; subject: string; reference: string;
  votesFor: number; votesAgainst: number; abstentions: number;
  result: 'ADOPTED'; mepVotes: typeof mepVotes;
  sourceUrl: string; dataSource: 'RCV';
} {
  return {
    id, date: '2026-01-15', term: 10, subject: 's', reference: 'r',
    votesFor: 0, votesAgainst: 0, abstentions: 0, result: 'ADOPTED',
    mepVotes, sourceUrl: 'https://example/test', dataSource: 'RCV',
  };
}

describe('computeNetworkVotingSimilarityFromDoceo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty edges when subset is empty', async () => {
    const result = await computeNetworkVotingSimilarityFromDoceo(new Set());
    expect(result?.edges).toEqual([]);
    expect(result?.rcvVotesInspected).toBe(0);
  });

  it('builds Jaccard-like edges for fully agreeing MEPs', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...baseResp,
      data: [
        rcv('v1', { A: 'FOR', B: 'FOR', C: 'AGAINST' }),
        rcv('v2', { A: 'FOR', B: 'FOR', C: 'AGAINST' }),
        rcv('v3', { A: 'FOR', B: 'FOR', C: 'AGAINST' }),
      ],
    });

    const result = await computeNetworkVotingSimilarityFromDoceo(new Set(['A', 'B', 'C']));
    expect(result).not.toBeNull();
    expect(result?.rcvVotesInspected).toBe(3);
    // A&B agree on all 3 decisive votes → similarity 1.0
    const ab = result?.edges.find(e =>
      (e.sourceId === 'A' && e.targetId === 'B') ||
      (e.sourceId === 'B' && e.targetId === 'A')
    );
    expect(ab?.similarity).toBe(1);
    // A&C disagree on all 3 → similarity 0 < 0.7 → omitted
    const ac = result?.edges.find(e =>
      (e.sourceId === 'A' && e.targetId === 'C') ||
      (e.sourceId === 'C' && e.targetId === 'A')
    );
    expect(ac).toBeUndefined();
  });

  it('drops pairs with too few shared decisive votes', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...baseResp,
      data: [
        rcv('v1', { A: 'FOR', B: 'FOR' }),
        rcv('v2', { A: 'FOR', B: 'FOR' }),
      ],
    });
    const result = await computeNetworkVotingSimilarityFromDoceo(new Set(['A', 'B']));
    // Only 2 shared decisive votes → below MIN_SHARED_DECISIVE_VOTES (3).
    expect(result?.edges).toEqual([]);
  });

  it('respects minSimilarity threshold', async () => {
    const data = [];
    for (let i = 0; i < 10; i++) {
      // A always votes FOR; B votes FOR on the first 6 and AGAINST on the rest
      // → 6/10 agreement → similarity 0.6.
      const bPos: 'FOR' | 'AGAINST' = i < 6 ? 'FOR' : 'AGAINST';
      data.push(rcv(`v${String(i)}`, { A: 'FOR', B: bPos }));
    }
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...baseResp,
      data,
    });
    const high = await computeNetworkVotingSimilarityFromDoceo(new Set(['A', 'B']), { minSimilarity: 0.7 });
    expect(high?.edges).toEqual([]);
    const low = await computeNetworkVotingSimilarityFromDoceo(new Set(['A', 'B']), { minSimilarity: 0.5 });
    expect(low?.edges.length).toBe(1);
    expect(low?.edges[0]?.similarity).toBeCloseTo(0.6, 2);
  });

  it('ignores abstentions when computing similarity', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      ...baseResp,
      data: [
        rcv('v1', { A: 'FOR', B: 'ABSTAIN' }),
        rcv('v2', { A: 'FOR', B: 'ABSTAIN' }),
        rcv('v3', { A: 'FOR', B: 'ABSTAIN' }),
      ],
    });
    const result = await computeNetworkVotingSimilarityFromDoceo(new Set(['A', 'B']));
    expect(result?.edges).toEqual([]);
  });

  it('returns null when DOCEO call throws', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(new Error('boom'));
    const result = await computeNetworkVotingSimilarityFromDoceo(new Set(['A']));
    expect(result).toBeNull();
  });

  it('throws RangeError for an invalid limit instead of swallowing it as a DOCEO outage', async () => {
    await expect(
      computeNetworkVotingSimilarityFromDoceo(new Set(['A', 'B']), { limit: 0 })
    ).rejects.toBeInstanceOf(RangeError);
    await expect(
      computeNetworkVotingSimilarityFromDoceo(new Set(['A', 'B']), { limit: 200 })
    ).rejects.toBeInstanceOf(RangeError);
    expect(doceoClientModule.doceoClient.getLatestVotes).not.toHaveBeenCalled();
  });
});
