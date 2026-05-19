/**
 * Tests for analyze_legislative_effectiveness MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleAnalyzeLegislativeEffectiveness,
  clearAnalyzeLegislativeEffectivenessCache,
} from './analyzeLegislativeEffectiveness.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn(),
    getCommitteeInfo: vi.fn(),
    getProcedures: vi.fn(),
    getAdoptedTexts: vi.fn(),
    getPlenarySessionDocumentItems: vi.fn(),
    getParliamentaryQuestions: vi.fn(),
  }
}));

/** Build a paginated response envelope matching the EP client contract. */
function paged<T>(data: T[]): { data: T[]; total: number; limit: number; offset: number; hasMore: boolean } {
  return { data, total: data.length, limit: 200, offset: 0, hasMore: false };
}

describe('analyze_legislative_effectiveness Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAnalyzeLegislativeEffectivenessCache();

    // Default: all four new EP sources return empty arrays so legacy tests
    // operate on a clean zero baseline. Individual tests override as needed.
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([]));
    vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(paged([]));
    vi.mocked(epClientModule.epClient.getPlenarySessionDocumentItems).mockResolvedValue(paged([]));
    vi.mocked(epClientModule.epClient.getParliamentaryQuestions).mockResolvedValue(paged([]));

    vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
      id: 'MEP-1',
      name: 'Test MEP',
      country: 'SE',
      politicalGroup: 'EPP',
      committees: ['AGRI', 'ENVI'],
      active: true,
      termStart: '2019-07-02',
      roles: ['Rapporteur - Report on climate', 'Vice-Chair - ENVI'],
      votingStatistics: {
        totalVotes: 1250,
        votesFor: 850,
        votesAgainst: 200,
        abstentions: 200,
        attendanceRate: 92.5
      }
    });

    vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
      id: 'COMM-ENVI',
      name: 'Committee on Environment, Public Health and Food Safety',
      abbreviation: 'ENVI',
      members: ['MEP-1', 'MEP-2'],
      chair: 'MEP-1',
      viceChairs: ['MEP-2'],
      meetingSchedule: ['2024-01-15', '2024-02-15'],
      responsibilities: ['Environmental policy', 'Public health']
    });
  });

  describe('Input Validation', () => {
    it('should accept MEP subject type', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      expect(result).toHaveProperty('content');
    });

    it('should accept COMMITTEE subject type', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'COMMITTEE',
        subjectId: 'ENVI'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject missing subjectType', async () => {
      await expect(handleAnalyzeLegislativeEffectiveness({ subjectId: 'MEP-1' }))
        .rejects.toThrow();
    });

    it('should reject missing subjectId', async () => {
      await expect(handleAnalyzeLegislativeEffectiveness({ subjectType: 'MEP' }))
        .rejects.toThrow();
    });

    it('should accept date parameters', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });
  });

  describe('Response Structure', () => {

    it('should include dataQualityWarnings array in response', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({ subjectType: 'MEP', subjectId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });
    it('should return MCP-compliant response', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      expect(() => JSON.parse(result.content[0]?.text ?? '{}') as unknown).not.toThrow();
    });

    it('should include effectiveness metrics', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('scores');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('benchmarks');
      expect(data).toHaveProperty('confidenceLevel');
    });

    it('should include detailed scores', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        scores: Record<string, unknown>;
      };

      expect(data.scores).toHaveProperty('productivityScore');
      expect(data.scores).toHaveProperty('qualityScore');
      expect(data.scores).toHaveProperty('impactScore');
      expect(data.scores).toHaveProperty('overallEffectiveness');
    });

    it('should include computed attributes', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('amendmentSuccessRate');
      expect(data.computedAttributes).toHaveProperty('legislativeOutputPerMonth');
      expect(data.computedAttributes).toHaveProperty('avgImpactPerReport');
      expect(data.computedAttributes).toHaveProperty('questionFollowUpRate');
      expect(data.computedAttributes).toHaveProperty('committeeCoverageRate');
      expect(data.computedAttributes).toHaveProperty('peerComparisonPercentile');
      expect(data.computedAttributes).toHaveProperty('effectivenessRank');
    });

    it('should include benchmarks', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        benchmarks: Record<string, unknown>;
      };

      expect(data.benchmarks).toHaveProperty('avgReportsPerMep');
      expect(data.benchmarks).toHaveProperty('avgAmendmentsPerMep');
      expect(data.benchmarks).toHaveProperty('avgSuccessRate');
    });
  });

  describe('Scoring Logic', () => {
    it('should produce scores between 0 and 100', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        scores: { overallEffectiveness: number; productivityScore: number; qualityScore: number; impactScore: number };
      };

      expect(data.scores.overallEffectiveness).toBeGreaterThanOrEqual(0);
      expect(data.scores.overallEffectiveness).toBeLessThanOrEqual(100);
      expect(data.scores.productivityScore).toBeGreaterThanOrEqual(0);
      expect(data.scores.qualityScore).toBeGreaterThanOrEqual(0);
      expect(data.scores.impactScore).toBeGreaterThanOrEqual(0);
    });

    it('should assign effectiveness rank', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-1'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { effectivenessRank: string };
      };

      expect(['HIGHLY_EFFECTIVE', 'EFFECTIVE', 'MODERATE', 'DEVELOPING'])
        .toContain(data.computedAttributes.effectivenessRank);
    });
  });

  describe('Error Handling', () => {
    it('should wrap API errors for MEP', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails)
        .mockRejectedValueOnce(new Error('Not found'));

      await expect(handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'INVALID'
      })).rejects.toThrow('Failed to analyze legislative effectiveness');
    });

    it('should wrap API errors for committee', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo)
        .mockRejectedValueOnce(new Error('Not found'));

      await expect(handleAnalyzeLegislativeEffectiveness({
        subjectType: 'COMMITTEE',
        subjectId: 'INVALID'
      })).rejects.toThrow('Failed to analyze legislative effectiveness');
    });
  });

  describe('Branch Coverage - Effectiveness Rank and Confidence', () => {
    it('should classify effectiveness as DEVELOPING when score < 30', async () => {
      // Arrange: MEP with no roles, very low totalVotes, no committees
      // reportsAuthored=0, amendmentsTabled=0 → productivityScore=0
      // qualityScore = 0+25*0.3=7.5, impactScore = (10/30)*100*0.5=16.67
      // overall = 0*0.35+7.5*0.35+16.67*0.30 ≈ 7.63 → DEVELOPING
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
        id: 'MEP-LOW',
        name: 'Low Activity MEP',
        country: 'RO',
        politicalGroup: 'NI',
        committees: [],
        active: true,
        termStart: '2019-07-02',
        roles: [],
        votingStatistics: {
          totalVotes: 30, votesFor: 10, votesAgainst: 15,
          abstentions: 5, attendanceRate: 25
        }
      });

      // Act
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-LOW'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { effectivenessRank: string };
        scores: { overallEffectiveness: number };
      };

      // Assert
      expect(data.computedAttributes.effectivenessRank).toBe('DEVELOPING');
      expect(data.scores.overallEffectiveness).toBeLessThan(30);
    });

    it('should classify confidence as LOW when totalVotes <= 100', async () => {
      // Arrange: MEP with totalVotes=50 → classifyConfidence(50) → LOW
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
        id: 'MEP-NEW',
        name: 'New MEP',
        country: 'BG',
        politicalGroup: 'EPP',
        committees: ['AGRI'],
        active: true,
        termStart: '2024-01-15',
        roles: [],
        votingStatistics: {
          totalVotes: 50, votesFor: 30, votesAgainst: 10,
          abstentions: 10, attendanceRate: 40
        }
      });

      // Act
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-NEW'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
      };

      // Assert
      expect(data.confidenceLevel).toBe('LOW');
    });

    it('should classify effectiveness as MODERATE when computed score between 30 and 49', async () => {
      // 4 reports authored + 2 adopted (50% success) + 10 amendments (5 adopted)
      // productivity = 4*8 + 10*2 = 52 (capped at 100)
      // quality = 50*0.6 + 50*0.4 = 50
      // impact = 4*10 = 40
      // overall = 52*0.35 + 50*0.35 + 40*0.30 = 18.2 + 17.5 + 12 = 47.7 → MODERATE
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged(
        Array.from({ length: 4 }, (_, i) => ({
          id: `P-${String(i)}`, title: '', reference: `2024/${String(i)}(COD)`, type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-03-01', dateLastActivity: '2024-06-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/124810',
          documents: [],
        })),
      ));
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(paged([
        {
          id: 'TA-1', title: '', reference: '', type: '',
          dateAdopted: '2024-06-15', procedureReference: '2024/0(COD)', subjectMatter: '',
        },
        {
          id: 'TA-2', title: '', reference: '', type: '',
          dateAdopted: '2024-06-15', procedureReference: '2024/1(COD)', subjectMatter: '',
        },
      ]));
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentItems).mockResolvedValue(paged(
        Array.from({ length: 10 }, (_, i) => ({
          id: `AM-${String(i)}`, title: '', type: 'AMENDMENT',
          date: '2024-04-01', authors: ['person/124810'],
          status: i < 5 ? 'ADOPTED' : 'TABLED',
        })),
      ));

      // Act
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'person/124810',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { effectivenessRank: string };
        scores: { overallEffectiveness: number };
        metrics: { reportsAuthored: number; legislativeSuccessRate: number };
      };

      expect(data.metrics.reportsAuthored).toBe(4);
      expect(data.metrics.legislativeSuccessRate).toBe(50);
      expect(data.computedAttributes.effectivenessRank).toBe('MODERATE');
      expect(data.scores.overallEffectiveness).toBeGreaterThanOrEqual(30);
      expect(data.scores.overallEffectiveness).toBeLessThan(50);
    });
  });

  describe('Multi-year adopted texts window', () => {
    it('should fetch /adopted-texts per-year for multi-year date windows', async () => {
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(paged([]));

      await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2023-06-01', dateTo: '2025-06-30',
      });

      const calls = vi.mocked(epClientModule.epClient.getAdoptedTexts).mock.calls;
      const years = calls.map((c) => c[0]?.year).filter((y): y is number => typeof y === 'number');
      expect(new Set(years)).toEqual(new Set([2023, 2024, 2025]));
    });

    it('should fall back to unfiltered /adopted-texts when window > 5 years', async () => {
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(paged([]));

      await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2018-01-01', dateTo: '2025-12-31',
      });

      const calls = vi.mocked(epClientModule.epClient.getAdoptedTexts).mock.calls;
      expect(calls).toHaveLength(1);
      expect(calls[0]?.[0]?.year).toBeUndefined();
    });

    it('should deduplicate adopted texts by id across overlapping year fetches', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([
        {
          id: 'P-DUP', title: '', reference: '2024/1(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-03-01', dateLastActivity: '2024-06-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/124810',
          documents: [],
        },
      ]));
      // Same TA-1 returned by every year fetch — must be counted once.
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(paged([
        {
          id: 'TA-1', title: '', reference: '', type: '',
          dateAdopted: '2024-06-01', procedureReference: '2024/1(COD)', subjectMatter: '',
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2025-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        metrics: { legislativeSuccessRate: number; reportsAuthored: number };
      };
      expect(data.metrics.reportsAuthored).toBe(1);
      expect(data.metrics.legislativeSuccessRate).toBe(100);
    });
  });

  describe('Per-source contribution (real metrics)', () => {
    it('should compute reportsAuthored from /procedures rapporteur attribution', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([
        {
          id: 'P-A', title: '', reference: '2024/100(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-15', dateLastActivity: '2024-03-15',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/124810 Jane Doe',
          documents: [],
        },
        {
          id: 'P-B', title: '', reference: '2024/101(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-02-15', dateLastActivity: '2024-04-15',
          responsibleCommittee: 'IMCO',
          rapporteur: 'Rapporteur person/124810',
          documents: [],
        },
        {
          // Not the subject — different rapporteur
          id: 'P-C', title: '', reference: '2024/102(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-02-15', dateLastActivity: '2024-04-15',
          responsibleCommittee: 'IMCO',
          rapporteur: 'Rapporteur person/999999',
          documents: [],
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        metrics: { reportsAuthored: number };
        attributions: { reportProcedureIds: string[] };
        dataSources: { procedures: string };
      };
      expect(data.metrics.reportsAuthored).toBe(2);
      expect(data.attributions.reportProcedureIds).toEqual(['P-A', 'P-B']);
      expect(data.dataSources.procedures).toBe('OK');
    });

    it('should compute opinionsDelivered when rapporteur field carries SHADOW/OPINION qualifier', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([
        {
          id: 'P-OP1', title: '', reference: '2024/200(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-02-01', dateLastActivity: '2024-04-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Shadow rapporteur person/124810',
          documents: [],
        },
        {
          id: 'P-OP2', title: '', reference: '2024/201(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-03-01', dateLastActivity: '2024-05-01',
          responsibleCommittee: 'IMCO',
          rapporteur: 'Opinion rapporteur person/124810',
          documents: [],
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        metrics: { opinionsDelivered: number; reportsAuthored: number };
        attributions: { opinionProcedureIds: string[] };
      };
      expect(data.metrics.opinionsDelivered).toBe(2);
      expect(data.metrics.reportsAuthored).toBe(0);
      expect(data.attributions.opinionProcedureIds).toEqual(['P-OP1', 'P-OP2']);
    });

    it('should compute amendmentsTabled/Adopted from plenary-session document items by author + adoption flag', async () => {
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentItems).mockResolvedValue(paged([
        {
          id: 'AM-1', title: 'Amendment 1', type: 'AMENDMENT',
          date: '2024-03-01', authors: ['person/124810'], status: 'ADOPTED',
        },
        {
          id: 'AM-2', title: 'Amendment 2', type: 'AMENDMENT',
          date: '2024-04-01', authors: ['person/124810'], status: 'TABLED',
        },
        {
          // Different author — must be excluded
          id: 'AM-3', title: 'Amendment 3', type: 'AMENDMENT',
          date: '2024-05-01', authors: ['person/999'], status: 'ADOPTED',
        },
        {
          // Not an amendment — must be excluded
          id: 'RPT-1', title: 'Report', type: 'REPORT',
          date: '2024-03-15', authors: ['person/124810'], status: 'ADOPTED',
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        metrics: { amendmentsTabled: number; amendmentsAdopted: number };
        attributions: { amendmentDocumentIds: string[]; amendmentAdoptedDocumentIds: string[] };
      };
      expect(data.metrics.amendmentsTabled).toBe(2);
      expect(data.metrics.amendmentsAdopted).toBe(1);
      expect(data.attributions.amendmentDocumentIds).toEqual(['AM-1', 'AM-2']);
      expect(data.attributions.amendmentAdoptedDocumentIds).toEqual(['AM-1']);
    });

    it('should compute questionsAsked from /parliamentary-questions filtered by author', async () => {
      vi.mocked(epClientModule.epClient.getParliamentaryQuestions).mockResolvedValue(paged([
        {
          id: 'Q-1', type: 'WRITTEN', author: 'person/124810',
          date: '2024-03-01', topic: 'Climate', questionText: 'q', status: 'PENDING',
        },
        {
          id: 'Q-2', type: 'WRITTEN', author: 'person/124810',
          date: '2024-05-01', topic: 'AI', questionText: 'q', status: 'ANSWERED',
        },
        {
          // Different author — excluded by aggregator (defense in depth)
          id: 'Q-3', type: 'ORAL', author: 'person/999',
          date: '2024-06-01', topic: '', questionText: 'q', status: 'PENDING',
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        metrics: { questionsAsked: number };
        attributions: { questionIds: string[] };
      };
      expect(data.metrics.questionsAsked).toBe(2);
      expect(data.attributions.questionIds).toEqual(['Q-1', 'Q-2']);
    });

    it('should compute legislativeSuccessRate = procedures-with-adopted-text / attributed-procedures', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([
        {
          id: 'P-X', title: '', reference: '2024/1(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-01', dateLastActivity: '2024-02-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/124810',
          documents: [],
        },
        {
          id: 'P-Y', title: '', reference: '2024/2(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-01', dateLastActivity: '2024-02-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/124810',
          documents: [],
        },
      ]));
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(paged([
        {
          id: 'TA-1', title: '', reference: '', type: '',
          dateAdopted: '2024-06-01', procedureReference: '2024/1(COD)', subjectMatter: '',
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        metrics: { legislativeSuccessRate: number; reportsAuthored: number };
      };
      // 1 adopted / 2 attributed → 50.00%
      expect(data.metrics.legislativeSuccessRate).toBe(50);
      expect(data.metrics.reportsAuthored).toBe(2);
    });
  });

  describe('Resilience: partial source outages', () => {
    it('should keep other metrics populated when /procedures fails', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockRejectedValue(new Error('upstream down'));
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentItems).mockResolvedValue(paged([
        {
          id: 'AM-1', title: '', type: 'AMENDMENT', date: '2024-03-01',
          authors: ['person/124810'], status: 'ADOPTED',
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        metrics: { reportsAuthored: number; amendmentsTabled: number };
        dataSources: Record<string, string>;
        dataQualityWarnings: string[];
      };

      expect(data.metrics.reportsAuthored).toBe(0);
      expect(data.metrics.amendmentsTabled).toBe(1);
      expect(data.dataSources.procedures).toBe('UNAVAILABLE');
      expect(data.dataSources.plenaryDocumentItems).toBe('OK');
      expect(data.dataQualityWarnings.some((w) => w.includes('procedures') && w.includes('unavailable'))).toBe(true);
    });

    it('should mark all four sources UNAVAILABLE when every EP endpoint rejects', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockRejectedValue(new Error('boom'));
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockRejectedValue(new Error('boom'));
      vi.mocked(epClientModule.epClient.getPlenarySessionDocumentItems).mockRejectedValue(new Error('boom'));
      vi.mocked(epClientModule.epClient.getParliamentaryQuestions).mockRejectedValue(new Error('boom'));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataSources: Record<string, string>;
        confidenceLevel: string;
      };
      expect(data.dataSources.procedures).toBe('UNAVAILABLE');
      expect(data.dataSources.adoptedTexts).toBe('UNAVAILABLE');
      expect(data.dataSources.plenaryDocumentItems).toBe('UNAVAILABLE');
      expect(data.dataSources.questions).toBe('UNAVAILABLE');
      expect(data.confidenceLevel).toBe('LOW');
    });
  });

  describe('Committee aggregation path', () => {
    it('should aggregate metrics across committee membership', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'COMM-ENVI',
        name: 'Committee on Environment',
        abbreviation: 'ENVI',
        members: ['person/100', 'person/200', 'person/300'],
        chair: 'person/100',
        viceChairs: [],
        meetingSchedule: [],
        responsibilities: [],
      });
      // Two procedures: one rapporteured by member 100, one by member 200.
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([
        {
          id: 'P-1', title: '', reference: '2024/1(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-01', dateLastActivity: '2024-02-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/100',
          documents: [],
        },
        {
          id: 'P-2', title: '', reference: '2024/2(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-01', dateLastActivity: '2024-02-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/200',
          documents: [],
        },
        {
          // Non-member rapporteur — must be excluded
          id: 'P-3', title: '', reference: '2024/3(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-01', dateLastActivity: '2024-02-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/999',
          documents: [],
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'COMMITTEE', subjectId: 'ENVI',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        subjectType: string; subjectName: string;
        metrics: { reportsAuthored: number };
        attributions: { reportProcedureIds: string[] };
      };
      expect(data.subjectType).toBe('COMMITTEE');
      expect(data.subjectName).toContain('Environment');
      expect(data.metrics.reportsAuthored).toBe(2);
      expect(data.attributions.reportProcedureIds).toEqual(['P-1', 'P-2']);
    });

    it('should not call getParliamentaryQuestions with author param for committee subject', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'COMM-ENVI', name: 'Environment', abbreviation: 'ENVI',
        members: ['person/100'], chair: 'person/100', viceChairs: [],
        meetingSchedule: [], responsibilities: [],
      });

      await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'COMMITTEE', subjectId: 'ENVI',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const call = vi.mocked(epClientModule.epClient.getParliamentaryQuestions).mock.calls[0]?.[0];
      expect(call).toBeDefined();
      expect(call?.author).toBeUndefined();
      // Date window must still be forwarded so the EP endpoint applies the
      // same temporal filter for committees as for individual MEPs.
      expect(call?.dateFrom).toBe('2024-01-01');
      expect(call?.dateTo).toBe('2024-12-31');
    });
  });

  describe('Deterministic ordering', () => {
    it('should sort attribution lists by stable identifier ascending', async () => {
      // Insert procedures in non-alphabetical order; expect the response to
      // sort them so a re-run produces identical attributions.
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([
        {
          id: 'P-Z', title: '', reference: '2024/9(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-01', dateLastActivity: '2024-02-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/124810',
          documents: [],
        },
        {
          id: 'P-A', title: '', reference: '2024/1(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-01', dateLastActivity: '2024-02-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/124810',
          documents: [],
        },
        {
          id: 'P-M', title: '', reference: '2024/5(COD)', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: '2024-01-01', dateLastActivity: '2024-02-01',
          responsibleCommittee: 'ENVI',
          rapporteur: 'Rapporteur person/124810',
          documents: [],
        },
      ]));

      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        attributions: { reportProcedureIds: string[] };
      };
      expect(data.attributions.reportProcedureIds).toEqual(['P-A', 'P-M', 'P-Z']);
    });
  });

  describe('Caching', () => {
    it('should return cached result on second identical call within 15 min', async () => {
      const params = {
        subjectType: 'MEP' as const, subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-12-31',
      };
      await handleAnalyzeLegislativeEffectiveness(params);
      await handleAnalyzeLegislativeEffectiveness(params);
      // Only one round-trip per source despite two calls
      expect(vi.mocked(epClientModule.epClient.getProcedures)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(epClientModule.epClient.getAdoptedTexts)).toHaveBeenCalledTimes(1);
    });

    it('should miss the cache when the date window differs', async () => {
      await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-01-01', dateTo: '2024-06-30',
      });
      await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
        dateFrom: '2024-07-01', dateTo: '2024-12-31',
      });
      expect(vi.mocked(epClientModule.epClient.getProcedures)).toHaveBeenCalledTimes(2);
    });
  });

  describe('Response envelope: dataSources + warnings', () => {
    it('should expose a dataSources block for all four EP sources', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataSources: Record<string, string>;
      };
      expect(data.dataSources).toHaveProperty('procedures');
      expect(data.dataSources).toHaveProperty('adoptedTexts');
      expect(data.dataSources).toHaveProperty('plenaryDocumentItems');
      expect(data.dataSources).toHaveProperty('questions');
    });

    it('should include EP attribution in methodology', async () => {
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP', subjectId: 'person/124810',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        methodology: string;
      };
      expect(data.methodology).toContain('European Parliament');
    });
  });
});
