/**
 * Unit tests for procedureTracker.ts
 *
 * Tests all branch paths in buildLegislativeTracking and its helpers.
 * All tests are deterministic — no external API calls.
 */

import { describe, it, expect } from 'vitest';
import { buildLegislativeTracking } from './procedureTracker.js';
import type { Procedure, EPEvent } from '../../types/europeanParliament.js';

// ─── Fixture helpers ─────────────────────────────────────────────────────────

function makeProcedure(overrides: Partial<Procedure> = {}): Procedure {
  return {
    id: 'COD/2024/0001',
    title: 'Test Regulation',
    reference: '2024/0001(COD)',
    type: 'COD',
    subjectMatter: 'Internal Market',
    stage: 'Awaiting committee decision',
    status: 'Ongoing',
    dateInitiated: '2024-01-15',
    dateLastActivity: '2024-06-20',
    responsibleCommittee: 'IMCO',
    rapporteur: 'Test Rapporteur',
    documents: ['COM(2024)0001', 'A9-0123/2024'],
    ...overrides,
  };
}

function makeEvent(overrides: Partial<EPEvent> = {}): EPEvent {
  return {
    id: 'evt-001',
    title: 'Committee hearing',
    date: '2025-02-10',
    endDate: '',
    type: 'HEARING',
    location: 'Brussels',
    organizer: 'IMCO',
    status: 'CONFIRMED',
    ...overrides,
  };
}

// ─── buildLegislativeTracking ────────────────────────────────────────────────

describe('buildLegislativeTracking', () => {
  // ── top-level fields ───────────────────────────────────────────────────────

  it('maps procedureId from procedure.id', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.procedureId).toBe('COD/2024/0001');
  });

  it('maps title from procedure.title', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.title).toBe('Test Regulation');
  });

  it('maps type from procedure.type', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.type).toBe('COD');
  });

  it('uses procedure.status when provided', () => {
    const result = buildLegislativeTracking(makeProcedure({ status: 'Ongoing' }));
    expect(result.status).toBe('Ongoing');
  });

  it('falls back to "COMMITTEE" when status is empty', () => {
    const result = buildLegislativeTracking(makeProcedure({ status: '' }));
    expect(result.status).toBe('COMMITTEE');
  });

  it('uses procedure.stage for currentStage when provided', () => {
    const result = buildLegislativeTracking(makeProcedure({ stage: 'First reading' }));
    expect(result.currentStage).toBe('First reading');
  });

  it('falls back to "Unknown" for currentStage when stage is empty', () => {
    const result = buildLegislativeTracking(makeProcedure({ stage: '' }));
    expect(result.currentStage).toBe('Unknown');
  });

  it('has fixed amendments structure', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.amendments).toEqual({ proposed: 0, adopted: 0, rejected: 0 });
  });

  it('has empty voting array', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.voting).toEqual([]);
  });

  it('returns MEDIUM confidenceLevel when timeline and committee are present', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.confidenceLevel).toBe('MEDIUM');
  });

  it('returns LOW confidenceLevel when timeline and committee are missing', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '', responsibleCommittee: '' })
    );
    expect(result.confidenceLevel).toBe('LOW');
  });

  it('includes EP API reference in methodology', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.methodology).toContain('/procedures');
    expect(result.methodology).toContain('EP API');
  });

  // ── data quality warnings ──────────────────────────────────────────────────

  it('always includes amendment and voting data quality warnings', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.dataQualityWarnings).toBeDefined();
    expect(result.dataQualityWarnings?.some((w) => w.includes('Amendment'))).toBe(true);
    expect(result.dataQualityWarnings?.some((w) => w.includes('Voting'))).toBe(true);
  });

  it('includes warning when dateInitiated is missing', () => {
    const result = buildLegislativeTracking(makeProcedure({ dateInitiated: '' }));
    expect(result.dataQualityWarnings?.some((w) => w.includes('initiation date'))).toBe(true);
  });

  it('includes warning when dateLastActivity is missing', () => {
    const result = buildLegislativeTracking(makeProcedure({ dateLastActivity: '' }));
    expect(result.dataQualityWarnings?.some((w) => w.includes('Last activity date'))).toBe(true);
  });

  it('includes warning when responsibleCommittee is missing', () => {
    const result = buildLegislativeTracking(makeProcedure({ responsibleCommittee: '' }));
    expect(result.dataQualityWarnings?.some((w) => w.includes('Responsible committee'))).toBe(true);
  });

  it('includes warning when rapporteur is missing', () => {
    const result = buildLegislativeTracking(makeProcedure({ rapporteur: '' }));
    expect(result.dataQualityWarnings?.some((w) => w.includes('Rapporteur'))).toBe(true);
  });

  it('does not include date warnings when dates are present', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.dataQualityWarnings?.some((w) => w.includes('initiation date'))).toBe(false);
    expect(result.dataQualityWarnings?.some((w) => w.includes('Last activity date'))).toBe(false);
  });

  // ── documents mapping ──────────────────────────────────────────────────────

  it('maps documents array correctly', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.documents).toHaveLength(2);
    expect(result.documents[0].id).toBe('COM(2024)0001');
    expect(result.documents[0].title).toBe('Reference: COM(2024)0001');
    expect(result.documents[0].type).toBe('Document');
  });

  it('uses dateLastActivity as document date when available', () => {
    const result = buildLegislativeTracking(makeProcedure({ dateLastActivity: '2024-06-20' }));
    expect(result.documents[0].date).toBe('2024-06-20');
  });

  it('falls back to dateInitiated when dateLastActivity is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateLastActivity: '', dateInitiated: '2024-01-15' })
    );
    expect(result.documents[0].date).toBe('2024-01-15');
  });

  it('falls back to empty string when both dates are empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateLastActivity: '', dateInitiated: '' })
    );
    expect(result.documents[0].date).toBe('');
  });

  it('handles empty documents array', () => {
    const result = buildLegislativeTracking(makeProcedure({ documents: [] }));
    expect(result.documents).toEqual([]);
  });
});

// ─── buildTimeline (tested via buildLegislativeTracking) ─────────────────────

describe('buildTimeline (via buildLegislativeTracking)', () => {
  it('creates two timeline entries when both dates differ', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '2024-01-15', dateLastActivity: '2024-06-20' })
    );
    expect(result.timeline).toHaveLength(2);
    expect(result.timeline[0].stage).toBe('Initiated');
    expect(result.timeline[0].date).toBe('2024-01-15');
  });

  it('uses reference in timeline description when reference is provided', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ reference: '2024/0001(COD)', id: 'COD/2024/0001' })
    );
    expect(result.timeline[0].description).toContain('2024/0001(COD)');
  });

  it('uses id in timeline description when reference is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ reference: '', id: 'COD/2024/0001' })
    );
    expect(result.timeline[0].description).toContain('COD/2024/0001');
  });

  it('uses stage in second timeline entry when stage is provided', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ stage: 'First reading', dateLastActivity: '2024-06-20' })
    );
    expect(result.timeline[1].stage).toBe('First reading');
  });

  it('falls back to "Latest activity" in second entry when stage is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ stage: '', dateLastActivity: '2024-06-20' })
    );
    expect(result.timeline[1].stage).toBe('Latest activity');
  });

  it('creates only one timeline entry when dateInitiated is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '2024-06-20' })
    );
    // dateInitiated is falsy, so no "Initiated" event
    expect(result.timeline).toHaveLength(1);
    expect(result.timeline[0].stage).not.toBe('Initiated');
  });

  it('creates no timeline entries when both dates are empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' })
    );
    expect(result.timeline).toHaveLength(0);
  });

  it('creates one entry when dateLastActivity equals dateInitiated', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '2024-01-15', dateLastActivity: '2024-01-15' })
    );
    // Second entry is suppressed because dates are the same
    expect(result.timeline).toHaveLength(1);
    expect(result.timeline[0].stage).toBe('Initiated');
  });

  it('creates only initiated entry when dateLastActivity is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '2024-01-15', dateLastActivity: '' })
    );
    expect(result.timeline).toHaveLength(1);
    expect(result.timeline[0].stage).toBe('Initiated');
  });
});

// ─── buildCommittees (tested via buildLegislativeTracking) ───────────────────

describe('buildCommittees (via buildLegislativeTracking)', () => {
  it('returns empty array when responsibleCommittee is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ responsibleCommittee: '' })
    );
    expect(result.committees).toEqual([]);
  });

  it('returns one committee entry when responsibleCommittee is provided', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ responsibleCommittee: 'IMCO' })
    );
    expect(result.committees).toHaveLength(1);
    expect(result.committees[0].abbreviation).toBe('IMCO');
    expect(result.committees[0].role).toBe('LEAD');
  });

  it('includes rapporteur when provided', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ responsibleCommittee: 'IMCO', rapporteur: 'Jane Doe' })
    );
    expect(result.committees[0].rapporteur).toBe('Jane Doe');
  });

  it('omits rapporteur field when rapporteur is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ responsibleCommittee: 'IMCO', rapporteur: '' })
    );
    expect(result.committees[0].rapporteur).toBeUndefined();
  });
});

// ─── buildNextSteps (tested via buildLegislativeTracking) ────────────────────

describe('buildNextSteps (via buildLegislativeTracking)', () => {
  it('includes stage and status steps when both are provided', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ stage: 'First reading', status: 'Ongoing' })
    );
    expect(result.nextSteps).toContain('Current stage: First reading');
    expect(result.nextSteps).toContain('Status: Ongoing');
  });

  it('omits stage step when stage is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ stage: '', status: 'Ongoing' })
    );
    expect(result.nextSteps.some((s) => s.startsWith('Current stage:'))).toBe(false);
    expect(result.nextSteps).toContain('Status: Ongoing');
  });

  it('omits status step when status is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ stage: 'First reading', status: '' })
    );
    expect(result.nextSteps).toContain('Current stage: First reading');
    expect(result.nextSteps.some((s) => s.startsWith('Status:'))).toBe(false);
  });

  it('returns empty next steps when both stage and status are empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ stage: '', status: '' })
    );
    expect(result.nextSteps).toEqual([]);
  });
});

// ─── enrichmentFailures (tested via buildLegislativeTracking) ────────────────

describe('enrichmentFailures (via buildLegislativeTracking)', () => {
  it('returns undefined enrichmentFailures when all fields are present', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.enrichmentFailures).toBeUndefined();
  });

  it('includes committeeResolve when responsibleCommittee is empty', () => {
    const result = buildLegislativeTracking(makeProcedure({ responsibleCommittee: '' }));
    expect(result.enrichmentFailures).toContain('committeeResolve');
  });

  it('includes rapporteurResolve when rapporteur is empty', () => {
    const result = buildLegislativeTracking(makeProcedure({ rapporteur: '' }));
    expect(result.enrichmentFailures).toContain('rapporteurResolve');
  });

  it('includes documentResolve when documents array is empty', () => {
    const result = buildLegislativeTracking(makeProcedure({ documents: [] }));
    expect(result.enrichmentFailures).toContain('documentResolve');
  });

  it('includes basicMetadata when dates and events are all empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' }),
      []
    );
    expect(result.enrichmentFailures).toContain('basicMetadata');
  });

  it('does NOT include basicMetadata when events are provided even without dates', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' }),
      [makeEvent()]
    );
    // enrichmentFailures may be undefined (no failures) or an array without basicMetadata
    expect(result.enrichmentFailures ?? []).not.toContain('basicMetadata');
  });

  it('includes basicMetadata when events are provided but all have empty dates', () => {
    // Events exist but are filtered out of the timeline because they have no date.
    // basicMetadata should be flagged since the merged timeline is still empty.
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' }),
      [makeEvent({ date: '' }), makeEvent({ id: 'evt-002', date: '' })]
    );
    expect(result.enrichmentFailures).toContain('basicMetadata');
  });

  it('propagates external enrichment failures (e.g. events-lookup)', () => {
    const result = buildLegislativeTracking(makeProcedure(), [], ['events-lookup']);
    expect(result.enrichmentFailures).toContain('events-lookup');
  });

  it('merges external and internal enrichment failures', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ responsibleCommittee: '', rapporteur: '' }),
      [],
      ['events-lookup']
    );
    expect(result.enrichmentFailures).toContain('events-lookup');
    expect(result.enrichmentFailures).toContain('committeeResolve');
    expect(result.enrichmentFailures).toContain('rapporteurResolve');
  });
});

// ─── events-enriched timeline (tested via buildLegislativeTracking) ──────────

describe('events-enriched timeline (via buildLegislativeTracking)', () => {
  it('merges procedure dates and events into the timeline', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '2024-01-15', dateLastActivity: '2024-06-20' }),
      [makeEvent({ date: '2025-02-10', type: 'HEARING', title: 'Committee hearing' })]
    );
    expect(result.timeline.length).toBe(3);
    const dates = result.timeline.map((t) => t.date);
    expect(dates).toContain('2024-01-15');
    expect(dates).toContain('2024-06-20');
    expect(dates).toContain('2025-02-10');
  });

  it('deduplicates timeline entries with same date and stage', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '2024-01-15', dateLastActivity: '2024-06-20' }),
      [makeEvent({ date: '2024-01-15', type: 'Initiated', title: 'Same day event' })]
    );
    const initiated = result.timeline.filter((t) => t.date === '2024-01-15' && t.stage === 'Initiated');
    expect(initiated.length).toBe(1);
  });

  it('merged timeline is sorted chronologically across procedure dates and events', () => {
    // Event date (2024-03-05) falls between dateInitiated (2024-01-15) and dateLastActivity (2024-06-20).
    // Without sorting, the merged list would be [2024-01-15, 2024-06-20, 2024-03-05].
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '2024-01-15', dateLastActivity: '2024-06-20' }),
      [makeEvent({ date: '2024-03-05', type: 'HEARING', title: 'Mid-term hearing' })]
    );
    const dates = result.timeline.map((t) => t.date);
    expect(dates).toEqual(['2024-01-15', '2024-03-05', '2024-06-20']);
  });

  it('populates timeline from events when procedure dates are absent', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' }),
      [makeEvent({ date: '2025-03-01', type: 'COMMITTEE_VOTE', title: 'Vote on draft' })]
    );
    expect(result.timeline.length).toBe(1);
    expect(result.timeline[0].date).toBe('2025-03-01');
    expect(result.timeline[0].stage).toBe('COMMITTEE_VOTE');
  });

  it('events timeline entries are sorted by date', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' }),
      [
        makeEvent({ id: 'evt-b', date: '2025-04-01', type: 'B' }),
        makeEvent({ id: 'evt-a', date: '2025-01-01', type: 'A' }),
      ]
    );
    expect(result.timeline[0].date).toBe('2025-01-01');
    expect(result.timeline[1].date).toBe('2025-04-01');
  });

  it('events with empty date are excluded from timeline', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' }),
      [makeEvent({ date: '' })]
    );
    expect(result.timeline).toHaveLength(0);
  });

  it('achieves MEDIUM confidence when only events provide timeline and committee is present', () => {
    // Committee is present and events provide the timeline
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '', responsibleCommittee: 'IMCO' }),
      [makeEvent()]
    );
    expect(result.confidenceLevel).toBe('MEDIUM');
  });

  it('populates responsible from event organizer', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' }),
      [makeEvent({ organizer: 'ENVI', date: '2025-01-01', type: 'HEARING' })]
    );
    expect(result.timeline[0].responsible).toBe('ENVI');
  });

  it('omits responsible when event organizer is empty', () => {
    const result = buildLegislativeTracking(
      makeProcedure({ dateInitiated: '', dateLastActivity: '' }),
      [makeEvent({ organizer: '', date: '2025-01-01', type: 'HEARING' })]
    );
    expect(result.timeline[0].responsible).toBeUndefined();
  });

  it('includes events enrichment note in methodology', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.methodology).toContain('/procedures/{process-id}/events');
  });
});
