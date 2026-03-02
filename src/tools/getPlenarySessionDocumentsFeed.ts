/**
 * MCP Tool: get_plenary_session_documents_feed
 *
 * Get recently updated plenary session documents from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /plenary-session-documents/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetPlenarySessionDocumentsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_plenary_session_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetPlenarySessionDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated plenary session document data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetPlenarySessionDocumentsFeed(args: unknown): Promise<ToolResult> {
  const params = GetPlenarySessionDocumentsFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  const result = await epClient.getPlenarySessionDocumentsFeed(apiParams as Parameters<typeof epClient.getPlenarySessionDocumentsFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_plenary_session_documents_feed */
export const getPlenarySessionDocumentsFeedToolMetadata = {
  name: 'get_plenary_session_documents_feed',
  description: 'Get recently updated plenary session documents from the feed. Returns plenary session documents published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
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
