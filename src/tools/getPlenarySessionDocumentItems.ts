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
 * Get plenary session document items tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with plenary session document items
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
