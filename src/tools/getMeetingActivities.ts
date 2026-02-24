/**
 * MCP Tool: get_meeting_activities
 *
 * Retrieve activities linked to a specific EP plenary sitting.
 *
 * **Intelligence Perspective:** Activity-level granularity enables precise tracking of
 * plenary agenda items, time allocation analysis, and priority assessment.
 *
 * **Business Perspective:** Meeting activity data powers agenda monitoring and
 * legislative scheduling intelligence products.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMeetingActivitiesSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get meeting activities tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with meeting activity data
 */
export async function handleGetMeetingActivities(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetMeetingActivitiesSchema.parse(args);

  const result = await epClient.getMeetingActivities(params.sittingId, {
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

/** Tool metadata for get_meeting_activities */
export const getMeetingActivitiesToolMetadata = {
  name: 'get_meeting_activities',
  description: 'Get activities linked to a specific EP plenary sitting (debates, votes, presentations). Requires a sitting ID. Data source: European Parliament Open Data Portal.',
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
