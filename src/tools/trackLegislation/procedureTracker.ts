/**
 * Procedure tracker for legislative data
 * 
 * Transforms real EP API Procedure data into structured legislative
 * tracking output. Most fields are derived from the API response.
 * Amendment counts and voting records are placeholder zeros/empty arrays
 * because the single-procedure endpoint does not provide them; these
 * are flagged via {@link LegislativeProcedure.dataQualityWarnings}.
 * 
 * ISMS Policy: SC-002 (Input Validation)
 */

import type { Procedure } from '../../types/europeanParliament.js';
import type { LegislativeProcedure } from './types.js';

/**
 * Derive a timeline from the procedure's date fields.
 * All dates come from the real EP API response.
 */
function buildTimeline(procedure: Procedure): LegislativeProcedure['timeline'] {
  const events: LegislativeProcedure['timeline'] = [];

  if (procedure.dateInitiated) {
    events.push({
      date: procedure.dateInitiated,
      stage: 'Initiated',
      description: `Procedure ${procedure.reference || procedure.id} initiated`,
    });
  }

  if (procedure.dateLastActivity && procedure.dateLastActivity !== procedure.dateInitiated) {
    events.push({
      date: procedure.dateLastActivity,
      stage: procedure.stage || 'Latest activity',
      description: `Latest recorded activity for ${procedure.reference || procedure.id}`,
    });
  }

  return events;
}

/**
 * Derive committee assignments from the procedure data.
 */
function buildCommittees(procedure: Procedure): LegislativeProcedure['committees'] {
  if (!procedure.responsibleCommittee) {
    return [];
  }
  const assignment: LegislativeProcedure['committees'][number] = {
    abbreviation: procedure.responsibleCommittee,
    role: 'LEAD' as const,
  };
  if (procedure.rapporteur) {
    assignment.rapporteur = procedure.rapporteur;
  }
  return [assignment];
}

/**
 * Derive next steps from the current stage.
 */
function buildNextSteps(procedure: Procedure): string[] {
  const steps: string[] = [];
  if (procedure.stage) {
    steps.push(`Current stage: ${procedure.stage}`);
  }
  if (procedure.status) {
    steps.push(`Status: ${procedure.status}`);
  }
  return steps;
}

/**
 * Build a legislative tracking result from a real EP API Procedure.
 * 
 * Most fields are derived directly from the API response. Amendment counts
 * and voting records are placeholders (zeros / empty array) because the
 * single-procedure endpoint does not supply them; these are surfaced in
 * {@link LegislativeProcedure.dataQualityWarnings}.
 * 
 * @param procedure - Real procedure data from EP API
 * @returns Structured legislative tracking data
 */
export function buildLegislativeTracking(procedure: Procedure): LegislativeProcedure {
  const warnings: string[] = [];

  warnings.push(
    'Amendment statistics not available from single procedure endpoint; proposed/adopted/rejected counts are zero.'
  );
  warnings.push(
    'Voting records not available from single procedure endpoint; voting array is empty.'
  );

  if (!procedure.dateInitiated) {
    warnings.push('Procedure initiation date is missing from EP API response.');
  }
  if (!procedure.dateLastActivity) {
    warnings.push('Last activity date is missing from EP API response.');
  }
  if (!procedure.responsibleCommittee) {
    warnings.push('Responsible committee is not assigned or missing from EP API response.');
  }
  if (!procedure.rapporteur) {
    warnings.push('Rapporteur is not assigned or missing from EP API response.');
  }

  const hasTimeline = Boolean(procedure.dateInitiated) || Boolean(procedure.dateLastActivity);
  const hasCommittee = Boolean(procedure.responsibleCommittee);
  const confidenceLevel: LegislativeProcedure['confidenceLevel'] =
    hasTimeline && hasCommittee ? 'MEDIUM' : 'LOW';

  return {
    procedureId: procedure.id,
    title: procedure.title,
    type: procedure.type,
    status: procedure.status || 'COMMITTEE',
    currentStage: procedure.stage || 'Unknown',
    timeline: buildTimeline(procedure),
    committees: buildCommittees(procedure),
    amendments: { proposed: 0, adopted: 0, rejected: 0 },
    voting: [],
    documents: procedure.documents.map((docRef) => ({
      id: docRef,
      type: 'Document',
      date: procedure.dateLastActivity || procedure.dateInitiated || '',
      title: `Reference: ${docRef}`,
    })),
    nextSteps: buildNextSteps(procedure),
    confidenceLevel,
    methodology: 'Real-time data from EP API /procedures endpoint. '
      + 'Procedure details (title, type, stage, status, dates, committee, rapporteur, documents) '
      + 'are sourced directly from the European Parliament open data API. '
      + 'Amendment and voting statistics require separate API calls and are not yet populated. '
      + 'Data source: https://data.europarl.europa.eu/api/v2/procedures',
    dataQualityWarnings: warnings,
  };
}
