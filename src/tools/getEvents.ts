/**
 * MCP Tool: get_events
 *
 * Retrieve European Parliament events (hearings, conferences, seminars).
 * Supports single event lookup by eventId or list with date range filtering.
 *
 * **Intelligence Perspective:** Event monitoring enables early detection of emerging
 * policy priorities and stakeholder engagement patterns.
 *
 * **Business Perspective:** Event data powers calendar integration and stakeholder
 * engagement tracking products.
 *
 * **EP API Endpoints:**
 * - `GET /events` (list)
 * - `GET /events/{event-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetEventsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Get events tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with event data
 */
export async function handleGetEvents(
  args: unknown
): Promise<ToolResult> {
  const params = GetEventsSchema.parse(args);

  if (params.eventId !== undefined) {
    const result = await epClient.getEventById(params.eventId);
    return buildToolResponse(result);
  }

  const apiParams: Record<string, unknown> = {
    limit: params.limit,
    offset: params.offset
  };
  if (params.dateFrom !== undefined) apiParams['dateFrom'] = params.dateFrom;
  if (params.dateTo !== undefined) apiParams['dateTo'] = params.dateTo;

  const result = await epClient.getEvents(apiParams as Parameters<typeof epClient.getEvents>[0]);

  return buildToolResponse(result);
}

/** Tool metadata for get_events */
export const getEventsToolMetadata = {
  name: 'get_events',
  description: 'Get European Parliament events including hearings, conferences, seminars, and institutional events. Supports single event lookup by eventId or list with date range filtering. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      eventId: { type: 'string', description: 'Event ID for single event lookup' },
      dateFrom: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
      dateTo: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
