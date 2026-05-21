/**
 * MCP Tool: detect_voting_anomalies
 *
 * Flag unusual voting patterns — party defections, sudden alignment shifts,
 * abstention spikes, and cross-party movement signals — using authoritative
 * DOCEO roll-call (RCV) records.
 *
 * **Intelligence Perspective:** Anomaly detection tool identifying deviations
 * from each MEP's *own* historical voting baseline within the requested
 * period. Surfaces early warning signals for party splits, political
 * realignments, and emerging cross-party movements. Consumed by
 * `correlate_intelligence` and `early_warning_system`.
 *
 * **Data source:** EP DOCEO XML (`PV-{term}-{date}-RCV_{lang}.xml`) via the
 * shared bounded/cached aggregator. Falls back gracefully to LOW confidence
 * with `dataQualityWarnings` when DOCEO is unreachable.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege),
 *   AU-002 (Audit Logging). GDPR Article 5(1)(c)/(d) — minimisation & accuracy.
 *
 * @since 0.8.0
 */

import { DetectVotingAnomaliesSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { doceoClient } from '../clients/ep/doceoClient.js';
import { auditLogger, toErrorMessage } from '../utils/auditLogger.js';
import { normalizePoliticalGroup } from '../utils/politicalGroupNormalization.js';
import { withTimeoutAndAbort } from '../utils/timeout.js';
import {
  bucketByWeek,
  classifyMepVote,
  coverageConfidence,
  findCrossPartyAlignmentWindows,
  findOutlierWeeks,
  findWoWShifts,
  isoWeekStart,
  iteratePlenaryWeeks,
  MAX_PLENARY_WEEKS,
  DEFAULT_CROSS_PARTY_SHARE,
  DEFAULT_WOW_THRESHOLD_PP,
  DEFAULT_Z_SCORE_THRESHOLD,
} from '../utils/votingBaseline.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';
import type { LatestVoteRecord } from '../clients/ep/doceoXmlParser.js';
import type { ClassifiedVote, WeekBucket } from '../utils/votingBaseline.js';

/** Max DOCEO RCV records aggregated per request (2 pages × 100 per page). */
const DOCEO_RCV_FETCH_LIMIT = 200;

/** Per-page limit for DOCEO getLatestVotes (API enforces ≤ 100). */
const DOCEO_PAGE_LIMIT = 100;

/** DOCEO call timeout, mirrors the shared aggregator guard. */
const DOCEO_TIMEOUT_MS = 2_000;

/** Cap MEPs inspected per group/all-MEPs request to bound runtime. */
const MAX_MEPS_PER_REQUEST = 50;

/** Window (hours) for the NEAR_REALTIME freshness label. */
const NEAR_REALTIME_WINDOW_HOURS = 72;

/**
 * Voting anomaly surface, preserves the schema consumed by
 * `correlate_intelligence` and adds `evidenceVoteIds` for traceability.
 */
interface VotingAnomaly {
  type:
    | 'PARTY_DEFECTION'
    | 'ABSTENTION_SPIKE'
    | 'ALIGNMENT_SHIFT'
    | 'CROSS_PARTY_ALIGNMENT_SHIFT';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  mepId: string;
  mepName: string;
  description: string;
  metrics: { expectedValue: number; actualValue: number; deviation: number };
  detectedDate: string;
  /**
   * DOCEO `LatestVoteRecord.id` values supporting the anomaly.
   * These are the unique vote identifiers returned by `get_latest_votes`
   * (e.g. `"RCV-10-2026-01-15-001"`).
   */
  evidenceVoteIds: string[];
}

interface VotingAnomalyAnalysis {
  period: { from: string; to: string };
  targetScope: string;
  anomalies: VotingAnomaly[];
  summary: { totalAnomalies: number; highSeverity: number; mediumSeverity: number; lowSeverity: number };
  computedAttributes: {
    anomalyRate: number;
    severityIndex: number;
    groupStabilityScore: number;
    defectionTrend: string;
    riskLevel: string;
  };
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  /**
   * Source of voting records consumed. Always `'DOCEO'` for this tool —
   * matches the closed set used by sibling OSINT tools (`'EP_API' | 'DOCEO'
   * | 'EP_API+DOCEO'`). Use {@link dataAvailable} = `false` to discriminate
   * the "DOCEO unreachable / empty period" branch.
   */
  dataSource: 'DOCEO';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
  dataQualityWarnings: string[];
  /**
   * Minimum per-MEP RCV votes inspected across the analysed scope (worst-case
   * coverage). Drives {@link confidenceLevel} so that group/all-MEP scopes
   * are not inflated by a single MEP with high coverage.
   */
  rcvVotesInspected: number;
  /**
   * Maximum per-MEP RCV votes inspected across the analysed scope (best-case
   * coverage). Surfaced for observability so callers can see the spread
   * between the worst- and best-covered MEP.
   */
  rcvVotesInspectedMax: number;
  mepsAnalyzed: number;
  /**
   * Number of distinct plenary weeks from which DOCEO RCV records were
   * successfully aggregated. Drives the HIGH-confidence ladder (HIGH requires
   * ≥3 weeks contributing AND ≥50 per-MEP RCVs inspected).
   */
  weeksInspected: number;
  /**
   * `true` when the requested `[from, to]` window spans more than the
   * server-side cap of 26 plenary weeks and the fetch was truncated to the
   * 26 most recent weeks in scope. Accompanied by a `dataQualityWarning`.
   */
  weeksTruncated?: boolean;
  /**
   * `false` when DOCEO was unreachable or returned no records for the
   * requested period; absent / `true` otherwise. Replaces the previous
   * `dataSource: 'NONE'` sentinel so the `dataSource` field stays a closed
   * set across OSINT tools.
   */
  dataAvailable?: boolean;
}

/** Trend assessment derived from high-severity counts. */
function classifyDefectionTrend(highCount: number): string {
  if (highCount > 2) return 'INCREASING';
  if (highCount > 0) return 'STABLE';
  return 'DECREASING';
}

/** Risk-level classifier derived from high-severity counts. */
function classifyRiskLevel(highCount: number): string {
  if (highCount > 3) return 'CRITICAL';
  if (highCount > 1) return 'ELEVATED';
  if (highCount > 0) return 'MODERATE';
  return 'LOW';
}

/** Map z-score magnitude to severity (preserves prior HIGH/MEDIUM/LOW semantics). */
function severityFromZ(z: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (z >= 3) return 'HIGH';
  if (z >= 2) return 'MEDIUM';
  return 'LOW';
}

/** Map percentage-point deltas to severity. */
function severityFromDelta(delta: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (delta >= 40) return 'HIGH';
  if (delta >= 30) return 'MEDIUM';
  return 'LOW';
}

/** Map cross-party alignment share to severity. */
function severityFromShare(share: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (share >= 90) return 'HIGH';
  if (share >= 75) return 'MEDIUM';
  return 'LOW';
}

/**
 * Build the human-readable methodology string emitted alongside each
 * response. Reports the *derived* thresholds actually applied for the
 * request so callers that override `sensitivityThreshold` see the scaled
 * values (not the spec defaults).
 *
 * @internal
 */
function buildMethodologyDescription(
  thresholds: SensitivityThresholds,
  sensitivity: number
): string {
  const z = Math.round(thresholds.zScore * 100) / 100;
  const wow = Math.round(thresholds.wowDelta * 100) / 100;
  const crossPct = Math.round(thresholds.crossPartyShare * 100);
  const isDefault = sensitivity === 0.3;
  const scalingNote = isDefault
    ? '(spec defaults)'
    : `(scaled from spec defaults — z≥${String(DEFAULT_Z_SCORE_THRESHOLD)}, WoW≥`
      + `${String(DEFAULT_WOW_THRESHOLD_PP)}pp, cross-party≥`
      + `${String(Math.round(DEFAULT_CROSS_PARTY_SHARE * 100))}% — `
      + `via sensitivityThreshold=${String(sensitivity)})`;
  return 'Per-MEP defection / abstention / cross-party alignment anomaly detection on DOCEO RCV '
    + 'records — iterates weekly DOCEO RCV pages across the requested period (deduplicated by '
    + `record id, capped at 200 records, ${String(MAX_PLENARY_WEEKS)}-week hard limit). Per-vote group `
    + 'majority resolved by plurality with alphabetical tie-breaking. Each MEP vote classified as '
    + 'aligned / defected / abstained / absent against their home-group majority. Anomalies emitted '
    + `when defection-rate z-score ≥ ${String(z)}, `
    + `abstention-rate z-score ≥ ${String(z)}, week-over-week defection delta ≥ ${String(wow)}pp, `
    + `or non-home-group alignment share ≥ ${String(crossPct)}% in a weekly sub-window `
    + `${scalingNote}. Confidence: HIGH requires ≥50 RCVs inspected AND ≥3 contributing weeks; `
    + 'otherwise MEDIUM (10-49 RCVs or <3 weeks) or LOW (<10 RCVs). Source: EP DOCEO XML.';
}

interface MepRef {
  id: string;
  name: string;
  politicalGroup: string;
}

/**
 * Per-request thresholds derived from `sensitivityThreshold`.
 *
 * Defaults match the issue specification: z ≥ 1.5, WoW ≥ 20pp, cross-party
 * share ≥ 0.6. The sensitivity parameter scales these so lower values yield
 * more anomalies (backward-compatible with prior callers).
 */
interface SensitivityThresholds {
  zScore: number;
  wowDelta: number;
  crossPartyShare: number;
}

function deriveThresholds(sensitivity: number): SensitivityThresholds {
  // Linear scale anchored at the default 0.3 → spec defaults.
  const factor = sensitivity / 0.3;
  return {
    zScore: Math.max(0.5, DEFAULT_Z_SCORE_THRESHOLD * factor),
    wowDelta: Math.max(5, DEFAULT_WOW_THRESHOLD_PP * factor),
    crossPartyShare: Math.min(0.95, Math.max(0.3, DEFAULT_CROSS_PARTY_SHARE * factor)),
  };
}

/**
 * Detect anomalies for a single MEP from the supplied DOCEO RCV records.
 *
 * @param mep - MEP reference (id/name/politicalGroup).
 * @param votes - All DOCEO RCV records in the inspection window.
 * @param thresholds - Sensitivity-adjusted detection thresholds.
 * @param detectedDate - Period end date stamped onto anomaly records.
 * @returns Detected anomalies and the per-MEP RCV inspection count.
 */
function detectMepAnomaliesFromDoceo(
  mep: MepRef,
  votes: LatestVoteRecord[],
  thresholds: SensitivityThresholds,
  detectedDate: string
): { anomalies: VotingAnomaly[]; classified: ClassifiedVote[]; buckets: WeekBucket[] } {
  const homeGroup = mep.politicalGroup !== '' ? normalizePoliticalGroup(mep.politicalGroup) : null;
  const classified = votes.map(v => classifyMepVote(v, mep.id, homeGroup));
  const buckets = bucketByWeek(classified);
  const anomalies: VotingAnomaly[] = [];

  for (const outlier of findOutlierWeeks(buckets, 'defectionRate', thresholds.zScore)) {
    anomalies.push({
      type: 'PARTY_DEFECTION',
      severity: severityFromZ(outlier.z),
      mepId: mep.id,
      mepName: mep.name,
      description: `Defection rate of ${String(outlier.value)}% during week of ${outlier.weekStart} `
        + `(z=${String(outlier.z)} vs ${mep.politicalGroup || 'home group'} majority on DOCEO RCVs)`,
      metrics: {
        expectedValue: outlier.baselineMean,
        actualValue: outlier.value,
        deviation: Math.round((outlier.value - outlier.baselineMean) * 100) / 100,
      },
      detectedDate,
      evidenceVoteIds: outlier.voteIds,
    });
  }

  for (const outlier of findOutlierWeeks(buckets, 'abstentionRate', thresholds.zScore)) {
    anomalies.push({
      type: 'ABSTENTION_SPIKE',
      severity: severityFromZ(outlier.z),
      mepId: mep.id,
      mepName: mep.name,
      description: `Abstention rate of ${String(outlier.value)}% during week of ${outlier.weekStart} `
        + `(z=${String(outlier.z)} vs MEP's own baseline)`,
      metrics: {
        expectedValue: outlier.baselineMean,
        actualValue: outlier.value,
        deviation: Math.round((outlier.value - outlier.baselineMean) * 100) / 100,
      },
      detectedDate,
      evidenceVoteIds: outlier.voteIds,
    });
  }

  for (const shift of findWoWShifts(buckets, thresholds.wowDelta)) {
    anomalies.push({
      type: 'ALIGNMENT_SHIFT',
      severity: severityFromDelta(shift.delta),
      mepId: mep.id,
      mepName: mep.name,
      description: `Week-over-week defection rate jumped by ${String(shift.delta)}pp `
        + `(${shift.fromWeek} → ${shift.toWeek})`,
      metrics: {
        expectedValue: shift.previousRate,
        actualValue: Math.round((shift.previousRate + shift.delta) * 100) / 100,
        deviation: shift.delta,
      },
      detectedDate,
      evidenceVoteIds: shift.voteIds,
    });
  }

  for (const window of findCrossPartyAlignmentWindows(buckets, thresholds.crossPartyShare)) {
    const thresholdPct = Math.round(thresholds.crossPartyShare * 100);
    anomalies.push({
      type: 'CROSS_PARTY_ALIGNMENT_SHIFT',
      severity: severityFromShare(window.sharePercent),
      mepId: mep.id,
      mepName: mep.name,
      description: `Voted with non-home group majorities on ${String(window.sharePercent)}% of `
        + `${String(window.decisive)} decisive RCVs during week of ${window.weekStart}`,
      metrics: {
        expectedValue: thresholdPct,
        actualValue: window.sharePercent,
        deviation: Math.round((window.sharePercent - thresholdPct) * 100) / 100,
      },
      detectedDate,
      evidenceVoteIds: window.voteIds,
    });
  }

  return { anomalies, classified, buckets };
}

/** Count RCV votes where the MEP actually appeared on the roll. */
function countVotesInspected(classified: ClassifiedVote[]): number {
  let n = 0;
  for (const c of classified) if (c.alignment !== 'absent') n += 1;
  return n;
}

/**
 * Determine whether the DOCEO source can be labelled NEAR_REALTIME.
 *
 * NEAR_REALTIME requires at least one DOCEO record with a sitting date within
 * the configured window (default 72h) of `referenceDate`.
 */
function isNearRealtime(votes: LatestVoteRecord[], referenceDate: Date): boolean {
  const cutoff = referenceDate.getTime() - NEAR_REALTIME_WINDOW_HOURS * 3_600_000;
  for (const v of votes) {
    const date = v.sittingDate ?? v.date;
    if (date === '') continue;
    const ts = Date.parse(date);
    if (!Number.isNaN(ts) && ts >= cutoff) return true;
  }
  return false;
}

/**
 * Return the most recent valid sitting date in the supplied record list,
 * or `null` when none of the records have a parseable date.
 *
 * @internal
 */
function mostRecentSittingDate(votes: LatestVoteRecord[]): Date | null {
  let latest: number | null = null;
  for (const v of votes) {
    const date = v.sittingDate ?? v.date;
    if (date === '') continue;
    const ts = Date.parse(date);
    if (Number.isNaN(ts)) continue;
    if (latest === null || ts > latest) latest = ts;
  }
  return latest === null ? null : new Date(latest);
}

/**
 * Return the oldest valid sitting date in the supplied record list, or `null`
 * when none of the records have a parseable date. Used by
 * {@link resolveDataFreshness} to surface the span actually covered by a
 * multi-week DOCEO fetch.
 *
 * @internal
 */
function oldestSittingDate(votes: LatestVoteRecord[]): Date | null {
  let oldest: number | null = null;
  for (const v of votes) {
    const date = v.sittingDate ?? v.date;
    if (date === '') continue;
    const ts = Date.parse(date);
    if (Number.isNaN(ts)) continue;
    if (oldest === null || ts < oldest) oldest = ts;
  }
  return oldest === null ? null : new Date(oldest);
}

/**
 * Result of the multi-week DOCEO fetch loop.
 *
 * @internal
 */
interface DoceoCorpus {
  records: LatestVoteRecord[];
  doceoAvailable: boolean;
  /** Plenary-week Mondays from which at least one RCV record was retrieved. */
  weeksContributing: number;
  /** Total plenary weeks attempted in the [from, to] window after truncation. */
  weeksAttempted: number;
  /** `true` when the requested window was truncated to {@link MAX_PLENARY_WEEKS}. */
  weeksTruncated: boolean;
}

/** Corpus cache TTL — 5 minutes per issue spec. */
const CORPUS_CACHE_TTL_MS = 5 * 60 * 1_000;

/**
 * Bound on the multi-week corpus cache to prevent unbounded memory growth in
 * long-lived servers as varied `${scope}|${from}|${to}` windows accumulate
 * — mirrors the convention used by `analyzeCommitteeActivity` and
 * `doceoMepAggregator`.
 */
const MAX_CORPUS_CACHE_ENTRIES = 200;

interface CorpusCacheEntry {
  corpus: DoceoCorpus;
  expiresAt: number;
}

/**
 * Multi-week DOCEO corpus cache, keyed by `${scope}|${from}|${to}`. Bounded
 * with a 5-minute TTL so back-to-back calls within the same window reuse the
 * weekly fan-out. Cache keys include both `from` and `to` so that windows
 * shifted even by one day re-fetch correctly.
 *
 * @internal
 */
const corpusCache = new Map<string, CorpusCacheEntry>();

/**
 * Clear the multi-week DOCEO corpus cache.
 *
 * @internal Exported for unit testing.
 */
export function clearDoceoCorpusCache(): void {
  corpusCache.clear();
}

/**
 * Fetch DOCEO RCV records for a single plenary week (Mon-Fri) anchored at
 * `weekStart`. Returns `null` when the week is entirely unreachable so the
 * caller can record per-week resilience without aborting the multi-week fan-out.
 *
 * Implements within-week pagination (2 × 100) only when the first page is
 * full *and* this is the only week being fetched — for multi-week requests
 * we prefer breadth (more weeks) over depth (more votes per week) to seed
 * a meaningful baseline.
 *
 * @internal
 */
async function fetchSinglePlenaryWeek(
  weekStart: string,
  paginateWithinWeek: boolean
): Promise<LatestVoteRecord[] | null> {
  try {
    const firstPage = await withTimeoutAndAbort(
      (signal) => doceoClient.getLatestVotes({
        includeIndividualVotes: true,
        limit: DOCEO_PAGE_LIMIT,
        offset: 0,
        weekStart,
        abortSignal: signal,
      }),
      DOCEO_TIMEOUT_MS,
      `DOCEO RCV fetch (week ${weekStart}, page 1) timed out`
    );
    let weekRecords = firstPage.data;
    if (paginateWithinWeek && firstPage.data.length >= DOCEO_PAGE_LIMIT) {
      try {
        const secondPage = await withTimeoutAndAbort(
          (signal) => doceoClient.getLatestVotes({
            includeIndividualVotes: true,
            limit: DOCEO_PAGE_LIMIT,
            offset: DOCEO_PAGE_LIMIT,
            weekStart,
            abortSignal: signal,
          }),
          DOCEO_TIMEOUT_MS,
          `DOCEO RCV fetch (week ${weekStart}, page 2) timed out`
        );
        weekRecords = [...weekRecords, ...secondPage.data];
      } catch {
        // Second page failure is non-fatal; continue with first page only.
      }
    }
    return weekRecords;
  } catch (error: unknown) {
    auditLogger.logError(
      'detect_voting_anomalies.doceo_week_fetch',
      { weekStart },
      toErrorMessage(error)
    );
    return null;
  }
}

/**
 * Sort RCV records chronologically (sittingDate desc) so the
 * `DOCEO_RCV_FETCH_LIMIT` cap keeps the freshest votes when truncating.
 *
 * @internal
 */
function sortRecordsDesc(records: LatestVoteRecord[]): LatestVoteRecord[] {
  const toTs = (d: string | undefined): number => {
    if (d === undefined || d === '' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return 0;
    const ts = Date.parse(`${d}T00:00:00Z`);
    return Number.isNaN(ts) ? 0 : ts;
  };
  return [...records].sort((a, b) => {
    const aTs = toTs(a.sittingDate ?? a.date);
    const bTs = toTs(b.sittingDate ?? b.date);
    if (bTs !== aTs) return bTs - aTs;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Detect whether the requested `[from, to]` window spans more plenary weeks
 * than {@link MAX_PLENARY_WEEKS}. Pure helper extracted to keep
 * {@link fetchDoceoRcvRecords} below the cyclomatic-complexity ceiling.
 *
 * @internal
 */
function detectWindowTruncation(
  period: { from: string; to: string }
): boolean {
  const fromMs = Date.parse(`${period.from}T00:00:00Z`);
  const toMs = Date.parse(`${period.to}T00:00:00Z`);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs) || fromMs > toMs) return false;
  // Count intersecting plenary weeks using the same Mon–Fri intersection logic
  // as iteratePlenaryWeeks — stop early once we've confirmed more than
  // MAX_PLENARY_WEEKS intersecting weeks exist so the result matches actual
  // truncation rather than a raw day-span heuristic.
  const DAY_MS = 24 * 3_600_000;
  const WEEK_MS = 7 * DAY_MS;
  const FRIDAY_OFFSET_MS = 4 * DAY_MS;
  const endMonday = isoWeekStart(period.to);
  let cursorMs = Date.parse(`${endMonday}T00:00:00Z`);
  let intersectingCount = 0;
  while (cursorMs + FRIDAY_OFFSET_MS >= fromMs) {
    if (cursorMs <= toMs) {
      intersectingCount += 1;
      if (intersectingCount > MAX_PLENARY_WEEKS) return true;
    }
    cursorMs -= WEEK_MS;
  }
  return false;
}

/** Stop the corpus build after this many consecutive per-week fetch failures. */
const MAX_CONSECUTIVE_FETCH_FAILURES = 3;

/**
 * Run the per-week DOCEO fetch loop sequentially, deduplicating RCV records
 * by `vote.id`. Returns the merged map plus a `anyWeekReached` flag used by
 * the caller to discriminate the "all weeks failed" branch from the "empty
 * corpus" branch.
 *
 * @internal
 */
async function fetchAndDedupWeeks(
  weeks: string[],
  paginateWithinWeek: boolean
): Promise<{
  dedup: Map<string, LatestVoteRecord>;
  anyWeekReached: boolean;
  rawFetched: number;
}> {
  const dedup = new Map<string, LatestVoteRecord>();
  let anyWeekReached = false;
  let rawFetched = 0;
  let consecutiveFailures = 0;
  for (const week of weeks) {
    if (consecutiveFailures >= MAX_CONSECUTIVE_FETCH_FAILURES) break;
    const weekRecords = await fetchSinglePlenaryWeek(week, paginateWithinWeek);
    if (weekRecords === null) {
      consecutiveFailures += 1;
      continue;
    }
    consecutiveFailures = 0;
    anyWeekReached = true;
    for (const v of weekRecords) {
      if (v.dataSource !== 'RCV') continue;
      rawFetched += 1;
      if (!dedup.has(v.id)) {
        dedup.set(v.id, v);
      }
    }
  }
  return { dedup, anyWeekReached, rawFetched };
}

/**
 * Count distinct ISO-week buckets (by `sittingDate`) present in the corpus.
 * This is the spec-aligned signal — "≥3 distinct weeks contributed votes" —
 * and is robust against fixtures where the same DOCEO XML fixture is returned
 * for multiple `weekStart` anchors.
 *
 * Malformed sitting dates (anything not matching `YYYY-MM-DD` or that
 * `Date.parse` cannot resolve) are skipped so they cannot inflate the
 * distinct-week count with bogus week keys — see review on
 * https://github.com/Hack23/European-Parliament-MCP-Server/pull/490.
 *
 * @internal
 */
function countDistinctSittingWeeks(corpus: LatestVoteRecord[]): number {
  const distinctWeeks = new Set<string>();
  for (const v of corpus) {
    const date = v.sittingDate ?? v.date;
    if (date === '') continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (Number.isNaN(Date.parse(`${date}T00:00:00Z`))) continue;
    distinctWeeks.add(isoWeekStart(date));
  }
  return distinctWeeks.size;
}

/**
 * Build the multi-week DOCEO RCV corpus for the requested `[period.from,
 * period.to]` window.
 *
 * Replaces the prior single-week fetch (which silently dropped any votes
 * outside the latest plenary week before `period.to`, degenerating the
 * per-MEP baseline to a single-week sample with zero stdev — see
 * Hack23/European-Parliament-MCP-Server#462 follow-up). Now iterates every
 * plenary-week Monday between `from` and `to`, sequentially under the
 * existing rate limiter, deduplicates by `vote.id`, and caps the corpus at
 * {@link DOCEO_RCV_FETCH_LIMIT}.
 *
 * Resilience: per-week timeouts/errors are absorbed (the week is recorded as
 * non-contributing) so a single bad week does not invalidate the whole
 * request.
 *
 * @internal
 */
async function fetchDoceoRcvRecords(
  period: { from: string; to: string }
): Promise<DoceoCorpus> {
  const allWeeks = iteratePlenaryWeeks(period.from, period.to);
  const weeksTruncated = detectWindowTruncation(period);

  // Single-week fallback: empty iteration (e.g. malformed dates) still hits
  // DOCEO at period.to to preserve the legacy "no [from,to]" path.
  const weeks = allWeeks.length === 0 ? [period.to] : allWeeks;
  const paginateWithinWeek = weeks.length === 1;

  const { dedup, anyWeekReached, rawFetched } = await fetchAndDedupWeeks(weeks, paginateWithinWeek);

  if (!anyWeekReached) {
    auditLogger.logError(
      'detect_voting_anomalies.doceo_fetch',
      { from: period.from, to: period.to, weeksAttempted: weeks.length },
      'all weekly fetches failed'
    );
    return {
      records: [],
      doceoAvailable: false,
      weeksContributing: 0,
      weeksAttempted: weeks.length,
      weeksTruncated,
    };
  }

  const merged = [...dedup.values()];
  const corpus = sortRecordsDesc(merged).slice(0, DOCEO_RCV_FETCH_LIMIT);
  const weeksContributing = countDistinctSittingWeeks(corpus);
  // `duplicatesRemoved` reflects RCV records collapsed by `vote.id`
  // (pre-dedup fetched − unique merged). `truncatedRecords` reports the
  // post-cap drop from `DOCEO_RCV_FETCH_LIMIT`. These were previously
  // conflated into a single `dedupeRatio` computed against the *capped*
  // corpus, which mostly measured truncation rather than true de-duplication
  // — see review on https://github.com/Hack23/European-Parliament-MCP-Server/pull/490.
  const duplicatesRemoved = Math.max(0, rawFetched - merged.length);
  const truncatedRecords = Math.max(0, merged.length - corpus.length);
  const dedupeRatio = rawFetched > 0
    ? Math.round((duplicatesRemoved / rawFetched) * 1000) / 1000
    : 0;

  auditLogger.logDataAccess(
    'detect_voting_anomalies.doceo_corpus',
    {
      from: period.from,
      to: period.to,
      weeksAttempted: weeks.length,
      weeksContributing,
      rawRecords: rawFetched,
      uniqueRecords: merged.length,
      duplicatesRemoved,
      cappedRecords: corpus.length,
      truncatedRecords,
      dedupeRatio,
    },
    corpus.length
  );

  return {
    records: corpus,
    doceoAvailable: true,
    weeksContributing,
    weeksAttempted: weeks.length,
    weeksTruncated,
  };
}

/**
 * Cached wrapper around {@link fetchDoceoRcvRecords}. Cache key includes the
 * MEP/group scope AND the period boundaries so windows shifted by even one
 * day refetch correctly. TTL is 5 minutes per the issue spec.
 *
 * @internal
 */
async function getDoceoCorpus(
  scope: { mepId?: string; groupId?: string },
  period: { from: string; to: string }
): Promise<DoceoCorpus> {
  const scopeKey = scope.mepId ?? scope.groupId ?? 'all';
  const key = `${scopeKey}|${period.from}|${period.to}`;
  const now = Date.now();
  const cached = corpusCache.get(key);
  if (cached !== undefined) {
    if (cached.expiresAt > now) {
      return cached.corpus;
    }
    // Expired entries are removed eagerly so the bounded cache reclaims slots
    // promptly instead of waiting for the FIFO eviction below.
    corpusCache.delete(key);
  }
  const corpus = await fetchDoceoRcvRecords(period);
  // Only cache successful fetches so a transient outage doesn't lock the
  // window into LOW confidence for 5 minutes.
  if (corpus.doceoAvailable) {
    if (corpusCache.size >= MAX_CORPUS_CACHE_ENTRIES) {
      // FIFO eviction: Map iteration order is insertion order in JS, so the
      // first key is the oldest insertion. Sufficient for a small bounded
      // corpus cache; full LRU is not warranted at this scale.
      const firstKey = corpusCache.keys().next().value;
      if (firstKey !== undefined) corpusCache.delete(firstKey);
    }
    corpusCache.set(key, { corpus, expiresAt: now + CORPUS_CACHE_TTL_MS });
  }
  return corpus;
}

interface DetectionResult {
  scope: string;
  anomalies: VotingAnomaly[];
  /** Minimum per-MEP RCV votes inspected (worst-case coverage). */
  rcvVotesInspected: number;
  /** Maximum per-MEP RCV votes inspected (best-case coverage). */
  rcvVotesInspectedMax: number;
  mepsAnalyzed: number;
}

/**
 * Aggregate per-MEP anomaly detection over a list of MEPs.
 *
 * Returns *minimum* and *maximum* RCV votes inspected across the MEP list.
 * The minimum drives confidence/warnings so that group/all-MEP scopes are not
 * inflated by a single high-coverage MEP — when most MEPs have few or zero
 * inspected votes (e.g. broad scope, narrow DOCEO window) the response
 * correctly reports LOW/MEDIUM confidence instead of HIGH.
 */
function runDetectionForMeps(
  meps: MepRef[],
  records: LatestVoteRecord[],
  thresholds: SensitivityThresholds,
  detectedDate: string
): { anomalies: VotingAnomaly[]; rcvVotesInspected: number; rcvVotesInspectedMax: number } {
  const allAnomalies: VotingAnomaly[] = [];
  const perMepInspected: number[] = [];
  for (const mep of meps) {
    const { anomalies, classified } = detectMepAnomaliesFromDoceo(mep, records, thresholds, detectedDate);
    const inspected = countVotesInspected(classified);
    perMepInspected.push(inspected);
    allAnomalies.push(...anomalies);
    auditLogger.logDataAccess(
      'detect_voting_anomalies.mep_analysis',
      { mepId: mep.id, rcvVotesInspected: inspected },
      inspected
    );
  }
  // Worst-case coverage drives confidence; best-case is reported separately
  // for observability. When no MEPs were analysed both values are 0.
  const rcvVotesInspected = perMepInspected.length > 0 ? Math.min(...perMepInspected) : 0;
  const rcvVotesInspectedMax = perMepInspected.length > 0 ? Math.max(...perMepInspected) : 0;
  return { anomalies: allAnomalies, rcvVotesInspected, rcvVotesInspectedMax };
}

/**
 * Detect anomalies for a single MEP.
 *
 * @internal Exported for unit testing.
 */
async function detectSingleMepAnomalies(
  mepId: string,
  thresholds: SensitivityThresholds,
  period: { from: string; to: string },
  records: LatestVoteRecord[]
): Promise<DetectionResult> {
  const mep = await epClient.getMEPDetails(mepId);
  const { anomalies, rcvVotesInspected, rcvVotesInspectedMax } = runDetectionForMeps(
    [{ id: mep.id, name: mep.name, politicalGroup: mep.politicalGroup }],
    records,
    thresholds,
    period.to
  );
  return { scope: `MEP: ${mepId}`, anomalies, rcvVotesInspected, rcvVotesInspectedMax, mepsAnalyzed: 1 };
}

/** Detect anomalies for a political group or all MEPs (bounded scan). */
async function detectGroupAnomalies(
  groupId: string | undefined,
  thresholds: SensitivityThresholds,
  period: { from: string; to: string },
  records: LatestVoteRecord[]
): Promise<DetectionResult> {
  const groupFilter: { group?: string } = {};
  if (groupId !== undefined) groupFilter.group = groupId;
  const scope = groupId !== undefined ? `Group: ${groupId}` : 'All MEPs';
  const mepsResult = await epClient.getCurrentMEPs({ ...groupFilter, limit: MAX_MEPS_PER_REQUEST });
  const meps: MepRef[] = mepsResult.data.map(m => ({
    id: m.id,
    name: m.name,
    politicalGroup: m.politicalGroup,
  }));
  const { anomalies, rcvVotesInspected, rcvVotesInspectedMax } =
    runDetectionForMeps(meps, records, thresholds, period.to);
  return { scope, anomalies, rcvVotesInspected, rcvVotesInspectedMax, mepsAnalyzed: meps.length };
}

/** Roll up anomalies into severity counts and derived attributes. */
function buildAnomalySummary(anomalies: VotingAnomaly[]): {
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  anomalyRate: number;
  severityIndex: number;
} {
  const highSeverity = anomalies.filter(a => a.severity === 'HIGH').length;
  const mediumSeverity = anomalies.filter(a => a.severity === 'MEDIUM').length;
  const lowSeverity = anomalies.filter(a => a.severity === 'LOW').length;
  const anomalyRate = anomalies.length > 0
    ? Math.round((highSeverity / anomalies.length) * 100) / 100
    : 0;
  const severityIndex = anomalies.length > 0
    ? Math.round(((highSeverity * 3 + mediumSeverity * 2 + lowSeverity) / anomalies.length) * 100) / 100
    : 0;
  return { highSeverity, mediumSeverity, lowSeverity, anomalyRate, severityIndex };
}

/**
 * Compute data-quality warnings for a given fetch outcome.
 *
 * @internal
 */
function collectDataQualityWarnings(
  doceoAvailable: boolean,
  recordCount: number,
  rcvVotesInspected: number,
  weeksContributing: number,
  weeksTruncated: boolean
): string[] {
  const warnings: string[] = [];
  if (!doceoAvailable) {
    warnings.push('DOCEO RCV source unavailable — anomaly detection deferred (LOW confidence).');
  } else if (recordCount === 0) {
    warnings.push('No DOCEO RCV records returned for the requested period.');
  } else if (rcvVotesInspected < 10) {
    warnings.push('Fewer than 10 RCV votes inspected — confidence reduced to LOW.');
  }
  if (weeksTruncated) {
    warnings.push(
      `Requested window exceeds the ${String(MAX_PLENARY_WEEKS)}-week cap — `
      + `fetched the most recent ${String(MAX_PLENARY_WEEKS)} plenary weeks only (weeksTruncated=true).`
    );
  }
  if (doceoAvailable && recordCount > 0 && weeksContributing < 3) {
    warnings.push(
      `Only ${String(weeksContributing)} plenary week(s) contributed RCV records — `
      + 'baseline lacks multi-week dispersion (confidence capped at MEDIUM).'
    );
  }
  return warnings;
}

/**
 * Resolve the data freshness label.
 *
 * - `NEAR_REALTIME` when at least one DOCEO sitting falls within
 *   {@link NEAR_REALTIME_WINDOW_HOURS} of "now".
 * - Otherwise, surface the most recent sitting date and the actual age in
 *   hours so consumers can reason about staleness without inflating the
 *   window. When multiple plenary weeks contributed, the oldest contributing
 *   week is also reported so callers can see the multi-week span covered.
 */
function resolveDataFreshness(
  dataAvailable: boolean,
  records: LatestVoteRecord[]
): string {
  if (!dataAvailable) return 'No DOCEO RCV data available for the requested period';
  const now = new Date();
  const latest = mostRecentSittingDate(records);
  const oldest = oldestSittingDate(records);
  const oldestSuffix = oldest !== null && latest !== null && oldest.getTime() < latest.getTime()
    ? ` (oldest contributing week ${oldest.toISOString().slice(0, 10)})`
    : '';
  if (isNearRealtime(records, now)) return `NEAR_REALTIME${oldestSuffix}`;
  if (latest === null) return `DOCEO RCV data — outside ${String(NEAR_REALTIME_WINDOW_HOURS)}h NEAR_REALTIME window`;
  const ageMs = now.getTime() - latest.getTime();
  const ageHours = Math.max(0, Math.round(ageMs / 3_600_000));
  return `DOCEO RCV data — latest sitting ${String(ageHours)}h old`
    + ` (outside ${String(NEAR_REALTIME_WINDOW_HOURS)}h NEAR_REALTIME window)${oldestSuffix}`;
}

/**
 * Resolve the confidence level from the fetch outcome and coverage.
 *
 * `HIGH` requires *both* ≥50 per-MEP RCVs *and* ≥3 distinct plenary weeks
 * contributing records — without multi-week dispersion the rolling baseline
 * has zero stdev and z-score outliers collapse (the failure mode this
 * follow-up was opened to fix). When coverage is sufficient but only 1-2
 * weeks contributed, confidence is capped at MEDIUM.
 */
function resolveConfidenceLevel(
  dataAvailable: boolean,
  rcvVotesInspected: number,
  weeksContributing: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (!dataAvailable) return 'LOW';
  const coverage = coverageConfidence(rcvVotesInspected);
  if (coverage === 'HIGH' && weeksContributing < 3) return 'MEDIUM';
  return coverage;
}

/**
 * Inputs assembled by {@link handleDetectVotingAnomalies} and consumed by
 * {@link buildVotingAnomalyAnalysis} to construct the response envelope.
 *
 * @internal
 */
interface AnalysisInputs {
  period: { from: string; to: string };
  result: DetectionResult;
  corpus: DoceoCorpus;
  thresholds: SensitivityThresholds;
  sensitivity: number;
  records: LatestVoteRecord[];
}

/**
 * Assemble the `VotingAnomalyAnalysis` response envelope from the detection
 * result, the multi-week DOCEO corpus, and the sensitivity-derived thresholds.
 * Extracted from {@link handleDetectVotingAnomalies} to keep its cyclomatic
 * complexity below the project ceiling.
 *
 * @internal
 */
function buildVotingAnomalyAnalysis(input: AnalysisInputs): VotingAnomalyAnalysis {
  const { period, result, corpus, thresholds, sensitivity, records } = input;
  const summary = buildAnomalySummary(result.anomalies);
  const dataAvailable = corpus.doceoAvailable && records.length > 0;
  const analysis: VotingAnomalyAnalysis = {
    period,
    targetScope: result.scope,
    anomalies: result.anomalies,
    summary: {
      totalAnomalies: result.anomalies.length,
      highSeverity: summary.highSeverity,
      mediumSeverity: summary.mediumSeverity,
      lowSeverity: summary.lowSeverity,
    },
    computedAttributes: {
      anomalyRate: summary.anomalyRate,
      severityIndex: summary.severityIndex,
      groupStabilityScore: Math.round((1 - summary.severityIndex / 3) * 100 * 100) / 100,
      defectionTrend: classifyDefectionTrend(summary.highSeverity),
      riskLevel: classifyRiskLevel(summary.highSeverity),
    },
    confidenceLevel: resolveConfidenceLevel(dataAvailable, result.rcvVotesInspected, corpus.weeksContributing),
    dataSource: 'DOCEO',
    dataFreshness: resolveDataFreshness(dataAvailable, records),
    sourceAttribution: 'European Parliament DOCEO XML — europarl.europa.eu/doceo',
    methodology: buildMethodologyDescription(thresholds, sensitivity),
    dataQualityWarnings: collectDataQualityWarnings(
      corpus.doceoAvailable,
      records.length,
      result.rcvVotesInspected,
      corpus.weeksContributing,
      corpus.weeksTruncated
    ),
    rcvVotesInspected: result.rcvVotesInspected,
    rcvVotesInspectedMax: result.rcvVotesInspectedMax,
    mepsAnalyzed: result.mepsAnalyzed,
    weeksInspected: corpus.weeksContributing,
  };
  if (corpus.weeksTruncated) analysis.weeksTruncated = true;
  if (!dataAvailable) analysis.dataAvailable = false;
  return analysis;
}

/**
 * Handles the `detect_voting_anomalies` MCP tool request.
 *
 * See file-level JSDoc for methodology details. Each anomaly carries
 * `evidenceVoteIds` referencing the contributing DOCEO RCV records.
 *
 * @param args - Raw tool arguments, validated against {@link DetectVotingAnomaliesSchema}
 * @returns MCP tool result containing detected anomalies with evidence vote IDs
 * @throws If `args` fails schema validation or the EP API is unreachable.
 *
 * @security Input validated with Zod. Audit logs record only `mepId` and
 *   sanitised counts (no MEP names or vote contents).
 * @since 0.8.0
 */
export async function handleDetectVotingAnomalies(
  args: unknown
): Promise<ToolResult> {
  const params = DetectVotingAnomaliesSchema.parse(args);

  try {
    const period = { from: params.dateFrom ?? '2024-01-01', to: params.dateTo ?? '2024-12-31' };
    const thresholds = deriveThresholds(params.sensitivityThreshold);

    const scope: { mepId?: string; groupId?: string } = {};
    if (params.mepId !== undefined) scope.mepId = params.mepId;
    if (params.groupId !== undefined) scope.groupId = params.groupId;
    const corpus = await getDoceoCorpus(scope, period);

    const result = params.mepId !== undefined
      ? await detectSingleMepAnomalies(params.mepId, thresholds, period, corpus.records)
      : await detectGroupAnomalies(params.groupId, thresholds, period, corpus.records);

    const analysis = buildVotingAnomalyAnalysis({
      period,
      result,
      corpus,
      thresholds,
      sensitivity: params.sensitivityThreshold,
      records: corpus.records,
    });
    return buildToolResponse(analysis);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to detect voting anomalies: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const detectVotingAnomaliesToolMetadata = {
  name: 'detect_voting_anomalies',
  description: 'Detect unusual voting patterns including party defections, abstention spikes, week-over-week alignment shifts, and cross-party movement signals. Uses DOCEO RCV roll-call records and per-MEP rolling baselines (defection z ≥1.5, abstention z ≥1.5, WoW Δ ≥20pp, cross-party share ≥60%). Returns anomalies with evidenceVoteIds, severity classification (HIGH/MEDIUM/LOW), group stability score, defection trend, and risk level.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepId: {
        type: 'string',
        description: 'MEP identifier (omit for broad analysis)',
        minLength: 1,
        maxLength: 100
      },
      groupId: {
        type: 'string',
        description: 'Political group to analyze',
        minLength: 1,
        maxLength: 50
      },
      dateFrom: {
        type: 'string',
        description: 'Analysis start date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      dateTo: {
        type: 'string',
        description: 'Analysis end date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      sensitivityThreshold: {
        type: 'number',
        description: 'Anomaly sensitivity (0-1, lower = more anomalies detected). Default 0.3 matches the spec thresholds (z≥1.5, WoW≥20pp, cross-party≥60%).',
        minimum: 0,
        maximum: 1,
        default: 0.3
      }
    }
  }
};
