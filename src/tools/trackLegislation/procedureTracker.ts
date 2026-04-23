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

import type { Procedure, EPEvent } from '../../types/europeanParliament.js';
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
 * Build timeline entries from EP procedure events.
 * Events come from the `/procedures/{id}/events` endpoint.
 */
function buildTimelineFromEvents(events: EPEvent[]): LegislativeProcedure['timeline'] {
  return events
    .filter((event) => Boolean(event.date))
    .map((event) => ({
      date: event.date,
      stage: event.type || 'Event',
      description: event.title || event.id,
      ...(event.organizer ? { responsible: event.organizer } : {}),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
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
 * Per-step enrichment failures are tracked and returned in
 * {@link LegislativeProcedure.enrichmentFailures} so that consumers can
 * identify exactly which data dimensions are incomplete and weight
 * per-field confidence accordingly.
 * 
 * @param procedure - Real procedure data from EP API
 * @param events - Optional events from `/procedures/{id}/events` endpoint for timeline enrichment
 * @param externalEnrichmentFailures - Named sub-steps that already failed before this call
 *   (e.g. `["events-lookup"]` when the events API call threw an error)
 * @returns Structured legislative tracking data
 */
/**
 * Build per-field data-quality warnings from the procedure response.
 */
function buildDataQualityWarnings(procedure: Procedure): string[] {
  const warnings: string[] = [
    'Amendment statistics not available from single procedure endpoint; proposed/adopted/rejected counts are zero.',
    'Voting records not available from single procedure endpoint; voting array is empty.',
  ];
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
  return warnings;
}

/**
 * Determine which internal enrichment sub-steps could not be resolved from the
 * procedure payload. `basicMetadata` is added only when no usable timeline
 * entry exists (neither procedure dates nor dated events produced any entry).
 */
function collectInternalEnrichmentFailures(
  procedure: Procedure,
  eventsTimelineLength: number
): string[] {
  const failures: string[] = [];
  if (!procedure.responsibleCommittee) failures.push('committeeResolve');
  if (!procedure.rapporteur) failures.push('rapporteurResolve');
  if (procedure.documents.length === 0) failures.push('documentResolve');
  if (!procedure.dateInitiated && !procedure.dateLastActivity && eventsTimelineLength === 0) {
    failures.push('basicMetadata');
  }
  return failures;
}

/**
 * Merge procedure-date timeline and events timeline, deduplicate by
 * `date:stage` key (procedure-date entries take precedence), and sort
 * chronologically by date so consumers receive a time-ordered sequence.
 */
function mergeAndSortTimeline(
  procedureTimeline: LegislativeProcedure['timeline'],
  eventsTimeline: LegislativeProcedure['timeline']
): LegislativeProcedure['timeline'] {
  const seenKeys = new Set<string>();
  const deduped = [...procedureTimeline, ...eventsTimeline].filter((entry) => {
    const key = `${entry.date}:${entry.stage}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
  return deduped.sort((a, b) => a.date.localeCompare(b.date));
}

export function buildLegislativeTracking(
  procedure: Procedure,
  events: EPEvent[] = [],
  externalEnrichmentFailures: string[] = []
): LegislativeProcedure {
  const procedureTimeline = buildTimeline(procedure);
  const eventsTimeline = buildTimelineFromEvents(events);
  const timeline = mergeAndSortTimeline(procedureTimeline, eventsTimeline);

  const enrichmentFailures = [
    ...externalEnrichmentFailures,
    ...collectInternalEnrichmentFailures(procedure, eventsTimeline.length),
  ];

  const confidenceLevel: LegislativeProcedure['confidenceLevel'] =
    timeline.length > 0 && Boolean(procedure.responsibleCommittee) ? 'MEDIUM' : 'LOW';

  return {
    procedureId: procedure.id,
    title: procedure.title,
    type: procedure.type,
    status: procedure.status || 'COMMITTEE',
    currentStage: procedure.stage || 'Unknown',
    timeline,
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
      + 'Timeline is enriched with events from /procedures/{id}/events when available. '
      + 'Amendment and voting statistics require separate API calls and are not yet populated. '
      + 'Data source: https://data.europarl.europa.eu/api/v2/procedures',
    dataQualityWarnings: buildDataQualityWarnings(procedure),
    ...(enrichmentFailures.length > 0 ? { enrichmentFailures } : {}),
  };
}
