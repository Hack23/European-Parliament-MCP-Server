/**
 * MCP Tool: get_homonym_meps
 *
 * Retrieve homonym Members of European Parliament for the current parliamentary term.
 *
 * **Intelligence Perspective:** Identifies MEPs with identical names, important for
 * disambiguation in intelligence analysis and data matching.
 *
 * **Business Perspective:** Ensures accurate MEP identification in products
 * that match MEP names across data sources.
 *
 * **EP API Endpoint:** `GET /meps/show-homonyms`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetHomonymMEPsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_homonym_meps MCP tool request.
 *
 * Retrieves Members of European Parliament who share identical names with other MEPs in the
 * current parliamentary term. Essential for disambiguation in data matching, identity
 * resolution pipelines, and intelligence analysis workflows where name collisions could
 * produce incorrect entity linkage.
 *
 * @param args - Raw tool arguments, validated against {@link GetHomonymMEPsSchema}
 * @returns MCP tool result containing a paginated list of MEP records with homonymous names
 * @throws - If `args` fails schema validation (e.g., limit out of range 1–100)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetHomonymMEPs({ limit: 50, offset: 0 });
 * // Returns MEPs who share a name with at least one other MEP in the current term
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getHomonymMEPsToolMetadata} for MCP schema registration
 * @see {@link handleGetMEPDetails} for disambiguating a specific MEP by unique ID
 */
export async function handleGetHomonymMEPs(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetHomonymMEPsSchema.parse>;
  try {
    params = GetHomonymMEPsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_homonym_meps',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const result = await epClient.getHomonymMEPs({
      limit: params.limit,
      offset: params.offset,
    });

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_homonym_meps',
      operation: 'fetchData',
      message: 'Failed to retrieve homonym MEPs',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_homonym_meps */
export const getHomonymMEPsToolMetadata = {
  name: 'get_homonym_meps',
  description:
    'Get homonym Members of European Parliament (MEPs with identical names) for the current parliamentary term. Useful for name disambiguation. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 },
    },
  },
};
