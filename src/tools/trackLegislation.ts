/**
 * MCP Tool: track_legislation
 * 
 * Track legislative procedure progress through European Parliament
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { TrackLegislationSchema } from '../schemas/europeanParliament.js';

/**
 * Legislative procedure status
 */
interface LegislativeProcedure {
  procedureId: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'COMMITTEE' | 'PLENARY' | 'ADOPTED' | 'REJECTED';
  currentStage: string;
  timeline: {
    date: string;
    stage: string;
    description: string;
    responsible?: string;
  }[];
  committees: {
    abbreviation: string;
    role: 'LEAD' | 'OPINION';
    rapporteur?: string;
  }[];
  amendments: {
    proposed: number;
    adopted: number;
    rejected: number;
  };
  voting: {
    date: string;
    stage: string;
    result: 'ADOPTED' | 'REJECTED';
    votesFor: number;
    votesAgainst: number;
    abstentions: number;
  }[];
  documents: {
    id: string;
    type: string;
    date: string;
    title: string;
  }[];
  nextSteps?: string[];
}

/**
 * Track legislation tool handler
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
    const procedure: LegislativeProcedure = {
      procedureId: params.procedureId,
      title: 'Climate Action and Renewable Energy Directive',
      type: 'Ordinary legislative procedure (COD)',
      status: 'PLENARY',
      currentStage: 'Awaiting plenary vote',
      timeline: [
        {
          date: '2024-01-15',
          stage: 'Commission Proposal',
          description: 'Legislative proposal submitted by European Commission',
          responsible: 'European Commission'
        },
        {
          date: '2024-02-20',
          stage: 'Committee Referral',
          description: 'Referred to ENVI Committee (lead), ITRE Committee (opinion)',
          responsible: 'European Parliament'
        },
        {
          date: '2024-05-10',
          stage: 'Committee Vote',
          description: 'ENVI Committee adopted report with amendments',
          responsible: 'ENVI Committee'
        },
        {
          date: '2024-06-15',
          stage: 'Plenary Reading',
          description: 'Scheduled for plenary vote',
          responsible: 'European Parliament'
        }
      ],
      committees: [
        {
          abbreviation: 'ENVI',
          role: 'LEAD',
          rapporteur: 'MEP-124810'
        },
        {
          abbreviation: 'ITRE',
          role: 'OPINION',
          rapporteur: 'MEP-124811'
        }
      ],
      amendments: {
        proposed: 156,
        adopted: 89,
        rejected: 67
      },
      voting: [
        {
          date: '2024-05-10',
          stage: 'ENVI Committee Vote',
          result: 'ADOPTED',
          votesFor: 45,
          votesAgainst: 12,
          abstentions: 3
        }
      ],
      documents: [
        {
          id: 'COM(2024)0001',
          type: 'Commission Proposal',
          date: '2024-01-15',
          title: 'Proposal for a Directive on Climate Action'
        },
        {
          id: 'A9-0123/2024',
          type: 'Committee Report',
          date: '2024-05-10',
          title: 'Report on Climate Action Directive'
        }
      ],
      nextSteps: [
        'Plenary debate scheduled for 2024-06-15',
        'Plenary vote expected 2024-06-16',
        'If adopted, proceed to Council for first reading'
      ]
    };
    
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
