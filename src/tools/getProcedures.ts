/**
 * MCP Tool: get_procedures
 *
 * Retrieve European Parliament legislative procedures.
 * Supports single procedure lookup by processId or list with year filtering.
 *
 * **Intelligence Perspective:** Procedure data enables end-to-end legislative tracking,
 * outcome prediction, and timeline analysis—core for policy monitoring intelligence.
 *
 * **Business Perspective:** Procedure tracking powers legislative intelligence products,
 * regulatory risk assessments, and compliance early-warning systems.
 *
 * **EP API Endpoints:**
 * - `GET /procedures` (list)
 * - `GET /procedures/{process-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetProceduresSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_procedures MCP tool request.
 *
 * Retrieves European Parliament legislative procedures enabling end-to-end legislative
 * tracking, outcome prediction, and timeline analysis. Supports both a single-procedure
 * lookup by `processId` and a paginated list optionally filtered by year.
 *
 * @param args - Raw tool arguments, validated against {@link GetProceduresSchema}
 * @returns MCP tool result containing procedure data (single procedure or paginated list)
 * @throws {ZodError} If `args` fails schema validation (e.g., invalid field types or formats)
 * @throws {Error} If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Single procedure lookup
 * const single = await handleGetProcedures({ processId: '2023/0132(COD)' });
 * // Returns the legislative procedure for the Artificial Intelligence Act
 *
 * // List procedures from 2024
 * const list = await handleGetProcedures({ year: 2024, limit: 50, offset: 0 });
 * // Returns up to 50 legislative procedures initiated in 2024
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data in responses is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getProceduresToolMetadata} for MCP schema registration
 * @see {@link handleGetProcedureEvents} for retrieving events linked to a specific procedure
 */
export async function handleGetProcedures(
  args: unknown
): Promise<ToolResult> {
  const params = GetProceduresSchema.parse(args);

  if (params.processId !== undefined) {
    const result = await epClient.getProcedureById(params.processId);
    return buildToolResponse(result);
  }

  const apiParams: Record<string, unknown> = {
    limit: params.limit,
    offset: params.offset
  };
  if (params.year !== undefined) apiParams['year'] = params.year;

  const result = await epClient.getProcedures(apiParams as Parameters<typeof epClient.getProcedures>[0]);

  return buildToolResponse(result);
}

/** Tool metadata for get_procedures */
export const getProceduresToolMetadata = {
  name: 'get_procedures',
  description: 'Get European Parliament legislative procedures. Supports single procedure lookup by processId or list with year filter. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      processId: { type: 'string', description: 'Process ID for single procedure lookup' },
      year: { type: 'number', description: 'Filter by year (e.g., 2024)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
