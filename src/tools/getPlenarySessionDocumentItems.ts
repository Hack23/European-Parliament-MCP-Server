/**
 * MCP Tool: get_plenary_session_document_items
 *
 * Retrieve European Parliament plenary session document items.
 *
 * **Intelligence Perspective:** Document items provide granular access to individual
 * items within plenary session documents for detailed legislative analysis.
 *
 * **Business Perspective:** Enables fine-grained document access for structured
 * legislative data products.
 *
 * **EP API Endpoint:** `GET /plenary-session-documents-items`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetPlenarySessionDocumentItemsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_plenary_session_document_items MCP tool request.
 *
 * Retrieves individual items within European Parliament plenary session documents,
 * enabling granular access to specific agenda or document entries within a session.
 *
 * @param args - Raw tool arguments, validated against {@link GetPlenarySessionDocumentItemsSchema}
 * @returns MCP tool result containing a paginated list of plenary session document items
 * @throws {ZodError} If `args` fails schema validation (e.g., missing required fields or invalid format)
 * @throws {Error} If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetPlenarySessionDocumentItems({ limit: 20, offset: 0 });
 * // Returns up to 20 plenary session document items from the EP Open Data Portal
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data in responses is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getPlenarySessionDocumentItemsToolMetadata} for MCP schema registration
 * @see {@link handleGetAdoptedTexts} for retrieving finalized plenary documents
 */
export async function handleGetPlenarySessionDocumentItems(
  args: unknown
): Promise<ToolResult> {
  const params = GetPlenarySessionDocumentItemsSchema.parse(args);

  const result = await epClient.getPlenarySessionDocumentItems({
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_plenary_session_document_items */
export const getPlenarySessionDocumentItemsToolMetadata = {
  name: 'get_plenary_session_document_items',
  description: 'Get European Parliament plenary session document items. Returns individual items within plenary session documents. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
