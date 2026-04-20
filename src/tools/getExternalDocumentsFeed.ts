/**
 * MCP Tool: get_external_documents_feed
 *
 * Get recently updated external documents (non-EP documents) from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /external-documents/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetExternalDocumentsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { ToolError } from './shared/errors.js';
import { isUpstream404, buildEmptyFeedResponse, buildFeedSuccessResponse } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_external_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetExternalDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated external document data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetExternalDocumentsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetExternalDocumentsFeedSchema.parse>;
  try {
    params = GetExternalDocumentsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_external_documents_feed',
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
    if (params.workType !== undefined) apiParams['workType'] = params.workType;
    const result = await epClient.getExternalDocumentsFeed(
      apiParams
    );
    return buildFeedSuccessResponse(result);
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
    throw new ToolError({
      toolName: 'get_external_documents_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve external documents feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_external_documents_feed */
export const getExternalDocumentsFeedToolMetadata = {
  name: 'get_external_documents_feed',
  description:
    'Get recently updated external documents (non-EP documents) from the feed. Returns external documents published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
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
      workType: { type: 'string', description: 'Work type filter' },
    },
  },
};
