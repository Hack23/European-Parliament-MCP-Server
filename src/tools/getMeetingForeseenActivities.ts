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

/**
 * Get meeting foreseen activities tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with foreseen activity data
 */
export async function handleGetMeetingForeseenActivities(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetMeetingForeseenActivitiesSchema.parse(args);

  const result = await epClient.getMeetingForeseenActivities(params.sittingId, {
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
