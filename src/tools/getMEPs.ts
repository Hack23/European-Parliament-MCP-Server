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
import { buildApiParams } from './shared/paramBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_meps MCP tool request.
 *
 * Retrieves Members of European Parliament with optional filtering by country, political
 * group, committee, and active status. Results are paginated and GDPR-compliant.
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
 * @param args - Raw tool arguments, validated against {@link GetMEPsSchema}
 * @returns MCP tool result containing a paginated list of MEP records with name, country,
 *   political group, committee memberships, and contact information
 * @throws - If `args` fails schema validation (e.g., country code not 2 uppercase
 *   letters, limit out of range 1–100)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetMEPs({ country: 'SE', limit: 10 });
 * // Returns up to 10 Swedish MEPs with group and committee details
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getMEPsToolMetadata} for MCP schema registration
 * @see {@link handleGetMEPDetails} for retrieving full details of a single MEP
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
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetMEPsSchema.parse>;
  try {
    params = GetMEPsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_meps',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    // Fetch MEPs from EP API (only pass defined properties)
    const apiParams = {
      active: params.active,
      limit: params.limit,
      offset: params.offset,
      ...buildApiParams(params, [
        { from: 'country', to: 'country' },
        { from: 'group', to: 'group' },
        { from: 'committee', to: 'committee' },
      ]),
    };
    
    const result = await epClient.getMEPs(apiParams as Parameters<typeof epClient.getMEPs>[0]);
    
    // Validate output
    const outputSchema = PaginatedResponseSchema(MEPSchema);
    const validated = outputSchema.parse(result);
    
    return buildToolResponse(validated);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_meps',
        operation: 'validateOutput',
        message: `Unexpected EP API response format: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw new ToolError({
      toolName: 'get_meps',
      operation: 'fetchData',
      message: 'Failed to retrieve MEPs',
      isRetryable: true,
      cause: error,
    });
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
