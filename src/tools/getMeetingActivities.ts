/**
 * MCP Tool: get_meeting_activities
 *
 * Retrieve activities linked to a specific EP plenary sitting.
 *
 * **Intelligence Perspective:** Activity-level granularity enables precise tracking of
 * plenary agenda items, time allocation analysis, and priority assessment.
 *
 * **Business Perspective:** Meeting activity data powers agenda monitoring and
 * legislative scheduling intelligence products.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMeetingActivitiesSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_meeting_activities MCP tool request.
 *
 * Retrieves activities linked to a specific European Parliament plenary sitting,
 * such as debates, votes, and presentations. Requires a sitting identifier.
 *
 * @param args - Raw tool arguments, validated against {@link GetMeetingActivitiesSchema}
 * @returns MCP tool result containing a paginated list of activities for the specified plenary sitting
 * @throws - If `args` fails schema validation (e.g., missing required `sittingId` or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetMeetingActivities({ sittingId: 'PV-9-2024-01-15', limit: 50 });
 * // Returns up to 50 activities from the specified plenary sitting
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getMeetingActivitiesToolMetadata} for MCP schema registration
 * @see {@link handleGetMeetingDecisions} for retrieving decisions from the same sitting
 */
export async function handleGetMeetingActivities(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetMeetingActivitiesSchema.parse>;
  try {
    params = GetMeetingActivitiesSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_meeting_activities',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const result = await epClient.getMeetingActivities(params.sittingId, {
      limit: params.limit,
      offset: params.offset,
    });

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_meeting_activities',
      operation: 'fetchData',
      message: 'Failed to retrieve meeting activities',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_meeting_activities */
export const getMeetingActivitiesToolMetadata = {
  name: 'get_meeting_activities',
  description:
    'Get activities linked to a specific EP plenary sitting (debates, votes, presentations). Requires a sitting ID. Data source: European Parliament Open Data Portal.',
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
