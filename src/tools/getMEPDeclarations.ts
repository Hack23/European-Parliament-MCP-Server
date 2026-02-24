/**
 * MCP Tool: get_mep_declarations
 *
 * Retrieve MEP declarations of financial interests.
 * Supports single declaration lookup by docId or list with year filtering.
 *
 * **Intelligence Perspective:** Financial declarations enable conflict-of-interest
 * detection, lobbying pattern analysis, and transparency assessment for MEP profiling.
 *
 * **Business Perspective:** Declaration data supports compliance monitoring products
 * and corporate governance risk assessment services.
 *
 * **EP API Endpoints:**
 * - `GET /meps-declarations` (list)
 * - `GET /meps-declarations/{doc-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), DP-001 (Data Protection)
 * @gdpr Access is audit-logged per GDPR Art. 6(1)(e)
 */

import { GetMEPDeclarationsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get MEP declarations tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with MEP declaration data
 */
export async function handleGetMEPDeclarations(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetMEPDeclarationsSchema.parse(args);

  if (params.docId !== undefined) {
    const result = await epClient.getMEPDeclarationById(params.docId);
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

  const result = await epClient.getMEPDeclarations(apiParams as Parameters<typeof epClient.getMEPDeclarations>[0]);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

/** Tool metadata for get_mep_declarations */
export const getMEPDeclarationsToolMetadata = {
  name: 'get_mep_declarations',
  description: 'Get MEP declarations of financial interests filed under the Rules of Procedure. Supports single declaration lookup by docId or list with year filter. Data source: European Parliament Open Data Portal. GDPR: Access is audit-logged.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      docId: { type: 'string', description: 'Document ID for single declaration lookup' },
      year: { type: 'number', description: 'Filter by filing year (e.g., 2024)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
