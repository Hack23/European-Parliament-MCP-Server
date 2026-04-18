/**
 * MCP Tool: get_plenary_session_documents_feed
 *
 * Get recently updated plenary session documents from the feed.
 * This is a **fixed-window feed** — the EP API does not accept a timeframe
 * or start-date parameter. It returns updates from a server-defined default
 * window (typically one month).
 *
 * **EP API Endpoint:**
 * - `GET /plenary-session-documents/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetPlenarySessionDocumentsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { ToolError } from './shared/errors.js';
import { isUpstream404, buildEmptyFeedResponse, isErrorInBody, buildFeedSuccessResponse } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_plenary_session_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetPlenarySessionDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated plenary session documents data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetPlenarySessionDocumentsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — fixed-window feeds accept no parameters
  try {
    GetPlenarySessionDocumentsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_plenary_session_documents_feed',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const result = await epClient.getPlenarySessionDocumentsFeed();
    if (isErrorInBody(result as Record<string, unknown>)) {
      return buildEmptyFeedResponse(
        'EP API returned an error-in-body response for get_plenary_session_documents_feed — the upstream enrichment step may have failed.',
      );
    }
    return buildFeedSuccessResponse(result);
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
    throw new ToolError({
      toolName: 'get_plenary_session_documents_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve plenary session documents feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_plenary_session_documents_feed */
export const getPlenarySessionDocumentsFeedToolMetadata = {
  name: 'get_plenary_session_documents_feed',
  description:
    'Get recently updated plenary session documents from the EP Open Data Portal feed. This is a fixed-window feed — no parameters needed. Returns items updated within the server-defined default window (typically one month). Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};
