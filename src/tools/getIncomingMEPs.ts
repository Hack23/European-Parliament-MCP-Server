/**
 * MCP Tool: get_incoming_meps
 *
 * Retrieve incoming Members of European Parliament for the current parliamentary term.
 *
 * **Intelligence Perspective:** Enables tracking of new MEPs joining parliament,
 * useful for understanding political transitions and new member onboarding.
 *
 * **Business Perspective:** Helps stakeholders identify newly arriving MEPs
 * for early engagement and relationship building.
 *
 * **EP API Endpoint:** `GET /meps/show-incoming`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetIncomingMEPsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Get incoming MEPs tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with incoming MEP data
 */
export async function handleGetIncomingMEPs(
  args: unknown
): Promise<ToolResult> {
  const params = GetIncomingMEPsSchema.parse(args);

  const result = await epClient.getIncomingMEPs({
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_incoming_meps */
export const getIncomingMEPsToolMetadata = {
  name: 'get_incoming_meps',
  description: 'Get incoming Members of European Parliament for the current parliamentary term. Returns MEPs who are newly joining. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
