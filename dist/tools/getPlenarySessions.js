/**
 * MCP Tool: get_plenary_sessions
 *
 * Retrieve European Parliament plenary session information
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
import { GetPlenarySessionsSchema, PlenarySessionSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
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
export async function handleGetPlenarySessions(args) {
    // Validate input
    const params = GetPlenarySessionsSchema.parse(args);
    try {
        // Fetch plenary sessions from EP API (only pass defined properties)
        const apiParams = {
            limit: params.limit,
            offset: params.offset
        };
        if (params['dateFrom'] !== undefined)
            apiParams['dateFrom'] = params['dateFrom'];
        if (params['dateTo'] !== undefined)
            apiParams['dateTo'] = params['dateTo'];
        if (params['location'] !== undefined)
            apiParams['location'] = params['location'];
        const result = await epClient.getPlenarySessions(apiParams);
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
    }
    catch (error) {
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
    description: 'Retrieve European Parliament plenary sessions with optional date and location filters. Returns session details including date, location, agenda items, voting records, and attendance statistics.',
    inputSchema: {
        type: 'object',
        properties: {
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
//# sourceMappingURL=getPlenarySessions.js.map