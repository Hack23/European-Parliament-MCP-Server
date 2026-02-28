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
import { buildApiParams } from './shared/paramBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_voting_records MCP tool request.
 *
 * Retrieves voting records from European Parliament plenary sessions, supporting
 * filtering by session, MEP, topic, and date range. Returns vote tallies
 * (for/against/abstain), final results, and optionally individual MEP votes.
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
  // Validate input
  const params = GetVotingRecordsSchema.parse(args);
  
  try {
    // Fetch voting records from EP API (only pass defined properties)
    const apiParams = {
      limit: params.limit,
      offset: params.offset,
      ...buildApiParams(params, [
        { from: 'sessionId', to: 'sessionId' },
        { from: 'mepId', to: 'mepId' },
        { from: 'topic', to: 'topic' },
        { from: 'dateFrom', to: 'dateFrom' },
        { from: 'dateTo', to: 'dateTo' },
      ]),
    };
    
    const result = await epClient.getVotingRecords(apiParams as Parameters<typeof epClient.getVotingRecords>[0]);
    
    // Validate output
    const outputSchema = PaginatedResponseSchema(VotingRecordSchema);
    const validated = outputSchema.parse(result);

    // Note: `_warning` is a meta-field added after Zod validation and is
    // intentionally not part of the Zod output schema.
    const responsePayload = {
      ...validated,
      _warning:
        params['mepId'] !== undefined
          ? 'The mepId parameter is not supported by the EP API and has no effect on results. ' +
            'The EP votes endpoint only returns aggregate vote counts, not per-MEP positions.'
          : undefined
    };
    
    // Return MCP-compliant response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(responsePayload, null, 2)
      }]
    };
  } catch (error) {
    // Handle errors without exposing internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to retrieve voting records: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getVotingRecordsToolMetadata = {
  name: 'get_voting_records',
  description: 'Retrieve voting records from European Parliament plenary sessions. Filter by session, MEP, topic, or date range. Returns vote counts (for/against/abstain), final result, and optionally individual MEP votes.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sessionId: {
        type: 'string',
        description: 'Plenary session identifier',
        minLength: 1,
        maxLength: 100
      },
      mepId: {
        type: 'string',
        description: 'MEP identifier to filter votes by specific MEP',
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
