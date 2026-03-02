/**
 * MCP Tool: get_mep_declarations_feed
 *
 * Get recently updated MEP declarations from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /meps-declarations/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMEPDeclarationsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_mep_declarations_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetMEPDeclarationsFeedSchema}
 * @returns MCP tool result containing recently updated MEP declaration data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetMEPDeclarationsFeed(args: unknown): Promise<ToolResult> {
  const params = GetMEPDeclarationsFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  if (params.timeframe !== undefined) apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  if (params.workType !== undefined) apiParams['workType'] = params.workType;
  const result = await epClient.getMEPDeclarationsFeed(apiParams as Parameters<typeof epClient.getMEPDeclarationsFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_mep_declarations_feed */
export const getMEPDeclarationsFeedToolMetadata = {
  name: 'get_mep_declarations_feed',
  description: 'Get recently updated MEP declarations from the feed. Returns declarations published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
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
      workType: { type: 'string', description: 'Work type filter' }
    }
  }
};
