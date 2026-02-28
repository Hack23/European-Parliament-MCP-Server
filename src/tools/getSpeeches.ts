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
import { buildToolResponse } from './shared/responseBuilder.js';
import { buildApiParams } from './shared/paramBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_speeches MCP tool request.
 *
 * Retrieves European Parliament plenary speeches and debate contributions.
 * Supports single speech lookup by speechId or a filtered list by date range.
 *
 * @param args - Raw tool arguments, validated against {@link GetSpeechesSchema}
 * @returns MCP tool result containing either a single speech record or a paginated list of speeches
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * // Single speech lookup
 * const result = await handleGetSpeeches({ speechId: 'SPEECH-2024-001' });
 * // Returns the full record for the specified speech
 *
 * // List speeches with date filter
 * const list = await handleGetSpeeches({ dateFrom: '2024-01-01', dateTo: '2024-03-31', limit: 50 });
 * // Returns up to 50 speeches from Q1 2024
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getSpeechesToolMetadata} for MCP schema registration
 * @see {@link handleGetMeetingActivities} for retrieving broader meeting-level activities
 */
export async function handleGetSpeeches(
  args: unknown
): Promise<ToolResult> {
  const params = GetSpeechesSchema.parse(args);

  if (params.speechId !== undefined) {
    const result = await epClient.getSpeechById(params.speechId);
    return buildToolResponse(result);
  }

  const apiParams = {
    limit: params.limit,
    offset: params.offset,
    ...buildApiParams(params, [
      { from: 'dateFrom', to: 'dateFrom' },
      { from: 'dateTo', to: 'dateTo' },
    ]),
  };

  const result = await epClient.getSpeeches(apiParams as Parameters<typeof epClient.getSpeeches>[0]);

  return buildToolResponse(result);
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
