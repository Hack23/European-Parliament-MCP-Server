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
import { ToolError } from './shared/errors.js';
import { isUpstream404, buildEmptyFeedResponse } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_parliamentary_questions_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetParliamentaryQuestionsFeedSchema}
 * @returns MCP tool result containing recently updated parliamentary question data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetParliamentaryQuestionsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetParliamentaryQuestionsFeedSchema.parse>;
  try {
    params = GetParliamentaryQuestionsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_parliamentary_questions_feed',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const apiParams: Record<string, unknown> = {};
    apiParams['timeframe'] = params.timeframe;
    if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
    const result = await epClient.getParliamentaryQuestionsFeed(
      apiParams as Parameters<typeof epClient.getParliamentaryQuestionsFeed>[0]
    );
    return buildToolResponse({ ...result, dataQualityWarnings: [] as string[] });
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
    throw new ToolError({
      toolName: 'get_parliamentary_questions_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve parliamentary questions feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_parliamentary_questions_feed */
export const getParliamentaryQuestionsFeedToolMetadata = {
  name: 'get_parliamentary_questions_feed',
  description:
    'Get recently updated parliamentary questions from the feed. Returns parliamentary questions published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      timeframe: {
        type: 'string',
        description: 'Timeframe for the feed (today, one-day, one-week, one-month, custom)',
        enum: ['today', 'one-day', 'one-week', 'one-month', 'custom'],
        default: 'one-week',
      },
      startDate: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD) — required when timeframe is "custom"',
      },
    },
  },
};
