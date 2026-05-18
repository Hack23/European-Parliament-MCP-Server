/**
 * @fileoverview DOCEO per-MEP voting aggregator.
 *
 * Aggregates per-MEP roll-call voting statistics from the EP DOCEO XML
 * source. Designed to be shared by OSINT tools (`assess_mep_influence`,
 * `detect_voting_anomalies`, `comparative_intelligence`) that need real
 * RCV-derived voting activity instead of the placeholder zeros returned
 * by `MEPDetails.votingStatistics` when the EP API has no per-MEP data.
 *
 * Behaviour mirrors `computeCoalitionCohesionFromDoceo` in
 * `src/tools/analyzeCoalitionDynamics.ts`:
 * - bounded by `withTimeoutAndAbort` (default 2 s)
 * - results cached for 5 minutes per `${mepId}|${dateFrom}|${dateTo}`
 * - empty/failed results are also cached briefly to avoid storms
 *
 * Source: `doceoClient.getLatestVotes()` (EP DOCEO XML).
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege),
 *   AU-002 (Audit Logging). GDPR Article 5(1)(d) — accuracy principle.
 *
 * @module utils/doceoMepAggregator
 * @since 1.4.0
 */

import { doceoClient } from '../clients/ep/doceoClient.js';
import { withTimeoutAndAbort } from './timeout.js';
import { auditLogger, toErrorMessage } from './auditLogger.js';
import { normalizePoliticalGroup } from './politicalGroupNormalization.js';
import type { LatestVoteRecord } from '../clients/ep/doceoXmlParser.js';

/** Default per-call DOCEO timeout (ms). Matches the coalition cohesion guard. */
export const DOCEO_MEP_AGGREGATOR_TIMEOUT_MS = 2_000;

/** Cache TTL for per-MEP aggregates (ms). Mirrors DOCEO cohesion cache. */
export const DOCEO_MEP_AGGREGATOR_CACHE_TTL_MS = 5 * 60_000;

/**
 * Aggregated per-MEP voting statistics derived from DOCEO RCV data.
 */
export interface MepVotingAggregateStats {
  /** Number of RCV votes considered (where the MEP appeared on the roll). */
  totalVotes: number;
  /** RCV votes the MEP cast as FOR. */
  votesFor: number;
  /** RCV votes the MEP cast as AGAINST. */
  votesAgainst: number;
  /** RCV votes the MEP cast as ABSTAIN. */
  abstentions: number;
  /**
   * Participation rate as `totalVotes / rcvVotesInspected * 100`. When no DOCEO
   * RCV votes were inspected, returns 0.
   */
  attendanceRate: number;
  /**
   * % of decisive votes (FOR/AGAINST) where the MEP voted with the
   * majority of their political group. `null` when the group cannot
   * be resolved from the MEP details or no DOCEO data was available.
   */
  loyaltyScore: number | null;
  /** Total number of RCV votes inspected from DOCEO for the period. */
  rcvVotesInspected: number;
}

/**
 * Result returned by {@link computeMepVotingActivityFromDoceo}.
 */
export interface DoceoMepAggregateResult {
  /** Aggregated voting statistics. */
  stats: MepVotingAggregateStats;
  /** Always `'DOCEO'`. */
  dataSource: 'DOCEO';
  /** `true` when this result was served from the in-memory cache. */
  cacheHit: boolean;
  /** Number of DOCEO RCV votes inspected (mirrors `stats.rcvVotesInspected`). */
  rcvVotesInspected: number;
}

interface CacheEntry {
  expiresAt: number;
  value: DoceoMepAggregateResult;
}

const aggregateCache = new Map<string, CacheEntry>();

/** Cache size cap to bound memory usage. */
const MAX_CACHE_ENTRIES = 1000;

function makeCacheKey(mepId: string, dateFrom: string | undefined, dateTo: string | undefined): string {
  return `${mepId}|${dateFrom ?? ''}|${dateTo ?? ''}`;
}

function readCache(key: string): DoceoMepAggregateResult | undefined {
  const entry = aggregateCache.get(key);
  if (entry === undefined) return undefined;
  if (entry.expiresAt <= Date.now()) {
    aggregateCache.delete(key);
    return undefined;
  }
  return { ...entry.value, cacheHit: true };
}

function writeCache(key: string, value: DoceoMepAggregateResult): void {
  if (aggregateCache.size >= MAX_CACHE_ENTRIES) {
    // Evict oldest entry (insertion order in Map).
    const firstKey = aggregateCache.keys().next().value;
    if (firstKey !== undefined) aggregateCache.delete(firstKey);
  }
  aggregateCache.set(key, {
    expiresAt: Date.now() + DOCEO_MEP_AGGREGATOR_CACHE_TTL_MS,
    value: { ...value, cacheHit: false },
  });
}

/**
 * Reset the bounded in-memory aggregate cache.
 *
 * @internal Test hook — production code should rely on TTL expiry.
 */
export function clearDoceoMepAggregatorCache(): void {
  aggregateCache.clear();
}

/**
 * Determine whether a DOCEO record falls inside the optional date range.
 */
function isWithinRange(record: LatestVoteRecord, dateFrom?: string, dateTo?: string): boolean {
  const date = record.sittingDate ?? record.date;
  if (dateFrom !== undefined && dateFrom !== '' && date < dateFrom) return false;
  if (dateTo !== undefined && dateTo !== '' && date > dateTo) return false;
  return true;
}

interface InternalAggregate {
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  rcvVotesInspected: number;
  loyaltyAgreements: number;
  loyaltyDecisiveVotes: number;
}

function emptyAggregate(): InternalAggregate {
  return {
    totalVotes: 0,
    votesFor: 0,
    votesAgainst: 0,
    abstentions: 0,
    rcvVotesInspected: 0,
    loyaltyAgreements: 0,
    loyaltyDecisiveVotes: 0,
  };
}

/** Determine the majority position of a political group from a DOCEO group breakdown row. */
function groupMajorityPosition(
  row: { for: number; against: number; abstain: number } | undefined
): 'FOR' | 'AGAINST' | 'ABSTAIN' | null {
  if (row === undefined) return null;
  const { for: f, against: a, abstain: ab } = row;
  if (f === 0 && a === 0 && ab === 0) return null;
  if (f >= a && f >= ab) return 'FOR';
  if (a >= f && a >= ab) return 'AGAINST';
  return 'ABSTAIN';
}

function recordVotePosition(position: 'FOR' | 'AGAINST' | 'ABSTAIN', agg: InternalAggregate): void {
  agg.totalVotes += 1;
  if (position === 'FOR') agg.votesFor += 1;
  else if (position === 'AGAINST') agg.votesAgainst += 1;
  else agg.abstentions += 1;
}

function updateLoyalty(
  position: 'FOR' | 'AGAINST',
  groupRow: { for: number; against: number; abstain: number } | undefined,
  agg: InternalAggregate
): void {
  const majority = groupMajorityPosition(groupRow);
  if (majority === null || majority === 'ABSTAIN') return;
  agg.loyaltyDecisiveVotes += 1;
  if (majority === position) agg.loyaltyAgreements += 1;
}

function tallyVote(
  vote: LatestVoteRecord,
  mepId: string,
  normalizedGroup: string | null,
  agg: InternalAggregate
): void {
  agg.rcvVotesInspected += 1;
  const position = vote.mepVotes?.[mepId];
  if (position === undefined) return;
  recordVotePosition(position, agg);

  // Loyalty: agreement of MEP's decisive vote with their group's majority.
  if (normalizedGroup === null || position === 'ABSTAIN') return;
  if (vote.groupBreakdown === undefined) return;
  updateLoyalty(position, vote.groupBreakdown[normalizedGroup], agg);
}

function buildStats(agg: InternalAggregate): MepVotingAggregateStats {
  const attendanceRate = agg.rcvVotesInspected > 0
    ? Math.round((agg.totalVotes / agg.rcvVotesInspected) * 100 * 100) / 100
    : 0;
  const loyaltyScore = agg.loyaltyDecisiveVotes > 0
    ? Math.round((agg.loyaltyAgreements / agg.loyaltyDecisiveVotes) * 100 * 100) / 100
    : null;
  return {
    totalVotes: agg.totalVotes,
    votesFor: agg.votesFor,
    votesAgainst: agg.votesAgainst,
    abstentions: agg.abstentions,
    attendanceRate,
    loyaltyScore,
    rcvVotesInspected: agg.rcvVotesInspected,
  };
}

/**
 * Options accepted by {@link computeMepVotingActivityFromDoceo}.
 */
export interface ComputeMepVotingActivityOptions {
  /** Inclusive lower bound for the sitting date (`YYYY-MM-DD`). */
  dateFrom?: string | undefined;
  /** Inclusive upper bound for the sitting date (`YYYY-MM-DD`). */
  dateTo?: string | undefined;
  /**
   * The MEP's canonical political-group code (e.g. `EPP`, `S&D`). When provided
   * the aggregator computes a real `loyaltyScore` from DOCEO group breakdowns.
   */
  politicalGroup?: string | undefined;
  /** Override the default 2 s DOCEO timeout (ms). */
  timeoutMs?: number | undefined;
  /**
   * Maximum number of DOCEO vote records to fetch (defaults to 100, the same
   * page size used by `analyzeCoalitionDynamics`).
   */
  limit?: number | undefined;
}

/**
 * Compute per-MEP voting activity stats from the EP DOCEO XML source.
 *
 * Fetches the latest plenary-week RCV records via `doceoClient.getLatestVotes`
 * and aggregates the MEP's individual vote positions. Returns `null` when the
 * DOCEO call fails (timeout, network, parse error) so the caller can fall back
 * to placeholder data and emit a `dataQualityWarning`.
 *
 * @param mepId - EP MEP identifier (e.g. `'197558'`).
 * @param options - Optional date range, political group, timeout and limit overrides.
 * @returns Aggregate result or `null` if DOCEO data is unavailable.
 *
 * @security Errors are audit-logged via `auditLogger.logError(
 *   'doceo_mep_aggregator.fetch', ...)`. Only `mepId` is logged (no PII).
 *
 * @example
 * ```typescript
 * const result = await computeMepVotingActivityFromDoceo('197558', {
 *   dateFrom: '2026-01-01',
 *   dateTo: '2026-12-31',
 *   politicalGroup: 'EPP',
 * });
 * if (result !== null) {
 *   console.log(result.stats.totalVotes, result.stats.loyaltyScore);
 * }
 * ```
 */
export async function computeMepVotingActivityFromDoceo(
  mepId: string,
  options: ComputeMepVotingActivityOptions = {}
): Promise<DoceoMepAggregateResult | null> {
  const { dateFrom, dateTo, politicalGroup, timeoutMs, limit } = options;
  const key = makeCacheKey(mepId, dateFrom, dateTo);
  const cached = readCache(key);
  if (cached !== undefined) return cached;

  const normalizedGroup = politicalGroup !== undefined && politicalGroup !== ''
    ? normalizePoliticalGroup(politicalGroup)
    : null;

  try {
    const response = await withTimeoutAndAbort(
      (signal) => doceoClient.getLatestVotes({
        includeIndividualVotes: true,
        limit: limit ?? 100,
        abortSignal: signal,
      }),
      timeoutMs ?? DOCEO_MEP_AGGREGATOR_TIMEOUT_MS,
      'DOCEO MEP voting aggregator timed out'
    );

    const agg = emptyAggregate();
    for (const vote of response.data) {
      if (!isWithinRange(vote, dateFrom, dateTo)) continue;
      if (vote.dataSource !== 'RCV') continue;
      tallyVote(vote, mepId, normalizedGroup, agg);
    }

    const result: DoceoMepAggregateResult = {
      stats: buildStats(agg),
      dataSource: 'DOCEO',
      cacheHit: false,
      rcvVotesInspected: agg.rcvVotesInspected,
    };
    writeCache(key, result);
    return result;
  } catch (error: unknown) {
    auditLogger.logError(
      'doceo_mep_aggregator.fetch',
      { mepId },
      toErrorMessage(error)
    );
    return null;
  }
}
