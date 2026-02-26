/**
 * MCP Tool: get_meeting_foreseen_activities
 *
 * Retrieve foreseen activities linked to a specific EP meeting (plenary sitting).
 *
 * **Intelligence Perspective:** Foreseen activities reveal planned agenda items before
 * meetings occur, enabling proactive intelligence collection and preparation.
 *
 * **Business Perspective:** Provides advance notice of planned parliamentary activities
 * for stakeholder preparation and calendar planning.
 *
 * **EP API Endpoint:** `GET /meetings/{sitting-id}/foreseen-activities`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMeetingForeseenActivitiesSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_meeting_foreseen_activities MCP tool request.
 *
 * Retrieves planned agenda items (foreseen activities) linked to a specific EP plenary
 * sitting, enabling proactive intelligence collection ahead of scheduled meetings.
 *
 * @param args - Raw tool arguments, validated against {@link GetMeetingForeseenActivitiesSchema}
 * @returns MCP tool result containing foreseen activity records for the requested sitting
 * @throws {ZodError} If `args` fails schema validation (e.g., missing required `sittingId` field)
 * @throws {Error} If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetMeetingForeseenActivities({
 *   sittingId: 'PV-9-2024-04-22',
 *   limit: 20,
 *   offset: 0
 * });
 * // Returns planned agenda items for plenary sitting PV-9-2024-04-22
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data in responses is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getMeetingForeseenActivitiesToolMetadata} for MCP schema registration
 * @see {@link handleGetMeetings} for retrieving the parent meeting records
 */
export async function handleGetMeetingForeseenActivities(
  args: unknown
): Promise<ToolResult> {
  const params = GetMeetingForeseenActivitiesSchema.parse(args);

  const result = await epClient.getMeetingForeseenActivities(params.sittingId, {
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_meeting_foreseen_activities */
export const getMeetingForeseenActivitiesToolMetadata = {
  name: 'get_meeting_foreseen_activities',
  description: 'Get foreseen (planned) activities for a specific EP meeting/plenary sitting. Returns scheduled agenda items. Data source: European Parliament Open Data Portal.',
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
