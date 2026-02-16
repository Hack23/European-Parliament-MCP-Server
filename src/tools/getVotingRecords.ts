/**
 * MCP Tool: get_voting_records
 * 
 * Retrieve voting records from European Parliament plenary sessions
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetVotingRecordsSchema, VotingRecordSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get voting records tool handler
 * 
 * @param args - Tool arguments
 * @returns MCP tool result with voting record data
 * 
 * @example
 * ```json
 * {
 *   "sessionId": "PLENARY-2024-01",
 *   "topic": "Climate Change",
 *   "limit": 20
 * }
 * ```
 */
export async function handleGetVotingRecords(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  // Validate input
  const params = GetVotingRecordsSchema.parse(args);
  
  try {
    // Fetch voting records from EP API (only pass defined properties)
    const apiParams: Record<string, unknown> = {
      limit: params.limit,
      offset: params.offset
    };
    if (params.sessionId !== undefined) apiParams.sessionId = params.sessionId;
    if (params.mepId !== undefined) apiParams.mepId = params.mepId;
    if (params.topic !== undefined) apiParams.topic = params.topic;
    if (params.dateFrom !== undefined) apiParams.dateFrom = params.dateFrom;
    if (params.dateTo !== undefined) apiParams.dateTo = params.dateTo;
    
    const result = await epClient.getVotingRecords(apiParams as Parameters<typeof epClient.getVotingRecords>[0]);
    
    // Validate output
    const outputSchema = PaginatedResponseSchema(VotingRecordSchema);
    const validated = outputSchema.parse(result);
    
    // Return MCP-compliant response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(validated, null, 2)
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
