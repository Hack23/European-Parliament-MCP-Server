/**
 * MCP Tool: get_procedures
 *
 * Retrieve European Parliament legislative procedures.
 * Supports single procedure lookup by processId or paginated list.
 * Note: The EP API /procedures endpoint does not support year filtering.
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
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_procedures MCP tool request.
 *
 * Retrieves European Parliament legislative procedures enabling end-to-end legislative
 * tracking, outcome prediction, and timeline analysis. Supports both a single-procedure
 * lookup by `processId` and a paginated list.
 *
 * Note: The EP API `/procedures` endpoint does **not** support `year` filtering.
 * Only `process-type` is available.  Callers needing year-specific counts
 * must filter client-side.
 *
 * @param args - Raw tool arguments, validated against {@link GetProceduresSchema}
 * @returns MCP tool result containing procedure data (single procedure or paginated list)
 * @throws - If `args` fails schema validation (e.g., invalid field types or formats)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Single procedure lookup
 * const single = await handleGetProcedures({ processId: '2023/0132(COD)' });
 * // Returns the legislative procedure for the Artificial Intelligence Act
 *
 * // List procedures (no year filter available in the EP API)
 * const list = await handleGetProcedures({ limit: 50, offset: 0 });
 * // Returns up to 50 legislative procedures
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getProceduresToolMetadata} for MCP schema registration
 * @see {@link handleGetProcedureEvents} for retrieving events linked to a specific procedure
 */
export async function handleGetProcedures(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetProceduresSchema.parse>;
  try {
    params = GetProceduresSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_procedures',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    if (params.processId !== undefined) {
      const result = await epClient.getProcedureById(params.processId);
      return buildToolResponse(result);
    }

    const apiParams = {
      limit: params.limit,
      offset: params.offset,
    };

    const result = await epClient.getProcedures(
      apiParams
    );

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_procedures',
      operation: 'fetchData',
      message: 'Failed to retrieve procedures',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_procedures */
export const getProceduresToolMetadata = {
  name: 'get_procedures',
  description:
    'Get European Parliament legislative procedures. Supports single procedure lookup by processId or paginated list. Note: The EP API /procedures endpoint does not support year filtering. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      processId: { type: 'string', description: 'Process ID for single procedure lookup' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 },
    },
  },
};
