/**
 * MCP Tool: get_meeting_plenary_session_document_items
 *
 * Retrieve plenary session document items linked to a specific EP meeting (plenary sitting).
 *
 * **Intelligence Perspective:** Provides granular access to individual document
 * items within a plenary session, enabling detailed agenda item tracking and
 * legislative analysis.
 *
 * **Business Perspective:** Allows policy teams and compliance officers to
 * enumerate every agenda document item for a plenary sitting, supporting
 * structured review workflows and audit trails.
 *
 * **Marketing Perspective:** Showcases fine-grained EP document access to
 * developers and researchers who need individual agenda-item level data beyond
 * top-level session documents.
 *
 * **EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-document-items`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMeetingPlenarySessionDocumentItemsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Handle the `get_meeting_plenary_session_document_items` MCP tool request.
 *
 * Retrieves the individual agenda-item-level documents linked to a specific EP
 * plenary sitting by calling
 * `GET /meetings/{sitting-id}/plenary-session-document-items` via {@link epClient}.
 * The raw API response is normalised into a standardised {@link ToolResult}
 * using {@link buildToolResponse}.
 *
 * @param args - Raw tool arguments provided by the MCP client. Must conform to
 *   {@link GetMeetingPlenarySessionDocumentItemsSchema}:
 *   - `sittingId` (string, required): EP plenary sitting identifier.
 *   - `limit` (number, optional): Maximum results to return (1–100, default 50).
 *   - `offset` (number, optional): Pagination offset (default 0).
 * @returns A promise that resolves to an MCP {@link ToolResult} containing the
 *   plenary session document items for the requested sitting.
 * @throws If `args` fails {@link GetMeetingPlenarySessionDocumentItemsSchema} validation
 *   (e.g. missing required `sittingId` or out-of-range `limit`).
 * @throws If `sittingId` contains path-traversal characters (`.`, `\`, `?`, `#`)
 *   — the underlying client throws an `APIError(400)`.
 * @throws If the European Parliament API is unreachable or returns an error response.
 *
 * @example
 * ```typescript
 * const result = await handleGetMeetingPlenarySessionDocumentItems({
 *   sittingId: 'PV-9-2024-04-22',
 *   limit: 50,
 *   offset: 0
 * });
 * // Returns individual agenda-item documents for plenary sitting PV-9-2024-04-22
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   `sittingId` is checked against path-traversal characters before URL construction.
 *   Personal data in responses is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 1.0.0
 * @see {@link getMeetingPlenarySessionDocumentItemsToolMetadata} for MCP schema registration
 * @see {@link handleGetMeetingPlenarySessionDocuments} for top-level session documents
 * @see {@link handleGetMeetingForeseenActivities} for planned meeting activities
 */
export async function handleGetMeetingPlenarySessionDocumentItems(
  args: unknown
): Promise<ToolResult> {
  const params = GetMeetingPlenarySessionDocumentItemsSchema.parse(args);

  const result = await epClient.getMeetingPlenarySessionDocumentItems(params.sittingId, {
    limit: params.limit,
    offset: params.offset
  });

  return buildToolResponse(result);
}

/** Tool metadata for get_meeting_plenary_session_document_items */
export const getMeetingPlenarySessionDocumentItemsToolMetadata = {
  name: 'get_meeting_plenary_session_document_items',
  description: 'Get plenary session document items for a specific EP meeting/plenary sitting. Returns individual agenda item documents for the meeting. Data source: European Parliament Open Data Portal.',
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
