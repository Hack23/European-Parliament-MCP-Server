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
 * Handles the get_procedure_events MCP tool request.
 *
 * Retrieves the chronological timeline of events (committee hearings, plenary debates,
 * votes, and other milestones) linked to a specific EP legislative procedure, supporting
 * precise legislative tracking and compliance monitoring.
 *
 * @param args - Raw tool arguments, validated against {@link GetProcedureEventsSchema}
 * @returns MCP tool result containing the ordered list of events for the specified procedure
 * @throws - If `args` fails schema validation (e.g., missing required `processId`)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetProcedureEvents({
 *   processId: '2023/0132(COD)',
 *   limit: 50,
 *   offset: 0
 * });
 * // Returns committee hearings, plenary debates, and votes for procedure 2023/0132(COD)
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getProcedureEventsToolMetadata} for MCP schema registration
 * @see {@link handleGetProcedures} for retrieving the parent procedure record
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
