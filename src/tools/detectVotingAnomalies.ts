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
    + 'records (up to 200 via 2×100 paged fetching). Per-vote group majority resolved by plurality with alphabetical '
    + 'tie-breaking. Each MEP vote classified as aligned / defected / abstained / absent against their '
    + `home-group majority. Anomalies emitted when defection-rate z-score ≥ ${String(z)}, `
    + `abstention-rate z-score ≥ ${String(z)}, week-over-week defection delta ≥ ${String(wow)}pp, `
    + `or non-home-group alignment share ≥ ${String(crossPct)}% in a weekly sub-window `
    + `${scalingNote}. Confidence reflects worst-case RCV coverage across analysed MEPs: `
    + 'HIGH ≥50 votes inspected, MEDIUM 10–49, LOW <10. Source: EP DOCEO XML.';
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
 * Fetch DOCEO RCV records covering the request window. Implements paged
 * fetching (2 × 100) since the DOCEO client validates `limit ≤ 100`.
 * Returns an empty sentinel when DOCEO is unreachable so the caller can
 * surface a graceful `dataQualityWarning` instead of throwing.
 */
async function fetchDoceoRcvRecords(
  period: { from: string; to: string }
): Promise<{ records: LatestVoteRecord[]; doceoAvailable: boolean }> {
  try {
    // Normalize period.to to an ISO date string for DOCEO weekStart.
    // DOCEO `weekStart` selects the plenary week containing the supplied date;
    // we use the period's *end* date to capture the most recent week in scope.
    const firstPage = await withTimeoutAndAbort(
      (signal) => doceoClient.getLatestVotes({
        includeIndividualVotes: true,
        limit: DOCEO_PAGE_LIMIT,
        offset: 0,
        weekStart: period.to,
        abortSignal: signal,
      }),
      DOCEO_TIMEOUT_MS,
      'DOCEO RCV fetch (page 1) timed out'
    );
    let allRecords = firstPage.data;

    // Second page if the first was full — up to DOCEO_RCV_FETCH_LIMIT total.
    if (firstPage.data.length >= DOCEO_PAGE_LIMIT) {
      try {
        const secondPage = await withTimeoutAndAbort(
          (signal) => doceoClient.getLatestVotes({
            includeIndividualVotes: true,
            limit: DOCEO_PAGE_LIMIT,
            offset: DOCEO_PAGE_LIMIT,
            weekStart: period.to,
            abortSignal: signal,
          }),
          DOCEO_TIMEOUT_MS,
          'DOCEO RCV fetch (page 2) timed out'
        );
        allRecords = [...allRecords, ...secondPage.data];
      } catch {
        // Second page failure is non-fatal; continue with first page only.
      }
    }

    const records = allRecords
      .filter(v => v.dataSource === 'RCV')
      .slice(0, DOCEO_RCV_FETCH_LIMIT);
    return { records, doceoAvailable: true };
  } catch (error: unknown) {
    auditLogger.logError('detect_voting_anomalies.doceo_fetch', { from: period.from, to: period.to }, toErrorMessage(error));
    return { records: [], doceoAvailable: false };
  }
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
  rcvVotesInspected: number
): string[] {
  const warnings: string[] = [];
  if (!doceoAvailable) {
    warnings.push('DOCEO RCV source unavailable — anomaly detection deferred (LOW confidence).');
  } else if (recordCount === 0) {
    warnings.push('No DOCEO RCV records returned for the requested period.');
  } else if (rcvVotesInspected < 10) {
    warnings.push('Fewer than 10 RCV votes inspected — confidence reduced to LOW.');
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
 *   window.
 */
function resolveDataFreshness(
  dataAvailable: boolean,
  records: LatestVoteRecord[]
): string {
  if (!dataAvailable) return 'No DOCEO RCV data available for the requested period';
  const now = new Date();
  if (isNearRealtime(records, now)) return 'NEAR_REALTIME';
  const latest = mostRecentSittingDate(records);
  if (latest === null) return `DOCEO RCV data — outside ${String(NEAR_REALTIME_WINDOW_HOURS)}h NEAR_REALTIME window`;
  const ageMs = now.getTime() - latest.getTime();
  const ageHours = Math.max(0, Math.round(ageMs / 3_600_000));
  return `DOCEO RCV data — latest sitting ${String(ageHours)}h old (outside ${String(NEAR_REALTIME_WINDOW_HOURS)}h NEAR_REALTIME window)`;
}

/** Resolve the confidence level from the fetch outcome and coverage. */
function resolveConfidenceLevel(
  dataAvailable: boolean,
  rcvVotesInspected: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (!dataAvailable) return 'LOW';
  return coverageConfidence(rcvVotesInspected);
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

    const { records, doceoAvailable } = await fetchDoceoRcvRecords(period);

    const result = params.mepId !== undefined
      ? await detectSingleMepAnomalies(params.mepId, thresholds, period, records)
      : await detectGroupAnomalies(params.groupId, thresholds, period, records);

    const summary = buildAnomalySummary(result.anomalies);
    const dataAvailable = doceoAvailable && records.length > 0;

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
      confidenceLevel: resolveConfidenceLevel(dataAvailable, result.rcvVotesInspected),
      dataSource: 'DOCEO',
      dataFreshness: resolveDataFreshness(dataAvailable, records),
      sourceAttribution: 'European Parliament DOCEO XML — europarl.europa.eu/doceo',
      methodology: buildMethodologyDescription(thresholds, params.sensitivityThreshold),
      dataQualityWarnings: collectDataQualityWarnings(doceoAvailable, records.length, result.rcvVotesInspected),
      rcvVotesInspected: result.rcvVotesInspected,
      rcvVotesInspectedMax: result.rcvVotesInspectedMax,
      mepsAnalyzed: result.mepsAnalyzed,
    };
    if (!dataAvailable) {
      analysis.dataAvailable = false;
    }

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
