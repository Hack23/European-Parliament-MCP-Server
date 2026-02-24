/**
 * MCP Tool: get_external_documents
 *
 * Retrieve external documents (non-EP documents) from the European Parliament data portal,
 * with optional single document lookup.
 *
 * **Intelligence Perspective:** External documents include inter-institutional communications,
 * Council positions, and Commission proposals relevant to EP legislative work.
 *
 * **Business Perspective:** Provides access to external reference documents needed
 * for complete regulatory intelligence.
 *
 * **EP API Endpoints:**
 * - `GET /external-documents` (list)
 * - `GET /external-documents/{doc-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetExternalDocumentsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get external documents tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with external document data
 */
export async function handleGetExternalDocuments(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetExternalDocumentsSchema.parse(args);

  if (params.docId !== undefined) {
    const result = await epClient.getExternalDocumentById(params.docId);
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

  const result = await epClient.getExternalDocuments(apiParams as Parameters<typeof epClient.getExternalDocuments>[0]);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

/** Tool metadata for get_external_documents */
export const getExternalDocumentsToolMetadata = {
  name: 'get_external_documents',
  description: 'Get external documents (non-EP documents such as Council positions, Commission proposals) from the European Parliament data portal. Supports single document lookup by docId. Data source: European Parliament Open Data Portal.',
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
