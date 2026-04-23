/**
 * Type definitions for legislation tracking
 * 
 * ISMS Policy: SC-002 (Input Validation)
 */

/**
 * Legislative procedure tracking result
 */
export interface LegislativeProcedure {
  /** Procedure identifier from EP API */
  procedureId: string;
  /** Procedure title from EP API */
  title: string;
  /** Procedure type (e.g., COD, NLE) */
  type: string;
  /** Current status */
  status: string;
  /** Current stage description */
  currentStage: string;
  /** Timeline of key events */
  timeline: TimelineEvent[];
  /** Committee assignments */
  committees: CommitteeAssignment[];
  /** Amendment statistics */
  amendments: AmendmentStats;
  /** Voting records */
  voting: VotingRecord[];
  /** Associated documents */
  documents: DocumentReference[];
  /** Predicted next steps */
  nextSteps?: string[];
  /** Data quality indicator */
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  /** Methodology and data source description */
  methodology: string;
  /** Warnings about partially available or missing data */
  dataQualityWarnings?: string[];
  /**
   * Named enrichment sub-steps that could not be resolved.
   * Consumers can use this to identify which data dimensions are incomplete
   * and weight per-field confidence accordingly.
   *
   * Known step names:
   * - `"basicMetadata"` — neither procedure dates nor dated events produced a timeline entry
   * - `"committeeResolve"` — responsible committee not found in API response
   * - `"rapporteurResolve"` — rapporteur not found in API response
   * - `"documentResolve"` — no document references in API response
   * - `"events-lookup"` — `/procedures/{id}/events` API call failed
   */
  enrichmentFailures?: string[];
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
