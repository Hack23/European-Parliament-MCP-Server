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

/**
 * Get plenary documents tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with plenary document data
 */
export async function handleGetPlenaryDocuments(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetPlenaryDocumentsSchema.parse(args);

  if (params.docId !== undefined) {
    const result = await epClient.getPlenaryDocumentById(params.docId);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  const apiParams: Record<string, unknown> = {
    limit: params.limit,
    offset: params.offset
  };
  if (params.year !== undefined) apiParams['year'] = params.year;

  const result = await epClient.getPlenaryDocuments(apiParams as Parameters<typeof epClient.getPlenaryDocuments>[0]);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
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
