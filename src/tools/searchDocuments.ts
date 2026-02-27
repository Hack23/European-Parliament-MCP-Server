/**
 * MCP Tool: search_documents
 * 
 * Search European Parliament legislative documents or retrieve a single document by ID.
 * 
 * **Intelligence Perspective:** Essential for legislative monitoring, policy tracking,
 * amendment analysis, and building intelligence products around EU regulatory developments.
 * 
 * **Business Perspective:** Enables document search products for legal firms, compliance
 * teams, and regulatory intelligence services requiring legislative text access.
 * 
 * **Marketing Perspective:** Demonstrates comprehensive document search capability—
 * key for attracting legal tech, RegTech, and policy research customer segments.
 * 
 * **EP API Endpoints:**
 * - `GET /documents` (list/search)
 * - `GET /documents/{doc-id}` (single)
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { SearchDocumentsSchema, LegislativeDocumentSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import type { ToolResult } from './shared/types.js';

/**
 * Search documents tool handler
 * 
 * @param args - Tool arguments
 * @returns MCP tool result with document data
 * 
 * @example
 * ```json
 * {
 *   "keyword": "climate change",
 *   "documentType": "REPORT",
 *   "dateFrom": "2024-01-01",
 *   "limit": 20
 * }
 * ```
 */
export async function handleSearchDocuments(
  args: unknown
): Promise<ToolResult> {
  // Validate input
  const params = SearchDocumentsSchema.parse(args);
  
  try {
    // Single document lookup by ID
    if (params.docId !== undefined) {
      const result = await epClient.getDocumentById(params.docId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }

    // Search documents via EP API (only pass defined properties)
    const apiParams: Record<string, unknown> = {
      keyword: params.keyword ?? '',
      limit: params.limit,
      offset: params.offset
    };
    if (params['documentType'] !== undefined) apiParams['documentType'] = params['documentType'];
    if (params['dateFrom'] !== undefined) apiParams['dateFrom'] = params['dateFrom'];
    if (params['dateTo'] !== undefined) apiParams['dateTo'] = params['dateTo'];
    if (params['committee'] !== undefined) apiParams['committee'] = params['committee'];
    
    const result = await epClient.searchDocuments(apiParams as Parameters<typeof epClient.searchDocuments>[0]);
    
    // Validate output
    const outputSchema = PaginatedResponseSchema(LegislativeDocumentSchema);
    const validated = outputSchema.parse(result);
    
    // Return MCP-compliant response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(validated, null, 2)
      }]
    };
  } catch (error) {
    // Handle errors without exposing internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to search documents: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const searchDocumentsToolMetadata = {
  name: 'search_documents',
  description: 'Search European Parliament legislative documents by keyword, or retrieve a single document by docId. Filter by document type (REPORT, RESOLUTION, DECISION, DIRECTIVE, REGULATION, OPINION), date range, and committee. Returns document metadata including title, authors, status, and PDF/XML links.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      docId: {
        type: 'string',
        description: 'Document ID for single document lookup (bypasses keyword search)'
      },
      keyword: {
        type: 'string',
        description: 'Search keyword or phrase (alphanumeric, spaces, hyphens, underscores only)',
        minLength: 1,
        maxLength: 200,
        pattern: '^[a-zA-Z0-9\\s\\-_]+$'
      },
      documentType: {
        type: 'string',
        description: 'Filter by document type',
        enum: ['REPORT', 'RESOLUTION', 'DECISION', 'DIRECTIVE', 'REGULATION', 'OPINION', 'AMENDMENT']
      },
      dateFrom: {
        type: 'string',
        description: 'Start date filter (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      dateTo: {
        type: 'string',
        description: 'End date filter (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      committee: {
        type: 'string',
        description: 'Committee identifier',
        minLength: 1,
        maxLength: 100
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 20
      },
      offset: {
        type: 'number',
        description: 'Pagination offset',
        minimum: 0,
        default: 0
      }
    }
  }
};
