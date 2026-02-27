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
 * Handles the get_events MCP tool request.
 *
 * Retrieves European Parliament events including hearings, conferences, and seminars.
 * Supports single event lookup by eventId or a paginated list filtered by date range.
 *
 * @param args - Raw tool arguments, validated against {@link GetEventsSchema}
 * @returns MCP tool result containing either a single event record or a paginated list of EP events
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Single event lookup
 * const result = await handleGetEvents({ eventId: 'EVT-2024-001' });
 * // Returns the full record for the specified event
 *
 * // List events within a date range
 * const list = await handleGetEvents({ dateFrom: '2024-06-01', dateTo: '2024-06-30', limit: 30 });
 * // Returns up to 30 EP events in June 2024
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getEventsToolMetadata} for MCP schema registration
 * @see {@link handleGetMeetingActivities} for retrieving activities within a specific plenary sitting
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
