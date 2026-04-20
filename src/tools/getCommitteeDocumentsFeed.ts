/**
 * MCP Tool: get_committee_documents_feed
 *
 * Get recently updated committee documents from the feed.
 * This is a **fixed-window feed** — the EP API does not accept a timeframe
 * or start-date parameter. It returns updates from a server-defined default
 * window (typically one month).
 *
 * **EP API Endpoint:**
 * - `GET /committee-documents/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetCommitteeDocumentsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { ToolError } from './shared/errors.js';
import { isUpstream404, buildEmptyFeedResponse, isErrorInBody, buildFeedSuccessResponse, FIXED_WINDOW_FEED_INPUT_SCHEMA } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_committee_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetCommitteeDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated committee documents data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetCommitteeDocumentsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — fixed-window feeds accept no parameters
  try {
    GetCommitteeDocumentsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_committee_documents_feed',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const result = await epClient.getCommitteeDocumentsFeed();
    if (isErrorInBody(result)) {
      return buildEmptyFeedResponse(
        'EP API returned an error-in-body response for get_committee_documents_feed — the upstream enrichment step may have failed.',
      );
    }
    return buildFeedSuccessResponse(result);
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
    throw new ToolError({
      toolName: 'get_committee_documents_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve committee documents feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_committee_documents_feed */
export const getCommitteeDocumentsFeedToolMetadata = {
  name: 'get_committee_documents_feed',
  description:
    'Get recently updated committee documents from the EP Open Data Portal feed. This is a fixed-window feed — the upstream EP API always returns items updated within a server-defined default window (typically one month). For contract uniformity with sliding-window feed tools, the common feed parameters (timeframe, startDate, limit, offset) are accepted but informational-only — they are silently ignored. Data source: European Parliament Open Data Portal.',
  inputSchema: FIXED_WINDOW_FEED_INPUT_SCHEMA,
};
