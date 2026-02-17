/**
 * Type definitions for legislation tracking
 * 
 * ISMS Policy: SC-002 (Input Validation)
 */

/**
 * Legislative procedure status
 */
export interface LegislativeProcedure {
  procedureId: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'COMMITTEE' | 'PLENARY' | 'ADOPTED' | 'REJECTED';
  currentStage: string;
  timeline: TimelineEvent[];
  committees: CommitteeAssignment[];
  amendments: AmendmentStats;
  voting: VotingRecord[];
  documents: DocumentReference[];
  nextSteps?: string[];
}

/**
 * Timeline event
 */
export interface TimelineEvent {
  date: string;
  stage: string;
  description: string;
  responsible?: string;
}

/**
 * Committee assignment
 */
export interface CommitteeAssignment {
  abbreviation: string;
  role: 'LEAD' | 'OPINION';
  rapporteur?: string;
}

/**
 * Amendment statistics
 */
export interface AmendmentStats {
  proposed: number;
  adopted: number;
  rejected: number;
}

/**
 * Voting record
 */
export interface VotingRecord {
  date: string;
  stage: string;
  result: 'ADOPTED' | 'REJECTED';
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
}

/**
 * Document reference
 */
export interface DocumentReference {
  id: string;
  type: string;
  date: string;
  title: string;
}
