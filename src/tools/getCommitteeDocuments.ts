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
 * Handles the get_committee_documents MCP tool request.
 *
 * Retrieves European Parliament committee documents, supporting single document
 * lookup by docId or a paginated list optionally filtered by year.
 *
 * @param args - Raw tool arguments, validated against {@link GetCommitteeDocumentsSchema}
 * @returns MCP tool result containing either a single committee document or a paginated list of documents
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Single document lookup
 * const result = await handleGetCommitteeDocuments({ docId: 'A9-0001/2024' });
 * // Returns the full record for the specified committee document
 *
 * // List documents filtered by year
 * const list = await handleGetCommitteeDocuments({ year: 2024, limit: 25 });
 * // Returns up to 25 committee documents from 2024
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getCommitteeDocumentsToolMetadata} for MCP schema registration
 * @see {@link handleGetCommitteeInfo} for retrieving committee membership and structure
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
