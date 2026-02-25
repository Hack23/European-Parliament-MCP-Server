/**
 * MCP Tool: get_procedure_events
 *
 * Retrieve events linked to a specific EP legislative procedure.
 *
 * **Intelligence Perspective:** Procedure events track the legislative timeline including
 * committee hearings, plenary debates, and votes for a specific procedure.
 *
 * **Business Perspective:** Provides legislative timeline data for procedure tracking
 * and compliance monitoring products.
 *
 * **EP API Endpoints:**
 * - `GET /procedures/{process-id}/events`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetProcedureEventsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Get procedure events tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with procedure event data
 */
export async function handleGetProcedureEvents(
  args: unknown
): Promise<ToolResult> {
  const params = GetProcedureEventsSchema.parse(args);

  const result = await epClient.getProcedureEvents(params.processId, {
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_procedure_events */
export const getProcedureEventsToolMetadata = {
  name: 'get_procedure_events',
  description: 'Get events linked to a specific EP legislative procedure (hearings, debates, votes). Returns the timeline of events for a procedure. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      processId: { type: 'string', description: 'Procedure process ID (required)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    },
    required: ['processId']
  }
};
