/**
 * MCP Tool: get_plenary_sessions
 * 
 * Retrieve European Parliament plenary session information
 * 
 * **Intelligence Perspective:** Critical for legislative monitoring, session activity tracking,
 * debate analysis, and identifying legislative priorities across parliamentary terms.
 * 
 * **Business Perspective:** Enables real-time legislative tracking products for compliance
 * teams, regulatory affairs departments, and policy monitoring services.
 * 
 * **Marketing Perspective:** Showcases live parliamentary data access—compelling for
 * journalists, media organizations, and civic tech platforms.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetPlenarySessionsSchema, PlenarySessionSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import type { ToolResult } from './shared/types.js';

/**
 * Get plenary sessions tool handler
 * 
 * @param args - Tool arguments
 * @returns MCP tool result with plenary session data
 * 
 * @example
 * ```json
 * {
 *   "dateFrom": "2024-01-01",
 *   "dateTo": "2024-12-31",
 *   "limit": 20
 * }
 * ```
 */
export async function handleGetPlenarySessions(
  args: unknown
): Promise<ToolResult> {
  // Validate input
  const params = GetPlenarySessionsSchema.parse(args);
  
  try {
    // Single meeting lookup by ID
    if (params.eventId !== undefined) {
      const result = await epClient.getMeetingById(params.eventId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }

    // Fetch plenary sessions from EP API (only pass defined properties)
    const apiParams: Record<string, unknown> = {
      limit: params.limit,
      offset: params.offset
    };
    if (params['dateFrom'] !== undefined) apiParams['dateFrom'] = params['dateFrom'];
    if (params['dateTo'] !== undefined) apiParams['dateTo'] = params['dateTo'];
    if (params['location'] !== undefined) apiParams['location'] = params['location'];
    
    const result = await epClient.getPlenarySessions(apiParams as Parameters<typeof epClient.getPlenarySessions>[0]);
    
    // Validate output
    const outputSchema = PaginatedResponseSchema(PlenarySessionSchema);
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
    throw new Error(`Failed to retrieve plenary sessions: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getPlenarySessionsToolMetadata = {
  name: 'get_plenary_sessions',
  description: 'Retrieve European Parliament plenary sessions/meetings. Supports single meeting lookup by eventId or list with date and location filters. Returns session details including date, location, agenda items, voting records, and attendance statistics.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      eventId: {
        type: 'string',
        description: 'Meeting event ID for single meeting lookup'
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
      location: {
        type: 'string',
        description: 'Session location (e.g., "Strasbourg", "Brussels")',
        minLength: 1,
        maxLength: 100
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
