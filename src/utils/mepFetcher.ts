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
import type { MEP } from '../types/europeanParliament.js';

/** Fetch all current MEPs by paginating until no more pages remain. */
export async function fetchAllCurrentMEPs(): Promise<MEP[]> {
  const batchSize = 100;
  const allMeps: MEP[] = [];
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const page = await epClient.getCurrentMEPs({ limit: batchSize, offset });
    allMeps.push(...page.data);
    hasMore = page.hasMore;
    offset += batchSize;
  }
  return allMeps;
}
