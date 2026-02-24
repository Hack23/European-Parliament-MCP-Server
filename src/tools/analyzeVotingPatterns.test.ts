import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAnalyzeVotingPatterns, analyzeVotingPatternsToolMetadata } from './analyzeVotingPatterns.js';
import { epClient } from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn()
  }
}));

describe('analyze_voting_patterns Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept valid MEP ID', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: [],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleAnalyzeVotingPatterns({ mepId: 'MEP-124810' });

      expect(result.content[0].type).toBe('text');
      expect(epClient.getMEPDetails).toHaveBeenCalledWith('MEP-124810');
    });

    it('should accept valid date range', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: [],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleAnalyzeVotingPatterns({
        mepId: 'MEP-124810',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null && 'period' in parsed) {
        const period = parsed.period;
        expect(typeof period === 'object' && period !== null).toBe(true);
        if (typeof period === 'object' && period !== null) {
          expect(period).toHaveProperty('from', '2024-01-01');
          expect(period).toHaveProperty('to', '2024-12-31');
        }
      }
    });

    it('should accept compareWithGroup parameter', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: [],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleAnalyzeVotingPatterns({
        mepId: 'MEP-124810',
        compareWithGroup: true
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('groupAlignment' in parsed).toBe(true);
        if ('groupAlignment' in parsed) {
          const ga = parsed.groupAlignment;
          expect(typeof ga === 'object' && ga !== null).toBe(true);
          if (typeof ga === 'object' && ga !== null) {
            // Alignment should be derived from real voting data, not hardcoded 87.5
            expect('alignmentRate' in ga).toBe(true);
            expect('divergentVotes' in ga).toBe(true);
            if ('divergentVotes' in ga) {
              expect(ga.divergentVotes).toBe(200); // equals votesAgainst from mock
            }
          }
        }
      }
    });

    it('should reject missing MEP ID', async () => {
      await expect(handleAnalyzeVotingPatterns({})).rejects.toThrow();
    });

    it('should reject invalid date format', async () => {
      await expect(
        handleAnalyzeVotingPatterns({ mepId: 'MEP-124810', dateFrom: 'invalid' })
      ).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: [],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleAnalyzeVotingPatterns({ mepId: 'MEP-124810' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should include voting statistics', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: [],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleAnalyzeVotingPatterns({ mepId: 'MEP-124810' });
      const parsed: unknown = JSON.parse(result.content[0].text);

      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('statistics' in parsed).toBe(true);
        if ('statistics' in parsed) {
          const stats = parsed.statistics;
          expect(typeof stats === 'object' && stats !== null).toBe(true);
          if (typeof stats === 'object' && stats !== null) {
            expect('totalVotes' in stats).toBe(true);
            expect('attendanceRate' in stats).toBe(true);
          }
        }
      }
    });

    it('should include cross-party voting derived from real data', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: [],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleAnalyzeVotingPatterns({ mepId: 'MEP-124810' });
      const parsed: unknown = JSON.parse(result.content[0].text);

      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('crossPartyVoting' in parsed).toBe(true);
        if ('crossPartyVoting' in parsed) {
          const cpv = parsed.crossPartyVoting;
          expect(typeof cpv === 'object' && cpv !== null).toBe(true);
          if (typeof cpv === 'object' && cpv !== null) {
            expect('withOtherGroups' in cpv).toBe(true);
            expect('rate' in cpv).toBe(true);
            // Should be derived from actual voting data, not hardcoded
            if ('withOtherGroups' in cpv) {
              expect(cpv.withOtherGroups).toBe(200); // equals votesAgainst
            }
          }
        }
      }
    });

    it('should include confidence level and methodology', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        committees: [],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleAnalyzeVotingPatterns({ mepId: 'MEP-124810' });
      const parsed: unknown = JSON.parse(result.content[0].text);

      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('confidenceLevel' in parsed).toBe(true);
        expect('methodology' in parsed).toBe(true);
        if ('confidenceLevel' in parsed) {
          expect(parsed.confidenceLevel).toBe('HIGH');
        }
        if ('methodology' in parsed) {
          expect(typeof parsed.methodology === 'string').toBe(true);
          if (typeof parsed.methodology === 'string') {
            expect(parsed.methodology).toContain('European Parliament');
          }
        }
      }
    });

    it('should handle MEP without voting statistics', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'New MEP',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        committees: []
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleAnalyzeVotingPatterns({ mepId: 'MEP-124810' });
      const parsed: unknown = JSON.parse(result.content[0].text);

      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('statistics' in parsed).toBe(true);
        if ('statistics' in parsed) {
          const stats = parsed.statistics;
          expect(typeof stats === 'object' && stats !== null).toBe(true);
          if (typeof stats === 'object' && stats !== null && 'totalVotes' in stats) {
            expect(stats.totalVotes).toBe(0);
          }
        }
        expect('confidenceLevel' in parsed).toBe(true);
        if ('confidenceLevel' in parsed) {
          expect(parsed.confidenceLevel).toBe('LOW');
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(epClient.getMEPDetails).mockRejectedValue(new Error('API Error'));

      await expect(
        handleAnalyzeVotingPatterns({ mepId: 'MEP-124810' })
      ).rejects.toThrow('Failed to analyze voting patterns');
    });

    it('should handle non-existent MEP', async () => {
      vi.mocked(epClient.getMEPDetails).mockRejectedValue(
        new Error('MEP not found')
      );

      await expect(
        handleAnalyzeVotingPatterns({ mepId: 'MEP-INVALID' })
      ).rejects.toThrow('Failed to analyze voting patterns');
    });
  });

  describe('Tool Metadata', () => {
    it('should have correct tool name', () => {
      expect(analyzeVotingPatternsToolMetadata.name).toBe('analyze_voting_patterns');
    });

    it('should have description', () => {
      expect(analyzeVotingPatternsToolMetadata.description).toBeTruthy();
      expect(analyzeVotingPatternsToolMetadata.description.length).toBeGreaterThan(50);
    });

    it('should have input schema', () => {
      expect(analyzeVotingPatternsToolMetadata.inputSchema).toBeDefined();
      expect(analyzeVotingPatternsToolMetadata.inputSchema.type).toBe('object');
      expect(analyzeVotingPatternsToolMetadata.inputSchema.required).toContain('mepId');
    });
  });
});
