/**
 * MCP Tool: get_events_feed
 *
 * Get recently updated European Parliament events from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /events/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetEventsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_events_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetEventsFeedSchema}
 * @returns MCP tool result containing recently updated event data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetEventsFeed(args: unknown): Promise<ToolResult> {
  const params = GetEventsFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  if (params.activityType !== undefined) apiParams['activityType'] = params.activityType;
  const result = await epClient.getEventsFeed(apiParams as Parameters<typeof epClient.getEventsFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_events_feed */
export const getEventsFeedToolMetadata = {
  name: 'get_events_feed',
  description: 'Get recently updated European Parliament events from the feed. Returns events published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      timeframe: {
        type: 'string',
        description: 'Timeframe for the feed (today, one-day, one-week, one-month, custom)',
        enum: ['today', 'one-day', 'one-week', 'one-month', 'custom'],
        default: 'one-week'
      },
      startDate: { type: 'string', description: 'Start date (YYYY-MM-DD) — required when timeframe is "custom"' },
      activityType: { type: 'string', description: 'Activity type filter' }
    }
  }
};
