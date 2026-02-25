/**
 * MCP Tool: get_meeting_decisions
 *
 * Retrieve decisions made in a specific EP plenary sitting.
 *
 * **Intelligence Perspective:** Decision tracking enables analysis of voting outcomes,
 * legislative success rates, and political group alignment on specific items.
 *
 * **Business Perspective:** Decision data powers compliance monitoring and regulatory
 * change detection services.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMeetingDecisionsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Get meeting decisions tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with meeting decision data
 */
export async function handleGetMeetingDecisions(
  args: unknown
): Promise<ToolResult> {
  const params = GetMeetingDecisionsSchema.parse(args);

  const result = await epClient.getMeetingDecisions(params.sittingId, {
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_meeting_decisions */
export const getMeetingDecisionsToolMetadata = {
  name: 'get_meeting_decisions',
  description: 'Get decisions made in a specific EP plenary sitting. Returns adopted decisions and voting outcomes. Requires a sitting ID. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sittingId: { type: 'string', description: 'Meeting / sitting identifier (required)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    },
    required: ['sittingId']
  }
};
