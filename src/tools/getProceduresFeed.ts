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
import { isUpstream404, buildEmptyFeedResponse, isErrorInBody, buildFeedSuccessResponse } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

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
    const result = await epClient.getProceduresFeed(
      apiParams
    );
    if (isErrorInBody(result)) {
      return buildEmptyFeedResponse(
        'EP API returned an error-in-body response for get_procedures_feed — the upstream enrichment step may have failed.',
      );
    }
    return buildFeedSuccessResponse(result);
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
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
