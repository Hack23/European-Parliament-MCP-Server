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
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_plenary_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetPlenaryDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated plenary document data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetPlenaryDocumentsFeed(args: unknown): Promise<ToolResult> {
  const params = GetPlenaryDocumentsFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  if (params.timeframe !== undefined) apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  const result = await epClient.getPlenaryDocumentsFeed(apiParams as Parameters<typeof epClient.getPlenaryDocumentsFeed>[0]);
  return buildToolResponse(result);
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
