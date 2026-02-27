/**
 * MCP Tool: get_parliamentary_questions
 * 
 * Retrieve European Parliament questions and answers
 * 
 * **Intelligence Perspective:** Reveals MEP policy priorities, Commission/Council scrutiny
 * patterns, and emerging political concerns through question topic analysis and frequency.
 * 
 * **Business Perspective:** Enables regulatory early-warning products—questions often signal
 * upcoming policy initiatives, making this valuable for compliance and government affairs.
 * 
 * **Marketing Perspective:** Unique dataset showcasing democratic accountability—ideal
 * for transparency advocates, investigative journalists, and academic researchers.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetParliamentaryQuestionsSchema, ParliamentaryQuestionSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_parliamentary_questions MCP tool request.
 *
 * Retrieves European Parliament questions (written and oral) submitted by MEPs,
 * with optional single-question lookup by docId or list filtering by type, author,
 * topic, status, and date range.
 *
 * @param args - Raw tool arguments, validated against {@link GetParliamentaryQuestionsSchema}
 * @returns MCP tool result containing either a single question record or a paginated list of parliamentary questions
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // List answered written questions on climate policy
 * const result = await handleGetParliamentaryQuestions({
 *   type: 'WRITTEN',
 *   status: 'ANSWERED',
 *   topic: 'climate policy',
 *   limit: 20
 * });
 * // Returns up to 20 answered written questions matching the topic
 *
 * // Single question lookup
 * const single = await handleGetParliamentaryQuestions({ docId: 'E-000001/2024' });
 * // Returns the full record for the specified question
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getParliamentaryQuestionsToolMetadata} for MCP schema registration
 * @see {@link handleGetVotingRecords} for retrieving plenary voting data
 */
export async function handleGetParliamentaryQuestions(
  args: unknown
): Promise<ToolResult> {
  // Validate input
  const params = GetParliamentaryQuestionsSchema.parse(args);
  
  try {
    // Single question lookup by ID
    if (params.docId !== undefined) {
      const result = await epClient.getParliamentaryQuestionById(params.docId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }

    // Fetch parliamentary questions from EP API (only pass defined properties)
    const apiParams: Record<string, unknown> = {
      limit: params.limit,
      offset: params.offset
    };
    if (params['type'] !== undefined) apiParams['type'] = params['type'];
    if (params['author'] !== undefined) apiParams['author'] = params['author'];
    if (params['topic'] !== undefined) apiParams['topic'] = params['topic'];
    if (params['status'] !== undefined) apiParams['status'] = params['status'];
    if (params['dateFrom'] !== undefined) apiParams['dateFrom'] = params['dateFrom'];
    if (params['dateTo'] !== undefined) apiParams['dateTo'] = params['dateTo'];
    
    const result = await epClient.getParliamentaryQuestions(apiParams as Parameters<typeof epClient.getParliamentaryQuestions>[0]);
    
    // Validate output
    const outputSchema = PaginatedResponseSchema(ParliamentaryQuestionSchema);
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
    throw new Error(`Failed to retrieve parliamentary questions: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getParliamentaryQuestionsToolMetadata = {
  name: 'get_parliamentary_questions',
  description: 'Retrieve European Parliament questions (written and oral) submitted by MEPs, or a single question by docId. Filter by question type, author, topic, status (pending/answered), and date range. Returns question text, answers if available, and metadata.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      docId: {
        type: 'string',
        description: 'Document ID for single question lookup'
      },
      type: {
        type: 'string',
        description: 'Question type',
        enum: ['WRITTEN', 'ORAL']
      },
      author: {
        type: 'string',
        description: 'MEP identifier or name of question author',
        minLength: 1,
        maxLength: 100
      },
      topic: {
        type: 'string',
        description: 'Question topic or keyword to search',
        minLength: 1,
        maxLength: 200
      },
      status: {
        type: 'string',
        description: 'Question status',
        enum: ['PENDING', 'ANSWERED']
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
