/**
 * MCP Tool: get_committee_documents
 *
 * Retrieve European Parliament committee documents, with optional single document lookup.
 *
 * **Intelligence Perspective:** Committee documents reveal policy positions and
 * legislative drafting before plenary votes, enabling early detection of policy shifts.
 *
 * **Business Perspective:** Provides early access to legislative drafts for
 * regulatory intelligence and compliance preparation.
 *
 * **EP API Endpoints:**
 * - `GET /committee-documents` (list)
 * - `GET /committee-documents/{doc-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetCommitteeDocumentsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Get committee documents tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with committee document data
 */
export async function handleGetCommitteeDocuments(
  args: unknown
): Promise<ToolResult> {
  const params = GetCommitteeDocumentsSchema.parse(args);

  if (params.docId !== undefined) {
    const result = await epClient.getCommitteeDocumentById(params.docId);
    return buildToolResponse(result);
  }

  const apiParams: Record<string, unknown> = {
    limit: params.limit,
    offset: params.offset
  };
  if (params.year !== undefined) apiParams['year'] = params.year;

  const result = await epClient.getCommitteeDocuments(apiParams as Parameters<typeof epClient.getCommitteeDocuments>[0]);

  return buildToolResponse(result);
}

/** Tool metadata for get_committee_documents */
export const getCommitteeDocumentsToolMetadata = {
  name: 'get_committee_documents',
  description: 'Get European Parliament committee documents. Supports single document lookup by docId or list with year filter. Data source: European Parliament Open Data Portal.',
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
