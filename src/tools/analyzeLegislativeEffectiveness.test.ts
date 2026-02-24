/**
 * Tests for analyze_legislative_effectiveness MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAnalyzeLegislativeEffectiveness } from './analyzeLegislativeEffectiveness.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn(),
    getCommitteeInfo: vi.fn()
  }
}));

describe('analyze_legislative_effectiveness Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
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

    it('should classify effectiveness as MODERATE when score between 30 and 49', async () => {
      // Arrange: MEP with moderate activity
      // reportsAuthored=0, amendmentsTabled=2, amendmentsAdopted=1
      // productivityScore=4, qualityScore=68, impactScore=45
      // overall = 4*0.35+68*0.35+45*0.30 = 1.4+23.8+13.5 = 38.7 → MODERATE
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
        id: 'MEP-MOD',
        name: 'Moderate MEP',
        country: 'ES',
        politicalGroup: 'S&D',
        committees: ['ENVI'],
        active: true,
        termStart: '2019-07-02',
        roles: [],
        votingStatistics: {
          totalVotes: 200, votesFor: 140, votesAgainst: 40,
          abstentions: 20, attendanceRate: 60
        }
      });

      // Act
      const result = await handleAnalyzeLegislativeEffectiveness({
        subjectType: 'MEP',
        subjectId: 'MEP-MOD'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { effectivenessRank: string };
        scores: { overallEffectiveness: number };
      };

      // Assert
      expect(data.computedAttributes.effectivenessRank).toBe('MODERATE');
      expect(data.scores.overallEffectiveness).toBeGreaterThanOrEqual(30);
      expect(data.scores.overallEffectiveness).toBeLessThan(50);
    });
  });
});
