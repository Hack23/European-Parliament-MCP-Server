/**
 * MCP Tool: get_committee_info
 * 
 * Retrieve European Parliament committee information
 * 
 * **Intelligence Perspective:** Maps committee power structures, membership networks,
 * and policy domain specialization for institutional analysis and influence mapping.
 * 
 * **Business Perspective:** Powers committee monitoring products for industry associations,
 * trade groups, and corporate government affairs tracking specific policy areas.
 * 
 * **Marketing Perspective:** Highlights structured access to EP's 20+ standing committees—
 * compelling for policy monitoring platforms and civic tech integrations.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetCommitteeInfoSchema, CommitteeSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { buildApiParams } from './shared/paramBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_committee_info MCP tool request.
 *
 * Retrieves European Parliament committee (corporate body) information including
 * composition, chair, vice-chairs, members, meeting schedules, and policy areas.
 * Supports lookup by committee ID, abbreviation, or listing all current active bodies.
 *
 * @param args - Raw tool arguments, validated against {@link GetCommitteeInfoSchema}
 * @returns MCP tool result containing committee details or a list of current active corporate bodies
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Lookup by abbreviation
 * const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
 * // Returns detailed info for the Environment Committee
 *
 * // List all current active bodies
 * const all = await handleGetCommitteeInfo({ showCurrent: true });
 * // Returns all currently active EP corporate bodies
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getCommitteeInfoToolMetadata} for MCP schema registration
 * @see {@link handleGetCommitteeDocuments} for retrieving documents produced by committees
 */
export async function handleGetCommitteeInfo(
  args: unknown
): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetCommitteeInfoSchema.parse>;
  try {
    params = GetCommitteeInfoSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_committee_info',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    // Return current active bodies if showCurrent is true
    if (params.showCurrent === true) {
      const result = await epClient.getCurrentCorporateBodies();
      return buildToolResponse(result);
    }

    // Fetch committee info from EP API (only pass defined properties)
    const apiParams = buildApiParams(params, [
      { from: 'id', to: 'id' },
      { from: 'abbreviation', to: 'abbreviation' },
    ]);
    
    const result = await epClient.getCommitteeInfo(apiParams as Parameters<typeof epClient.getCommitteeInfo>[0]);
    
    // Validate output
    const validated = CommitteeSchema.parse(result);
    
    return buildToolResponse(validated);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_committee_info',
        operation: 'validateOutput',
        message: `Unexpected EP API response format: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw new ToolError({
      toolName: 'get_committee_info',
      operation: 'fetchData',
      message: 'Failed to retrieve committee information',
      isRetryable: true,
      cause: error,
    });
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getCommitteeInfoToolMetadata = {
  name: 'get_committee_info',
  description: 'Retrieve detailed information about EP corporate bodies/committees. Query by ID, abbreviation, or set showCurrent=true for all current active bodies. Returns composition, chair, vice-chairs, members, meeting schedules, and areas of responsibility.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'Committee identifier',
        minLength: 1,
        maxLength: 100
      },
      abbreviation: {
        type: 'string',
        description: 'Committee abbreviation (e.g., "ENVI", "AGRI", "ECON")',
        minLength: 1,
        maxLength: 20
      },
      showCurrent: {
        type: 'boolean',
        description: 'If true, returns all current active corporate bodies',
        default: false
      }
    }
  }
};
