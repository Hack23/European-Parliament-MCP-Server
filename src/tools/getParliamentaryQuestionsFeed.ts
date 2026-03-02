/**
 * MCP Tool: get_parliamentary_questions_feed
 *
 * Get recently updated parliamentary questions from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /parliamentary-questions/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetParliamentaryQuestionsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_parliamentary_questions_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetParliamentaryQuestionsFeedSchema}
 * @returns MCP tool result containing recently updated parliamentary question data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetParliamentaryQuestionsFeed(args: unknown): Promise<ToolResult> {
  const params = GetParliamentaryQuestionsFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  const result = await epClient.getParliamentaryQuestionsFeed(apiParams as Parameters<typeof epClient.getParliamentaryQuestionsFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_parliamentary_questions_feed */
export const getParliamentaryQuestionsFeedToolMetadata = {
  name: 'get_parliamentary_questions_feed',
  description: 'Get recently updated parliamentary questions from the feed. Returns parliamentary questions published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
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
