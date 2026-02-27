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
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_current_meps MCP tool request.
 *
 * Retrieves Members of European Parliament who hold an active mandate as of today's date.
 * Outgoing or inactive members are excluded, providing a real-time snapshot of the current
 * parliamentary composition.
 *
 * @param args - Raw tool arguments, validated against {@link GetCurrentMEPsSchema}
 * @returns MCP tool result containing a paginated list of currently active MEP records
 * @throws - If `args` fails schema validation (e.g., limit out of range 1–100)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetCurrentMEPs({ limit: 50, offset: 0 });
 * // Returns up to 50 MEPs with active mandates as of today
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getCurrentMEPsToolMetadata} for MCP schema registration
 * @see {@link handleGetIncomingMEPs} for MEPs who are newly joining parliament
 * @see {@link handleGetOutgoingMEPs} for MEPs who are departing parliament
 */
export async function handleGetCurrentMEPs(
  args: unknown
): Promise<ToolResult> {
  const params = GetCurrentMEPsSchema.parse(args);

  const result = await epClient.getCurrentMEPs({
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
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
