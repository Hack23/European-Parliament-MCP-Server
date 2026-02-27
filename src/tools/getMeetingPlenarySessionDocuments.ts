/**
 * MCP Tool: get_meeting_plenary_session_documents
 *
 * Retrieve plenary session documents linked to a specific EP meeting (plenary sitting).
 *
 * **Intelligence Perspective:** Provides access to all session documents
 * associated with a specific plenary meeting, enabling comprehensive document
 * review and legislative tracking.
 *
 * **Business Perspective:** Enables stakeholders and lobbyists to retrieve
 * official session documents ahead of plenary votes for briefing preparation
 * and compliance monitoring.
 *
 * **Marketing Perspective:** Demonstrates direct access to official EP plenary
 * documents, appealing to legal professionals, journalists, and civic tech
 * developers who need reliable legislative source material.
 *
 * **EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-documents`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMeetingPlenarySessionDocumentsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handle the `get_meeting_plenary_session_documents` MCP tool request.
 *
 * Retrieves all plenary session documents associated with a specific EP plenary
 * sitting by calling `GET /meetings/{sitting-id}/plenary-session-documents` via
 * {@link epClient}. The raw API response is normalised into a standardised
 * {@link ToolResult} using {@link buildToolResponse}.
 *
 * @param args - Raw tool arguments provided by the MCP client. Must conform to
 *   {@link GetMeetingPlenarySessionDocumentsSchema}:
 *   - `sittingId` (string, required): EP plenary sitting identifier.
 *   - `limit` (number, optional): Maximum results to return (1–100, default 50).
 *   - `offset` (number, optional): Pagination offset (default 0).
 * @returns A promise that resolves to an MCP {@link ToolResult} containing the
 *   plenary session documents for the requested sitting.
 * @throws If `args` fails {@link GetMeetingPlenarySessionDocumentsSchema} validation
 *   (e.g. missing required `sittingId` or out-of-range `limit`).
 * @throws If `sittingId` contains path-traversal characters (`.`, `\`, `?`, `#`)
 *   — the underlying client throws an `APIError(400)`.
 * @throws If the European Parliament API is unreachable or returns an error response.
 *
 * @example
 * ```typescript
 * const result = await handleGetMeetingPlenarySessionDocuments({
 *   sittingId: 'PV-9-2024-04-22',
 *   limit: 20,
 *   offset: 0
 * });
 * // Returns plenary session documents for sitting PV-9-2024-04-22
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   `sittingId` is checked against path-traversal characters before URL construction.
 *   Personal data in responses is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 1.0.0
 * @see {@link getMeetingPlenarySessionDocumentsToolMetadata} for MCP schema registration
 * @see {@link handleGetMeetingPlenarySessionDocumentItems} for individual agenda-item documents
 * @see {@link handleGetMeetingForeseenActivities} for planned meeting activities
 */
export async function handleGetMeetingPlenarySessionDocuments(
  args: unknown
): Promise<ToolResult> {
  const params = GetMeetingPlenarySessionDocumentsSchema.parse(args);

  const result = await epClient.getMeetingPlenarySessionDocuments(params.sittingId, {
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_meeting_plenary_session_documents */
export const getMeetingPlenarySessionDocumentsToolMetadata = {
  name: 'get_meeting_plenary_session_documents',
  description: 'Get plenary session documents for a specific EP meeting/plenary sitting. Returns session documents associated with the meeting. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sittingId: { type: 'string', description: 'Meeting / sitting identifier (required)' },
      limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 50 },
      offset: { type: 'number', description: 'Pagination offset', default: 0 }
    },
    required: ['sittingId']
  }
};
