/**
 * MCP Tool: get_plenary_session_documents
 *
 * Retrieve European Parliament plenary session documents, with optional single document lookup.
 *
 * **Intelligence Perspective:** Session documents contain agendas, minutes, and voting
 * lists for plenary sessions—core data for parliamentary activity monitoring.
 *
 * **Business Perspective:** Provides session-level documentation for compliance
 * tracking and meeting intelligence products.
 *
 * **EP API Endpoints:**
 * - `GET /plenary-session-documents` (list)
 * - `GET /plenary-session-documents/{doc-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetPlenarySessionDocumentsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_plenary_session_documents MCP tool request.
 *
 * Retrieves European Parliament plenary session documents such as agendas, minutes, and
 * voting lists. Supports both single-document lookup by document ID and paginated list
 * retrieval. Core data source for parliamentary activity monitoring and meeting intelligence.
 *
 * @param args - Raw tool arguments, validated against {@link GetPlenarySessionDocumentsSchema}
 * @returns MCP tool result containing either a single plenary session document (when `docId`
 *   is provided) or a paginated list of session documents including agendas, minutes, and
 *   voting lists
 * @throws - If `args` fails schema validation (e.g., limit out of range 1–100)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // List the most recent session documents
 * const result = await handleGetPlenarySessionDocuments({ limit: 10, offset: 0 });
 * // Returns up to 10 plenary session documents (agendas, minutes, voting lists)
 *
 * // Fetch a single session document by ID
 * const single = await handleGetPlenarySessionDocuments({ docId: 'SESS-DOC-2024-042' });
 * // Returns the full session document record
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getPlenarySessionDocumentsToolMetadata} for MCP schema registration
 * @see {@link handleGetPlenarySessions} for the sessions these documents belong to
 * @see {@link handleGetPlenaryDocuments} for broader legislative plenary documents
 */
export async function handleGetPlenarySessionDocuments(
  args: unknown
): Promise<ToolResult> {
  const params = GetPlenarySessionDocumentsSchema.parse(args);

  if (params.docId !== undefined) {
    const result = await epClient.getPlenarySessionDocumentById(params.docId);
    return buildToolResponse(result);
  }

  const result = await epClient.getPlenarySessionDocuments({
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_plenary_session_documents */
export const getPlenarySessionDocumentsToolMetadata = {
  name: 'get_plenary_session_documents',
  description: 'Get European Parliament plenary session documents (agendas, minutes, voting lists). Supports single document lookup by docId. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      docId: { type: 'string', description: 'Document ID for single document lookup' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
