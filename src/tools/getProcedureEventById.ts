/**
 * MCP Tool: get_procedure_event_by_id
 *
 * Get a specific event linked to a legislative procedure.
 *
 * **EP API Endpoint:**
 * - `GET /procedures/{process-id}/events/{event-id}`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetProcedureEventByIdSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_procedure_event_by_id MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetProcedureEventByIdSchema}
 * @returns MCP tool result containing the procedure event data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetProcedureEventById(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetProcedureEventByIdSchema.parse>;
  try {
    params = GetProcedureEventByIdSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_procedure_event_by_id',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const result = await epClient.getProcedureEventById(params.processId, params.eventId);
    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_procedure_event_by_id',
      operation: 'fetchData',
      message: 'Failed to retrieve procedure event',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_procedure_event_by_id */
export const getProcedureEventByIdToolMetadata = {
  name: 'get_procedure_event_by_id',
  description:
    'Get a specific event linked to a legislative procedure. Returns a single event for the specified procedure and event identifiers. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      processId: { type: 'string', description: 'Procedure process ID' },
      eventId: { type: 'string', description: 'Event identifier' },
    },
    required: ['processId', 'eventId'],
  },
};
