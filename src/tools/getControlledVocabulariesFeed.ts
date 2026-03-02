/**
 * MCP Tool: get_controlled_vocabularies_feed
 *
 * Get recently updated controlled vocabularies from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /controlled-vocabularies/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetControlledVocabulariesFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_controlled_vocabularies_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetControlledVocabulariesFeedSchema}
 * @returns MCP tool result containing recently updated controlled vocabulary data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetControlledVocabulariesFeed(args: unknown): Promise<ToolResult> {
  const params = GetControlledVocabulariesFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  if (params.timeframe !== undefined) apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  const result = await epClient.getControlledVocabulariesFeed(apiParams as Parameters<typeof epClient.getControlledVocabulariesFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_controlled_vocabularies_feed */
export const getControlledVocabulariesFeedToolMetadata = {
  name: 'get_controlled_vocabularies_feed',
  description: 'Get recently updated controlled vocabularies from the feed. Returns controlled vocabularies published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
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
