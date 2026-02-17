/**
 * MCP Tool: track_legislation
 * 
 * Track legislative procedure progress through European Parliament
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { TrackLegislationSchema } from '../../schemas/europeanParliament.js';
import { createMockProcedure } from './procedureTracker.js';

/**
 * Track legislation tool handler
 * Cyclomatic complexity: 2
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
export function handleTrackLegislation(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  // Validate input
  const params = TrackLegislationSchema.parse(args);
  
  try {
    // For MVP, return mock legislative tracking data
    // In production, fetch from EP Legislative Observatory API
    const procedure = createMockProcedure(params.procedureId);
    
    // Return MCP-compliant response
    return Promise.resolve({
      content: [{
        type: 'text',
        text: JSON.stringify(procedure, null, 2)
      }]
    });
  } catch (error) {
    // Handle errors without exposing internal details
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

// Re-export types for external use
export type {
  LegislativeProcedure,
  TimelineEvent,
  CommitteeAssignment,
  AmendmentStats,
  VotingRecord,
  DocumentReference
} from './types.js';
