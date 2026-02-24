/**
 * MCP Tool: get_procedures
 *
 * Retrieve European Parliament legislative procedures.
 *
 * **Intelligence Perspective:** Procedure data enables end-to-end legislative tracking,
 * outcome prediction, and timeline analysis—core for policy monitoring intelligence.
 *
 * **Business Perspective:** Procedure tracking powers legislative intelligence products,
 * regulatory risk assessments, and compliance early-warning systems.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetProceduresSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get procedures tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with procedure data
 */
export async function handleGetProcedures(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetProceduresSchema.parse(args);

  const apiParams: Record<string, unknown> = {
    limit: params.limit,
    offset: params.offset
  };
  if (params.year !== undefined) apiParams['year'] = params.year;

  const result = await epClient.getProcedures(apiParams as Parameters<typeof epClient.getProcedures>[0]);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

/** Tool metadata for get_procedures */
export const getProceduresToolMetadata = {
  name: 'get_procedures',
  description: 'Get European Parliament legislative procedures (ordinary legislative procedure, consultation, consent). Filter by year. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      year: { type: 'number', description: 'Filter by year (e.g., 2024)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
