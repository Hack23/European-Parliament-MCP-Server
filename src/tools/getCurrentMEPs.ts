/**
 * MCP Tool: get_current_meps
 *
 * Retrieve currently active Members of European Parliament.
 *
 * **Intelligence Perspective:** Provides real-time snapshot of active MEPs for current
 * political landscape analysis, filtering out outgoing/inactive members.
 *
 * **Business Perspective:** Essential for stakeholder mapping products that need
 * only current, contactable MEPs.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetCurrentMEPsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get currently active MEPs tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with current MEP data
 */
export async function handleGetCurrentMEPs(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetCurrentMEPsSchema.parse(args);

  const result = await epClient.getCurrentMEPs({
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

/** Tool metadata for get_current_meps */
export const getCurrentMEPsToolMetadata = {
  name: 'get_current_meps',
  description: 'Get currently active Members of European Parliament (today\'s date). Returns only MEPs with active mandates. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
