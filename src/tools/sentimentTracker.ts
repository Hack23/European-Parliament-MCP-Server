/**
 * MCP Tool: sentiment_tracker
 *
 * Track political group sentiment over a configurable time window using a
 * weighted blend of (a) seat-share momentum derived from the current EP API
 * MEP composition and (b) observed voting cohesion / defection rates derived
 * from EP DOCEO roll-call vote (RCV) XML. The previously informational-only
 * `timeframe` parameter now drives a real DOCEO window: votes outside the
 * `last_month`/`last_quarter`/`last_year` cutoff are excluded, and the tool
 * splits the window into halves and sub-windows to compute trend and
 * volatility deterministically.
 *
 * **Intelligence Perspective:** Real RCV-derived cohesion provides direct
 * visibility into intra-group dissent, defection patterns and emerging
 * fractures — substantially more reliable than pure seat-share proxies.
 *
 * **Business Perspective:** Supports policy consultancies, financial
 * analysts, and corporate affairs teams who need timely, methodology-sound
 * reads on group discipline for lobbying strategy and regulatory risk
 * assessment.
 *
 * **Marketing Perspective:** Appeals to journalists, academic researchers,
 * and civic-tech developers as a transparent, time-windowed barometer with
 * explicit fallback semantics when DOCEO coverage is sparse.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege),
 *   AU-002 (Audit Logging). GDPR Article 5(1)(d) — accuracy principle.
 */

import { z } from 'zod';
import { buildToolResponse, buildErrorResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';
import { fetchAllCurrentMEPs } from '../utils/mepFetcher.js';
import { doceoClient } from '../clients/ep/doceoClient.js';
import { normalizePoliticalGroup } from '../utils/politicalGroupNormalization.js';
import { withTimeoutAndAbort } from '../utils/timeout.js';
import type { LatestVoteRecord } from '../clients/ep/doceoXmlParser.js';

/**
 * Zod input schema for the `sentiment_tracker` MCP tool. Optional
 * `groupId` filters the analysis to a single political group; `timeframe`
 * selects the DOCEO RCV aggregation window (last 30 / 90 / 365 days).
 */
export const SentimentTrackerSchema = z.object({
  groupId: z.string()
    .min(1)
    .max(50)
    .optional()
    .describe('Political group ID to track (omit for all groups)'),
  timeframe: z.enum(['last_month', 'last_quarter', 'last_year'])
    .optional()
    .default('last_quarter')
    .describe('DOCEO roll-call vote aggregation window: last_month (~30d), last_quarter (~90d), or last_year (~365d). Falls back to seat-share-only proxy with confidenceLevel=LOW when DOCEO coverage is insufficient.'),
});

/**
 * Validated parameter type for the `sentiment_tracker` tool, inferred
 * from {@link SentimentTrackerSchema}.
 */
export type SentimentTrackerParams = z.infer<typeof SentimentTrackerSchema>;

type Timeframe = NonNullable<SentimentTrackerParams['timeframe']>;
type Trend = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE';

interface GroupSentiment {
  groupId: string;
  sentimentScore: number;
  trend: Trend;
  volatility: number;
  memberCount: number;
  cohesionProxy: number;
}

/** Internal type extending GroupSentiment with unrounded cohesion for aggregation. */
interface InternalGroupSentiment extends GroupSentiment {
  _rawCohesion: number;
}

interface SentimentShift {
  groupId: string;
  fromScore: number;
  toScore: number;
  magnitude: number;
  direction: 'POSITIVE' | 'NEGATIVE';
  estimatedCause: string;
}

interface SentimentTrackerResult {
  timeframe: string;
  groupSentiments: GroupSentiment[];
  polarizationIndex: number;
  consensusTopics: string[];
  divisiveTopics: string[];
  sentimentShifts: SentimentShift[];
  overallParliamentSentiment: number;
  computedAttributes: {
    mostPositiveGroup: string;
    mostNegativeGroup: string;
    highestVolatility: string;
    trendingSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    bimodalityIndex: number;
  };
  dataAvailable: boolean;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
  dataQualityWarnings: string[];
}

const KNOWN_POLITICAL_GROUPS = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'PfE', 'The Left', 'ESN', 'NI'];

/** Per-timeframe DOCEO fetch and aggregation parameters. */
const TIMEFRAME_CONFIG: Record<Timeframe, {
  days: number;
  maxWeeks: number;
  voteBudget: number;
  subWindows: number;
}> = {
  last_month: { days: 30, maxWeeks: 2, voteBudget: 100, subWindows: 2 },
  last_quarter: { days: 90, maxWeeks: 4, voteBudget: 200, subWindows: 3 },
  last_year: { days: 365, maxWeeks: 8, voteBudget: 300, subWindows: 4 },
} as const;

/** Minimum DOCEO RCV votes within the window required to upgrade out of LOW confidence. */
const MIN_RCV_VOTES_FOR_MEDIUM = 10;
const MIN_RCV_VOTES_FOR_HIGH = 40;

/** DOCEO call timeout (mirrors `analyzeCoalitionDynamics` budget). */
const DOCEO_TIMEOUT_MS = 4_000;
/** In-memory cache TTL for the (timeframe-keyed) DOCEO window aggregate. */
const DOCEO_CACHE_TTL_MS = 5 * 60_000;

/** Cohesion bands used to surface DOCEO vote subjects as consensus/divisive topics. */
const CONSENSUS_TOPIC_COHESION_MIN = 0.95;
const DIVISIVE_TOPIC_COHESION_MAX = 0.55;

/** Sentiment score component weights (must sum to 1.0). */
const SCORE_WEIGHTS = {
  cohesion: 0.5,
  dissent: 0.2,
  seatShareMomentum: 0.3,
} as const;

/** Seat-share thresholds used only on the fallback path (no DOCEO data). */
const SEAT_SHARE_THRESHOLDS = { large: 0.25, medium: 0.15, small: 0.05 } as const;
const SEAT_SHARE_FALLBACK_SCORES = { large: 0.3, medium: 0.2, small: 0.1, micro: -0.1 } as const;

/** Trend classification thresholds. */
const TREND_DELTA_THRESHOLD = 0.05;
const VOLATILITY_VARIANCE_THRESHOLD = 0.1;

interface DoceoWindowAggregate {
  /** Per-group cohesion stats for the full window. */
  groupStats: Map<string, { cohesion: number; rcvVotes: number; topics: string[] }>;
  /** Per-group cohesion for the first half of the window (oldest). */
  firstHalfCohesion: Map<string, number>;
  /** Per-group cohesion for the second half of the window (newest). */
  secondHalfCohesion: Map<string, number>;
  /** Per-group cohesion variance across N sub-windows (drives VOLATILE classification). */
  cohesionVariance: Map<string, number>;
  /** Per-group consensus vote subjects (cohesion ≥ CONSENSUS_TOPIC_COHESION_MIN). */
  consensusTopics: string[];
  /** Per-group divisive vote subjects (cohesion ≤ DIVISIVE_TOPIC_COHESION_MAX). */
  divisiveTopics: string[];
  /** Total RCV votes inspected within the window. */
  rcvVoteCount: number;
  /** True when DOCEO returned no RCV-backed records inside the window. */
  empty: boolean;
}

let doceoWindowCache:
  | { expiresAt: number; key: string; value: DoceoWindowAggregate }
  | undefined;

/**
 * Test-only hook for resetting the bounded DOCEO window cache between specs.
 * @internal
 */
export function clearSentimentTrackerDoceoCache(): void {
  doceoWindowCache = undefined;
}

/**
 * Format a `Date` as `YYYY-MM-DD` in UTC.
 */
function formatDateIsoUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Compute the Monday of the plenary week containing `now`.
 */
function mostRecentMondayUtc(now: Date): string {
  const day = now.getUTCDay();
  const daysBack = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysBack);
  return formatDateIsoUtc(monday);
}

/**
 * Subtract `days` UTC days from a `YYYY-MM-DD` date.
 */
function subtractDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return formatDateIsoUtc(d);
}

/**
 * Compute majority cohesion for a single group breakdown row.
 * Cohesion = `max(for, against, abstain) / total` ∈ [0, 1].
 * Returns `null` when no votes were recorded for the group on this vote.
 */
function rowCohesion(
  row: { for: number; against: number; abstain: number } | undefined
): number | null {
  if (row === undefined) return null;
  const total = row.for + row.against + row.abstain;
  if (total === 0) return null;
  return Math.max(row.for, row.against, row.abstain) / total;
}

/**
 * Locate the cohesion contribution for `normalizedGroup` in a raw DOCEO group
 * breakdown record. Falls back to alias-aware matching via {@link normalizePoliticalGroup}.
 */
function resolveGroupRow(
  breakdown: Record<string, { for: number; against: number; abstain: number }> | undefined,
  normalizedGroup: string
): { for: number; against: number; abstain: number } | undefined {
  if (breakdown === undefined) return undefined;
  if (normalizedGroup in breakdown) return breakdown[normalizedGroup];
  for (const [rawKey, row] of Object.entries(breakdown)) {
    if (normalizePoliticalGroup(rawKey) === normalizedGroup) return row;
  }
  return undefined;
}

/**
 * Process a single DOCEO response page, filtering RCV records by date and
 * appending them to `collected` until the vote budget is reached.
 * Returns `{ stop: true }` when the budget is exhausted.
 * Records with missing/empty dates are treated as out-of-window and skipped.
 * Pre-cutoff records are filtered out but do NOT terminate iteration (DOCEO
 * responses are not guaranteed to be sorted newest→oldest within a week).
 */
function ingestDoceoPage(
  response: { data: readonly LatestVoteRecord[] },
  cutoff: string,
  voteBudget: number,
  collected: LatestVoteRecord[]
): { stop: boolean } {
  for (const vote of response.data) {
    if (vote.dataSource !== 'RCV') continue;
    if (vote.groupBreakdown === undefined) continue;
    const date = vote.sittingDate ?? vote.date;
    // Treat missing/empty dates as out-of-window (skip without stopping).
    if (date === '') continue;
    // Filter out pre-cutoff votes without stopping iteration.
    if (date < cutoff) continue;
    collected.push(vote);
    if (collected.length >= voteBudget) return { stop: true };
  }
  return { stop: false };
}

/**
 * Iterate plenary weeks backwards from the current week, fetching DOCEO RCV
 * records and filtering them to the time window `[cutoff, now]`. Stops on
 * vote-budget or `maxWeeks` boundary, whichever comes first.
 */
async function fetchWindowedDoceoVotes(
  timeframe: Timeframe,
  abortSignal: AbortSignal,
  now: Date = new Date()
): Promise<LatestVoteRecord[]> {
  const cfg = TIMEFRAME_CONFIG[timeframe];
  const cutoff = subtractDaysIso(formatDateIsoUtc(now), cfg.days);
  const collected: LatestVoteRecord[] = [];
  let weekStart = mostRecentMondayUtc(now);

  for (let weekIndex = 0; weekIndex < cfg.maxWeeks && collected.length < cfg.voteBudget; weekIndex++) {
    const response = await doceoClient.getLatestVotes({
      weekStart,
      includeIndividualVotes: false,
      limit: 100,
      abortSignal,
    });
    const { stop } = ingestDoceoPage(response, cutoff, cfg.voteBudget, collected);
    if (stop) break;
    weekStart = subtractDaysIso(weekStart, 7);
  }

  return collected.slice(0, cfg.voteBudget);
}

/** Sort vote records ascending by sitting date (oldest first), stable on input order ties. */
function sortVotesByDateAscending(votes: LatestVoteRecord[]): LatestVoteRecord[] {
  const indexed = votes.map((v, i) => ({ v, i, d: v.sittingDate ?? v.date }));
  indexed.sort((a, b) => {
    if (a.d === b.d) return a.i - b.i;
    return a.d < b.d ? -1 : 1;
  });
  return indexed.map(x => x.v);
}

/** Compute mean cohesion for a given group over a slice of votes. */
function meanCohesion(
  votes: readonly LatestVoteRecord[],
  group: string
): { mean: number; count: number } {
  let sum = 0;
  let count = 0;
  for (const vote of votes) {
    const c = rowCohesion(resolveGroupRow(vote.groupBreakdown, group));
    if (c !== null) { sum += c; count++; }
  }
  return { mean: count > 0 ? sum / count : 0, count };
}

/** Compute sample variance across non-empty sub-window cohesion means for a group. */
function subWindowVariance(
  votes: readonly LatestVoteRecord[],
  group: string,
  subWindows: number
): number {
  if (votes.length < subWindows) return 0;
  const bucketSize = Math.ceil(votes.length / subWindows);
  const means: number[] = [];
  for (let i = 0; i < subWindows; i++) {
    const slice = votes.slice(i * bucketSize, (i + 1) * bucketSize);
    const { mean, count } = meanCohesion(slice, group);
    if (count > 0) means.push(mean);
  }
  if (means.length < 2) return 0;
  const avg = means.reduce((s, v) => s + v, 0) / means.length;
  const variance = means.reduce((s, v) => s + (v - avg) ** 2, 0) / means.length;
  return variance;
}

/** Identify per-vote consensus / divisive subjects for any analyzed group. */
function extractTopics(
  votes: readonly LatestVoteRecord[],
  analyzedGroups: readonly string[]
): { consensus: string[]; divisive: string[] } {
  const consensus = new Set<string>();
  const divisive = new Set<string>();
  for (const vote of votes) {
    const subject = vote.subject.trim();
    if (subject === '') continue;
    for (const group of analyzedGroups) {
      const c = rowCohesion(resolveGroupRow(vote.groupBreakdown, group));
      if (c === null) continue;
      if (c >= CONSENSUS_TOPIC_COHESION_MIN) consensus.add(subject);
      else if (c <= DIVISIVE_TOPIC_COHESION_MAX) divisive.add(subject);
    }
  }
  return {
    consensus: [...consensus].slice(0, 10),
    divisive: [...divisive].slice(0, 10),
  };
}

/**
 * Build per-group cohesion statistics, half-window splits and sub-window
 * variance from the windowed DOCEO RCV slice.
 */
function buildDoceoAggregate(
  votes: LatestVoteRecord[],
  analyzedGroups: readonly string[],
  subWindows: number
): DoceoWindowAggregate {
  const sorted = sortVotesByDateAscending(votes);
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const groupStats = new Map<string, { cohesion: number; rcvVotes: number; topics: string[] }>();
  const firstHalfCohesion = new Map<string, number>();
  const secondHalfCohesion = new Map<string, number>();
  const cohesionVariance = new Map<string, number>();

  for (const group of analyzedGroups) {
    const fullStats = meanCohesion(sorted, group);
    if (fullStats.count > 0) {
      groupStats.set(group, { cohesion: fullStats.mean, rcvVotes: fullStats.count, topics: [] });
    }
    const firstStats = meanCohesion(firstHalf, group);
    if (firstStats.count > 0) firstHalfCohesion.set(group, firstStats.mean);
    const secondStats = meanCohesion(secondHalf, group);
    if (secondStats.count > 0) secondHalfCohesion.set(group, secondStats.mean);
    cohesionVariance.set(group, subWindowVariance(sorted, group, subWindows));
  }

  const { consensus, divisive } = extractTopics(sorted, analyzedGroups);

  return {
    groupStats,
    firstHalfCohesion,
    secondHalfCohesion,
    cohesionVariance,
    consensusTopics: consensus,
    divisiveTopics: divisive,
    rcvVoteCount: sorted.length,
    empty: sorted.length === 0,
  };
}

function emptyDoceoAggregate(): DoceoWindowAggregate {
  return {
    groupStats: new Map(),
    firstHalfCohesion: new Map(),
    secondHalfCohesion: new Map(),
    cohesionVariance: new Map(),
    consensusTopics: [],
    divisiveTopics: [],
    rcvVoteCount: 0,
    empty: true,
  };
}

/**
 * Fetch the DOCEO window aggregate for the requested timeframe with a TTL
 * cache. Failures are swallowed — the caller falls back to the seat-share
 * proxy path with `confidenceLevel: 'LOW'`.
 */
async function loadDoceoWindowAggregate(
  timeframe: Timeframe,
  analyzedGroups: readonly string[]
): Promise<DoceoWindowAggregate> {
  const now = Date.now();
  const key = `${timeframe}::${analyzedGroups.join(',')}`;
  if (doceoWindowCache?.key === key && doceoWindowCache.expiresAt > now) {
    return doceoWindowCache.value;
  }

  try {
    const votes = await withTimeoutAndAbort(
      (signal) => fetchWindowedDoceoVotes(timeframe, signal),
      DOCEO_TIMEOUT_MS,
      'DOCEO window aggregation timed out'
    );
    const aggregate = buildDoceoAggregate(votes, analyzedGroups, TIMEFRAME_CONFIG[timeframe].subWindows);
    doceoWindowCache = { expiresAt: now + DOCEO_CACHE_TTL_MS, key, value: aggregate };
    return aggregate;
  } catch {
    const aggregate = emptyDoceoAggregate();
    doceoWindowCache = { expiresAt: now + DOCEO_CACHE_TTL_MS, key, value: aggregate };
    return aggregate;
  }
}

/** Seat-share fallback score used when DOCEO data is insufficient. */
function fallbackSeatShareScore(memberCount: number, totalMEPs: number): number {
  const seatShare = totalMEPs > 0 ? memberCount / totalMEPs : 0;
  if (seatShare > SEAT_SHARE_THRESHOLDS.large) return SEAT_SHARE_FALLBACK_SCORES.large;
  if (seatShare > SEAT_SHARE_THRESHOLDS.medium) return SEAT_SHARE_FALLBACK_SCORES.medium;
  if (seatShare > SEAT_SHARE_THRESHOLDS.small) return SEAT_SHARE_FALLBACK_SCORES.small;
  return SEAT_SHARE_FALLBACK_SCORES.micro;
}

/** Seat-share-only trend fallback (no DOCEO half-window data). */
function fallbackSeatShareTrend(seatShare: number): Trend {
  if (seatShare > 0.25) return 'STABLE';
  if (seatShare > 0.15) return 'IMPROVING';
  if (seatShare > 0.05) return 'STABLE';
  return 'DECLINING';
}

/**
 * Classify a per-group trend using DOCEO half-window cohesion delta and
 * sub-window variance. Returns `null` when the DOCEO data is insufficient.
 */
function classifyDoceoTrend(
  firstHalf: number | undefined,
  secondHalf: number | undefined,
  variance: number
): Trend | null {
  if (variance > VOLATILITY_VARIANCE_THRESHOLD) return 'VOLATILE';
  if (firstHalf === undefined || secondHalf === undefined) return null;
  const delta = secondHalf - firstHalf;
  if (delta > TREND_DELTA_THRESHOLD) return 'IMPROVING';
  if (delta < -TREND_DELTA_THRESHOLD) return 'DECLINING';
  return 'STABLE';
}

/** Clamp a real-valued score into `[-1, +1]`. */
function clampScore(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

/** Round a number to 2 decimal places. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Compute the per-group sentiment score as a weighted blend of:
 * - DOCEO cohesion (centred at 0.5 → score range `[-0.5, +0.5]`),
 * - dissent / defection rate (inverse cohesion penalty, range `[-0.5, +0.5]`),
 * - seat-share momentum (linear in seat share, range `[-0.5, +0.5]`).
 */
function computeBlendedScore(
  cohesion: number,
  seatShare: number
): number {
  // Cohesion: 0.5 cohesion → 0 contribution, 1.0 → +0.5, 0.0 → -0.5.
  const cohesionTerm = (cohesion - 0.5) * 2 * 0.5;
  // Dissent: penalty proportional to (1 - cohesion), inverted.
  const dissentTerm = (0.5 - (1 - cohesion)) * 0.5;
  // Seat-share momentum: 0% → -0.5, 50% → +0.5.
  const seatShareTerm = (seatShare - 0.25) * 2;
  const raw =
    SCORE_WEIGHTS.cohesion * cohesionTerm +
    SCORE_WEIGHTS.dissent * dissentTerm +
    SCORE_WEIGHTS.seatShareMomentum * seatShareTerm;
  return clampScore(raw);
}

interface BuildGroupSentimentArgs {
  groupId: string;
  memberCount: number;
  totalMEPs: number;
  doceo: DoceoWindowAggregate;
  hasDoceoCoverage: boolean;
}

/** Build the per-group sentiment record using DOCEO data when available. */
function buildGroupSentiment(args: BuildGroupSentimentArgs): InternalGroupSentiment {
  const { groupId, memberCount, totalMEPs, doceo, hasDoceoCoverage } = args;
  const seatShare = totalMEPs > 0 ? memberCount / totalMEPs : 0;
  const stats = doceo.groupStats.get(groupId);

  if (!hasDoceoCoverage || stats === undefined) {
    const fallbackScore = fallbackSeatShareScore(memberCount, totalMEPs);
    const rawCohesion = 0.5 + fallbackScore * 0.3;
    return {
      groupId,
      sentimentScore: round2(fallbackScore),
      trend: fallbackSeatShareTrend(seatShare),
      volatility: 0.12,
      memberCount,
      cohesionProxy: round2(rawCohesion),
      _rawCohesion: rawCohesion,
    };
  }

  const cohesion = stats.cohesion;
  const variance = doceo.cohesionVariance.get(groupId) ?? 0;
  const trend = classifyDoceoTrend(
    doceo.firstHalfCohesion.get(groupId),
    doceo.secondHalfCohesion.get(groupId),
    variance
  ) ?? fallbackSeatShareTrend(seatShare);
  const score = computeBlendedScore(cohesion, seatShare);
  return {
    groupId,
    sentimentScore: round2(score),
    trend,
    volatility: round2(Math.sqrt(variance)),
    memberCount,
    cohesionProxy: round2(cohesion),
    _rawCohesion: cohesion,
  };
}

/**
 * Compute polarization as `1 − seat-share-weighted mean of cohesion across
 * analyzed groups that have observed DOCEO cohesion`. Falls back to
 * seat-share-score dispersion when DOCEO cohesion is unavailable. Only groups
 * with actual DOCEO observations are weighted into the polarization index;
 * groups whose `cohesionProxy` is a fallback value are excluded so the metric
 * remains a faithful measure of observed group cohesion.
 */
function computePolarizationIndex(
  sentiments: InternalGroupSentiment[],
  totalMEPs: number,
  hasDoceoCoverage: boolean,
  doceo: DoceoWindowAggregate
): number {
  if (sentiments.length === 0) return 0;
  if (hasDoceoCoverage && totalMEPs > 0) {
    let weightedCohesion = 0;
    let totalWeight = 0;
    for (const g of sentiments) {
      if (!doceo.groupStats.has(g.groupId)) continue;
      const weight = g.memberCount / totalMEPs;
      weightedCohesion += g._rawCohesion * weight;
      totalWeight += weight;
    }
    if (totalWeight === 0) return 0;
    const mean = weightedCohesion / totalWeight;
    return round2(Math.max(0, Math.min(1, 1 - mean)));
  }
  // Fallback: dispersion of fallback seat-share scores.
  if (sentiments.length < 2) return 0;
  const scores = sentiments.map(s => s.sentimentScore);
  const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
  const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
  return Math.min(1, Math.round(Math.sqrt(variance) * 200) / 100);
}

function computeBimodalityIndex(sentiments: number[]): number {
  if (sentiments.length < 3) return 0;
  const extreme = sentiments.filter(s => s > 0.1 || s < -0.1).length;
  return Math.round((extreme / sentiments.length) * 100) / 100;
}

function buildSentimentShifts(
  sentiments: GroupSentiment[],
  hasDoceoCoverage: boolean
): SentimentShift[] {
  const shifts: SentimentShift[] = [];
  for (const g of sentiments) {
    const magnitude = Math.abs(g.sentimentScore);
    if (magnitude > 0.15) {
      shifts.push({
        groupId: g.groupId,
        fromScore: 0,
        toScore: g.sentimentScore,
        magnitude: Math.round(magnitude * 100) / 100,
        direction: g.sentimentScore > 0 ? 'POSITIVE' : 'NEGATIVE',
        estimatedCause: estimateShiftCause(g, hasDoceoCoverage),
      });
    }
  }
  return shifts.sort((a, b) => b.magnitude - a.magnitude).slice(0, 5);
}

function estimateShiftCause(g: GroupSentiment, hasDoceoCoverage: boolean): string {
  if (!hasDoceoCoverage) {
    return g.sentimentScore > 0
      ? 'Large seat share indicates strong institutional position on tracked topics'
      : 'Smaller seat share indicates weaker institutional position or limited leverage on tracked topics';
  }
  if (g.trend === 'VOLATILE') {
    return 'High variance in DOCEO group cohesion across sub-windows';
  }
  if (g.sentimentScore > 0) {
    return `High DOCEO cohesion (${String(g.cohesionProxy)}) combined with seat-share position`;
  }
  return `Low DOCEO cohesion (${String(g.cohesionProxy)}) signals dissent / defection within the window`;
}

function classifyTrendingSentiment(score: number): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
  if (score > 0.1) return 'POSITIVE';
  if (score < -0.1) return 'NEGATIVE';
  return 'NEUTRAL';
}

function determineConfidenceLevel(rcvVoteCount: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (rcvVoteCount >= MIN_RCV_VOTES_FOR_HIGH) return 'HIGH';
  if (rcvVoteCount >= MIN_RCV_VOTES_FOR_MEDIUM) return 'MEDIUM';
  return 'LOW';
}

function buildEmptySentimentResult(params: SentimentTrackerParams): SentimentTrackerResult {
  return {
    timeframe: params.timeframe,
    groupSentiments: [],
    polarizationIndex: 0,
    consensusTopics: [],
    divisiveTopics: [],
    sentimentShifts: [],
    overallParliamentSentiment: 0,
    computedAttributes: {
      mostPositiveGroup: 'N/A',
      mostNegativeGroup: 'N/A',
      highestVolatility: 'N/A',
      trendingSentiment: 'NEUTRAL',
      bimodalityIndex: 0
    },
    dataAvailable: false,
    confidenceLevel: 'LOW',
    dataFreshness: 'No data available from EP API',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Sentiment derived from seat-share proxies — no MEP data available.',
    dataQualityWarnings: ['No MEP data available from EP API — all sentiment scores are empty'],
  };
}

function buildSentimentComputedAttrs(
  validSentiments: GroupSentiment[],
  sentimentScores: number[],
  overallSentiment: number
): SentimentTrackerResult['computedAttributes'] {
  const sortedBySentiment = [...validSentiments].sort((a, b) => b.sentimentScore - a.sentimentScore);
  const sortedByVolatility = [...validSentiments].sort((a, b) => b.volatility - a.volatility);
  return {
    mostPositiveGroup: sortedBySentiment[0]?.groupId ?? 'N/A',
    mostNegativeGroup: sortedBySentiment[sortedBySentiment.length - 1]?.groupId ?? 'N/A',
    highestVolatility: sortedByVolatility[0]?.groupId ?? 'N/A',
    trendingSentiment: classifyTrendingSentiment(overallSentiment),
    bimodalityIndex: computeBimodalityIndex(sentimentScores)
  };
}

function buildMethodology(timeframe: Timeframe, hasDoceoCoverage: boolean, rcvVoteCount: number): string {
  const window = `${String(TIMEFRAME_CONFIG[timeframe].days)}d`;
  if (!hasDoceoCoverage) {
    const coverageNote = rcvVoteCount > 0
      ? `insufficient DOCEO RCV coverage in ${window} window — only ${String(rcvVoteCount)} usable RCVs, minimum ${String(MIN_RCV_VOTES_FOR_MEDIUM)} required`
      : `no DOCEO RCV votes found in ${window} window`;
    return [
      `FALLBACK PATH (${coverageNote}).`,
      'Sentiment scores fall back to seat-share proxy (larger group → stronger institutional position).',
      'Trend defaults to seat-share band. polarizationIndex = std-dev of fallback scores.',
      'Data source (composition): https://data.europarl.europa.eu/api/v2/meps',
    ].join(' ');
  }
  return [
    `Sentiment score = ${String(SCORE_WEIGHTS.cohesion)} · DOCEO cohesion (centred at 0.5)`,
    `+ ${String(SCORE_WEIGHTS.dissent)} · inverse-dissent term`,
    `+ ${String(SCORE_WEIGHTS.seatShareMomentum)} · seat-share momentum, clamped to [-1, +1].`,
    `Trend derived from half-window cohesion delta (>${String(TREND_DELTA_THRESHOLD)} → IMPROVING/DECLINING) `,
    `with VOLATILE when sub-window cohesion variance > ${String(VOLATILITY_VARIANCE_THRESHOLD)}.`,
    `polarizationIndex = 1 − seat-share-weighted mean(cohesion) across analyzed groups.`,
    `Window: ${window}, ${String(rcvVoteCount)} DOCEO RCVs inspected.`,
    'Data sources: https://data.europarl.europa.eu/api/v2/meps (composition); EP DOCEO RCV XML (cohesion).',
  ].join(' ');
}

interface SentimentBuildContext {
  groupCounts: Map<string, number>;
  totalMEPs: number;
  doceo: DoceoWindowAggregate;
  hasDoceoCoverage: boolean;
}

function buildSentimentScores(
  targetGroups: readonly string[],
  ctx: SentimentBuildContext
): InternalGroupSentiment[] {
  return targetGroups.map(gId => buildGroupSentiment({
    groupId: gId,
    memberCount: ctx.groupCounts.get(gId) ?? 0,
    totalMEPs: ctx.totalMEPs,
    doceo: ctx.doceo,
    hasDoceoCoverage: ctx.hasDoceoCoverage,
  }));
}

function buildDataQualityWarnings(
  hasDoceoCoverage: boolean,
  rcvVoteCount: number,
  mepDataComplete: boolean,
  mepFailureOffset: number | undefined
): string[] {
  const warnings: string[] = [];
  if (!hasDoceoCoverage) {
    warnings.push(
      `DOCEO RCV coverage insufficient (${String(rcvVoteCount)} RCVs in window) — sentiment scores fall back to seat-share proxy`
    );
  } else if (rcvVoteCount < MIN_RCV_VOTES_FOR_HIGH) {
    warnings.push(
      `DOCEO RCV coverage limited (${String(rcvVoteCount)} RCVs) — scores reflect a small sample of recent votes`
    );
  }
  if (!mepDataComplete) {
    warnings.push(
      `MEP data is incomplete — pagination failed at offset ${String(mepFailureOffset ?? 0)}; results based on partial data`
    );
  }
  return warnings;
}

function tallyGroupCounts(allMeps: readonly { politicalGroup: string }[]): Map<string, number> {
  const groupCounts = new Map<string, number>();
  for (const mep of allMeps) {
    const canonical = normalizePoliticalGroup(mep.politicalGroup);
    if (canonical === '' || canonical.toLowerCase() === 'unknown') continue;
    groupCounts.set(canonical, (groupCounts.get(canonical) ?? 0) + 1);
  }
  return groupCounts;
}

function resolveTargetGroups(groupId: string | undefined): readonly string[] {
  if (groupId === undefined) return KNOWN_POLITICAL_GROUPS;
  const normalized = normalizePoliticalGroup(groupId);
  return [normalized === '' ? groupId : normalized];
}

interface SentimentResultArgs {
  params: SentimentTrackerParams;
  fetchResult: { complete: boolean; failureOffset?: number | undefined };
  totalMEPs: number;
  groupSentiments: InternalGroupSentiment[];
  doceo: DoceoWindowAggregate;
  hasDoceoCoverage: boolean;
}

function buildSentimentResult(args: SentimentResultArgs): SentimentTrackerResult {
  const { params, fetchResult, totalMEPs, groupSentiments, doceo, hasDoceoCoverage } = args;
  const validSentiments = groupSentiments.filter(g => g.memberCount > 0);
  const sentimentScores = validSentiments.map(g => g.sentimentScore);
  const overallSentiment = sentimentScores.length > 0
    ? round2(sentimentScores.reduce((s, v) => s + v, 0) / sentimentScores.length)
    : 0;
  const polarizationIndex = computePolarizationIndex(validSentiments, totalMEPs, hasDoceoCoverage, doceo);

  return {
    timeframe: params.timeframe,
    groupSentiments: groupSentiments.map(({ _rawCohesion: _, ...rest }) => rest),
    polarizationIndex,
    consensusTopics: hasDoceoCoverage ? doceo.consensusTopics : [],
    divisiveTopics: hasDoceoCoverage ? doceo.divisiveTopics : [],
    sentimentShifts: buildSentimentShifts(validSentiments, hasDoceoCoverage),
    overallParliamentSentiment: overallSentiment,
    computedAttributes: buildSentimentComputedAttrs(validSentiments, sentimentScores, overallSentiment),
    dataAvailable: validSentiments.length > 0,
    confidenceLevel: determineConfidenceLevel(doceo.rcvVoteCount),
    dataFreshness: hasDoceoCoverage
      ? `EP API MEP composition + DOCEO RCV XML in last ${String(TIMEFRAME_CONFIG[params.timeframe].days)}d window`
      : 'EP API MEP composition only — DOCEO RCV coverage insufficient for this window',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: buildMethodology(params.timeframe, hasDoceoCoverage, doceo.rcvVoteCount),
    dataQualityWarnings: buildDataQualityWarnings(
      hasDoceoCoverage,
      doceo.rcvVoteCount,
      fetchResult.complete,
      fetchResult.failureOffset
    ),
  };
}

/**
 * Compute political-group sentiment scores over a configurable time window.
 *
 * Implementation of the MCP `sentiment_tracker` tool. Combines current EP API
 * MEP composition with DOCEO roll-call vote (RCV) records inside the requested
 * `timeframe` window to derive a per-group sentiment score, trend, volatility,
 * polarization index, and consensus/divisive topic lists. Falls back to a
 * seat-share-only proxy with `confidenceLevel: 'LOW'` and an explicit
 * `methodology` note when DOCEO coverage is insufficient.
 *
 * @param params - Validated tool parameters (see {@link SentimentTrackerSchema})
 * @returns A {@link ToolResult} containing the sentiment report or a structured
 *   error response on failure.
 */
export async function sentimentTracker(params: SentimentTrackerParams): Promise<ToolResult> {
  try {
    const fetchResult = await fetchAllCurrentMEPs();
    const allMeps = fetchResult.meps;
    const totalMEPs = allMeps.length;

    if (totalMEPs === 0) {
      return buildToolResponse(buildEmptySentimentResult(params));
    }

    const groupCounts = tallyGroupCounts(allMeps);
    const targetGroups = resolveTargetGroups(params.groupId);
    const doceo = await loadDoceoWindowAggregate(params.timeframe, targetGroups);
    const hasDoceoCoverage = !doceo.empty && doceo.rcvVoteCount >= MIN_RCV_VOTES_FOR_MEDIUM;
    const groupSentiments = buildSentimentScores(targetGroups, {
      groupCounts, totalMEPs, doceo, hasDoceoCoverage,
    });

    return buildToolResponse(
      buildSentimentResult({ params, fetchResult, totalMEPs, groupSentiments, doceo, hasDoceoCoverage })
    );
  } catch (error: unknown) {
    return buildErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      'sentiment_tracker'
    );
  }
}

/**
 * MCP tool metadata for `sentiment_tracker` (name, description, and
 * JSON Schema for the tool's input). Consumed by the server's tool
 * registry to advertise this tool in `ListTools` responses.
 */
export const sentimentTrackerToolMetadata = {
  name: 'sentiment_tracker',
  description: 'Track political group sentiment over a configurable time window. Combines current EP API MEP composition with DOCEO roll-call vote (RCV) cohesion / defection data aggregated across last_month (~30d), last_quarter (~90d) or last_year (~365d). Returns per-group sentiment scores (-1 to +1), IMPROVING/STABLE/DECLINING/VOLATILE trends derived from half-window and sub-window DOCEO cohesion deltas, polarization index (1 − seat-share-weighted mean cohesion), and consensus/divisive vote subjects. Falls back to seat-share proxy with confidenceLevel=LOW when DOCEO coverage is insufficient.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      groupId: {
        type: 'string',
        description: 'Political group ID to track (omit for all groups)',
        minLength: 1,
        maxLength: 50
      },
      timeframe: {
        type: 'string',
        enum: ['last_month', 'last_quarter', 'last_year'],
        description: 'DOCEO RCV aggregation window: last_month (~30d), last_quarter (~90d), or last_year (~365d). Falls back to seat-share-only proxy with confidenceLevel=LOW when DOCEO coverage is insufficient.',
        default: 'last_quarter'
      },
    }
  }
};

/**
 * MCP `CallTool` handler entry point for `sentiment_tracker`.
 *
 * Validates the raw input arguments against {@link SentimentTrackerSchema}
 * and delegates execution to {@link sentimentTracker}.
 *
 * @param args - Raw, untrusted MCP `CallTool` arguments
 * @returns The same {@link ToolResult} produced by {@link sentimentTracker}
 */
export async function handleSentimentTracker(args: unknown): Promise<ToolResult> {
  const params = SentimentTrackerSchema.parse(args);
  return sentimentTracker(params);
}
