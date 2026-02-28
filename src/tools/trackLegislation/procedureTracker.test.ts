/**
 * Unit tests for procedureTracker.ts
 *
 * Tests all branch paths in buildLegislativeTracking and its helpers.
 * All tests are deterministic — no external API calls.
 */

import { describe, it, expect } from 'vitest';
import { buildLegislativeTracking } from './procedureTracker.js';
import type { Procedure } from '../../types/europeanParliament.js';

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

  it('always returns MEDIUM confidenceLevel', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.confidenceLevel).toBe('MEDIUM');
  });

  it('includes EP API reference in methodology', () => {
    const result = buildLegislativeTracking(makeProcedure());
    expect(result.methodology).toContain('/procedures');
    expect(result.methodology).toContain('EP API');
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
