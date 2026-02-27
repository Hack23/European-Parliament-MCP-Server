/**
 * MCP Tool: get_controlled_vocabularies
 *
 * Retrieve European Parliament controlled vocabularies, with optional single vocabulary lookup.
 *
 * **Intelligence Perspective:** Controlled vocabularies define standardized terms used
 * across EP data—essential for accurate query construction and data interpretation.
 *
 * **Business Perspective:** Vocabulary data enables proper classification and
 * categorization in data products.
 *
 * **EP API Endpoints:**
 * - `GET /controlled-vocabularies` (list)
 * - `GET /controlled-vocabularies/{voc-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetControlledVocabulariesSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_controlled_vocabularies MCP tool request.
 *
 * Retrieves European Parliament controlled vocabularies—standardised classification terms
 * used across EP datasets. Supports both a paginated list view and a single-vocabulary
 * lookup when `vocId` is provided. These vocabularies are essential for accurate query
 * construction and data interpretation across other EP API tools.
 *
 * @param args - Raw tool arguments, validated against {@link GetControlledVocabulariesSchema}
 * @returns MCP tool result containing vocabulary data (single vocabulary or paginated list)
 * @throws - If `args` fails schema validation (e.g., invalid field types or formats)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Single vocabulary lookup
 * const single = await handleGetControlledVocabularies({ vocId: 'activities-type' });
 * // Returns the controlled vocabulary for activity types
 *
 * // List all vocabularies
 * const list = await handleGetControlledVocabularies({ limit: 50, offset: 0 });
 * // Returns up to 50 controlled vocabulary entries
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getControlledVocabulariesToolMetadata} for MCP schema registration
 * @see {@link handleSearchDocuments} for tools that consume vocabulary terms as filter values
 */
export async function handleGetControlledVocabularies(
  args: unknown
): Promise<ToolResult> {
  const params = GetControlledVocabulariesSchema.parse(args);

  if (params.vocId !== undefined) {
    const result = await epClient.getControlledVocabularyById(params.vocId);
    return buildToolResponse(result);
  }

  const result = await epClient.getControlledVocabularies({
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_controlled_vocabularies */
export const getControlledVocabulariesToolMetadata = {
  name: 'get_controlled_vocabularies',
  description: 'Get European Parliament controlled vocabularies (standardized classification terms). Supports single vocabulary lookup by vocId. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      vocId: { type: 'string', description: 'Vocabulary ID for single vocabulary lookup' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
