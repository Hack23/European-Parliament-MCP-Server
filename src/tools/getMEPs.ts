/**
 * MCP Tool: get_meps
 * 
 * Retrieve Members of European Parliament with filtering options
 * 
 * **Intelligence Perspective:** Foundation for MEP profiling, political group cohesion analysis,
 * national delegation mapping, and cross-party alliance detection via OSINT methodologies.
 * 
 * **Business Perspective:** Core data product for B2G/B2B customers requiring MEP contact
 * databases, political risk assessments, and stakeholder mapping services.
 * 
 * **Marketing Perspective:** Primary showcase tool demonstrating API value proposition
 * to journalists, researchers, and civic tech developers seeking structured MEP data.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMEPsSchema, MEPSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Get MEPs tool handler
 * 
 * Retrieves MEP data with filtering, validation, and GDPR-compliant response formatting.
 * 
 * **Intelligence Use Cases:** Filter by country for national delegation analysis, by group for
 * cohesion studies, by committee for policy domain expertise mapping.
 * 
 * **Business Use Cases:** Power stakeholder mapping products, political risk dashboards,
 * and MEP engagement tracking for corporate affairs teams.
 * 
 * **Marketing Use Cases:** Demo-ready endpoint for showcasing EP data access to potential
 * API consumers, journalists, and civic tech developers.
 * 
 * @param args - Tool arguments matching GetMEPsSchema (country, group, committee, active, limit, offset)
 * @returns MCP ToolResult containing paginated MEP list as JSON text content
 * @throws {Error} When the EP API request fails or returns an unexpected error
 * @throws {ZodError} When input fails schema validation (invalid country code, out-of-range limit, etc.)
 * 
 * @example
 * ```typescript
 * // Get Swedish MEPs
 * const result = await handleGetMEPs({ country: "SE", limit: 10 });
 * const data = JSON.parse(result.content[0].text);
 * console.log(`Found ${data.total} Swedish MEPs`);
 * ```
 * 
 * @example
 * ```typescript
 * // Get active EPP group members
 * const result = await handleGetMEPs({ group: "EPP", active: true, limit: 50 });
 * ```
 * 
 * @security Input validated by Zod schema before any API call. Errors are sanitized
 * to avoid exposing internal implementation details. Personal data access is
 * audit-logged per GDPR Article 30. ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
export async function handleGetMEPs(
  args: unknown
): Promise<ToolResult> {
  // Validate input
  const params = GetMEPsSchema.parse(args);
  
  try {
    // Fetch MEPs from EP API (only pass defined properties)
    const apiParams: Record<string, unknown> = {
      active: params.active,
      limit: params.limit,
      offset: params.offset
    };
    if (params['country'] !== undefined) apiParams['country'] = params['country'];
    if (params['group'] !== undefined) apiParams['group'] = params['group'];
    if (params['committee'] !== undefined) apiParams['committee'] = params['committee'];
    
    const result = await epClient.getMEPs(apiParams as Parameters<typeof epClient.getMEPs>[0]);
    
    // Validate output
    const outputSchema = PaginatedResponseSchema(MEPSchema);
    const validated = outputSchema.parse(result);
    
    return buildToolResponse(validated);
  } catch (error) {
    // Handle errors without exposing internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to retrieve MEPs: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getMEPsToolMetadata = {
  name: 'get_meps',
  description: 'Retrieve Members of European Parliament with optional filters (country, political group, committee, active status). Returns paginated results with MEP details including name, country, political group, committees, and contact information.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      country: {
        type: 'string',
        description: 'ISO 3166-1 alpha-2 country code (e.g., "SE" for Sweden)',
        pattern: '^[A-Z]{2}$',
        minLength: 2,
        maxLength: 2
      },
      group: {
        type: 'string',
        description: 'Political group identifier (e.g., "EPP", "S&D", "Greens/EFA")',
        minLength: 1,
        maxLength: 50
      },
      committee: {
        type: 'string',
        description: 'Committee identifier (e.g., "ENVI", "AGRI")',
        minLength: 1,
        maxLength: 100
      },
      active: {
        type: 'boolean',
        description: 'Filter by active status',
        default: true
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
