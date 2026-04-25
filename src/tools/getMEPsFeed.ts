/**
 * MCP Tool: get_meps_feed
 *
 * Get recently updated MEPs from the European Parliament feed.
 *
 * **EP API Endpoint:**
 * - `GET /meps/feed`
 *
 * **Oversized-payload detection:** the Hack23/euparliamentmonitor
 * 2026-04-24 breaking audit §1.5 documented that the upstream feed is
 * occasionally failing open to a full-census dump (33.6 MB / ~700 items)
 * instead of returning a delta. When the response item count exceeds
 * {@link OVERSIZED_PAYLOAD_THRESHOLD} we surface an `OVERSIZED_PAYLOAD`
 * warning so consumers can detect this mechanically without parsing prose.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMEPsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { ToolError } from './shared/errors.js';
import { isUpstream404, buildEmptyFeedResponse, buildFeedSuccessResponse } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Item-count threshold above which a `/meps/feed` response is considered a
 * full-census dump rather than a delta. The total seated MEP count is ≤ 720,
 * and a healthy delta on a single day rarely exceeds ~50 mandate changes.
 * 200 is a deliberately conservative threshold that flags the failure mode
 * without firing on legitimate term-start ramps.
 *
 * @internal
 */
const OVERSIZED_PAYLOAD_THRESHOLD = 200;

/**
 * Build OVERSIZED_PAYLOAD warning entries when the feed item count crosses
 * {@link OVERSIZED_PAYLOAD_THRESHOLD}. Mechanically observable signal of the
 * upstream delta-pagination failure mode.
 *
 * @internal
 */
function buildOversizedPayloadWarnings(result: unknown): readonly string[] {
  const source = (result ?? {}) as Record<string, unknown>;
  const items = Array.isArray(source['data']) ? (source['data'] as unknown[]) : [];
  if (items.length <= OVERSIZED_PAYLOAD_THRESHOLD) return [];
  return [
    `OVERSIZED_PAYLOAD: EP /meps/feed returned ${String(items.length)} item(s) — ` +
      `this exceeds the delta-vs-census threshold (${String(OVERSIZED_PAYLOAD_THRESHOLD)}) and indicates the ` +
      `upstream delta-pagination has likely failed open to a full-census dump. The data is structurally valid ` +
      `but does not represent a delta of recent mandate changes. Consider using get_meps for census queries ` +
      `instead, and re-querying get_meps_feed with a narrower timeframe.`,
  ];
}

/**
 * Handles the get_meps_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetMEPsFeedSchema}
 * @returns MCP tool result containing recently updated MEP data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetMEPsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetMEPsFeedSchema.parse>;
  try {
    params = GetMEPsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_meps_feed',
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
    const result = await epClient.getMEPsFeed(
      apiParams
    );
    const oversizedWarnings = buildOversizedPayloadWarnings(result);
    return buildFeedSuccessResponse(result, oversizedWarnings);
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
    throw new ToolError({
      toolName: 'get_meps_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve MEPs feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_meps_feed */
export const getMEPsFeedToolMetadata = {
  name: 'get_meps_feed',
  description:
    'Get recently updated MEPs from the European Parliament feed. Returns MEPs published or updated during the specified timeframe. Data source: European Parliament Open Data Portal. NOTE: when the upstream returns more than 200 items (a known failure mode where delta-pagination falls back to a full-census dump) the response surfaces an OVERSIZED_PAYLOAD entry in dataQualityWarnings so consumers can detect the regression mechanically.',
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
