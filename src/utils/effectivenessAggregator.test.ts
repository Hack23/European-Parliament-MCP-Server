/**
 * Unit tests for the pure legislative-effectiveness aggregator.
 *
 * Focuses on deterministic computation, identifier normalisation,
 * date-window filtering, and committee aggregation semantics.
 */

import { describe, it, expect } from 'vitest';
import {
  aggregateLegislativeEffectiveness,
  buildSubjectTokens,
  matchesMep,
  normaliseMepIdTokens,
  roundToTwoDecimals,
} from './effectivenessAggregator.js';
import type { Procedure, AdoptedText } from '../types/ep/activities.js';
import type { LegislativeDocument } from '../types/ep/document.js';
import type { ParliamentaryQuestion } from '../types/ep/question.js';

const WINDOW = { dateFrom: '2024-01-01', dateTo: '2024-12-31' };

function proc(overrides: Partial<Procedure> = {}): Procedure {
  return {
    id: 'P-1', title: '', reference: '2024/1(COD)', type: 'COD',
    subjectMatter: '', stage: '', status: 'Ongoing',
    dateInitiated: '2024-03-01', dateLastActivity: '2024-06-01',
    responsibleCommittee: 'ENVI', rapporteur: '', documents: [],
    ...overrides,
  };
}

function text(overrides: Partial<AdoptedText> = {}): AdoptedText {
  return {
    id: 'TA-1', title: '', reference: '', type: '',
    dateAdopted: '2024-06-15', procedureReference: '', subjectMatter: '',
    ...overrides,
  };
}

function doc(overrides: Partial<LegislativeDocument> = {}): LegislativeDocument {
  return {
    id: 'D-1', title: '', type: 'AMENDMENT', date: '2024-03-01',
    authors: [], status: 'TABLED', ...overrides,
  };
}

function question(overrides: Partial<ParliamentaryQuestion> = {}): ParliamentaryQuestion {
  return {
    id: 'Q-1', type: 'WRITTEN', author: '', date: '2024-03-01',
    topic: '', questionText: '', status: 'PENDING', ...overrides,
  };
}

describe('roundToTwoDecimals', () => {
  it('rounds to two decimal places', () => {
    expect(roundToTwoDecimals(50)).toBe(50);
    expect(roundToTwoDecimals(50.555)).toBe(50.56);
    expect(roundToTwoDecimals(0.123)).toBe(0.12);
  });

  it('returns 0 for NaN / Infinity inputs (defense in depth)', () => {
    expect(roundToTwoDecimals(Number.NaN)).toBe(0);
    expect(roundToTwoDecimals(Number.POSITIVE_INFINITY)).toBe(0);
    expect(roundToTwoDecimals(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe('normaliseMepIdTokens', () => {
  it('returns empty array for empty/whitespace input', () => {
    expect(normaliseMepIdTokens('')).toEqual([]);
    expect(normaliseMepIdTokens('   ')).toEqual([]);
  });

  it('extracts bare numeric token from person/-prefixed id', () => {
    const tokens = normaliseMepIdTokens('person/124810');
    expect(tokens).toContain('person/124810');
    expect(tokens).toContain('124810');
  });

  it('extracts bare token from dash-prefixed id', () => {
    expect(normaliseMepIdTokens('MEP-124810')).toContain('124810');
  });
});

describe('matchesMep', () => {
  it('returns false for empty / null candidates', () => {
    expect(matchesMep('', ['124810'])).toBe(false);
    expect(matchesMep(null, ['124810'])).toBe(false);
    expect(matchesMep(undefined, ['124810'])).toBe(false);
  });

  it('returns false when no tokens supplied', () => {
    expect(matchesMep('anything', [])).toBe(false);
  });

  it('matches exact, prefix-stripped, and substring forms (case-insensitive)', () => {
    expect(matchesMep('Rapporteur person/124810', ['124810'])).toBe(true);
    expect(matchesMep('PERSON/124810', ['person/124810'])).toBe(true);
    expect(matchesMep('Person/999', ['124810'])).toBe(false);
  });
});

describe('buildSubjectTokens', () => {
  it('returns the MEP tokens for a single subject', () => {
    const tokens = buildSubjectTokens('person/124810');
    expect(tokens).toContain('124810');
    expect(tokens).toContain('person/124810');
  });

  it('unions committee member tokens for committee subjects', () => {
    const tokens = buildSubjectTokens('ENVI', ['person/100', 'person/200']);
    expect(tokens).toContain('100');
    expect(tokens).toContain('200');
  });
});

describe('aggregateLegislativeEffectiveness', () => {
  const baseInputs = {
    subjectId: 'person/124810',
    ...WINDOW,
    procedures: [], adoptedTexts: [], plenaryDocumentItems: [], questions: [],
  };

  it('skips procedures with missing/empty rapporteur (defensive)', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      procedures: [
        proc({ id: 'P-EMPTY', rapporteur: '' }),
        // Force a runtime-undefined rapporteur to verify defensive guard.
        proc({ id: 'P-NULL', rapporteur: undefined as unknown as string }),
        proc({ id: 'P-OK', rapporteur: 'Rapporteur person/124810' }),
      ],
    });
    expect(r.metrics.reportsAuthored).toBe(1);
    expect(r.attributions.reportProcedureIds).toEqual(['P-OK']);
  });

  it('returns zero metrics for empty inputs', () => {
    const r = aggregateLegislativeEffectiveness(baseInputs);
    expect(r.metrics).toEqual({
      reportsAuthored: 0, opinionsDelivered: 0, amendmentsTabled: 0,
      amendmentsAdopted: 0, questionsAsked: 0, legislativeSuccessRate: 0,
    });
    expect(r.attributedProcedureCount).toBe(0);
    expect(r.proceduresWithAdoptedText).toBe(0);
  });

  it('counts rapporteur attributions, excluding non-subject procedures', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      procedures: [
        proc({ id: 'P-A', reference: '2024/1(COD)', rapporteur: 'Rapporteur person/124810' }),
        proc({ id: 'P-B', reference: '2024/2(COD)', rapporteur: 'Rapporteur person/999' }),
      ],
    });
    expect(r.metrics.reportsAuthored).toBe(1);
    expect(r.attributions.reportProcedureIds).toEqual(['P-A']);
  });

  it('classifies SHADOW/OPINION rapporteur as opinion, not report', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      procedures: [
        proc({ id: 'P-OPN', rapporteur: 'Shadow rapporteur person/124810' }),
        proc({ id: 'P-OP2', rapporteur: 'Opinion rapporteur person/124810' }),
      ],
    });
    expect(r.metrics.reportsAuthored).toBe(0);
    expect(r.metrics.opinionsDelivered).toBe(2);
  });

  it('computes legislativeSuccessRate from adopted-text procedure refs', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      procedures: [
        proc({ id: 'P-1', reference: '2024/1(COD)', rapporteur: 'Rapporteur person/124810' }),
        proc({ id: 'P-2', reference: '2024/2(COD)', rapporteur: 'Rapporteur person/124810' }),
      ],
      adoptedTexts: [text({ procedureReference: '2024/1(COD)' })],
    });
    expect(r.metrics.legislativeSuccessRate).toBe(50);
    expect(r.proceduresWithAdoptedText).toBe(1);
    expect(r.attributedProcedureCount).toBe(2);
  });

  it('counts amendments tabled and adopted from plenary document items', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      plenaryDocumentItems: [
        doc({ id: 'D-1', type: 'AMENDMENT', authors: ['person/124810'], status: 'ADOPTED' }),
        doc({ id: 'D-2', type: 'AMENDMENT', authors: ['person/124810'], status: 'TABLED' }),
        doc({ id: 'D-3', type: 'REPORT', authors: ['person/124810'], status: 'ADOPTED' }),
      ],
    });
    expect(r.metrics.amendmentsTabled).toBe(2);
    expect(r.metrics.amendmentsAdopted).toBe(1);
  });

  it('counts questions by author', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      questions: [
        question({ id: 'Q-1', author: 'person/124810' }),
        question({ id: 'Q-2', author: 'person/999' }),
      ],
    });
    expect(r.metrics.questionsAsked).toBe(1);
  });

  it('filters by date window', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      dateFrom: '2024-06-01',
      dateTo: '2024-06-30',
      procedures: [
        proc({ id: 'P-IN', reference: '2024/1(COD)', dateInitiated: '2024-06-10', dateLastActivity: '2024-06-15', rapporteur: 'Rapporteur person/124810' }),
        proc({ id: 'P-OUT', reference: '2024/2(COD)', dateInitiated: '2023-01-01', dateLastActivity: '2023-01-15', rapporteur: 'Rapporteur person/124810' }),
      ],
    });
    expect(r.metrics.reportsAuthored).toBe(1);
    expect(r.attributions.reportProcedureIds).toEqual(['P-IN']);
  });

  it('sorts attributions deterministically ascending', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      procedures: [
        proc({ id: 'P-Z', reference: '2024/9(COD)', rapporteur: 'Rapporteur person/124810' }),
        proc({ id: 'P-A', reference: '2024/1(COD)', rapporteur: 'Rapporteur person/124810' }),
        proc({ id: 'P-M', reference: '2024/5(COD)', rapporteur: 'Rapporteur person/124810' }),
      ],
    });
    expect(r.attributions.reportProcedureIds).toEqual(['P-A', 'P-M', 'P-Z']);
  });

  it('aggregates across committee members when committeeMemberIds provided', () => {
    const r = aggregateLegislativeEffectiveness({
      ...baseInputs,
      subjectId: 'ENVI',
      committeeMemberIds: ['person/100', 'person/200'],
      procedures: [
        proc({ id: 'P-1', rapporteur: 'Rapporteur person/100' }),
        proc({ id: 'P-2', rapporteur: 'Rapporteur person/200' }),
        proc({ id: 'P-3', rapporteur: 'Rapporteur person/999' }),
      ],
    });
    expect(r.metrics.reportsAuthored).toBe(2);
    expect(r.attributions.reportProcedureIds).toEqual(['P-1', 'P-2']);
  });
});
