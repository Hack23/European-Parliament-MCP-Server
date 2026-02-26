/**
 * MCP Tool: get_incoming_meps
 *
 * Retrieve incoming Members of European Parliament for the current parliamentary term.
 *
 * **Intelligence Perspective:** Enables tracking of new MEPs joining parliament,
 * useful for understanding political transitions and new member onboarding.
 *
 * **Business Perspective:** Helps stakeholders identify newly arriving MEPs
 * for early engagement and relationship building.
 *
 * **EP API Endpoint:** `GET /meps/show-incoming`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetIncomingMEPsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handles the get_incoming_meps MCP tool request.
 *
 * Retrieves Members of European Parliament who are newly joining parliament during the
 * current parliamentary term. Useful for tracking political transitions, onboarding
 * patterns, and early-engagement stakeholder analysis.
 *
 * @param args - Raw tool arguments, validated against {@link GetIncomingMEPsSchema}
 * @returns MCP tool result containing a paginated list of incoming MEP records for the
 *   current parliamentary term
 * @throws {ZodError} If `args` fails schema validation (e.g., limit out of range 1–100)
 * @throws {Error} If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetIncomingMEPs({ limit: 20, offset: 0 });
 * // Returns up to 20 MEPs who are newly joining the current parliamentary term
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data in responses is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link getIncomingMEPsToolMetadata} for MCP schema registration
 * @see {@link handleGetCurrentMEPs} for all currently active MEPs
 * @see {@link handleGetOutgoingMEPs} for MEPs who are departing parliament
 */
export async function handleGetIncomingMEPs(
  args: unknown
): Promise<ToolResult> {
  const params = GetIncomingMEPsSchema.parse(args);

  const result = await epClient.getIncomingMEPs({
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_incoming_meps */
export const getIncomingMEPsToolMetadata = {
  name: 'get_incoming_meps',
  description: 'Get incoming Members of European Parliament for the current parliamentary term. Returns MEPs who are newly joining. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    }
  }
};
