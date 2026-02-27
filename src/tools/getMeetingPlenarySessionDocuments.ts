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
 * Get meeting plenary session documents tool handler.
 *
 * @param args - Tool arguments
 * @returns MCP tool result with plenary session document data
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
