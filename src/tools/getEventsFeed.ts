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
import { ToolError } from './shared/errors.js';
import { isUpstream404, buildEmptyFeedResponse, isErrorInBody, buildFeedSuccessResponse } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_events_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetEventsFeedSchema}
 * @returns MCP tool result containing recently updated event data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetEventsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetEventsFeedSchema.parse>;
  try {
    params = GetEventsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_events_feed',
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
    if (params.activityType !== undefined) apiParams['activityType'] = params.activityType;
    const result = await epClient.getEventsFeed(
      apiParams as Parameters<typeof epClient.getEventsFeed>[0]
    );
    if (isErrorInBody(result as Record<string, unknown>)) {
      return buildEmptyFeedResponse(
        'EP API returned an error-in-body response for get_events_feed — the upstream enrichment step may have failed.',
      );
    }
    return buildFeedSuccessResponse(result);
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
    throw new ToolError({
      toolName: 'get_events_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve events feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_events_feed */
export const getEventsFeedToolMetadata = {
  name: 'get_events_feed',
  description:
    'Get recently updated European Parliament events from the feed. Returns events published or updated during the specified timeframe. Data source: European Parliament Open Data Portal. NOTE: The EP API events/feed endpoint is significantly slower than other feeds — "one-month" queries can exceed the default 120-second extended timeout. If needed, increase the global timeout with --timeout or EP_REQUEST_TIMEOUT_MS. For faster results, use get_plenary_sessions with a year filter instead.',
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
      activityType: { type: 'string', description: 'Activity type filter' },
    },
  },
};
