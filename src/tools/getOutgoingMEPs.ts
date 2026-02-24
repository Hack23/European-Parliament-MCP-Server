/**
 * MCP Tool: get_outgoing_meps
 *
 * Retrieve outgoing Members of European Parliament for the current parliamentary term.
 *
 * **Intelligence Perspective:** Enables tracking of departing MEPs, useful for
 * understanding political transitions and succession patterns.
 *
 * **Business Perspective:** Helps stakeholders prepare for political transitions
 * and identify outgoing MEPs for final engagement.
 *
 * **EP API Endpoint:** `GET /meps/show-outgoing`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetOutgoingMEPsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get outgoing MEPs tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with outgoing MEP data
 */
export async function handleGetOutgoingMEPs(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetOutgoingMEPsSchema.parse(args);

  const result = await epClient.getOutgoingMEPs({
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

/** Tool metadata for get_outgoing_meps */
export const getOutgoingMEPsToolMetadata = {
  name: 'get_outgoing_meps',
  description: 'Get outgoing Members of European Parliament for the current parliamentary term. Returns MEPs who are leaving parliament. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
