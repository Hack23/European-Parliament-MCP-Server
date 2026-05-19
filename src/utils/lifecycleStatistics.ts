/**
 * Lifecycle Statistics — corpus-wide dwell distributions for EP procedures.
 *
 * Builds an in-memory model of how long procedures historically dwell at each
 * lifecycle stage, indexed by `(procedureType, stage)`. Two distributions are
 * derived per key:
 *
 * - `dwellAtStage` — days between an event and the next event observed for the
 *   same procedure. Used to detect bottlenecks: a current procedure whose
 *   "days in current stage" exceeds the historical 95th percentile is flagged
 *   as a real stuck procedure rather than a heuristic guess.
 * - `remainingToCompletion` — days between an event at the given stage and the
 *   final event of the same procedure (used as the completion timestamp).
 *   Used as the forecasting baseline for `estimatedCompletionDays`.
 *
 * The model is corpus-wide (latest N=500 procedures), cached for 30 minutes,
 * and computed deterministically (median + percentile use sorted inputs with
 * stable tie-breaking).
 *
 * **Why this exists:** `monitor_legislative_pipeline` previously approximated
 * `daysInCurrentStage`, `bottleneckRisk`, and `estimatedCompletionDays` from
 * procedure metadata alone. With the real `/procedures/{id}/events` timeline
 * available, we can build verifiable, distribution-based metrics instead of
 * heuristics.
 *
 * **Security:**
 * - No PII is stored — only event types, dates, and procedure types.
 * - Audit logging captures corpus size and computation time only (see
 *   `monitorLegislativePipeline.ts`).
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 *
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 */

import { epClient } from '../clients/europeanParliamentClient.js';
import type { EPEvent, Procedure } from '../types/europeanParliament.js';

/** Number of latest procedures to sample when building the dwell distribution. */
export const CORPUS_SIZE = 500;

/** Cache TTL for the corpus-wide lifecycle model (30 minutes). */
export const CACHE_TTL_MS = 30 * 60 * 1000;

/** Bounded concurrency for per-procedure event fetches. */
export const EVENT_FETCH_CONCURRENCY = 8;

/** Maximum events to fetch per procedure when building the corpus. */
const EVENTS_PER_PROCEDURE = 50;

/**
 * Statistics for a single `(procedureType, stage)` pair.
 *
 * All numbers are in days. `sampleSize` exposes how many observations the
 * statistics were derived from — callers should treat low-sample cells as
 * less reliable and may degrade `forecastBasis` to `INSUFFICIENT_DATA`.
 */
export interface StageDwellStatistics {
  /** Median number of days a procedure dwells at this stage before moving on. */
  medianDwellDays: number;
  /** 95th-percentile dwell — exceeding this is the bottleneck threshold. */
  p95DwellDays: number;
  /**
   * Median number of days remaining from this stage until the final event of
   * the same procedure. Used as the forecasting baseline.
   */
  medianRemainingDays: number;
  /** Number of observations contributing to the dwell distribution. */
  sampleSize: number;
}

/**
 * Full lifecycle model built from a corpus of procedures.
 */
export interface LifecycleStatisticsModel {
  /** Keyed by `${procedureType}::${stage}` — deterministic ordering. */
  byTypeAndStage: ReadonlyMap<string, StageDwellStatistics>;
  /** Total number of procedures inspected (after filtering for ≥2 events). */
  corpusSize: number;
  /** Total number of dwell observations across all keys. */
  totalObservations: number;
  /** Wall-clock duration of the corpus build, in milliseconds. */
  computationTimeMs: number;
  /** Timestamp the model was built (epoch ms). */
  builtAt: number;
}

interface MutableStageBuckets {
  dwellSamples: number[];
  remainingSamples: number[];
}

interface CacheEntry {
  model: LifecycleStatisticsModel;
  expiresAt: number;
}

// Cache + in-flight builds are keyed by `corpusSize` so that callers
// requesting different sample sizes do not silently observe each other's
// model. The map is bounded to one entry per distinct size used and is
// expected to stay tiny in practice (production callers use the default).
const memoCacheByCorpusSize = new Map<number, CacheEntry>();
const inFlightBuildByCorpusSize = new Map<number, Promise<LifecycleStatisticsModel>>();

/**
 * Normalize an EP event type to a stable stage key.
 *
 * The EP API sometimes returns event types as short codes (`REFERRAL`,
 * `COM_VOTE`) and sometimes as URI strings (`def/ep-activities/REFERRAL`).
 * This helper strips any URI prefix and uppercases the result so both forms
 * map to the same stage in the dwell distribution.
 *
 * @param type - Raw event type from the EP API
 * @returns Normalized stage key, or empty string when unavailable
 */
export function normalizeStageKey(type: string): string {
  if (typeof type !== 'string') return '';
  const trimmed = type.trim();
  if (trimmed === '') return '';
  const lastSegment = trimmed.includes('/') ? trimmed.slice(trimmed.lastIndexOf('/') + 1) : trimmed;
  return lastSegment.toUpperCase();
}

/**
 * Build a `(procedureType, stage)` map key.
 *
 * @param procedureType - The EP procedure type (e.g. `COD`, `NLE`)
 * @param stage - Normalized stage key
 */
export function lifecycleKey(procedureType: string, stage: string): string {
  return `${procedureType}::${stage}`;
}

/**
 * Compute the lower-median of a numeric array.
 *
 * Deterministic: input is sorted ascending with the stable JS sort.
 * For even-length arrays the lower of the two middle elements is returned —
 * this avoids floating-point ties that depend on iteration order.
 *
 * @param values - Numeric samples (will be copied, not mutated)
 * @returns Lower median, or 0 for empty inputs
 */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor((sorted.length - 1) / 2);
  return sorted[mid] ?? 0;
}

/**
 * Compute a percentile using nearest-rank with `Math.ceil`.
 *
 * Deterministic and tie-stable: identical fixture sets produce identical
 * percentiles regardless of insertion order. Inputs are always sorted before
 * the percentile rank is read so the return value is consistent for all
 * inputs in the documented range.
 *
 * @param values - Numeric samples
 * @param percentile - Percentile in the range [0, 100]. Values ≤ 0 return
 *   the minimum (sorted[0]); values ≥ 100 return the maximum.
 * @returns The percentile value, or 0 for empty inputs
 */
export function percentile(values: readonly number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  if (percentile <= 0) return sorted[0] ?? 0;
  const rank = Math.min(sorted.length, Math.max(1, Math.ceil((percentile / 100) * sorted.length)));
  return sorted[rank - 1] ?? 0;
}

/**
 * Compute integer days between two ISO date strings, clamped to ≥0.
 *
 * @param fromIso - Earlier ISO date string
 * @param toIso - Later ISO date string
 * @returns Whole-day delta, or 0 when either date is invalid
 */
export function daysBetween(fromIso: string, toIso: string): number {
  if (fromIso === '' || toIso === '') return 0;
  const start = new Date(fromIso);
  const end = new Date(toIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  // Use UTC day boundaries to avoid DST/time-of-day shifts
  const startUtcDays = Math.floor(start.getTime() / (1000 * 60 * 60 * 24));
  const endUtcDays = Math.floor(end.getTime() / (1000 * 60 * 60 * 24));
  return Math.max(0, endUtcDays - startUtcDays);
}

/**
 * Sort events chronologically by date, with stable tie-break on event id.
 *
 * @param events - Raw events from `/procedures/{id}/events`
 * @returns A new array sorted in ascending date order
 */
export function sortEventsChronologically(events: readonly EPEvent[]): EPEvent[] {
  return [...events]
    .filter((e) => e.date !== '' && !isNaN(new Date(e.date).getTime()))
    .sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });
}

/**
 * Extract dwell-at-stage and remaining-to-completion observations from a
 * single procedure's chronologically-sorted event list.
 *
 * @param procedureType - The EP procedure type (e.g. `COD`)
 * @param sortedEvents - Events sorted via {@link sortEventsChronologically}
 * @param buckets - Mutable accumulator keyed by `${type}::${stage}`
 */
function accumulateProcedure(
  procedureType: string,
  sortedEvents: readonly EPEvent[],
  buckets: Map<string, MutableStageBuckets>
): void {
  if (sortedEvents.length < 2) return;
  const lastEvent = sortedEvents[sortedEvents.length - 1];
  if (lastEvent === undefined) return;
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    if (current === undefined || next === undefined) continue;
    const stage = normalizeStageKey(current.type);
    if (stage === '') continue;
    const dwell = daysBetween(current.date, next.date);
    const remaining = daysBetween(current.date, lastEvent.date);
    const key = lifecycleKey(procedureType, stage);
    let bucket = buckets.get(key);
    if (bucket === undefined) {
      bucket = { dwellSamples: [], remainingSamples: [] };
      buckets.set(key, bucket);
    }
    bucket.dwellSamples.push(dwell);
    bucket.remainingSamples.push(remaining);
  }
}

/**
 * Fetch event sequences for a list of procedures with bounded concurrency.
 *
 * Uses `Promise.allSettled` so a single 404 or transient error does not abort
 * the whole corpus build — failures are silently skipped (their contribution
 * to the distribution is simply omitted).
 *
 * @param procedures - Procedures to enrich with their event timeline
 * @param concurrency - Maximum parallel fetches (≤8 recommended)
 * @returns Map of process-id → events array (failed fetches are absent)
 */
export async function fetchEventsBounded(
  procedures: readonly Procedure[],
  concurrency: number = EVENT_FETCH_CONCURRENCY
): Promise<Map<string, EPEvent[]>> {
  const results = new Map<string, EPEvent[]>();
  const bound = Math.max(1, Math.min(concurrency, EVENT_FETCH_CONCURRENCY));
  for (let i = 0; i < procedures.length; i += bound) {
    const slice = procedures.slice(i, i + bound);
    const settled = await Promise.allSettled(
      slice.map(async (proc) => {
        const events = await epClient.getProcedureEvents(proc.id, { limit: EVENTS_PER_PROCEDURE });
        return { id: proc.id, events: events.data };
      })
    );
    for (const r of settled) {
      if (r.status === 'fulfilled') {
        results.set(r.value.id, r.value.events);
      }
    }
  }
  return results;
}

/**
 * Build the lifecycle statistics model from a procedure corpus and their
 * event timelines.
 *
 * Deterministic: identical input procedures and events produce identical
 * statistics (the model is independent of `Map` insertion order — only the
 * `byTypeAndStage` map's `Map`/`Object.entries` iteration order may differ,
 * but the per-key values are stable).
 *
 * @param procedures - The corpus of procedures
 * @param eventsByProcedureId - Event timelines fetched via {@link fetchEventsBounded}
 * @returns Frozen lifecycle statistics model
 */
export function buildLifecycleStatistics(
  procedures: readonly Procedure[],
  eventsByProcedureId: ReadonlyMap<string, EPEvent[]>
): LifecycleStatisticsModel {
  const start = Date.now();
  const buckets = new Map<string, MutableStageBuckets>();
  let usableProcedures = 0;

  for (const proc of procedures) {
    const events = eventsByProcedureId.get(proc.id);
    if (events === undefined || events.length < 2) continue;
    const sorted = sortEventsChronologically(events);
    if (sorted.length < 2) continue;
    accumulateProcedure(proc.type !== '' ? proc.type : 'UNKNOWN', sorted, buckets);
    usableProcedures++;
  }

  const byTypeAndStage = new Map<string, StageDwellStatistics>();
  let totalObservations = 0;
  // Iterate keys in sorted order so the resulting map's insertion order is
  // deterministic, regardless of how procedures were processed.
  for (const key of [...buckets.keys()].sort()) {
    const bucket = buckets.get(key);
    if (bucket === undefined) continue;
    totalObservations += bucket.dwellSamples.length;
    byTypeAndStage.set(key, {
      medianDwellDays: median(bucket.dwellSamples),
      p95DwellDays: percentile(bucket.dwellSamples, 95),
      medianRemainingDays: median(bucket.remainingSamples),
      sampleSize: bucket.dwellSamples.length,
    });
  }

  return {
    byTypeAndStage,
    corpusSize: usableProcedures,
    totalObservations,
    computationTimeMs: Date.now() - start,
    builtAt: Date.now(),
  };
}

/**
 * Lookup statistics for a `(procedureType, stage)` pair.
 *
 * Performs an exact lookup by `lifecycleKey(procedureType, normalizedStage)`.
 * Returns `undefined` when no matching cell exists or the cell has zero
 * samples, so callers must handle the missing-data case explicitly.
 *
 * @param model - The lifecycle statistics model
 * @param procedureType - The procedure type (e.g. `COD`)
 * @param stage - Normalized stage key
 * @returns Stage statistics, or `undefined` when no usable data exists
 */
export function lookupStageStatistics(
  model: LifecycleStatisticsModel,
  procedureType: string,
  stage: string
): StageDwellStatistics | undefined {
  const normalizedStage = normalizeStageKey(stage);
  if (normalizedStage === '' || procedureType === '') return undefined;
  const exact = model.byTypeAndStage.get(lifecycleKey(procedureType, normalizedStage));
  if (exact !== undefined && exact.sampleSize > 0) return exact;
  return undefined;
}

/**
 * Build (or return cached) lifecycle statistics for the latest N procedures.
 *
 * The corpus is cached for {@link CACHE_TTL_MS}; subsequent callers within
 * the window receive the same model instance for free. Refreshing is lazy:
 * a stale cache is rebuilt on the next call rather than on a timer, so
 * idle processes pay no background cost. Cache and in-flight builds are
 * keyed by `corpusSize` so distinct sample sizes never share a model.
 *
 * @param options - Optional overrides
 * @param options.corpusSize - Number of procedures to sample (default: {@link CORPUS_SIZE})
 * @param options.forceRefresh - Ignore cached model and rebuild
 * @returns The lifecycle statistics model
 *
 * @security The corpus contains only procedure types, event types, and dates —
 *   no PII. Bounded concurrency (≤8) prevents API rate-limit exhaustion.
 * @since 0.8.0
 */
export async function getLifecycleStatistics(options: {
  corpusSize?: number;
  forceRefresh?: boolean;
} = {}): Promise<LifecycleStatisticsModel> {
  const corpus = options.corpusSize ?? CORPUS_SIZE;
  const cached = memoCacheByCorpusSize.get(corpus);
  if (options.forceRefresh !== true && cached !== undefined && cached.expiresAt > Date.now()) {
    return cached.model;
  }

  // Concurrency-safe rebuild: share an in-flight promise per corpusSize so
  // simultaneous callers requesting the same sample size don't each trigger
  // a duplicate corpus-wide fetch. Different corpusSize values get their own
  // independent build so a small ad-hoc build cannot pollute the default
  // production model.
  const inFlight = inFlightBuildByCorpusSize.get(corpus);
  if (inFlight !== undefined && options.forceRefresh !== true) {
    return inFlight;
  }

  const buildPromise = (async (): Promise<LifecycleStatisticsModel> => {
    try {
      const procResp = await epClient.getProcedures({ limit: corpus });
      const events = await fetchEventsBounded(procResp.data, EVENT_FETCH_CONCURRENCY);
      const model = buildLifecycleStatistics(procResp.data, events);
      memoCacheByCorpusSize.set(corpus, { model, expiresAt: Date.now() + CACHE_TTL_MS });
      return model;
    } finally {
      inFlightBuildByCorpusSize.delete(corpus);
    }
  })();
  inFlightBuildByCorpusSize.set(corpus, buildPromise);
  return buildPromise;
}

/**
 * Return the cached lifecycle statistics model **without** triggering a
 * rebuild. Use this on latency-sensitive request paths where waiting for a
 * cold-cache corpus build (potentially hundreds of `/events` calls) is not
 * acceptable. Returns `undefined` when no fresh entry is cached for the
 * requested corpus size.
 *
 * Callers that want the cache to warm in the background should additionally
 * invoke {@link triggerLifecycleBackgroundRebuild}.
 */
export function getCachedLifecycleStatistics(
  options: { corpusSize?: number } = {}
): LifecycleStatisticsModel | undefined {
  const corpus = options.corpusSize ?? CORPUS_SIZE;
  const cached = memoCacheByCorpusSize.get(corpus);
  if (cached !== undefined && cached.expiresAt > Date.now()) {
    return cached.model;
  }
  return undefined;
}

/**
 * Kick off a background lifecycle-statistics rebuild without waiting for it.
 *
 * Fire-and-forget: errors are swallowed (logged) so they cannot escape into
 * the caller's promise chain. If a rebuild is already in flight for the same
 * `corpusSize`, this is a no-op. The result populates the cache for
 * subsequent calls to {@link getCachedLifecycleStatistics} /
 * {@link getLifecycleStatistics}.
 */
export function triggerLifecycleBackgroundRebuild(
  options: { corpusSize?: number } = {}
): void {
  const corpus = options.corpusSize ?? CORPUS_SIZE;
  if (inFlightBuildByCorpusSize.has(corpus)) return;
  void getLifecycleStatistics({ corpusSize: corpus }).catch((err: unknown) => {
    const name = err instanceof Error ? err.name : 'UnknownError';
    console.error('[lifecycleStatistics] Background rebuild failed:', name);
  });
}

/**
 * An empty lifecycle model that callers can use as a fast fallback when the
 * corpus rebuild fails or exceeds its time budget. With this model every
 * lookup returns `undefined` so forecasts gracefully degrade to the
 * `INSUFFICIENT_DATA` heuristic basis without aborting the request.
 */
export function emptyLifecycleStatisticsModel(): LifecycleStatisticsModel {
  return {
    byTypeAndStage: new Map(),
    corpusSize: 0,
    totalObservations: 0,
    computationTimeMs: 0,
    builtAt: Date.now(),
  };
}

/**
 * Reset the in-memory cache. Intended for tests and forced refreshes.
 */
export function resetLifecycleStatisticsCache(): void {
  memoCacheByCorpusSize.clear();
  inFlightBuildByCorpusSize.clear();
}
