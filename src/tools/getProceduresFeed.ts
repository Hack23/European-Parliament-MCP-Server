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
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_procedures_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetProceduresFeedSchema}
 * @returns MCP tool result containing recently updated procedure data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetProceduresFeed(args: unknown): Promise<ToolResult> {
  const params = GetProceduresFeedSchema.parse(args);
  const apiParams: Record<string, unknown> = {};
  apiParams['timeframe'] = params.timeframe;
  if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
  if (params.processType !== undefined) apiParams['processType'] = params.processType;
  const result = await epClient.getProceduresFeed(apiParams as Parameters<typeof epClient.getProceduresFeed>[0]);
  return buildToolResponse(result);
}

/** Tool metadata for get_procedures_feed */
export const getProceduresFeedToolMetadata = {
  name: 'get_procedures_feed',
  description: 'Get recently updated European Parliament procedures from the feed. Returns procedures published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      timeframe: {
        type: 'string',
        description: 'Timeframe for the feed (today, one-day, one-week, one-month, custom)',
        enum: ['today', 'one-day', 'one-week', 'one-month', 'custom'],
        default: 'one-week'
      },
      startDate: { type: 'string', description: 'Start date (YYYY-MM-DD) — required when timeframe is "custom"' },
      processType: { type: 'string', description: 'Process type filter' }
    }
  }
};
