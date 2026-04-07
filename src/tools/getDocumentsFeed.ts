/**
 * MCP Tool: get_documents_feed
 *
 * Get recently updated European Parliament documents from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /documents/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetDocumentsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { isUpstream404, buildEmptyFeedResponse } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated document data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetDocumentsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetDocumentsFeedSchema.parse>;
  try {
    params = GetDocumentsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_documents_feed',
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
    const result = await epClient.getDocumentsFeed(
      apiParams as Parameters<typeof epClient.getDocumentsFeed>[0]
    );
    return buildToolResponse({ ...result, dataQualityWarnings: [] });
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
    throw new ToolError({
      toolName: 'get_documents_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve documents feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_documents_feed */
export const getDocumentsFeedToolMetadata = {
  name: 'get_documents_feed',
  description:
    'Get recently updated European Parliament documents from the feed. Returns documents published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
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
