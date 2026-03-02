/**
 * MCP Tool: get_corporate_bodies_feed
 *
 * Get recently updated corporate bodies (committees, delegations) from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /corporate-bodies/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetCorporateBodiesFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_corporate_bodies_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetCorporateBodiesFeedSchema}
 * @returns MCP tool result containing recently updated corporate body data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetCorporateBodiesFeed(args: unknown): Promise<ToolResult> {
  const params = GetCorporateBodiesFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  if (params.timeframe !== undefined) apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  const result = await epClient.getCorporateBodiesFeed(apiParams as Parameters<typeof epClient.getCorporateBodiesFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_corporate_bodies_feed */
export const getCorporateBodiesFeedToolMetadata = {
  name: 'get_corporate_bodies_feed',
  description: 'Get recently updated corporate bodies (committees, delegations) from the feed. Returns corporate bodies published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      timeframe: {
        type: 'string',
        description: 'Timeframe for the feed (today, one-day, one-week, one-month, custom)',
        enum: ['today', 'one-day', 'one-week', 'one-month', 'custom'],
        default: 'one-week'
      },
      startDate: { type: 'string', description: 'Start date (YYYY-MM-DD) — required when timeframe is "custom"' }
    }
  }
};
