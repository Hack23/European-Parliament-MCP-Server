/**
 * MCP Tool: get_outgoing_meps
 *
 * Retrieve outgoing Members of European Parliament for the current parliamentary term.
 *
 * **Intelligence Perspective:** Enables tracking of departing MEPs, useful for
 * understanding political transitions and succession patterns.
 *
 * **Business Perspective:** Helps stakeholders prepare for political transitions
 * and identify outgoing MEPs for final engagement.
 *
 * **EP API Endpoint:** `GET /meps/show-outgoing`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetOutgoingMEPsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_outgoing_meps MCP tool request.
 *
 * Retrieves Members of European Parliament who are departing parliament during the current
 * parliamentary term. Useful for monitoring political transitions, succession analysis, and
 * identifying final-engagement opportunities with outgoing stakeholders.
 *
 * @param args - Raw tool arguments, validated against {@link GetOutgoingMEPsSchema}
 * @returns MCP tool result containing a paginated list of outgoing MEP records for the
 *   current parliamentary term
 * @throws - If `args` fails schema validation (e.g., limit out of range 1–100)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetOutgoingMEPs({ limit: 20, offset: 0 });
 * // Returns up to 20 MEPs who are leaving the current parliamentary term
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getOutgoingMEPsToolMetadata} for MCP schema registration
 * @see {@link handleGetCurrentMEPs} for all currently active MEPs
 * @see {@link handleGetIncomingMEPs} for MEPs who are newly joining parliament
 */
export async function handleGetOutgoingMEPs(
  args: unknown
): Promise<ToolResult> {
  const params = GetOutgoingMEPsSchema.parse(args);

  const result = await epClient.getOutgoingMEPs({
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_outgoing_meps */
export const getOutgoingMEPsToolMetadata = {
  name: 'get_outgoing_meps',
  description: 'Get outgoing Members of European Parliament for the current parliamentary term. Returns MEPs who are leaving parliament. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
