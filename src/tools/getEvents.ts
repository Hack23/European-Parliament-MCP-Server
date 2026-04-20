/**
 * MCP Tool: get_events
 *
 * Retrieve European Parliament events (hearings, conferences, seminars).
 * Supports single event lookup by eventId or paginated list.
 *
 * **Note:** The EP API `/events` endpoint has **no** date filtering
 * (`year`, `date-from`, `date-to` are all unsupported).
 * Only pagination (limit/offset) is available.
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
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_events MCP tool request.
 *
 * Retrieves European Parliament events including hearings, conferences, and seminars.
 * Supports single event lookup by eventId or a paginated list.
 *
 * **Note:** The EP API `/events` endpoint has no date filtering.
 * Only pagination (limit/offset) is supported.
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
 * // List events (pagination only — no date filtering available)
 * const list = await handleGetEvents({ limit: 30, offset: 0 });
 * // Returns up to 30 EP events
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getEventsToolMetadata} for MCP schema registration
 * @see {@link handleGetMeetingActivities} for retrieving activities within a specific plenary sitting
 */
export async function handleGetEvents(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetEventsSchema.parse>;
  try {
    params = GetEventsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_events',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    if (params.eventId !== undefined) {
      const result = await epClient.getEventById(params.eventId);
      return buildToolResponse(result);
    }

    const apiParams: Record<string, unknown> = {
      limit: params.limit,
      offset: params.offset,
    };

    const result = await epClient.getEvents(apiParams);

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_events',
      operation: 'fetchData',
      message: 'Failed to retrieve events',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_events */
export const getEventsToolMetadata = {
  name: 'get_events',
  description:
    'Get European Parliament events including hearings, conferences, seminars, and institutional events. Supports single event lookup by eventId or paginated list. Note: The EP API /events endpoint has no date filtering — only pagination (limit/offset) is supported. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      eventId: { type: 'string', description: 'Event ID for single event lookup' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 },
    },
  },
};
