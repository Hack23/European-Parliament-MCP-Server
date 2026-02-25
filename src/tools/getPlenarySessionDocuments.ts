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
 * Get plenary session documents tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with plenary session document data
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
