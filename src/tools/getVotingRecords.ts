/**
 * MCP Tool: get_voting_records
 * 
 * Retrieve voting records from European Parliament plenary sessions
 * 
 * **Intelligence Perspective:** Core intelligence product for voting pattern analysis,
 * political group cohesion measurement, cross-party alliance detection, and MEP
 * loyalty/independence scoring through structured analytic techniques.
 * 
 * **Business Perspective:** High-value data product for political risk assessment firms,
 * policy analysis consultancies, and corporate government affairs departments.
 * 
 * **Marketing Perspective:** Most compelling data for data journalism partnerships,
 * academic research collaborations, and transparency advocacy organizations.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetVotingRecordsSchema, VotingRecordSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { buildApiParams } from './shared/paramBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Format a list of Zod issues into a single human-readable string.
 *
 * Root-level issues (e.g. `unrecognized_keys` produced by `.strict()`) have
 * an empty `path` array; rendering them as `path.join('.')` would yield
 * `: message` with a misleading leading colon. We substitute `(root)` for
 * such issues so the error reads `(root): Unrecognized key(s) ...`.
 */
function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map(issue => {
      const pathStr = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `${pathStr}: ${issue.message}`;
    })
    .join('; ');
}

/**
 * Handles the get_voting_records MCP tool request.
 *
 * Retrieves voting records from European Parliament plenary sessions, supporting
 * filtering by session, topic, and date range. Returns aggregate vote tallies
 * (for/against/abstain) and final results. The EP API only provides aggregate
 * vote counts, not individual MEP positions.
 *
 * @param args - Raw tool arguments, validated against {@link GetVotingRecordsSchema}
 * @returns MCP tool result containing a paginated list of voting records with vote counts and results
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetVotingRecords({
 *   sessionId: 'PLENARY-2024-01',
 *   topic: 'Climate Change',
 *   limit: 20
 * });
 * // Returns voting records for the January 2024 plenary session on climate topics
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getVotingRecordsToolMetadata} for MCP schema registration
 * @see [handleGetMeetingDecisions](../../getMeetingDecisions/functions/handleGetMeetingDecisions.md) for retrieving decisions linked to a specific sitting
 */
export async function handleGetVotingRecords(
  args: unknown
): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetVotingRecordsSchema.parse>;
  try {
    params = GetVotingRecordsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = formatZodIssues(error);
      throw new ToolError({
        toolName: 'get_voting_records',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    // Fetch voting records from EP API (only pass defined properties)
    const apiParams = {
      limit: params.limit,
      offset: params.offset,
      ...buildApiParams(params, [
        { from: 'sessionId', to: 'sessionId' },
        { from: 'topic', to: 'topic' },
        { from: 'dateFrom', to: 'dateFrom' },
        { from: 'dateTo', to: 'dateTo' },
      ]),
    };
    
    const result = await epClient.getVotingRecords(apiParams);
    
    // Validate output
    const outputSchema = PaginatedResponseSchema(VotingRecordSchema);
    const validated = outputSchema.parse(result);

    return buildToolResponse(validated);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = formatZodIssues(error);
      throw new ToolError({
        toolName: 'get_voting_records',
        operation: 'validateOutput',
        message: `Unexpected EP API response format: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw new ToolError({
      toolName: 'get_voting_records',
      operation: 'fetchData',
      message: 'Failed to retrieve voting records',
      isRetryable: true,
      cause: error,
    });
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getVotingRecordsToolMetadata = {
  name: 'get_voting_records',
  description: 'Retrieve voting records from European Parliament plenary sessions. Filter by session, topic, or date range. Returns aggregate vote counts (for/against/abstain) and final result. The EP API only provides aggregate vote tallies, not individual MEP positions. NOTE: The EP publishes roll-call voting data with a delay of several weeks, so queries for the most recent 1-2 months may return empty results — this is expected EP API behavior, not an error.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sessionId: {
        type: 'string',
        description: 'Plenary session identifier',
        minLength: 1,
        maxLength: 100
      },
      topic: {
        type: 'string',
        description: 'Vote topic or keyword to search',
        minLength: 1,
        maxLength: 200
      },
      dateFrom: {
        type: 'string',
        description: 'Start date filter (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      dateTo: {
        type: 'string',
        description: 'End date filter (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 50
      },
      offset: {
        type: 'number',
        description: 'Pagination offset',
        minimum: 0,
        default: 0
      }
    }
  }
};
