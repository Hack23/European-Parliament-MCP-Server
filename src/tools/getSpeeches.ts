/**
 * MCP Tool: get_speeches
 *
 * Retrieve European Parliament plenary speeches and speech-related activities.
 * Supports single speech lookup by speechId or list with date range filtering.
 *
 * **Intelligence Perspective:** Speech data enables content analysis of MEP positions,
 * rhetorical patterns, and policy priorities across plenary debates.
 *
 * **Business Perspective:** Speech transcripts power NLP-based products, sentiment
 * analysis dashboards, and topic monitoring services.
 *
 * **EP API Endpoints:**
 * - `GET /speeches` (list)
 * - `GET /speeches/{speech-id}` (single)
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetSpeechesSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get speeches tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with speech data
 */
export async function handleGetSpeeches(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = GetSpeechesSchema.parse(args);

  if (params.speechId !== undefined) {
    const result = await epClient.getSpeechById(params.speechId);
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
  if (params.dateFrom !== undefined) apiParams['dateFrom'] = params.dateFrom;
  if (params.dateTo !== undefined) apiParams['dateTo'] = params.dateTo;

  const result = await epClient.getSpeeches(apiParams as Parameters<typeof epClient.getSpeeches>[0]);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}

/** Tool metadata for get_speeches */
export const getSpeechesToolMetadata = {
  name: 'get_speeches',
  description: 'Get European Parliament plenary speeches and debate contributions. Supports single speech lookup by speechId or list with date range filtering. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      speechId: { type: 'string', description: 'Speech ID for single speech lookup' },
      dateFrom: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
      dateTo: { type: 'string', description: 'End date (YYYY-MM-DD)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
