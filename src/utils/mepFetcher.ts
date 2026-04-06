/**
 * Shared utility for fetching all current MEPs via paginated batches.
 *
 * Used by OSINT tools that need full MEP counts (e.g., sentimentTracker,
 * analyzeCoalitionDynamics) to avoid per-group API calls that each trigger
 * a full multi-page fetch.
 *
 * @module utils/mepFetcher
 */

import { epClient } from '../clients/europeanParliamentClient.js';
import { auditLogger, toErrorMessage } from './auditLogger.js';
import type { MEP } from '../types/europeanParliament.js';

/**
 * Result of a paginated MEP fetch. Callers should inspect `complete` to
 * determine whether the returned `meps` array represents a full dataset
 * or only a partial snapshot (due to a pagination error).
 */
export interface FetchMEPsResult {
  /** MEPs collected so far (may be partial on error). */
  meps: MEP[];
  /** `true` when all pages were fetched successfully; `false` on error. */
  complete: boolean;
  /** The offset at which a failure occurred, if any. */
  failureOffset?: number;
}

/**
 * Fetch all current MEPs by paginating until no more pages remain.
 *
 * If a page request fails mid-pagination, the error is logged via
 * {@link auditLogger.logError} and the function returns the MEPs
 * collected so far as partial results. Callers should check
 * {@link FetchMEPsResult.complete} to know whether the data is complete.
 *
 * @returns A {@link FetchMEPsResult} containing the MEPs, a `complete` flag,
 *   and an optional `failureOffset` when the fetch was incomplete.
 */
export async function fetchAllCurrentMEPs(): Promise<FetchMEPsResult> {
  const batchSize = 100;
  const allMeps: MEP[] = [];
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    try {
      const page = await epClient.getCurrentMEPs({ limit: batchSize, offset });
      allMeps.push(...page.data);
      hasMore = page.hasMore;
      offset += batchSize;
    } catch (error: unknown) {
      auditLogger.logError('fetchAllCurrentMEPs', { offset, batchSize }, `Pagination failed at offset ${String(offset)}: ${toErrorMessage(error)}`);
      return { meps: allMeps, complete: false, failureOffset: offset };
    }
  }
  return { meps: allMeps, complete: true };
}
