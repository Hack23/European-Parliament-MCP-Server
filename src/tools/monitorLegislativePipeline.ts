/**
 * MCP Tool: monitor_legislative_pipeline
 *
 * Real-time legislative pipeline status with bottleneck detection and
 * timeline forecasting backed by the authoritative procedure-event
 * lifecycle (`/procedures/{id}/events`).
 *
 * **Intelligence Perspective:** Pipeline monitoring tool providing situational
 * awareness of legislative progress — enables early warning for stalled
 * procedures, bottleneck identification, and timeline forecasting based on
 * historical median dwell statistics rather than heuristics.
 *
 * **Methodology:**
 * 1. Load (or rebuild) the corpus-wide lifecycle model (`getLifecycleStatistics`)
 *    covering the latest 500 procedures, cached 30 minutes. Median +
 *    95th-percentile dwell are computed per `(procedureType, stage)`. The
 *    rebuild is wrapped in a wall-clock budget (`LIFECYCLE_BUILD_BUDGET_MS`)
 *    that cooperatively cancels the underlying `/events` fan-out when the
 *    budget elapses, so a cold cache cannot starve the request's own
 *    rate-limit budget. When the budget fires, the model is empty and
 *    per-procedure forecasts degrade to `INSUFFICIENT_DATA`.
 * 2. For each procedure in scope, fetch its event timeline with bounded
 *    concurrency (≤8 parallel) and `Promise.allSettled`.
 * 3. `daysInCurrentStage` = days between the latest event and `now`.
 * 4. `bottleneckRisk` = percentile bucket of the current dwell vs. the
 *    historical distribution for the same `(procedureType, stage)`.
 * 5. `estimatedCompletionDays` = historical median remaining days from the
 *    current stage (falls back to a heuristic when the corpus lacks data,
 *    in which case `forecastBasis` is `INSUFFICIENT_DATA`).
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { MonitorLegislativePipelineSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import type { Procedure, EPEvent } from '../types/europeanParliament.js';
import type { ToolResult } from './shared/types.js';
import { withTimeout, TimeoutError } from '../utils/timeout.js';
import { buildTimeoutResponse } from './shared/errorHandler.js';
import { ToolError } from './shared/errors.js';
import { APIError } from '../clients/ep/baseClient.js';
import {
  getLifecycleStatistics,
  emptyLifecycleStatisticsModel,
  fetchEventsBounded,
  sortEventsChronologically,
  normalizeStageKey,
  lookupStageStatistics,
  type LifecycleStatisticsModel,
  type StageDwellStatistics,
} from '../utils/lifecycleStatistics.js';

/**
 * Maximum wall-clock time (ms) allowed for the full
 * `monitor_legislative_pipeline` operation. Chosen to align with sibling
 * intelligence tools and stay below the integration-test 120 s ceiling.
 */
const OPERATION_TIMEOUT_MS = 30_000;

/**
 * Wall-clock budget (ms) for the lifecycle-statistics corpus build on the
 * request path. The corpus rebuild calls `/procedures` + up to 500
 * `/procedures/{id}/events` and competes with the request's own events
 * fetches for the EP API client's 100 req/min rate limit. With this budget
 * the rebuild's events loop is cooperatively cancelled (via
 * `getLifecycleStatistics({ deadline })`) once the budget elapses, so the
 * remaining {@link OPERATION_TIMEOUT_MS} envelope is reserved for the
 * request's own `/events` fan-out. On a cold integration run the rebuild
 * will typically time out and the response falls back to `INSUFFICIENT_DATA`;
 * on a warm cache the cached model is returned instantly.
 */
const LIFECYCLE_BUILD_BUDGET_MS = 8_000;

/** Forecast basis discriminator emitted in the response envelope. */
export type ForecastBasis = 'HISTORICAL_MEDIAN' | 'INSUFFICIENT_DATA' | 'NOT_APPLICABLE';

/** A single lifecycle event echoed for traceability. */
export interface PipelineLifecycleEvent {
  date: string;
  stage: string;
  rawType: string;
  title: string;
}

/** Computed attributes for a single pipeline item */
interface PipelineItemComputedAttrs {
  progressPercentage: number;
  velocityScore: number;
  complexityIndicator: string;
  estimatedCompletionDays: number;
  bottleneckRisk: string;
}

/** A single procedure in the pipeline */
interface PipelineItem {
  procedureId: string;
  title: string;
  type: string;
  currentStage: string;
  committee: string;
  daysInCurrentStage: number;
  isStalled: boolean;
  nextExpectedAction: string;
  computedAttributes: PipelineItemComputedAttrs;
  lifecycleEvents: PipelineLifecycleEvent[];
}

/** Bottleneck analysis */
interface BottleneckInfo {
  stage: string;
  procedureCount: number;
  avgDaysStuck: number;
  severity: string;
  /** Historical 95th-percentile dwell (days) for the stage — bottleneck threshold. */
  thresholdDays: number;
}

/** Full pipeline analysis result */
interface LegislativePipelineAnalysis {
  period: { from: string; to: string };
  filter: { committee?: string; status: string };
  pipeline: PipelineItem[];
  summary: {
    totalProcedures: number;
    activeCount: number;
    stalledCount: number;
    completedCount: number;
    avgDaysInPipeline: number;
  };
  bottlenecks: BottleneckInfo[];
  computedAttributes: {
    pipelineHealthScore: number;
    throughputRate: number;
    bottleneckIndex: number;
    stalledProcedureRate: number;
    estimatedClearanceTime: number;
    legislativeMomentum: string;
  };
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
  dataQualityWarnings: string[];
  forecastBasis: ForecastBasis;
  lifecycleCorpus: {
    corpusSize: number;
    totalObservations: number;
    computationTimeMs: number;
  };
}

/**
 * Default recency window (years) applied to the ACTIVE status filter when no
 * explicit dateFrom is provided. Procedures whose best available date predates
 * this window cannot be confirmed as currently active and are excluded.
 */
const ACTIVE_RECENCY_YEARS = 10;

/**
 * Minimum sample size for a `(type, stage)` cell to be treated as a reliable
 * forecasting baseline. Below this the cell is ignored and we fall back to
 * the heuristic forecast.
 */
const MIN_SAMPLE_SIZE_FOR_FORECAST = 3;

/**
 * Calculate whole-day delta between two date strings (or between a date and
 * "now" when `endStr` is omitted). Uses UTC day boundaries with `Math.floor`
 * to match {@link import('../utils/lifecycleStatistics.js').daysBetween}, so
 * the current-dwell value compared against `p95DwellDays` / `medianDwellDays`
 * is computed on the same scale as the corpus statistics.
 */
function daysBetween(dateStr: string, endStr?: string): number {
  const start = new Date(dateStr);
  const end = endStr !== undefined && endStr !== '' ? new Date(endStr) : new Date();
  if (isNaN(start.getTime())) return 0;
  if (isNaN(end.getTime())) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const startUtcDays = Math.floor(start.getTime() / msPerDay);
  const endUtcDays = Math.floor(end.getTime() / msPerDay);
  return Math.max(0, endUtcDays - startUtcDays);
}

/** Classify complexity from days in stage */
function classifyComplexity(days: number): string {
  if (days > 60) return 'HIGH';
  if (days > 30) return 'MEDIUM';
  return 'LOW';
}

/**
 * Classify bottleneck risk by comparing the current dwell to the historical
 * distribution for `(procedureType, stage)`. Falls back to the legacy
 * heuristic when no statistics are available so the tool degrades gracefully.
 */
function classifyBottleneckRisk(
  days: number,
  stats: StageDwellStatistics | undefined,
  isStalledHeuristic: boolean
): string {
  if (stats !== undefined && stats.sampleSize > 0) {
    if (days >= stats.p95DwellDays) return 'HIGH';
    if (days >= stats.medianDwellDays) return 'MEDIUM';
    return 'LOW';
  }
  if (isStalledHeuristic) return 'HIGH';
  if (days > 45) return 'MEDIUM';
  return 'LOW';
}

/** Classify bottleneck severity */
function classifyBottleneckSeverity(count: number): string {
  if (count > 3) return 'CRITICAL';
  if (count > 1) return 'HIGH';
  return 'MODERATE';
}

/** Classify legislative momentum */
function classifyMomentum(healthScore: number): string {
  if (healthScore > 80) return 'STRONG';
  if (healthScore > 60) return 'MODERATE';
  if (healthScore > 40) return 'SLOW';
  return 'STALLED';
}

/**
 * Check if a procedure status indicates completion.
 */
function isStatusCompleted(status: string): boolean {
  const lower = status.toLowerCase();
  return lower.includes('adopted') || lower.includes('completed') ||
    lower.includes('rejected') || lower.includes('withdrawn') || lower.includes('closed');
}

/**
 * Compute the dwell time at the current stage from the latest event date.
 * Falls back to the procedure's `dateLastActivity` (then `dateInitiated`)
 * when no events are available so behavior remains defined when the
 * `/events` endpoint is unreachable for a given procedure.
 */
function computeDwellFromEvents(
  proc: Procedure,
  sortedEvents: readonly EPEvent[]
): { daysInStage: number; latestEventDate: string; latestStage: string } {
  if (sortedEvents.length > 0) {
    const latest = sortedEvents[sortedEvents.length - 1];
    if (latest !== undefined) {
      return {
        daysInStage: daysBetween(latest.date),
        latestEventDate: latest.date,
        latestStage: normalizeStageKey(latest.type),
      };
    }
  }
  const fallback = proc.dateLastActivity !== '' ? proc.dateLastActivity : proc.dateInitiated;
  return {
    daysInStage: daysBetween(fallback),
    latestEventDate: fallback,
    latestStage: '',
  };
}

/**
 * Forecast the remaining days until completion, preferring the historical
 * median for the matching `(procedureType, stage)` cell.
 */
function forecastRemainingDays(
  isCompleted: boolean,
  daysInStage: number,
  stats: StageDwellStatistics | undefined
): { estimatedDays: number; basis: ForecastBasis } {
  if (isCompleted) return { estimatedDays: 0, basis: 'NOT_APPLICABLE' };
  if (stats !== undefined && stats.sampleSize >= MIN_SAMPLE_SIZE_FOR_FORECAST) {
    const remaining = Math.max(0, stats.medianRemainingDays - daysInStage);
    return { estimatedDays: remaining, basis: 'HISTORICAL_MEDIAN' };
  }
  return { estimatedDays: Math.max(30, daysInStage * 2), basis: 'INSUFFICIENT_DATA' };
}

/**
 * Compute progress metrics for a procedure using the real event timeline.
 */
function computePipelineMetrics(
  proc: Procedure,
  sortedEvents: readonly EPEvent[],
  stats: StageDwellStatistics | undefined
): {
  daysInStage: number; isCompleted: boolean; isStalled: boolean;
  totalDays: number; progressEstimate: number; velocityScore: number;
  estimatedDays: number; basis: ForecastBasis; latestStage: string; latestEventDate: string;
} {
  const dwell = computeDwellFromEvents(proc, sortedEvents);
  const isCompleted = isStatusCompleted(proc.status);
  const isStalledByStats = stats !== undefined && stats.sampleSize > 0
    ? dwell.daysInStage >= stats.p95DwellDays
    : false;
  const isStalledByHeuristic = !isCompleted && dwell.daysInStage > 60;
  const isStalled = !isCompleted && (isStalledByStats || isStalledByHeuristic);
  const initiated = proc.dateInitiated !== '' ? proc.dateInitiated : '';
  const lastAct = proc.dateLastActivity !== '' ? proc.dateLastActivity : undefined;
  const totalDays = daysBetween(initiated, lastAct);
  const progressEstimate = isCompleted ? 100 : Math.min(90, Math.max(5, Math.round(totalDays / 10)));
  const velocityScore = isStalled ? 20 : Math.min(100, 100 - Math.min(80, dwell.daysInStage));
  const { estimatedDays, basis } = forecastRemainingDays(isCompleted, dwell.daysInStage, stats);
  return {
    daysInStage: dwell.daysInStage,
    isCompleted,
    isStalled,
    totalDays,
    progressEstimate,
    velocityScore,
    estimatedDays,
    basis,
    latestStage: dwell.latestStage,
    latestEventDate: dwell.latestEventDate,
  };
}

/**
 * Build the lifecycleEvents array echoed back to callers for traceability.
 * The events are returned in chronological order, normalised but preserving
 * the original raw type for downstream consumers.
 */
function toLifecycleEvents(sortedEvents: readonly EPEvent[]): PipelineLifecycleEvent[] {
  return sortedEvents.map((e) => ({
    date: e.date,
    stage: normalizeStageKey(e.type),
    rawType: e.type,
    title: e.title,
  }));
}

/**
 * Resolve the procedure's display stage, preferring the latest event stage,
 * then the procedure's metadata stage/status fields. Falls back to `'Unknown'`
 * when no stage signal is available.
 */
function resolveCurrentStage(latestStage: string, proc: Procedure): string {
  if (latestStage !== '') return latestStage;
  if (proc.stage !== '') return proc.stage;
  if (proc.status !== '') return proc.status;
  return 'Unknown';
}

/**
 * Transform a real EP API Procedure into a PipelineItem, using the procedure's
 * lifecycle events when available.
 */
function procedureToPipelineItem(
  proc: Procedure,
  sortedEvents: readonly EPEvent[],
  model: LifecycleStatisticsModel
): { item: PipelineItem; basis: ForecastBasis } {
  const procedureType = proc.type !== '' ? proc.type : 'UNKNOWN';
  const stageFromEvents = sortedEvents.length > 0
    ? normalizeStageKey(sortedEvents[sortedEvents.length - 1]?.type ?? '')
    : '';
  const stats = lookupStageStatistics(model, procedureType, stageFromEvents);
  const m = computePipelineMetrics(proc, sortedEvents, stats);

  const currentStage = resolveCurrentStage(m.latestStage, proc);
  const committee = proc.responsibleCommittee !== '' ? proc.responsibleCommittee : 'Unknown';
  const stageLabel = currentStage !== 'Unknown' ? currentStage : 'processing';
  const nextAction = m.isCompleted ? 'COMPLETED' : `Continue ${stageLabel}`;

  return {
    item: {
      procedureId: proc.id,
      title: proc.title,
      type: proc.type,
      currentStage,
      committee,
      daysInCurrentStage: m.daysInStage,
      isStalled: m.isStalled,
      nextExpectedAction: nextAction,
      computedAttributes: {
        progressPercentage: m.progressEstimate,
        velocityScore: m.velocityScore,
        complexityIndicator: classifyComplexity(m.daysInStage),
        estimatedCompletionDays: m.estimatedDays,
        bottleneckRisk: classifyBottleneckRisk(m.daysInStage, stats, m.isStalled),
      },
      lifecycleEvents: toLifecycleEvents(sortedEvents),
    },
    basis: m.basis,
  };
}

/**
 * Check if a procedure's dates pass the recency cut-off for the ACTIVE filter.
 * Returns false if the procedure has no temporal data or is older than the cut-off.
 */
function isWithinRecencyCutoff(
  lastActivity: string,
  initiated: string | undefined,
  cutoffDate: string
): boolean {
  if (lastActivity === '' && initiated === undefined) return false;
  const referenceDate = lastActivity !== '' ? lastActivity : initiated;
  return referenceDate !== undefined && referenceDate >= cutoffDate;
}

/** Check if a procedure matches an explicit date range (dateFrom / dateTo) */
function matchesDateRange(
  lastActivity: string,
  initiated: string | undefined,
  dateFrom: string | undefined,
  dateTo: string | undefined
): boolean {
  if (dateFrom !== undefined && lastActivity !== '' && lastActivity < dateFrom) return false;
  if (dateTo !== undefined && initiated !== undefined && initiated > dateTo) return false;
  return true;
}

/** Check if item matches status filter */
function matchesStatusFilter(item: PipelineItem, status: string): boolean {
  if (status === 'ALL') return true;
  if (status === 'ACTIVE') {
    return !item.isStalled
      && item.computedAttributes.progressPercentage < 100
      && item.currentStage !== 'Unknown';
  }
  if (status === 'STALLED') return item.isStalled;
  if (status === 'COMPLETED') return item.computedAttributes.progressPercentage >= 100;
  return true;
}

/** Check if item matches committee filter */
function matchesCommitteeFilter(item: PipelineItem, committee: string | undefined): boolean {
  if (committee === undefined) return true;
  return item.committee === committee;
}

/**
 * Compare a stage string for sort stability (named to avoid nested ternaries).
 */
function compareStage(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Decide whether a pipeline item should be counted as a bottleneck.
 *
 * Returns `true` when the procedure's dwell at its current stage is at or
 * above the historical 95th percentile, or — when no statistics exist for the
 * `(type, stage)` cell — when the legacy stalled heuristic applies.
 */
function isBottleneckItem(
  item: PipelineItem,
  stats: StageDwellStatistics | undefined,
): boolean {
  if (stats !== undefined && stats.sampleSize > 0) {
    return item.daysInCurrentStage >= stats.p95DwellDays;
  }
  return stats === undefined && item.isStalled;
}

interface BottleneckBucket {
  count: number;
  totalDays: number;
  thresholdDays: number;
}

/**
 * Detect bottlenecks from pipeline items whose dwell at the current stage is
 * at or above the historical 95th percentile. Procedures with no matching
 * statistics fall back to the legacy `isStalled` heuristic so the tool keeps
 * producing a useful list even when the corpus is empty.
 *
 * **Cross-type aggregation:** bottlenecks are keyed by **stage label only**
 * (e.g. `"REFERRAL"`), not `(type, stage)`. This is intentional — callers
 * looking at "which stage is stuck right now" want a single view across
 * procedure types. The per-procedure `bottleneckRisk` field (and the
 * underlying p95 cell) remains type-aware, so the precise threshold for an
 * individual procedure is unaffected by cross-type aggregation here.
 * `thresholdDays` reports the **maximum** p95 seen across the contributing
 * `(type, stage)` cells — interpret it as a conservative high-water mark
 * for the worst type in that stage bucket.
 */
function detectBottlenecks(pipeline: PipelineItem[], model: LifecycleStatisticsModel): BottleneckInfo[] {
  const stageBuckets: Record<string, BottleneckBucket> = {};
  for (const item of pipeline) {
    const stats = lookupStageStatistics(model, item.type !== '' ? item.type : 'UNKNOWN', item.currentStage);
    if (!isBottleneckItem(item, stats)) continue;
    const entry = stageBuckets[item.currentStage] ?? {
      count: 0,
      totalDays: 0,
      thresholdDays: stats?.p95DwellDays ?? 0,
    };
    entry.count++;
    entry.totalDays += item.daysInCurrentStage;
    if (stats !== undefined && stats.p95DwellDays > entry.thresholdDays) {
      entry.thresholdDays = stats.p95DwellDays;
    }
    stageBuckets[item.currentStage] = entry;
  }
  return Object.entries(stageBuckets)
    .map(([stage, data]) => ({
      stage,
      procedureCount: data.count,
      avgDaysStuck: Math.round(data.totalDays / data.count),
      severity: classifyBottleneckSeverity(data.count),
      thresholdDays: data.thresholdDays,
    }))
    .sort((a, b) => {
      if (b.procedureCount !== a.procedureCount) return b.procedureCount - a.procedureCount;
      return compareStage(a.stage, b.stage);
    });
}

/** Compute pipeline summary statistics */
function computePipelineSummary(pipeline: PipelineItem[]): {
  activeCount: number; stalledCount: number; completedCount: number; avgDays: number;
} {
  const activeCount = pipeline.filter(p => !p.isStalled && p.computedAttributes.progressPercentage < 100).length;
  const stalledCount = pipeline.filter(p => p.isStalled).length;
  const completedCount = pipeline.filter(p => p.computedAttributes.progressPercentage >= 100).length;
  const totalDays = pipeline.reduce((sum, p) => sum + p.daysInCurrentStage, 0);
  const avgDays = pipeline.length > 0 ? Math.round(totalDays / pipeline.length) : 0;
  return { activeCount, stalledCount, completedCount, avgDays };
}

/** Compute pipeline health metrics */
function computeHealthMetrics(pipeline: PipelineItem[], summary: ReturnType<typeof computePipelineSummary>): {
  healthScore: number; throughputRate: number; stalledRate: number;
} {
  const stalledRate = pipeline.length > 0 ? summary.stalledCount / pipeline.length : 0;
  const healthScore = Math.round((1 - stalledRate) * 100 * 100) / 100;
  const throughputRate = pipeline.length > 0
    ? Math.round((summary.completedCount / pipeline.length) * 100 * 100) / 100
    : 0;
  return { healthScore, throughputRate, stalledRate };
}

/**
 * Aggregate the per-procedure forecast bases into a single envelope-level
 * basis. If any procedure used a historical median forecast we report
 * `HISTORICAL_MEDIAN`; otherwise we report `INSUFFICIENT_DATA`.
 */
function aggregateForecastBasis(perItemBases: readonly ForecastBasis[]): ForecastBasis {
  // Exclude NOT_APPLICABLE (completed procedures) from the envelope-level determination
  const actionable = perItemBases.filter((b) => b !== 'NOT_APPLICABLE');
  if (actionable.length === 0) return 'NOT_APPLICABLE';
  return actionable.some((b) => b === 'HISTORICAL_MEDIAN')
    ? 'HISTORICAL_MEDIAN'
    : 'INSUFFICIENT_DATA';
}

/**
 * Build the human-readable list of data-quality warnings appended to the
 * response envelope.
 */
function buildWarnings(
  pipelineSize: number,
  envelopeBasis: ForecastBasis,
  unknownEnrichmentCount: number,
  eventFetchFailures: number,
): string[] {
  const warnings: string[] = [];
  if (pipelineSize < 10) {
    warnings.push('Small procedure sample (< 10) — pipeline health metrics may not be statistically representative');
  }
  if (unknownEnrichmentCount > 0) {
    warnings.push(`${String(unknownEnrichmentCount)} procedure(s) excluded from ACTIVE filter due to missing enrichment data (stage/committee unknown) — these may be historical or incomplete records`);
  }
  if (eventFetchFailures > 0) {
    warnings.push(`${String(eventFetchFailures)} procedure(s) had no lifecycle events available — fell back to procedure-metadata dates for dwell computation`);
  }
  if (envelopeBasis === 'INSUFFICIENT_DATA') {
    warnings.push('Forecast basis: insufficient historical lifecycle data — `estimatedCompletionDays` uses a heuristic fallback');
  }
  return warnings;
}

interface BuildAnalysisInput {
  reportFrom: string;
  reportTo: string;
  params: ReturnType<typeof MonitorLegislativePipelineSchema.parse>;
  pipeline: PipelineItem[];
  model: LifecycleStatisticsModel;
  envelopeBasis: ForecastBasis;
  unknownEnrichmentCount: number;
  eventFetchFailures: number;
}

/**
 * Build the analysis envelope.
 */
function buildAnalysis(input: BuildAnalysisInput): LegislativePipelineAnalysis {
  const { reportFrom, reportTo, params, pipeline, model, envelopeBasis,
    unknownEnrichmentCount, eventFetchFailures } = input;
  const summary = computePipelineSummary(pipeline);
  const bottlenecks = detectBottlenecks(pipeline, model);
  const health = computeHealthMetrics(pipeline, summary);
  const warnings = buildWarnings(pipeline.length, envelopeBasis, unknownEnrichmentCount, eventFetchFailures);
  return {
    period: { from: reportFrom, to: reportTo },
    filter: { ...(params.committee !== undefined ? { committee: params.committee } : {}), status: params.status },
    pipeline,
    summary: {
      totalProcedures: pipeline.length,
      activeCount: summary.activeCount,
      stalledCount: summary.stalledCount,
      completedCount: summary.completedCount,
      avgDaysInPipeline: summary.avgDays,
    },
    bottlenecks,
    computedAttributes: {
      pipelineHealthScore: health.healthScore,
      throughputRate: health.throughputRate,
      bottleneckIndex: Math.round(health.stalledRate * summary.avgDays * 100) / 100,
      stalledProcedureRate: Math.round(health.stalledRate * 100 * 100) / 100,
      estimatedClearanceTime: summary.avgDays * Math.max(1, summary.activeCount),
      legislativeMomentum: classifyMomentum(health.healthScore),
    },
    confidenceLevel: pipeline.length >= 10 && envelopeBasis === 'HISTORICAL_MEDIAN'
      ? 'MEDIUM'
      : 'LOW',
    dataFreshness: 'Real-time EP API data — procedures from /procedures and lifecycle from /procedures/{id}/events',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Lifecycle-driven pipeline analysis using EP API /procedures and /procedures/{id}/events. '
      + 'For each procedure in scope the authoritative event sequence is fetched in parallel (bounded ≤8). '
      + '`daysInCurrentStage` is the delta between the most recent event and now. '
      + '`bottleneckRisk` is a percentile bucket of the current dwell against the historical distribution '
      + 'for the same (procedureType, stage) observed across the latest 500 procedures (30 min cache). '
      + '`estimatedCompletionDays` uses the historical median remaining-time at the current stage; '
      + 'when no comparable historical sample exists the response is flagged `INSUFFICIENT_DATA`. '
      + 'Bottlenecks are aggregated from procedures whose dwell is ≥ the 95th percentile.',
    dataQualityWarnings: warnings,
    forecastBasis: envelopeBasis,
    lifecycleCorpus: {
      corpusSize: model.corpusSize,
      totalObservations: model.totalObservations,
      computationTimeMs: model.computationTimeMs,
    },
  };
}

interface OperationContext {
  params: ReturnType<typeof MonitorLegislativePipelineSchema.parse>;
  reportFrom: string;
  reportTo: string;
  activeCutoffDate: string | undefined;
}

/**
 * Resolve the reporting period and ACTIVE recency cut-off from input params.
 */
function resolveOperationContext(
  params: ReturnType<typeof MonitorLegislativePipelineSchema.parse>
): OperationContext {
  const toIsoDate = (d: Date): string => d.toISOString().slice(0, 10);
  const todayIso = toIsoDate(new Date());
  const defaultFromIso = ((): string => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 30);
    return toIsoDate(d);
  })();
  const reportFrom = params.dateFrom ?? defaultFromIso;
  const reportTo = params.dateTo ?? todayIso;
  const activeCutoffDate = ((): string | undefined => {
    if (params.status !== 'ACTIVE' || params.dateFrom !== undefined) return undefined;
    const referenceYear = parseInt(
      (params.dateTo ?? todayIso).slice(0, 4),
      10
    );
    return `${String(referenceYear - ACTIVE_RECENCY_YEARS)}-01-01`;
  })();
  return { params, reportFrom, reportTo, activeCutoffDate };
}

/**
 * Apply the recency + explicit date-range filters to the raw procedure list.
 */
function applyDateFilters(
  procedures: readonly Procedure[],
  ctx: OperationContext,
): Procedure[] {
  return procedures.filter(proc => {
    const lastActivity = proc.dateLastActivity !== '' ? proc.dateLastActivity : proc.dateInitiated;
    const initiated = proc.dateInitiated !== '' ? proc.dateInitiated : undefined;
    if (ctx.activeCutoffDate !== undefined && !isWithinRecencyCutoff(lastActivity, initiated, ctx.activeCutoffDate)) {
      return false;
    }
    return matchesDateRange(lastActivity, initiated, ctx.params.dateFrom, ctx.params.dateTo);
  });
}

/**
 * Build per-procedure pipeline items and count event-fetch failures.
 *
 * Returns the forecast basis indexed by `procedureId` so downstream
 * filtering can correlate items to their basis without relying on
 * positional indices (which become misaligned after filtering).
 */
function buildPipelineItems(
  filteredProcs: readonly Procedure[],
  eventsByProcedureId: ReadonlyMap<string, EPEvent[]>,
  model: LifecycleStatisticsModel,
): { items: PipelineItem[]; basisByProcedureId: Map<string, ForecastBasis>; eventFetchFailures: number } {
  const items: PipelineItem[] = [];
  const basisByProcedureId = new Map<string, ForecastBasis>();
  let eventFetchFailures = 0;
  for (const proc of filteredProcs) {
    const rawEvents = eventsByProcedureId.get(proc.id);
    if (rawEvents === undefined || rawEvents.length === 0) {
      eventFetchFailures++;
    }
    const sortedEvents = sortEventsChronologically(rawEvents ?? []);
    const { item, basis } = procedureToPipelineItem(proc, sortedEvents, model);
    items.push(item);
    basisByProcedureId.set(proc.id, basis);
  }
  return { items, basisByProcedureId, eventFetchFailures };
}

/**
 * Load the lifecycle statistics model with a strict wall-clock budget.
 *
 * On a cold cache the corpus rebuild calls `/procedures` plus up to
 * {@link CORPUS_SIZE} `/procedures/{id}/events`. Under the EP API client's
 * default 100 req/min rate limit this cannot complete inside
 * {@link OPERATION_TIMEOUT_MS} and would also starve the request's own
 * `/events` fan-out, which previously caused the integration test to
 * receive a {@link buildTimeoutResponse} envelope.
 *
 * Strategy:
 *  - Pass a wall-clock `deadline` of `now + LIFECYCLE_BUILD_BUDGET_MS` to
 *    {@link getLifecycleStatistics}. The internal `fetchEventsBounded` loop
 *    stops queueing new batches once the deadline elapses, returning
 *    whatever model could be built from the partial corpus (possibly empty).
 *    This cooperatively cancels the rebuild so it no longer competes with
 *    the request's own rate-limited calls.
 *  - On expected failures ({@link TimeoutError}, {@link APIError}), fall
 *    back to an empty model. Per-procedure forecasts degrade to
 *    `INSUFFICIENT_DATA` but the response shape is unchanged.
 *  - Unexpected/programming errors propagate so they surface in monitoring.
 *
 * In unit tests with mocked clients the deadline never fires (mocks resolve
 * synchronously) and the full corpus is built from the fixture data.
 */
async function loadLifecycleModelWithBudget(): Promise<LifecycleStatisticsModel> {
  const deadline = Date.now() + LIFECYCLE_BUILD_BUDGET_MS;
  try {
    return await withTimeout(
      getLifecycleStatistics({ deadline }),
      LIFECYCLE_BUILD_BUDGET_MS + 500,
      'lifecycle statistics build exceeded budget'
    );
  } catch (error: unknown) {
    if (error instanceof TimeoutError || error instanceof APIError) {
      const statusCode = error instanceof APIError ? error.statusCode : undefined;
      console.error(
        '[monitor_legislative_pipeline] Lifecycle model fallback engaged:',
        error.name,
        statusCode !== undefined ? `status=${String(statusCode)}` : ''
      );
      return emptyLifecycleStatisticsModel();
    }
    throw error;
  }
}

/**
 * Run the core pipeline-monitoring operation: load procedures + lifecycle
 * statistics, fetch per-procedure events, score each procedure, filter, and
 * assemble the response envelope.
 */
async function runPipelineOperation(
  params: ReturnType<typeof MonitorLegislativePipelineSchema.parse>
): Promise<LegislativePipelineAnalysis> {
  const ctx = resolveOperationContext(params);
  // Load the lifecycle model FIRST (with a wall-clock budget). This serialises
  // the corpus rebuild ahead of the request's own /events fan-out so the two
  // do not compete for the EP API rate limit. When the budget fires, the
  // rebuild cooperatively cancels and yields the rate-limit budget back to
  // the visible-procedure fetches that follow.
  const model = await loadLifecycleModelWithBudget();
  const procedures = await epClient.getProcedures({ limit: params.limit });

  const filteredProcs = applyDateFilters(procedures.data, ctx);
  const eventsByProcedureId = await fetchEventsBounded(filteredProcs);
  const { items: allMappedItems, basisByProcedureId, eventFetchFailures } =
    buildPipelineItems(filteredProcs, eventsByProcedureId, model);

  const unknownEnrichmentCount = params.status === 'ACTIVE'
    ? allMappedItems.filter(item => item.currentStage === 'Unknown').length
    : 0;

  const allItems = allMappedItems
    .filter((item) => matchesStatusFilter(item, params.status))
    .filter((item) => matchesCommitteeFilter(item, params.committee));

  const pipeline = allItems.slice(0, params.limit);
  const visibleBases: ForecastBasis[] = pipeline
    .map((item) => basisByProcedureId.get(item.procedureId))
    .filter((b): b is ForecastBasis => b !== undefined);
  const envelopeBasis = aggregateForecastBasis(visibleBases);

  return buildAnalysis({
    reportFrom: ctx.reportFrom,
    reportTo: ctx.reportTo,
    params,
    pipeline,
    model,
    envelopeBasis,
    unknownEnrichmentCount,
    eventFetchFailures,
  });
}

/**
 * Handles the monitor_legislative_pipeline MCP tool request.
 *
 * Monitors the European Parliament's active legislative pipeline by fetching
 * real procedures and their authoritative event timelines from the EP API
 * (`/procedures` + `/procedures/{id}/events`) and computing lifecycle-driven
 * health metrics: percentile-based bottleneck detection, historical-median
 * completion forecasts, and stage-aware dwell statistics.
 *
 * @param args - Raw tool arguments, validated against {@link MonitorLegislativePipelineSchema}
 * @returns MCP tool result containing pipeline items with stage, lifecycle events,
 *   forecast basis, summary counts, detected bottlenecks (≥95th percentile dwell),
 *   pipeline health score, throughput rate, bottleneck index, and legislative momentum.
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable for the primary procedure list
 *
 * @example
 * ```typescript
 * const result = await handleMonitorLegislativePipeline({
 *   status: 'ACTIVE',
 *   committee: 'ENVI',
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-12-31',
 *   limit: 20
 * });
 * // Returns pipeline health score, stalled/active/completed counts,
 * // bottleneck list, lifecycleEvents per procedure, and forecastBasis.
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - Bounded concurrency (≤8 parallel) on the event fan-out limits API load.
 * - Lifecycle corpus is cached 30 min; only event types/dates are retained.
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link monitorLegislativePipelineToolMetadata} for MCP schema registration
 * @see {@link handleTrackLegislation} for individual procedure stage and timeline tracking
 */
export async function handleMonitorLegislativePipeline(
  args: unknown
): Promise<ToolResult> {
  const params = MonitorLegislativePipelineSchema.parse(args);

  try {
    const analysis = await withTimeout(
      runPipelineOperation(params),
      OPERATION_TIMEOUT_MS,
      'monitor_legislative_pipeline operation timed out'
    );
    return { content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }] };
  } catch (error: unknown) {
    if (error instanceof TimeoutError) {
      return buildTimeoutResponse('monitor_legislative_pipeline', OPERATION_TIMEOUT_MS);
    }
    // Preserve the original error as `cause` for server-side diagnostics
    // (logs/audit) while keeping the client-visible message generic so we
    // don't leak upstream URLs, status text, or other internal details.
    throw new ToolError({
      toolName: 'monitor_legislative_pipeline',
      operation: 'runPipelineOperation',
      message: 'Failed to monitor legislative pipeline',
      cause: error,
      isRetryable: true,
    });
  }
}

/**
 * Tool metadata for MCP registration
 */
export const monitorLegislativePipelineToolMetadata = {
  name: 'monitor_legislative_pipeline',
  description: 'Monitor legislative pipeline status with lifecycle-driven bottleneck detection and timeline forecasting. Tracks procedures through their authoritative event sequence (REFERRAL → COM_VOTE → EP_ADOPTION → SIGNATURE / REJECTION). Returns pipeline health score, throughput rate, bottleneck index (procedures with dwell ≥ 95th percentile of historical distribution), stalled procedure rate, legislative momentum, per-procedure lifecycleEvents, and a forecastBasis discriminator (HISTORICAL_MEDIAN | INSUFFICIENT_DATA | NOT_APPLICABLE — the last when every visible procedure is already completed).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      committee: {
        type: 'string',
        description: 'Filter by committee',
        minLength: 1,
        maxLength: 100
      },
      status: {
        type: 'string',
        enum: ['ALL', 'ACTIVE', 'STALLED', 'COMPLETED'],
        description: 'Pipeline status filter',
        default: 'ACTIVE'
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
      limit: {
        type: 'number',
        description: 'Maximum results to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 20
      }
    }
  }
};
