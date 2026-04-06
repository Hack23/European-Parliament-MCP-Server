/**
 * MCP Tool: get_adopted_texts
 *
 * Retrieve European Parliament adopted texts (legislative resolutions,
 * positions, non-legislative resolutions).
 * Supports single document lookup by docId or list with year filtering.
 *
 * **Intelligence Perspective:** Adopted texts represent final legislative outputs—
 * tracking them enables assessment of legislative productivity and policy direction.
 *
 * **Business Perspective:** Adopted text monitoring powers regulatory compliance
 * products and legislative change management services.
 *
 * **EP API Endpoints:**
 * - `GET /adopted-texts` (list)
 * - `GET /adopted-texts/{doc-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetAdoptedTextsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_adopted_texts MCP tool request.
 *
 * Retrieves European Parliament adopted texts, including legislative resolutions,
 * first-reading positions, and non-legislative resolutions. Supports single document
 * lookup by docId or a paginated list optionally filtered by year.
 *
 * @param args - Raw tool arguments, validated against {@link GetAdoptedTextsSchema}
 * @returns MCP tool result containing either a single adopted text or a paginated list of adopted texts
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Single adopted text lookup
 * const result = await handleGetAdoptedTexts({ docId: 'P9-TA(2024)0001' });
 * // Returns the full record for the specified adopted text
 *
 * // List adopted texts from 2024
 * const list = await handleGetAdoptedTexts({ year: 2024, limit: 50 });
 * // Returns up to 50 adopted texts from 2024
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getAdoptedTextsToolMetadata} for MCP schema registration
 * @see {@link handleGetPlenarySessionDocumentItems} for retrieving in-session document items
 */
export async function handleGetAdoptedTexts(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetAdoptedTextsSchema.parse>;
  try {
    params = GetAdoptedTextsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_adopted_texts',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    if (params.docId !== undefined) {
      const result = await epClient.getAdoptedTextById(params.docId);
      return buildToolResponse(result);
    }

    const apiParams: Record<string, unknown> = {
      limit: params.limit,
      offset: params.offset,
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const result = await epClient.getAdoptedTexts(
      apiParams as Parameters<typeof epClient.getAdoptedTexts>[0]
    );

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_adopted_texts',
      operation: 'fetchData',
      message: 'Failed to retrieve adopted texts',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_adopted_texts */
export const getAdoptedTextsToolMetadata = {
  name: 'get_adopted_texts',
  description:
    'Get European Parliament adopted texts including legislative resolutions, positions, and non-legislative resolutions. Supports single document lookup by docId or list with year filter. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      docId: { type: 'string', description: 'Document ID for single adopted text lookup' },
      year: { type: 'number', description: 'Filter by year of adoption (e.g., 2024)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 },
    },
  },
};
