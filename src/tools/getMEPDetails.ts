/**
 * MCP Tool: get_mep_details
 * 
 * Retrieve detailed information about a specific MEP
 * 
 * **Intelligence Perspective:** Enables deep-dive MEP profiling including voting statistics,
 * committee memberships, political group alignment, and behavioral pattern analysis for
 * individual actor intelligence assessments.
 * 
 * **Business Perspective:** Powers premium MEP profile products for corporate affairs teams,
 * lobbyists, and political consultancies requiring comprehensive stakeholder intelligence.
 * 
 * **Marketing Perspective:** Demonstrates depth of EP data access—key differentiator
 * for attracting enterprise customers and academic researchers.
 * 
 * ISMS Policy: SC-002 (Input Validation), AU-002 (Audit Logging), GDPR Compliance
 */

import { GetMEPDetailsSchema, MEPDetailsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_mep_details MCP tool request.
 *
 * Retrieves comprehensive information about a single MEP identified by their unique ID,
 * including biography, contact details, committee memberships, voting statistics, and
 * parliamentary activities. Access to personal data is audit-logged for GDPR compliance.
 *
 * @param args - Raw tool arguments, validated against {@link GetMEPDetailsSchema}
 * @returns MCP tool result containing detailed MEP profile data including biography,
 *   contact information, committee roles, voting record, and activity statistics
 * @throws {ZodError} If `args` fails schema validation (e.g., missing or empty `id` field)
 * @throws {Error} If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetMEPDetails({ id: 'MEP-124810' });
 * // Returns full profile for MEP 124810, including committees and voting stats
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data (biography, contact info) access is audit-logged per GDPR Art. 5(2)
 *   and ISMS Policy AU-002. Data minimisation applied per GDPR Article 5(1)(c).
 * @since 0.8.0
 * @see {@link getMEPDetailsToolMetadata} for MCP schema registration
 * @see {@link handleGetMEPs} for listing MEPs and obtaining valid IDs
 */
export async function handleGetMEPDetails(
  args: unknown
): Promise<ToolResult> {
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
  } catch (error) {
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
    type: 'object' as const,
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
