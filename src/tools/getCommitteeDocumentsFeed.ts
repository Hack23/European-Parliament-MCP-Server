/**
 * MCP Tool: get_committee_documents_feed
 *
 * Get recently updated committee documents from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /committee-documents/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetCommitteeDocumentsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_committee_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetCommitteeDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated committee document data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetCommitteeDocumentsFeed(args: unknown): Promise<ToolResult> {
  const params = GetCommitteeDocumentsFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  const result = await epClient.getCommitteeDocumentsFeed(apiParams as Parameters<typeof epClient.getCommitteeDocumentsFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_committee_documents_feed */
export const getCommitteeDocumentsFeedToolMetadata = {
  name: 'get_committee_documents_feed',
  description: 'Get recently updated committee documents from the feed. Returns committee documents published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
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
