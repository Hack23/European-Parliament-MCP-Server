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
 * Get meeting plenary session document items tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with plenary session document item data
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
