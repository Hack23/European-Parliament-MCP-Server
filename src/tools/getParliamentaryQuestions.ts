/**
 * MCP Tool: get_parliamentary_questions
 * 
 * Retrieve European Parliament questions and answers
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetParliamentaryQuestionsSchema, ParliamentaryQuestionSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get parliamentary questions tool handler
 * 
 * @param args - Tool arguments
 * @returns MCP tool result with parliamentary question data
 * 
 * @example
 * ```json
 * {
 *   "type": "WRITTEN",
 *   "status": "ANSWERED",
 *   "topic": "climate policy",
 *   "limit": 20
 * }
 * ```
 */
export async function handleGetParliamentaryQuestions(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  // Validate input
  const params = GetParliamentaryQuestionsSchema.parse(args);
  
  try {
    // Fetch parliamentary questions from EP API (only pass defined properties)
    const apiParams: Record<string, unknown> = {
      limit: params.limit,
      offset: params.offset
    };
    if (params.type !== undefined) apiParams.type = params.type;
    if (params.author !== undefined) apiParams.author = params.author;
    if (params.topic !== undefined) apiParams.topic = params.topic;
    if (params.status !== undefined) apiParams.status = params.status;
    if (params.dateFrom !== undefined) apiParams.dateFrom = params.dateFrom;
    if (params.dateTo !== undefined) apiParams.dateTo = params.dateTo;
    
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
  description: 'Retrieve European Parliament questions (written and oral) submitted by MEPs. Filter by question type, author, topic, status (pending/answered), and date range. Returns question text, answers if available, and metadata.',
  inputSchema: {
    type: 'object' as const,
    properties: {
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
