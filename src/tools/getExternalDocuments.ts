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
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_external_documents MCP tool request.
 *
 * Retrieves external documents (non-EP documents such as Council positions and Commission
 * proposals) from the European Parliament data portal. Supports both a paginated list view
 * and a single-document lookup when `docId` is provided.
 *
 * @param args - Raw tool arguments, validated against {@link GetExternalDocumentsSchema}
 * @returns MCP tool result containing external document data (single document or paginated list)
 * @throws - If `args` fails schema validation (e.g., invalid field types or formats)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Single document lookup
 * const single = await handleGetExternalDocuments({ docId: 'COM-2024-123' });
 * // Returns the external document with ID COM-2024-123
 *
 * // List documents (no year filter available in the EP API)
 * const list = await handleGetExternalDocuments({ limit: 30, offset: 0 });
 * // Returns up to 30 external documents
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getExternalDocumentsToolMetadata} for MCP schema registration
 * @see {@link handleSearchDocuments} for full-text search across EP legislative documents
 */
export async function handleGetExternalDocuments(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetExternalDocumentsSchema.parse>;
  try {
    params = GetExternalDocumentsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_external_documents',
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
      const result = await epClient.getExternalDocumentById(params.docId);
      return buildToolResponse(result);
    }

    const apiParams: Record<string, unknown> = {
      limit: params.limit,
      offset: params.offset,
    };

    const result = await epClient.getExternalDocuments(
      apiParams as Parameters<typeof epClient.getExternalDocuments>[0]
    );

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_external_documents',
      operation: 'fetchData',
      message: 'Failed to retrieve external documents',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_external_documents */
export const getExternalDocumentsToolMetadata = {
  name: 'get_external_documents',
  description:
    'Get external documents (non-EP documents such as Council positions, Commission proposals) from the European Parliament data portal. Supports single document lookup by docId or paginated list. Note: The EP API /external-documents endpoint does not support year filtering. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      docId: { type: 'string', description: 'Document ID for single document lookup' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 },
    },
  },
};
