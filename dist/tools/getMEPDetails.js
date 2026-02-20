/**
 * MCP Tool: get_mep_details
 *
 * Retrieve detailed information about a specific MEP
 *
 * ISMS Policy: SC-002 (Input Validation), AU-002 (Audit Logging), GDPR Compliance
 */
import { GetMEPDetailsSchema, MEPDetailsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
/**
 * Get MEP details tool handler
 *
 * @param args - Tool arguments
 * @returns MCP tool result with detailed MEP data
 *
 * @example
 * ```json
 * {
 *   "id": "MEP-124810"
 * }
 * ```
 */
export async function handleGetMEPDetails(args) {
    // Validate input
    const params = GetMEPDetailsSchema.parse(args);
    try {
        // Fetch MEP details from EP API
        const result = await epClient.getMEPDetails(params.id);
        // Validate output
        const validated = MEPDetailsSchema.parse(result);
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
        throw new Error(`Failed to retrieve MEP details: ${errorMessage}`);
    }
}
/**
 * Tool metadata for MCP registration
 */
export const getMEPDetailsToolMetadata = {
    name: 'get_mep_details',
    description: 'Retrieve detailed information about a specific Member of European Parliament including biography, contact information, committee memberships, voting statistics, and parliamentary activities. Personal data access is logged for GDPR compliance.',
    inputSchema: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'MEP identifier (e.g., "MEP-124810")',
                minLength: 1,
                maxLength: 100
            }
        },
        required: ['id']
    }
};
//# sourceMappingURL=getMEPDetails.js.map