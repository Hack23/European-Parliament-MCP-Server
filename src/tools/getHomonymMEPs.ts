/**
 * MCP Tool: get_homonym_meps
 *
 * Retrieve homonym Members of European Parliament for the current parliamentary term.
 *
 * **Intelligence Perspective:** Identifies MEPs with identical names, important for
 * disambiguation in intelligence analysis and data matching.
 *
 * **Business Perspective:** Ensures accurate MEP identification in products
 * that match MEP names across data sources.
 *
 * **EP API Endpoint:** `GET /meps/show-homonyms`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetHomonymMEPsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get homonym MEPs tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with homonym MEP data
 */
export async function handleGetHomonymMEPs(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetHomonymMEPsSchema.parse(args);

  const result = await epClient.getHomonymMEPs({
    limit: params.limit,
    offset: params.offset
  });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

/** Tool metadata for get_homonym_meps */
export const getHomonymMEPsToolMetadata = {
  name: 'get_homonym_meps',
  description: 'Get homonym Members of European Parliament (MEPs with identical names) for the current parliamentary term. Useful for name disambiguation. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
