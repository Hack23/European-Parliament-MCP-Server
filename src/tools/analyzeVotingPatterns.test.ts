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

      const parsed = JSON.parse(result.content[0].text) as {
        period: { from: string; to: string };
      };
      expect(parsed.period).toHaveProperty('from', '2024-01-01');
      expect(parsed.period).toHaveProperty('to', '2024-12-31');
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

      const parsed = JSON.parse(result.content[0].text) as {
        groupAlignment: { alignmentRate: number; divergentVotes: number };
      };
      expect(parsed.groupAlignment).toHaveProperty('alignmentRate');
      expect(parsed.groupAlignment).toHaveProperty('divergentVotes');
      expect(parsed.groupAlignment.divergentVotes).toBe(200);
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
      const parsed = JSON.parse(result.content[0].text) as {
        statistics: { totalVotes: number; attendanceRate: number };
      };
      expect(parsed.statistics).toHaveProperty('totalVotes');
      expect(parsed.statistics).toHaveProperty('attendanceRate');
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
      const parsed = JSON.parse(result.content[0].text) as {
        crossPartyVoting: { withOtherGroups: number; rate: number };
      };
      expect(parsed.crossPartyVoting).toHaveProperty('withOtherGroups');
      expect(parsed.crossPartyVoting).toHaveProperty('rate');
      expect(parsed.crossPartyVoting.withOtherGroups).toBe(200);
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
      const parsed = JSON.parse(result.content[0].text) as {
        confidenceLevel: string;
        methodology: string;
      };
      expect(parsed.confidenceLevel).toBe('HIGH');
      expect(typeof parsed.methodology).toBe('string');
      expect(parsed.methodology).toContain('European Parliament');
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
      const parsed = JSON.parse(result.content[0].text) as {
        dataAvailable: boolean;
        confidenceLevel: string;
      };
      // EP API /meps/{id} never returns voting stats — expect dataAvailable: false
      expect(parsed.dataAvailable).toBe(false);
      expect(parsed.confidenceLevel).toBe('LOW');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(epClient.getMEPDetails).mockRejectedValue(new Error('API Error'));

      await expect(
        handleAnalyzeVotingPatterns({ mepId: 'MEP-124810' })
      ).rejects.toThrow('[analyze_voting_patterns] fetchVotingData: Failed to retrieve voting records for analysis');
    });

    it('should handle non-existent MEP', async () => {
      vi.mocked(epClient.getMEPDetails).mockRejectedValue(
        new Error('MEP not found')
      );

      await expect(
        handleAnalyzeVotingPatterns({ mepId: 'MEP-INVALID' })
      ).rejects.toThrow('[analyze_voting_patterns] fetchVotingData: Failed to retrieve voting records for analysis');
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
      expect(analyzeVotingPatternsToolMetadata.inputSchema.type).toBe('object');
      expect(analyzeVotingPatternsToolMetadata.inputSchema.required).toContain('mepId');
    });
  });
});
