/**
 * Retrieves the complete MEP listing with a caller-configured page size.
 *
 * @module utils/allMepFetcher
 */

interface MEPPage {
  data: unknown[];
  hasMore: boolean;
}

export interface MEPPageClient {
  getMEPs(params: {
    active: boolean;
    limit: number;
    offset: number;
  }): Promise<MEPPage>;
}

/**
 * Fetches one MEP listing page for an incremental detail-cache refresh.
 *
 * @param client - Client used to retrieve the MEP page.
 * @param batchSize - Number of MEPs requested for this refresh.
 * @returns MEP records from the first listing page.
 */
export async function fetchMEPBatch(client: MEPPageClient, batchSize: number): Promise<unknown[]> {
  const page = await client.getMEPs({ active: false, limit: batchSize, offset: 0 });
  return page.data;
}

/**
 * Fetches every MEP page, preserving the configured page size for each request.
 *
 * @param client - Client used to retrieve MEP pages.
 * @param batchSize - Number of MEPs requested per page.
 * @returns All MEP records returned by the paginated endpoint.
 */
export async function fetchAllMEPs(client: MEPPageClient, batchSize: number): Promise<unknown[]> {
  const result: unknown[] = [];
  let offset = 0;

  for (;;) {
    const page = await client.getMEPs({ active: false, limit: batchSize, offset });
    result.push(...page.data);
    if (!page.hasMore) return result;
    offset += batchSize;
  }
}
