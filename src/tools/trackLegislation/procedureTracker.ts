/**
 * Procedure tracker for legislative data
 * 
 * ISMS Policy: SC-002 (Input Validation)
 */

import type {
  LegislativeProcedure,
  CommitteeAssignment,
  AmendmentStats,
  VotingRecord,
  DocumentReference
} from './types.js';
import { buildProcedureTimeline, buildNextSteps } from './timelineBuilder.js';

/**
 * Build committee assignments
 * Cyclomatic complexity: 1
 */
function buildCommitteeAssignments(): CommitteeAssignment[] {
  return [
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
  ];
}

/**
 * Build amendment statistics
 * Cyclomatic complexity: 1
 */
function buildAmendmentStats(): AmendmentStats {
  return {
    proposed: 156,
    adopted: 89,
    rejected: 67
  };
}

/**
 * Build voting records
 * Cyclomatic complexity: 1
 */
function buildVotingRecords(): VotingRecord[] {
  return [
    {
      date: '2024-05-10',
      stage: 'ENVI Committee Vote',
      result: 'ADOPTED',
      votesFor: 45,
      votesAgainst: 12,
      abstentions: 3
    }
  ];
}

/**
 * Build document references
 * Cyclomatic complexity: 1
 */
function buildDocumentReferences(): DocumentReference[] {
  return [
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
  ];
}

/**
 * Create a mock legislative procedure
 * Cyclomatic complexity: 1
 * 
 * In production, this would fetch from EP Legislative Observatory API
 */
export function createMockProcedure(procedureId: string): LegislativeProcedure {
  return {
    procedureId,
    title: 'Climate Action and Renewable Energy Directive',
    type: 'Ordinary legislative procedure (COD)',
    status: 'PLENARY',
    currentStage: 'Awaiting plenary vote',
    timeline: buildProcedureTimeline(),
    committees: buildCommitteeAssignments(),
    amendments: buildAmendmentStats(),
    voting: buildVotingRecords(),
    documents: buildDocumentReferences(),
    nextSteps: buildNextSteps()
  };
}
