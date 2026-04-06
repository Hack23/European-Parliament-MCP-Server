/**
 * Tests for strengthened input validation schemas.
 *
 * Covers:
 * - Modern Zod 4.x email/URL syntax (z.email(), z.url())
 * - .refine() constraints for mutually exclusive/dependent parameters
 * - Minimum keyword length enforcement
 * - Entity ID format validation (MepIdSchema, SessionIdSchema)
 * - Date range cross-field validation (dateFrom <= dateTo)
 * - SearchDocuments: require either docId or keyword
 * - GetCommitteeInfo: require showCurrent=true, id, or abbreviation
 */

import { describe, it, expect } from 'vitest';
import {
  MepIdSchema,
  SessionIdSchema,
  refineDateRange,
  DATE_RANGE_ERROR,
} from './common.js';
import { MEPSchema, MEPDetailsSchema } from './mep.js';
import { SearchDocumentsSchema, LegislativeDocumentSchema } from './document.js';
import { GetCommitteeInfoSchema } from './committee.js';
import { GetPlenarySessionsSchema, GetVotingRecordsSchema } from './plenary.js';
import { GetParliamentaryQuestionsSchema } from './question.js';
import {
  AnalyzeVotingPatternsSchema,
  GenerateReportSchema,
  AssessMepInfluenceSchema,
  AnalyzeCoalitionDynamicsSchema,
  DetectVotingAnomaliesSchema,
  ComparePoliticalGroupsSchema,
  AnalyzeLegislativeEffectivenessSchema,
  MonitorLegislativePipelineSchema,
} from './analysis.js';

// ── MepIdSchema ──────────────────────────────────────────────────────────

describe('MepIdSchema', () => {
  it('should accept numeric MEP ID', () => {
    expect(() => MepIdSchema.parse('124810')).not.toThrow();
  });

  it('should accept "MEP-{number}" format', () => {
    expect(() => MepIdSchema.parse('MEP-124810')).not.toThrow();
  });

  it('should accept "person/{number}" format', () => {
    expect(() => MepIdSchema.parse('person/124810')).not.toThrow();
  });

  it('should reject empty string', () => {
    expect(() => MepIdSchema.parse('')).toThrow();
  });

  it('should reject invalid format (random text)', () => {
    expect(() => MepIdSchema.parse('some-random-text')).toThrow();
  });

  it('should reject invalid format (missing number after MEP-)', () => {
    expect(() => MepIdSchema.parse('MEP-')).toThrow();
  });

  it('should reject paths with double slashes', () => {
    expect(() => MepIdSchema.parse('person//123')).toThrow();
  });
});

// ── SessionIdSchema ──────────────────────────────────────────────────────

describe('SessionIdSchema', () => {
  it('should accept alphanumeric session ID', () => {
    expect(() => SessionIdSchema.parse('MTG-PL-2024-06-01')).not.toThrow();
  });

  it('should accept ID with underscores', () => {
    expect(() => SessionIdSchema.parse('session_123')).not.toThrow();
  });

  it('should accept plain numeric ID', () => {
    expect(() => SessionIdSchema.parse('12345')).not.toThrow();
  });

  it('should reject empty string', () => {
    expect(() => SessionIdSchema.parse('')).toThrow();
  });

  it('should reject ID with special characters', () => {
    expect(() => SessionIdSchema.parse('session@123!')).toThrow();
  });

  it('should reject ID with spaces', () => {
    expect(() => SessionIdSchema.parse('session 123')).toThrow();
  });
});

// ── refineDateRange helper ───────────────────────────────────────────────

describe('refineDateRange', () => {
  it('should return true when no dates provided', () => {
    expect(refineDateRange({})).toBe(true);
  });

  it('should return true when only dateFrom provided', () => {
    expect(refineDateRange({ dateFrom: '2024-01-01' })).toBe(true);
  });

  it('should return true when only dateTo provided', () => {
    expect(refineDateRange({ dateTo: '2024-12-31' })).toBe(true);
  });

  it('should return true when dateFrom < dateTo', () => {
    expect(refineDateRange({ dateFrom: '2024-01-01', dateTo: '2024-12-31' })).toBe(true);
  });

  it('should return true when dateFrom === dateTo', () => {
    expect(refineDateRange({ dateFrom: '2024-06-15', dateTo: '2024-06-15' })).toBe(true);
  });

  it('should return false when dateFrom > dateTo', () => {
    expect(refineDateRange({ dateFrom: '2024-12-31', dateTo: '2024-01-01' })).toBe(false);
  });
});

// ── MEP email/URL (modern Zod 4.x syntax) ───────────────────────────────

describe('MEP schema email/URL validation', () => {
  const baseMep = {
    id: '1',
    name: 'Test',
    country: 'SE',
    politicalGroup: 'EPP',
    committees: [],
    active: true,
    termStart: '2024-07-01',
  };

  it('should accept valid email in MEPSchema', () => {
    const result = MEPSchema.safeParse({ ...baseMep, email: 'mep@europarl.eu' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email in MEPSchema', () => {
    const result = MEPSchema.safeParse({ ...baseMep, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should accept missing email in MEPSchema', () => {
    const result = MEPSchema.safeParse(baseMep);
    expect(result.success).toBe(true);
  });

  it('should accept valid URL in MEPDetailsSchema', () => {
    const result = MEPDetailsSchema.safeParse({ ...baseMep, website: 'https://example.com' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid URL in MEPDetailsSchema', () => {
    const result = MEPDetailsSchema.safeParse({ ...baseMep, website: 'not a url' });
    expect(result.success).toBe(false);
  });

  it('should accept missing URL in MEPDetailsSchema', () => {
    const result = MEPDetailsSchema.safeParse(baseMep);
    expect(result.success).toBe(true);
  });
});

// ── LegislativeDocumentSchema URL validation ─────────────────────────────

describe('LegislativeDocumentSchema URL validation', () => {
  const baseDoc = {
    id: 'doc-1',
    type: 'REPORT' as const,
    title: 'Test Report',
    date: '2024-06-01',
    authors: ['Author'],
    status: 'ADOPTED' as const,
  };

  it('should accept valid PDF URL', () => {
    const result = LegislativeDocumentSchema.safeParse({
      ...baseDoc,
      pdfUrl: 'https://www.europarl.europa.eu/doc.pdf',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid PDF URL', () => {
    const result = LegislativeDocumentSchema.safeParse({
      ...baseDoc,
      pdfUrl: 'not a url',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid XML URL', () => {
    const result = LegislativeDocumentSchema.safeParse({
      ...baseDoc,
      xmlUrl: 'https://data.europarl.europa.eu/doc.xml',
    });
    expect(result.success).toBe(true);
  });
});

// ── SearchDocumentsSchema refinement ─────────────────────────────────────

describe('SearchDocumentsSchema refinement', () => {
  it('should accept valid keyword', () => {
    const result = SearchDocumentsSchema.safeParse({ keyword: 'climate' });
    expect(result.success).toBe(true);
  });

  it('should accept valid docId', () => {
    const result = SearchDocumentsSchema.safeParse({ docId: 'A9-0001/2024' });
    expect(result.success).toBe(true);
  });

  it('should accept both docId and keyword', () => {
    const result = SearchDocumentsSchema.safeParse({ docId: 'A9-0001', keyword: 'climate' });
    expect(result.success).toBe(true);
  });

  it('should reject when neither docId nor keyword provided', () => {
    const result = SearchDocumentsSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map(i => i.message).join('; ');
      expect(msg).toContain('Either docId or keyword must be provided');
    }
  });

  it('should reject single-character keyword', () => {
    const result = SearchDocumentsSchema.safeParse({ keyword: 'x' });
    expect(result.success).toBe(false);
  });

  it('should accept two-character keyword', () => {
    const result = SearchDocumentsSchema.safeParse({ keyword: 'AI' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid date range (dateFrom > dateTo)', () => {
    const result = SearchDocumentsSchema.safeParse({
      keyword: 'climate',
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map(i => i.message).join('; ');
      expect(msg).toContain(DATE_RANGE_ERROR);
    }
  });

  it('should accept valid date range', () => {
    const result = SearchDocumentsSchema.safeParse({
      keyword: 'climate',
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });
});

// ── GetCommitteeInfoSchema refinement ────────────────────────────────────

describe('GetCommitteeInfoSchema refinement', () => {
  it('should accept showCurrent=true', () => {
    const result = GetCommitteeInfoSchema.safeParse({ showCurrent: true });
    expect(result.success).toBe(true);
  });

  it('should accept id parameter', () => {
    const result = GetCommitteeInfoSchema.safeParse({ id: 'ENVI-123' });
    expect(result.success).toBe(true);
  });

  it('should accept abbreviation parameter', () => {
    const result = GetCommitteeInfoSchema.safeParse({ abbreviation: 'ENVI' });
    expect(result.success).toBe(true);
  });

  it('should reject when no identifying parameter provided', () => {
    const result = GetCommitteeInfoSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map(i => i.message).join('; ');
      expect(msg).toContain('Either showCurrent=true, id, or abbreviation is required');
    }
  });

  it('should reject showCurrent=false without id or abbreviation', () => {
    const result = GetCommitteeInfoSchema.safeParse({ showCurrent: false });
    expect(result.success).toBe(false);
  });
});

// ── Plenary date range validation ────────────────────────────────────────

describe('GetPlenarySessionsSchema date range', () => {
  it('should accept valid date range', () => {
    const result = GetPlenarySessionsSchema.safeParse({
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid date range', () => {
    const result = GetPlenarySessionsSchema.safeParse({
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('should accept when no dates provided', () => {
    const result = GetPlenarySessionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('GetVotingRecordsSchema date range', () => {
  it('should accept valid date range', () => {
    const result = GetVotingRecordsSchema.safeParse({
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid date range', () => {
    const result = GetVotingRecordsSchema.safeParse({
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });
});

// ── Question date range validation ───────────────────────────────────────

describe('GetParliamentaryQuestionsSchema date range', () => {
  it('should accept valid date range', () => {
    const result = GetParliamentaryQuestionsSchema.safeParse({
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid date range', () => {
    const result = GetParliamentaryQuestionsSchema.safeParse({
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });
});

// ── Analysis date range validation ───────────────────────────────────────

describe('Analysis schemas date range validation', () => {
  it('AnalyzeVotingPatternsSchema should reject invalid date range', () => {
    const result = AnalyzeVotingPatternsSchema.safeParse({
      mepId: '12345',
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('AnalyzeVotingPatternsSchema should accept valid date range', () => {
    const result = AnalyzeVotingPatternsSchema.safeParse({
      mepId: '12345',
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('GenerateReportSchema should reject invalid date range', () => {
    const result = GenerateReportSchema.safeParse({
      reportType: 'MEP_ACTIVITY',
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('AssessMepInfluenceSchema should reject invalid date range', () => {
    const result = AssessMepInfluenceSchema.safeParse({
      mepId: '12345',
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('AnalyzeCoalitionDynamicsSchema should reject invalid date range', () => {
    const result = AnalyzeCoalitionDynamicsSchema.safeParse({
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('DetectVotingAnomaliesSchema should reject invalid date range', () => {
    const result = DetectVotingAnomaliesSchema.safeParse({
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('DetectVotingAnomaliesSchema should still enforce mepId/groupId exclusivity', () => {
    const result = DetectVotingAnomaliesSchema.safeParse({
      mepId: '12345',
      groupId: 'EPP',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map(i => i.message).join('; ');
      expect(msg).toContain('Cannot specify both mepId and groupId');
    }
  });

  it('ComparePoliticalGroupsSchema should reject invalid date range', () => {
    const result = ComparePoliticalGroupsSchema.safeParse({
      groupIds: ['EPP', 'S&D'],
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('AnalyzeLegislativeEffectivenessSchema should reject invalid date range', () => {
    const result = AnalyzeLegislativeEffectivenessSchema.safeParse({
      subjectType: 'MEP',
      subjectId: '12345',
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('MonitorLegislativePipelineSchema should reject invalid date range', () => {
    const result = MonitorLegislativePipelineSchema.safeParse({
      dateFrom: '2024-12-31',
      dateTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('MonitorLegislativePipelineSchema should accept valid date range', () => {
    const result = MonitorLegislativePipelineSchema.safeParse({
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });
    expect(result.success).toBe(true);
  });
});

// ── Existing valid inputs still pass (regression tests) ──────────────────

describe('Regression tests — existing valid inputs', () => {
  it('SearchDocumentsSchema with all options', () => {
    const result = SearchDocumentsSchema.safeParse({
      keyword: 'climate change',
      documentType: 'RESOLUTION',
      dateFrom: '2024-01-01',
      dateTo: '2024-06-30',
      committee: 'ENVI',
      limit: 50,
      offset: 0,
    });
    expect(result.success).toBe(true);
  });

  it('GetCommitteeInfoSchema with id + abbreviation', () => {
    const result = GetCommitteeInfoSchema.safeParse({
      id: 'ENVI-123',
      abbreviation: 'ENVI',
    });
    expect(result.success).toBe(true);
  });

  it('AnalyzeVotingPatternsSchema with all fields', () => {
    const result = AnalyzeVotingPatternsSchema.safeParse({
      mepId: '12345',
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
      compareWithGroup: false,
    });
    expect(result.success).toBe(true);
  });

  it('GetPlenarySessionsSchema with year only', () => {
    const result = GetPlenarySessionsSchema.safeParse({ year: 2024 });
    expect(result.success).toBe(true);
  });

  it('GetParliamentaryQuestionsSchema with type and status', () => {
    const result = GetParliamentaryQuestionsSchema.safeParse({
      type: 'WRITTEN',
      status: 'ANSWERED',
    });
    expect(result.success).toBe(true);
  });

  it('DetectVotingAnomaliesSchema with only mepId', () => {
    const result = DetectVotingAnomaliesSchema.safeParse({ mepId: '12345' });
    expect(result.success).toBe(true);
  });

  it('DetectVotingAnomaliesSchema with only groupId', () => {
    const result = DetectVotingAnomaliesSchema.safeParse({ groupId: 'EPP' });
    expect(result.success).toBe(true);
  });

  it('DetectVotingAnomaliesSchema with no filters', () => {
    const result = DetectVotingAnomaliesSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
