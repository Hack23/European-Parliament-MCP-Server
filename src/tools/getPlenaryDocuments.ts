/**
 * MCP Tool: get_plenary_documents
 *
 * Retrieve European Parliament plenary documents, with optional single document lookup.
 *
 * **Intelligence Perspective:** Plenary documents contain legislative texts, reports,
 * and amendments central to policy analysis and legislative tracking.
 *
 * **Business Perspective:** Provides access to legislative outputs for compliance
 * monitoring and regulatory intelligence products.
 *
 * **EP API Endpoints:**
 * - `GET /plenary-documents` (list)
 * - `GET /plenary-documents/{doc-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetPlenaryDocumentsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_plenary_documents MCP tool request.
 *
 * Retrieves European Parliament plenary documents including legislative texts, reports, and
 * amendments. Supports both single-document lookup by document ID and list retrieval with
 * optional year filtering. Central to policy analysis and legislative tracking workflows.
 *
 * @param args - Raw tool arguments, validated against {@link GetPlenaryDocumentsSchema}
 * @returns MCP tool result containing either a single plenary document (when `docId` is
 *   provided) or a paginated list of documents, optionally filtered by year
 * @throws {ZodError} If `args` fails schema validation (e.g., limit out of range 1–100)
 * @throws {Error} If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // List documents for a specific year
 * const result = await handleGetPlenaryDocuments({ year: 2024, limit: 25 });
 * // Returns up to 25 plenary documents from 2024
 *
 * // Fetch a single document by ID
 * const single = await handleGetPlenaryDocuments({ docId: 'DOC-2024-001' });
 * // Returns the full plenary document record
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data in responses is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getPlenaryDocumentsToolMetadata} for MCP schema registration
 * @see {@link handleGetPlenarySessions} for the sessions associated with these documents
 * @see {@link handleGetPlenarySessionDocuments} for session-level agendas and minutes
 */
export async function handleGetPlenaryDocuments(
  args: unknown
): Promise<ToolResult> {
  const params = GetPlenaryDocumentsSchema.parse(args);

  if (params.docId !== undefined) {
    const result = await epClient.getPlenaryDocumentById(params.docId);
    return buildToolResponse(result);
  }

  const apiParams: Record<string, unknown> = {
    limit: params.limit,
    offset: params.offset
  };
  if (params.year !== undefined) apiParams['year'] = params.year;

  const result = await epClient.getPlenaryDocuments(apiParams as Parameters<typeof epClient.getPlenaryDocuments>[0]);

  return buildToolResponse(result);
}

/** Tool metadata for get_plenary_documents */
export const getPlenaryDocumentsToolMetadata = {
  name: 'get_plenary_documents',
  description: 'Get European Parliament plenary documents. Supports single document lookup by docId or list with year filter. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      docId: { type: 'string', description: 'Document ID for single document lookup' },
      year: { type: 'number', description: 'Filter by year' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
