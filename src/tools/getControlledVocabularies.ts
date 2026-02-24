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

/**
 * Get controlled vocabularies tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with vocabulary data
 */
export async function handleGetControlledVocabularies(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetControlledVocabulariesSchema.parse(args);

  if (params.vocId !== undefined) {
    const result = await epClient.getControlledVocabularyById(params.vocId);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  const result = await epClient.getControlledVocabularies({
    limit: params.limit,
    offset: params.offset
  });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
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
