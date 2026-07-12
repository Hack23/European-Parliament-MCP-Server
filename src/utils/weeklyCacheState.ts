/**
 * Adaptive (incremental) weekly-cache loading primitives.
 *
 * These helpers let the weekly cache generators resume from whatever detail
 * records were already fetched in a prior run instead of starting over every
 * time. They keep side effects explicit (state mutation is limited to the
 * caller-provided `details` map and `missingIds` set, and I/O is limited to
 * the injected `fetchDetail` callback), which keeps fetch orchestration
 * unit-testable without hitting the European Parliament Open Data API.
 *
 * @module utils/weeklyCacheState
 */

/**
 * Mutable state carried across a weekly refresh: the detail records fetched so
 * far (keyed by every identifier variant) and the identifiers that returned a
 * definitive "not found" and should not be retried this cycle.
 */
export interface IncrementalDetailState {
  details: Record<string, unknown>;
  missingIds: Set<string>;
}

const DANGEROUS_CACHE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function createSafeDetailsMap(): Record<string, unknown> {
  return Object.create(null) as Record<string, unknown>;
}

function isSafeCacheKey(key: string): boolean {
  return !DANGEROUS_CACHE_KEYS.has(key);
}

/**
 * Reconstructs incremental state from a previously written `latest.json`
 * payload. Unknown or malformed input yields empty state rather than throwing,
 * so a corrupt cache simply triggers a full rebuild.
 *
 * @param parsed - Parsed prior cache payload (or any value).
 * @param detailsKey - Property holding the detail map (e.g. `"mepDetails"`).
 * @param missingKey - Property holding the missing-id list.
 * @returns Detail map and missing-id set restored from the payload.
 */
export function readIncrementalDetailState(
  parsed: unknown,
  detailsKey: string,
  missingKey = 'missingDetailIds',
): IncrementalDetailState {
  if (typeof parsed !== 'object' || parsed === null) {
    return { details: createSafeDetailsMap(), missingIds: new Set<string>() };
  }
  const record = parsed as Record<string, unknown>;
  const detailsRaw = record[detailsKey];
  const details = createSafeDetailsMap();
  if (typeof detailsRaw === 'object' && detailsRaw !== null) {
    for (const [key, value] of Object.entries(detailsRaw as Record<string, unknown>)) {
      if (isSafeCacheKey(key)) {
        details[key] = value;
      }
    }
  }
  const missingRaw = record[missingKey];
  const missingIds = new Set<string>(
    Array.isArray(missingRaw)
      ? missingRaw.filter((value): value is string => typeof value === 'string')
      : [],
  );
  return { details, missingIds };
}

/**
 * Drops missing identifiers that are no longer part of the active roster so a
 * departed entity does not permanently suppress a re-added one.
 *
 * @param missingIds - Missing-id set (mutated in place).
 * @param activeIds - Identifiers present in the current listing.
 */
export function pruneMissingIds(missingIds: Set<string>, activeIds: ReadonlySet<string>): void {
  for (const id of Array.from(missingIds)) {
    if (!activeIds.has(id)) {
      missingIds.delete(id);
    }
  }
}

/** Returns true when any identifier variant already has a cached detail record. */
export function hasCachedDetail(details: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.some((key) => details[key] !== undefined);
}

/** Stores a detail record under every provided identifier variant. */
export function cacheDetail(
  details: Record<string, unknown>,
  keys: readonly string[],
  value: unknown,
): void {
  for (const key of keys) {
    if (isSafeCacheKey(key)) {
      details[key] = value;
    }
  }
}

/** Options controlling a single incremental detail-refresh batch. */
export interface DetailBatchOptions<Item> {
  /** Full current roster of items. */
  items: readonly Item[];
  /** Maximum number of uncached items to fetch this run. */
  batchSize: number;
  /** Detail map fetched so far (mutated in place). */
  details: Record<string, unknown>;
  /** Not-found identifiers to skip this cycle (mutated in place). */
  missingIds: Set<string>;
  /** Primary identifier used for missing-id bookkeeping. */
  idFor: (item: Item) => string;
  /** All identifier variants a detail record should be stored/looked up under. */
  keysFor: (item: Item) => readonly string[];
  /** Fetches the detail record for one item. */
  fetchDetail: (item: Item) => Promise<unknown>;
  /** Additional keys derived from the fetched detail (e.g. canonical identifier). */
  extraKeysFromDetail?: (detail: unknown) => readonly string[];
  /** Classifies an error as a definitive 404 so the id is not retried. */
  isNotFound: (error: unknown) => boolean;
  /** Invoked when an item is recorded as permanently missing (404). */
  onSkip?: (id: string) => void;
  /** Invoked when an item fetch fails transiently and will be retried later. */
  onRetry?: (id: string) => void;
}

/** Outcome summary of an incremental detail-refresh batch. */
export interface DetailBatchResult {
  fetchedInRun: number;
  failedDetailIds: string[];
  remainingDetails: number;
  complete: boolean;
}

function selectPending<Item>(options: DetailBatchOptions<Item>): Item[] {
  return options.items.filter(
    (item) =>
      !hasCachedDetail(options.details, options.keysFor(item)) &&
      !options.missingIds.has(options.idFor(item)),
  );
}

/**
 * Fetches detail records for up to `batchSize` items that have neither been
 * cached nor flagged missing, mutating `details` and `missingIds` in place.
 *
 * @param options - Batch configuration and mutable state.
 * @returns Counts describing this run's progress and whether the cache is complete.
 */
export async function refreshDetailBatch<Item>(
  options: DetailBatchOptions<Item>,
): Promise<DetailBatchResult> {
  const batch = selectPending(options).slice(0, Math.max(0, options.batchSize));
  const failedDetailIds: string[] = [];
  let fetchedInRun = 0;

  for (const item of batch) {
    const id = options.idFor(item);
    try {
      const detail = await options.fetchDetail(item);
      const keys = [
        ...options.keysFor(item),
        ...(options.extraKeysFromDetail?.(detail) ?? []),
      ];
      cacheDetail(options.details, keys, detail);
      fetchedInRun += 1;
    } catch (error: unknown) {
      if (options.isNotFound(error)) {
        options.missingIds.add(id);
        options.onSkip?.(id);
        continue;
      }
      failedDetailIds.push(id);
      options.onRetry?.(id);
    }
  }

  const remainingDetails = selectPending(options).length;
  return {
    fetchedInRun,
    failedDetailIds,
    remainingDetails,
    complete: remainingDetails === 0,
  };
}
