/**
 * @fileoverview Pairwise MEP voting-similarity helper for network OSINT.
 *
 * Fetches DOCEO RCV records once and computes Jaccard-like agreement
 * scores over the set of **decisive** votes (FOR / AGAINST only — abstentions
 * excluded) that two MEPs jointly participated in.
 *
 * `similarity(A, B) = sharedAgreements(A, B) / sharedDecisiveVotes(A, B)`
 *
 * Pairs with fewer than {@link MIN_SHARED_DECISIVE_VOTES} co-participations
 * are skipped to suppress spurious edges with poor statistical support.
 *
 * The helper is intentionally narrow — it does NOT cache the matrix, since
 * each `network_analysis` call may scope to a different MEP subset.
 *
 * Behaviour mirrors `computeCoalitionCohesionFromDoceo`:
 * - bounded by `withTimeoutAndAbort` (default 5 s — larger than the 2 s
 *   cohesion guard because individual-vote XML is heavier)
 * - errors are silently suppressed → the caller falls back to committee edges
 *
 * ISMS Policy: SC-002, AC-003, AU-002. GDPR Article 5(1)(d) — accuracy
 * (Open-data public-figure data, decisive RCVs only).
 *
 * @module utils/networkVotingSimilarity
 * @since 1.4.0
 */

import { doceoClient } from '../clients/ep/doceoClient.js';
import { withTimeoutAndAbort } from './timeout.js';
import { auditLogger, toErrorMessage } from './auditLogger.js';

/** Default DOCEO timeout for the network helper (ms). */
export const NETWORK_VOTING_SIMILARITY_TIMEOUT_MS = 5_000;

/** Minimum shared decisive votes for a similarity score to be reported. */
export const MIN_SHARED_DECISIVE_VOTES = 3;

/** Default page size for the DOCEO fetch (matches coalition cohesion). */
export const DEFAULT_DOCEO_PAGE_SIZE = 100;

/**
 * Result of a single similarity computation between MEPs.
 */
export interface VotingSimilarityEdge {
  /** Stable lexicographic-first MEP id. */
  sourceId: string;
  /** Stable lexicographic-second MEP id. */
  targetId: string;
  /** Agreement share in `[0, 1]`. */
  similarity: number;
  /** Number of decisive votes both MEPs participated in. */
  sharedDecisiveVotes: number;
}

/**
 * Result envelope for {@link computeNetworkVotingSimilarityFromDoceo}.
 */
export interface NetworkVotingSimilarityResult {
  /** Pairs with similarity ≥ `minSimilarity` and ≥ {@link MIN_SHARED_DECISIVE_VOTES} co-participations. */
  edges: VotingSimilarityEdge[];
  /** Number of DOCEO RCV records inspected. */
  rcvVotesInspected: number;
  /** Whether the result was served from DOCEO (always `'DOCEO'` on success). */
  dataSource: 'DOCEO';
}

/** Options accepted by {@link computeNetworkVotingSimilarityFromDoceo}. */
export interface ComputeNetworkVotingSimilarityOptions {
  /** Minimum similarity score (default 0.7). */
  minSimilarity?: number;
  /** Max DOCEO records to fetch (default 100). */
  limit?: number;
  /** Override the default 5 s DOCEO timeout (ms). */
  timeoutMs?: number;
  /** Plenary-week anchor passed through to `doceoClient.getLatestVotes`. */
  weekStart?: string;
}

interface PairCounts {
  agreements: number;
  shared: number;
}

function makePairKey(a: string, b: string): { key: string; first: string; second: string } {
  if (a < b) return { key: `${a}|${b}`, first: a, second: b };
  return { key: `${b}|${a}`, first: b, second: a };
}

/**
 * Compute pairwise voting-similarity edges for the supplied MEP id set.
 *
 * Only MEP ids in `mepIdSubset` are considered, keeping the O(V²) inner loop
 * bounded by the caller's network size (≤ 900 MEPs).
 *
 * @param mepIdSubset - Set of MEP ids to score (typically the network nodes).
 * @param options - Optional bounds and timeout overrides.
 * @returns Edges with similarity ≥ `minSimilarity` (default 0.7) and
 *   ≥ {@link MIN_SHARED_DECISIVE_VOTES} co-participations, or `null` when
 *   DOCEO is unavailable.
 *
 * @security Errors are audit-logged as `network_voting_similarity.fetch` —
 *   only the inspected count and node count are logged; no PII.
 */
function extractDecisiveMeps(
  mepVotes: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>,
  subset: ReadonlySet<string>
): { id: string; pos: 'FOR' | 'AGAINST' }[] {
  const out: { id: string; pos: 'FOR' | 'AGAINST' }[] = [];
  for (const [id, pos] of Object.entries(mepVotes)) {
    if (pos === 'ABSTAIN') continue;
    if (!subset.has(id)) continue;
    out.push({ id, pos });
  }
  return out;
}

function tallyPairs(
  decisive: readonly { id: string; pos: 'FOR' | 'AGAINST' }[],
  pairs: Map<string, PairCounts>
): void {
  for (let i = 0; i < decisive.length; i++) {
    const a = decisive[i];
    if (a === undefined) continue;
    for (let j = i + 1; j < decisive.length; j++) {
      const b = decisive[j];
      if (b === undefined) continue;
      const { key } = makePairKey(a.id, b.id);
      let counts = pairs.get(key);
      if (counts === undefined) {
        counts = { agreements: 0, shared: 0 };
        pairs.set(key, counts);
      }
      counts.shared += 1;
      if (a.pos === b.pos) counts.agreements += 1;
    }
  }
}

function compareEdge(a: VotingSimilarityEdge, b: VotingSimilarityEdge): number {
  if (a.sourceId !== b.sourceId) return a.sourceId < b.sourceId ? -1 : 1;
  if (a.targetId === b.targetId) return 0;
  return a.targetId < b.targetId ? -1 : 1;
}

function buildEdgesFromPairs(
  pairs: Map<string, PairCounts>,
  minSimilarity: number
): VotingSimilarityEdge[] {
  const edges: VotingSimilarityEdge[] = [];
  for (const [key, counts] of pairs) {
    if (counts.shared < MIN_SHARED_DECISIVE_VOTES) continue;
    const similarity = counts.agreements / counts.shared;
    // Exclude zero-similarity edges even when minSimilarity=0 to avoid
    // 0-weight edges that cause inconsistencies in weighted algorithms.
    if (similarity <= 0 || similarity < minSimilarity) continue;
    const [sourceId, targetId] = key.split('|') as [string, string];
    edges.push({
      sourceId,
      targetId,
      similarity: Math.round(similarity * 10000) / 10000,
      sharedDecisiveVotes: counts.shared,
    });
  }
  edges.sort(compareEdge);
  return edges;
}

export async function computeNetworkVotingSimilarityFromDoceo(
  mepIdSubset: ReadonlySet<string>,
  options: ComputeNetworkVotingSimilarityOptions = {}
): Promise<NetworkVotingSimilarityResult | null> {
  const minSimilarity = options.minSimilarity ?? 0.7;
  const limit = options.limit ?? DEFAULT_DOCEO_PAGE_SIZE;
  const timeoutMs = options.timeoutMs ?? NETWORK_VOTING_SIMILARITY_TIMEOUT_MS;

  // Validate `limit` *before* the try/catch so a misuse (e.g. caller-supplied
  // 0 or 200) surfaces as a RangeError instead of being swallowed and made
  // indistinguishable from a real DOCEO outage (which returns `null`).
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      `computeNetworkVotingSimilarityFromDoceo: options.limit must be an integer in [1, 100], received ${String(limit)}`
    );
  }

  if (mepIdSubset.size === 0) {
    return { edges: [], rcvVotesInspected: 0, dataSource: 'DOCEO' };
  }

  try {
    const response = await withTimeoutAndAbort(
      (signal) => doceoClient.getLatestVotes({
        includeIndividualVotes: true,
        limit,
        weekStart: options.weekStart,
        abortSignal: signal,
      }),
      timeoutMs,
      'Network voting similarity DOCEO fetch timed out'
    );

    const pairs = new Map<string, PairCounts>();
    let rcvVotesInspected = 0;
    for (const vote of response.data) {
      if (vote.dataSource !== 'RCV') continue;
      if (vote.mepVotes === undefined) continue;
      rcvVotesInspected += 1;
      const decisiveMeps = extractDecisiveMeps(vote.mepVotes, mepIdSubset);
      tallyPairs(decisiveMeps, pairs);
    }

    const edges = buildEdgesFromPairs(pairs, minSimilarity);
    return { edges, rcvVotesInspected, dataSource: 'DOCEO' };
  } catch (error: unknown) {
    auditLogger.logError(
      'network_voting_similarity.fetch',
      { nodeCount: mepIdSubset.size },
      toErrorMessage(error)
    );
    return null;
  }
}
