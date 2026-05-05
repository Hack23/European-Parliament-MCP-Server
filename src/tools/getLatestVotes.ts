/**
 * MCP Tool: get_latest_votes
 *
 * Retrieve the latest plenary votes from European Parliament DOCEO XML documents.
 * This provides more recent data than the standard EP Open Data API, which has
 * a publication delay of several weeks for roll-call voting data.
 *
 * **Data Sources:**
 * - RCV (Roll-Call Votes): Individual MEP positions by political group
 * - VOT (Vote Results): Aggregate tallies with vote outcomes
 *
 * **Intelligence Perspective:** Near-real-time voting intelligence enabling rapid
 * coalition analysis, political group cohesion tracking, and early detection of
 * political shifts within hours of votes being cast.
 *
 * **Business Perspective:** Premium data freshness differentiator — provides
 * vote data days/weeks before the EP Open Data API publishes it.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { doceoClient } from '../clients/ep/doceoClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import type { ToolResult } from './shared/types.js';

/**
 * Input schema for get_latest_votes tool.
 */
export const GetLatestVotesSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Specific date to fetch votes for (YYYY-MM-DD). If omitted, fetches the most recent plenary week.'),
  weekStart: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Monday of a specific plenary week (YYYY-MM-DD). Fetches Mon-Thu of that week.'),
  term: z.number()
    .int()
    .min(1)
    .max(15)
    .optional()
    .describe('Parliamentary term number (defaults to 10 for current 2024-2029 term)'),
  includeIndividualVotes: z.boolean()
    .optional()
    .default(true)
    .describe('Include individual MEP vote positions from roll-call data (default: true)'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum number of vote records to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset'),
}).strict();

/**
 * Handles the get_latest_votes MCP tool request.
 *
 * Fetches the latest plenary vote data from the EP DOCEO XML system,
 * providing near-real-time access to roll-call votes and vote results.
 * This data source is fresher than the EP Open Data API which has a
 * multi-week publication delay.
 *
 * @param args - Raw tool arguments, validated against GetLatestVotesSchema
 * @returns MCP tool result with latest vote records
 *
 * @example
 * ```typescript
 * // Get votes from the most recent plenary week
 * const result = await handleGetLatestVotes({});
 *
 * // Get votes for a specific date
 * const result = await handleGetLatestVotes({ date: '2026-04-27' });
 *
 * // Get a specific plenary week without individual MEP positions
 * const result = await handleGetLatestVotes({
 *   weekStart: '2026-04-27',
 *   includeIndividualVotes: false
 * });
 * ```
 */
export async function handleGetLatestVotes(args: unknown): Promise<ToolResult> {
  let params: z.infer<typeof GetLatestVotesSchema>;
  try {
    params = GetLatestVotesSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues
        .map(issue => {
          const pathStr = issue.path.length > 0 ? issue.path.join('.') : '(root)';
          return `${pathStr}: ${issue.message}`;
        })
        .join('; ');
      throw new ToolError({
        toolName: 'get_latest_votes',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const result = await doceoClient.getLatestVotes({
      date: params.date,
      weekStart: params.weekStart,
      term: params.term,
      includeIndividualVotes: params.includeIndividualVotes,
      limit: params.limit,
      offset: params.offset,
    });

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_latest_votes',
      operation: 'fetchData',
      message: 'Failed to retrieve latest votes from DOCEO',
      isRetryable: true,
      cause: error instanceof Error ? error : undefined,
    });
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getLatestVotesToolMetadata = {
  name: 'get_latest_votes',
  description: 'Retrieve the latest plenary votes from EP DOCEO XML documents. Provides near-real-time access to roll-call votes (individual MEP positions by political group) and vote results (aggregate tallies). This data source is fresher than the EP Open Data API which has a multi-week publication delay. Use for up-to-date political intelligence on voting patterns, coalition analysis, and group cohesion tracking.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      date: {
        type: 'string',
        description: 'Specific date to fetch votes for (YYYY-MM-DD). If omitted, fetches the most recent plenary week (Mon-Thu).',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      weekStart: {
        type: 'string',
        description: 'Monday of a specific plenary week (YYYY-MM-DD). Fetches Mon-Thu of that week.',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      term: {
        type: 'number',
        description: 'Parliamentary term number (defaults to 10 for current 2024-2029 term)',
        minimum: 1,
        maximum: 15
      },
      includeIndividualVotes: {
        type: 'boolean',
        description: 'Include individual MEP vote positions from roll-call data (default: true). Set to false for aggregate-only results.',
        default: true
      },
      limit: {
        type: 'number',
        description: 'Maximum number of vote records to return (1-100)',
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
