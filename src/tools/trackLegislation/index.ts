/**
 * MCP Tool: track_legislation
 * 
 * Track legislative procedure progress through European Parliament
 * 
 * **Intelligence Perspective:** Enables real-time legislative pipeline monitoring,
 * procedure stage analysis, and trilogue outcome tracking for strategic intelligence
 * on EU regulatory developments and policy trajectory forecasting.
 * 
 * **Business Perspective:** Core compliance monitoring product—essential for enterprises
 * tracking regulatory changes, industry associations monitoring sector-specific legislation.
 * 
 * **Marketing Perspective:** Demonstrates end-to-end legislative tracking capability—
 * differentiator for RegTech market and EU affairs consultancy customer acquisition.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { TrackLegislationSchema } from '../../schemas/europeanParliament.js';
import { epClient } from '../../clients/europeanParliamentClient.js';
import { buildLegislativeTracking } from './procedureTracker.js';

/**
 * Track legislation tool handler
 * 
 * Fetches real procedure data from the EP API `/procedures` endpoint
 * and returns structured legislative tracking information derived
 * entirely from the API response.
 * 
 * @param args - Tool arguments
 * @returns MCP tool result with legislative procedure tracking data
 * 
 * @example
 * ```json
 * {
 *   "procedureId": "2024/0001(COD)"
 * }
 * ```
 */
export async function handleTrackLegislation(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = TrackLegislationSchema.parse(args);
  
  try {
    const procedure = await epClient.getProcedureById(params.procedureId);
    const tracking = buildLegislativeTracking(procedure);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(tracking, null, 2)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to track legislation: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const trackLegislationToolMetadata = {
  name: 'track_legislation',
  description: 'Track European Parliament legislative procedure progress including current status, timeline of stages, committee assignments, amendments, voting records, and next steps. Provides comprehensive overview of legislation journey from proposal to adoption.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      procedureId: {
        type: 'string',
        description: 'Legislative procedure identifier (e.g., "2024/0001(COD)")',
        minLength: 1,
        maxLength: 100
      }
    },
    required: ['procedureId']
  }
};
