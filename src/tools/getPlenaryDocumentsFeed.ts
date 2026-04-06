/**
 * MCP Tool: get_plenary_documents_feed
 *
 * Get recently updated plenary documents from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /plenary-documents/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetPlenaryDocumentsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_plenary_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetPlenaryDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated plenary document data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetPlenaryDocumentsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetPlenaryDocumentsFeedSchema.parse>;
  try {
    params = GetPlenaryDocumentsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_plenary_documents_feed',
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
  const result = await epClient.getPlenaryDocumentsFeed(apiParams as Parameters<typeof epClient.getPlenaryDocumentsFeed>[0]);
  return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_plenary_documents_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve plenary documents feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_plenary_documents_feed */
export const getPlenaryDocumentsFeedToolMetadata = {
  name: 'get_plenary_documents_feed',
  description: 'Get recently updated plenary documents from the feed. Returns plenary documents published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      timeframe: {
        type: 'string',
        description: 'Timeframe for the feed (today, one-day, one-week, one-month, custom)',
        enum: ['today', 'one-day', 'one-week', 'one-month', 'custom'],
        default: 'one-week'
      },
      startDate: { type: 'string', description: 'Start date (YYYY-MM-DD) — required when timeframe is "custom"' }
    }
  }
};
