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
import {
  isUpstream404,
  buildEmptyFeedResponse,
  isErrorInBody,
  buildFeedSuccessResponse,
  extractUpstreamStatusCode,
  type FeedErrorMeta,
} from './shared/feedUtils.js';
import { APIError } from '../clients/ep/baseClient.js';
import { TimeoutError } from '../utils/timeout.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Build an in-band response for an error-in-body reply.
 *
 * @param rawError - Raw EP API error string from the response body
 * @internal
 */
function buildEnrichmentFailedResponse(rawError: string): ToolResult {
  const upstreamStatusCode = extractUpstreamStatusCode(rawError);
  const upstream =
    upstreamStatusCode !== undefined || rawError !== ''
      ? {
          ...(upstreamStatusCode !== undefined && { statusCode: upstreamStatusCode }),
          ...(rawError !== '' && { errorMessage: rawError }),
        }
      : undefined;
  const meta: FeedErrorMeta = {
    errorCode: 'ENRICHMENT_FAILED',
    retryable: true,
    ...(upstream !== undefined ? { upstream } : {}),
  };
  const errorSuffix = rawError ? ` (upstream: ${rawError})` : '';
  return buildEmptyFeedResponse(
    `EP API returned an error-in-body response for get_events_feed — the upstream enrichment step may have failed${errorSuffix}.`,
    meta,
  );
}

/**
 * Detect timeout failures surfaced either directly or via the EP API wrapper.
 *
 * @param error - Error thrown by the EP API client or timeout utility
 * @returns true when the failure should be classified as UPSTREAM_TIMEOUT
 * @internal
 */
function isTimeoutLikeError(error: unknown): boolean {
  return (
    error instanceof TimeoutError ||
    (error instanceof APIError && error.statusCode === 408) ||
    (error instanceof Error && error.message.includes('timed out'))
  );
}

/**
 * Build the uniform feed envelope for upstream HTTP 429 rate limits.
 *
 * @param error - APIError carrying the rate-limit failure details
 * @returns MCP ToolResult with RATE_LIMIT metadata for downstream retry logic
 * @internal
 */
function buildRateLimitResponse(error: APIError): ToolResult {
  return buildEmptyFeedResponse(
    `EP API rate limit reached for get_events_feed — retry after a short delay.`,
    {
      errorCode: 'RATE_LIMIT',
      retryable: true,
      upstream: {
        statusCode: 429,
        ...(error.message ? { errorMessage: error.message } : {}),
      },
    },
  );
}

/**
 * Build the uniform feed envelope for retryable upstream 5xx failures.
 *
 * @param error - APIError carrying the upstream failure details
 * @param statusCode - HTTP 5xx status code to expose in the envelope
 * @returns MCP ToolResult with UPSTREAM_ERROR metadata
 * @internal
 */
function buildUpstreamErrorResponse(error: APIError, statusCode: number): ToolResult {
  return buildEmptyFeedResponse(
    `EP API upstream error for get_events_feed — retry later or use get_events with limit/offset as a fallback.`,
    {
      errorCode: 'UPSTREAM_ERROR',
      retryable: true,
      upstream: {
        statusCode,
        ...(error.message ? { errorMessage: error.message } : {}),
      },
    },
  );
}

/**
 * Classify transient upstream errors into the uniform feed envelope.
 *
 * @param error - Caught error from the EP API client
 * @returns In-band ToolResult for known transient failures, or null
 * @internal
 */
function handleUpstreamCatchError(error: unknown): ToolResult | null {
  if (isUpstream404(error)) return buildEmptyFeedResponse();

  if (isTimeoutLikeError(error)) {
    return buildEmptyFeedResponse(
      `EP API request timed out for get_events_feed — the endpoint is known to be slow. ` +
        `Consider retrying with timeframe="one-week" or using get_events with limit/offset as a fallback.`,
      { errorCode: 'UPSTREAM_TIMEOUT', retryable: true },
    );
  }

  if (error instanceof APIError && error.statusCode === 429) {
    return buildRateLimitResponse(error);
  }

  if (error instanceof APIError && error.statusCode !== undefined && error.statusCode >= 500) {
    return buildUpstreamErrorResponse(error, error.statusCode);
  }

  return null;
}

/**
 * Handles the get_events_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetEventsFeedSchema}
 * @returns MCP tool result containing recently updated event data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetEventsFeed(args: unknown): Promise<ToolResult> {
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
      apiParams
    );
    if (isErrorInBody(result)) {
      const rawError = typeof result['error'] === 'string' ? result['error'] : '';
      return buildEnrichmentFailedResponse(rawError);
    }
    const emptyReason = `EP API events/feed returned no data for timeframe '${params.timeframe}' — no events were updated in the requested period. Use get_events (with limit/offset) to browse a paginated list of events as a fallback.`;
    return buildFeedSuccessResponse(result, [], emptyReason);
  } catch (error: unknown) {
    const inBand = handleUpstreamCatchError(error);
    if (inBand !== null) return inBand;
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
    'Get recently updated European Parliament events from the feed. Returns events published or updated during the specified timeframe. Data source: European Parliament Open Data Portal. NOTE: The EP API events/feed endpoint is significantly slower than other feeds, so this tool uses the global EP request timeout (default 60 seconds) and normalizes timeout/rate-limit/upstream failures into the feed envelope. For faster fallback browsing, use get_events with limit/offset.',
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
