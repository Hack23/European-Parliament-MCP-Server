/**
 * MCP Tool: get_mep_declarations
 *
 * Retrieve MEP declarations of financial interests.
 * Supports single declaration lookup by docId or list with year filtering.
 *
 * **Intelligence Perspective:** Financial declarations enable conflict-of-interest
 * detection, lobbying pattern analysis, and transparency assessment for MEP profiling.
 *
 * **Business Perspective:** Declaration data supports compliance monitoring products
 * and corporate governance risk assessment services.
 *
 * **EP API Endpoints:**
 * - `GET /meps-declarations` (list)
 * - `GET /meps-declarations/{doc-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), DP-001 (Data Protection)
 * @gdpr Access is audit-logged per GDPR Art. 6(1)(e)
 */

import { GetMEPDeclarationsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_mep_declarations MCP tool request.
 *
 * Retrieves MEP declarations of financial interests filed under the Rules of Procedure.
 * Supports both single-declaration lookup by document ID and list retrieval with optional
 * year filtering. Financial declaration data enables conflict-of-interest detection,
 * lobbying pattern analysis, and transparency assessments.
 *
 * @param args - Raw tool arguments, validated against {@link GetMEPDeclarationsSchema}
 * @returns MCP tool result containing either a single MEP financial declaration document
 *   or a paginated list of declarations, optionally filtered by filing year
 * @throws - If `args` fails schema validation (e.g., invalid year or limit
 *   out of range 1–100)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // List declarations for a specific year
 * const result = await handleGetMEPDeclarations({ year: 2024, limit: 20 });
 * // Returns up to 20 financial declarations filed in 2024
 *
 * // Fetch a single declaration by document ID
 * const single = await handleGetMEPDeclarations({ docId: 'DECL-2024-001' });
 * // Returns the full declaration document
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Access to financial declarations (personal data) is audit-logged per GDPR Art. 6(1)(e)
 *   and ISMS Policy AU-002. Data minimisation applied per GDPR Article 5(1)(c).
 * @since 0.8.0
 * @see {@link getMEPDeclarationsToolMetadata} for MCP schema registration
 * @see {@link handleGetMEPDetails} for retrieving broader MEP profile information
 */
export async function handleGetMEPDeclarations(
  args: unknown
): Promise<ToolResult> {
  const params = GetMEPDeclarationsSchema.parse(args);

  if (params.docId !== undefined) {
    const result = await epClient.getMEPDeclarationById(params.docId);
    return buildToolResponse(result);
  }

  const apiParams: Record<string, unknown> = {
    limit: params.limit,
    offset: params.offset
  };
  if (params.year !== undefined) apiParams['year'] = params.year;

  const result = await epClient.getMEPDeclarations(apiParams as Parameters<typeof epClient.getMEPDeclarations>[0]);

  return buildToolResponse(result);
}

/** Tool metadata for get_mep_declarations */
export const getMEPDeclarationsToolMetadata = {
  name: 'get_mep_declarations',
  description: 'Get MEP declarations of financial interests filed under the Rules of Procedure. Supports single declaration lookup by docId or list with year filter. Data source: European Parliament Open Data Portal. GDPR: Access is audit-logged.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      docId: { type: 'string', description: 'Document ID for single declaration lookup' },
      year: { type: 'number', description: 'Filter by filing year (e.g., 2024)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
