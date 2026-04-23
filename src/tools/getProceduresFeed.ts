/**
 * MCP Tool: get_procedures_feed
 *
 * Get recently updated European Parliament procedures from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /procedures/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetProceduresFeedSchema } from '../schemas/europeanParliament.js';
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
 * Attempt to fetch a degraded fallback from the non-feed procedures endpoint.
 *
 * Called when the feed's enrichment step fails (error-in-body). Returns a
 * degraded feed response with a warning, or `null` if the fallback also fails.
 *
 * @param rawError - The raw error string from the error-in-body payload
 * @returns Degraded ToolResult on success, or `null` on failure
 * @internal
 */
async function tryProceduresFallback(rawError: string): Promise<ToolResult | null> {
  try {
    const fallbackResult = await epClient.getProcedures({ limit: 50, offset: 0 });
    const errorSuffix = rawError ? ` (upstream: ${rawError})` : '';
    const fallbackWarning =
      `ENRICHMENT_FAILED: EP API enrichment step failed${errorSuffix}. ` +
      `Degraded mode: showing recent procedures without timeframe filter` +
      ` — consider retrying get_procedures_feed.`;
    return buildFeedSuccessResponse(fallbackResult, [fallbackWarning]);
  } catch {
    return null;
  }
}

/**
 * Build an in-band response for an error-in-body reply.
 *
 * Classifies the failure as `ENRICHMENT_FAILED`, parses any upstream
 * HTTP status code from the error message, and returns the full
 * machine-readable envelope.
 *
 * @param rawError - The raw error string from the EP API response body
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
    `EP API returned an error-in-body response for get_procedures_feed — the upstream enrichment step may have failed${errorSuffix}.`,
    meta,
  );
}

/**
 * Classify and handle a caught upstream error, returning an in-band feed response
 * for well-known transient failure modes (404, timeout, rate limit).
 * Returns `null` for unclassified errors that should be re-thrown.
 *
 * @param error - The caught error
 * @returns In-band ToolResult for known transient failures, or `null`
 * @internal
 */
function handleUpstreamCatchError(error: unknown): ToolResult | null {
  if (isUpstream404(error)) return buildEmptyFeedResponse();

  if (error instanceof TimeoutError || (error instanceof Error && error.message.includes('timed out'))) {
    return buildEmptyFeedResponse(
      `EP API request timed out for get_procedures_feed — the endpoint is known to be slow. ` +
        `Consider retrying or using get_procedures with a limit parameter instead.`,
      { errorCode: 'UPSTREAM_TIMEOUT', retryable: true },
    );
  }

  if (error instanceof APIError && error.statusCode === 429) {
    return buildEmptyFeedResponse(
      `EP API rate limit reached for get_procedures_feed — retry after a short delay.`,
      { errorCode: 'RATE_LIMIT', retryable: true },
    );
  }

  return null;
}

/**
 * Handles the get_procedures_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetProceduresFeedSchema}
 * @returns MCP tool result containing recently updated procedure data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetProceduresFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetProceduresFeedSchema.parse>;
  try {
    params = GetProceduresFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_procedures_feed',
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
    if (params.processType !== undefined) apiParams['processType'] = params.processType;
    const result = await epClient.getProceduresFeed(apiParams);
    if (isErrorInBody(result)) {
      const rawError = typeof result['error'] === 'string' ? result['error'] : '';
      const fallback = await tryProceduresFallback(rawError);
      if (fallback !== null) return fallback;
      return buildEnrichmentFailedResponse(rawError);
    }
    return buildFeedSuccessResponse(result);
  } catch (error: unknown) {
    const inBand = handleUpstreamCatchError(error);
    if (inBand !== null) return inBand;
    throw new ToolError({
      toolName: 'get_procedures_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve procedures feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_procedures_feed */
export const getProceduresFeedToolMetadata = {
  name: 'get_procedures_feed',
  description:
    'Get recently updated European Parliament procedures from the feed. Returns procedures published or updated during the specified timeframe. Data source: European Parliament Open Data Portal. NOTE: The EP API procedures/feed endpoint is significantly slower than other feeds — "one-month" queries may take around 120 seconds and can still time out. If you see timeouts, increase the global timeout with --timeout or EP_REQUEST_TIMEOUT_MS. For faster results, use get_procedures with a year filter instead.',
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
      processType: { type: 'string', description: 'Process type filter' },
    },
  },
};
