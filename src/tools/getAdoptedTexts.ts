/**
 * MCP Tool: get_adopted_texts
 *
 * Retrieve European Parliament adopted texts (legislative resolutions,
 * positions, non-legislative resolutions).
 *
 * **Intelligence Perspective:** Adopted texts represent final legislative outputs—
 * tracking them enables assessment of legislative productivity and policy direction.
 *
 * **Business Perspective:** Adopted text monitoring powers regulatory compliance
 * products and legislative change management services.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetAdoptedTextsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get adopted texts tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with adopted text data
 */
export async function handleGetAdoptedTexts(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetAdoptedTextsSchema.parse(args);

  const apiParams: Record<string, unknown> = {
    limit: params.limit,
    offset: params.offset
  };
  if (params.year !== undefined) apiParams['year'] = params.year;

  const result = await epClient.getAdoptedTexts(apiParams as Parameters<typeof epClient.getAdoptedTexts>[0]);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

/** Tool metadata for get_adopted_texts */
export const getAdoptedTextsToolMetadata = {
  name: 'get_adopted_texts',
  description: 'Get European Parliament adopted texts including legislative resolutions, positions, and non-legislative resolutions. Filter by year. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      year: { type: 'number', description: 'Filter by year of adoption (e.g., 2024)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
