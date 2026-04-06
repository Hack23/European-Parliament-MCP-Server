/**
 * MCP Tool: get_meeting_decisions
 *
 * Retrieve decisions made in a specific EP plenary sitting.
 *
 * **Intelligence Perspective:** Decision tracking enables analysis of voting outcomes,
 * legislative success rates, and political group alignment on specific items.
 *
 * **Business Perspective:** Decision data powers compliance monitoring and regulatory
 * change detection services.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMeetingDecisionsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_meeting_decisions MCP tool request.
 *
 * Retrieves decisions made in a specific European Parliament plenary sitting,
 * including adopted decisions and voting outcomes. Requires a sitting identifier.
 *
 * @param args - Raw tool arguments, validated against {@link GetMeetingDecisionsSchema}
 * @returns MCP tool result containing a paginated list of decisions from the specified plenary sitting
 * @throws - If `args` fails schema validation (e.g., missing required `sittingId` or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetMeetingDecisions({ sittingId: 'PV-9-2024-01-15', limit: 50 });
 * // Returns up to 50 decisions from the specified plenary sitting
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getMeetingDecisionsToolMetadata} for MCP schema registration
 * @see {@link handleGetMeetingActivities} for retrieving the broader agenda of the same sitting
 */
export async function handleGetMeetingDecisions(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetMeetingDecisionsSchema.parse>;
  try {
    params = GetMeetingDecisionsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_meeting_decisions',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const result = await epClient.getMeetingDecisions(params.sittingId, {
      limit: params.limit,
      offset: params.offset,
    });

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_meeting_decisions',
      operation: 'fetchData',
      message: 'Failed to retrieve meeting decisions',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_meeting_decisions */
export const getMeetingDecisionsToolMetadata = {
  name: 'get_meeting_decisions',
  description:
    'Get decisions made in a specific EP plenary sitting. Returns adopted decisions and voting outcomes. Requires a sitting ID. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sittingId: { type: 'string', description: 'Meeting / sitting identifier (required)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 },
    },
    required: ['sittingId'],
  },
};
