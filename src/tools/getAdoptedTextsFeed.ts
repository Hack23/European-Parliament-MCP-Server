/**
 * MCP Tool: get_adopted_texts_feed
 *
 * Get recently updated European Parliament adopted texts from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /adopted-texts/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetAdoptedTextsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_adopted_texts_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetAdoptedTextsFeedSchema}
 * @returns MCP tool result containing recently updated adopted text data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetAdoptedTextsFeed(args: unknown): Promise<ToolResult> {
  const params = GetAdoptedTextsFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  if (params.workType !== undefined) apiParams['workType'] = params.workType;
  const result = await epClient.getAdoptedTextsFeed(apiParams as Parameters<typeof epClient.getAdoptedTextsFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_adopted_texts_feed */
export const getAdoptedTextsFeedToolMetadata = {
  name: 'get_adopted_texts_feed',
  description: 'Get recently updated European Parliament adopted texts from the feed. Returns adopted texts published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
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
