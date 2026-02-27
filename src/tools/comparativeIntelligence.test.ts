/**
 * Tests for comparative_intelligence MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleComparativeIntelligence } from './comparativeIntelligence.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn()
  }
}));

const mockMEP1 = {
  id: '1',
  name: 'Alice Smith',
  country: 'DE',
  politicalGroup: 'EPP',
  committees: ['AGRI', 'ENVI'],
  active: true,
  termStart: '2019-07-02',
  roles: ['Rapporteur - AGRI', 'Chair - ENVI'],
  votingStatistics: {
    totalVotes: 1200,
    votesFor: 800,
    votesAgainst: 250,
    abstentions: 150,
    attendanceRate: 88.5
  }
};

const mockMEP2 = {
  id: '2',
  name: 'Bob Jones',
  country: 'FR',
  politicalGroup: 'S&D',
  committees: ['ITRE', 'BUDG'],
  active: true,
  termStart: '2019-07-02',
  roles: [],
  votingStatistics: {
    totalVotes: 950,
    votesFor: 600,
    votesAgainst: 200,
    abstentions: 150,
    attendanceRate: 72.0
  }
};

const mockMEP3 = {
  id: '3',
  name: 'Clara Mueller',
  country: 'DE',
  politicalGroup: 'EPP',
  committees: ['LIBE'],
  active: true,
  termStart: '2019-07-02',
  roles: ['Vice-Chair - LIBE'],
  votingStatistics: {
    totalVotes: 0,
    votesFor: 0,
    votesAgainst: 0,
    abstentions: 0,
    attendanceRate: 0
  }
};

describe('comparative_intelligence Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPDetails)
      .mockImplementation(async (id: string) => {
        if (id === '1') return mockMEP1;
        if (id === '2') return mockMEP2;
        if (id === '3') return mockMEP3;
        throw new Error(`MEP ${id} not found`);
      });
  });

  describe('Input Validation', () => {
    it('should accept valid mepIds array', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      expect(result).toHaveProperty('content');
    });

    it('should accept optional dimensions', async () => {
      const result = await handleComparativeIntelligence({
        mepIds: [1, 2],
        dimensions: ['voting', 'attendance']
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject fewer than 2 mepIds', async () => {
      await expect(handleComparativeIntelligence({ mepIds: [1] })).rejects.toThrow();
    });

    it('should reject more than 10 mepIds', async () => {
      const ids = Array.from({ length: 11 }, (_, i) => i + 1);
      await expect(handleComparativeIntelligence({ mepIds: ids })).rejects.toThrow();
    });

    it('should reject missing mepIds', async () => {
      await expect(handleComparativeIntelligence({})).rejects.toThrow();
    });

    it('should reject invalid dimension', async () => {
      await expect(handleComparativeIntelligence({
        mepIds: [1, 2],
        dimensions: ['invalid_dim']
      })).rejects.toThrow();
    });

    it('should reject negative mepId', async () => {
      await expect(handleComparativeIntelligence({ mepIds: [-1, 2] })).rejects.toThrow();
    });
  });

  describe('Response Structure', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
    });

    it('should include required fields', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('mepCount');
      expect(data).toHaveProperty('dimensions');
      expect(data).toHaveProperty('profiles');
      expect(data).toHaveProperty('rankingByDimension');
      expect(data).toHaveProperty('correlationMatrix');
      expect(data).toHaveProperty('outlierMEPs');
      expect(data).toHaveProperty('clusterAnalysis');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('dataAvailable');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('dataFreshness');
      expect(data).toHaveProperty('sourceAttribution');
      expect(data).toHaveProperty('methodology');
    });

    it('should include correct mepCount', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { mepCount: number };
      expect(data.mepCount).toBe(2);
    });

    it('should include computedAttributes fields', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('mostSimilarPair');
      expect(data.computedAttributes).toHaveProperty('mostDifferentPair');
      expect(data.computedAttributes).toHaveProperty('topOverallPerformer');
      expect(data.computedAttributes).toHaveProperty('lowestOverallPerformer');
      expect(data.computedAttributes).toHaveProperty('dimensionWithHighestVariance');
    });

    it('should build correct number of profiles', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2, 3] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        profiles: unknown[];
      };
      expect(data.profiles).toHaveLength(3);
    });

    it('should build correlation matrix with correct pair count', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2, 3] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        correlationMatrix: unknown[];
      };
      // 3 MEPs = 3 pairs (1-2, 1-3, 2-3)
      expect(data.correlationMatrix).toHaveLength(3);
    });

    it('should rank MEPs in each dimension', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        rankingByDimension: { dimension: string; ranking: unknown[] }[];
      };

      expect(data.rankingByDimension.length).toBeGreaterThan(0);
      const firstRanking = data.rankingByDimension[0];
      expect(firstRanking?.ranking).toHaveLength(2);
    });

    it('should have correct sourceAttribution', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { sourceAttribution: string };
      expect(data.sourceAttribution).toBe('European Parliament Open Data Portal - data.europarl.europa.eu');
    });
  });

  describe('dataAvailable: false scenario', () => {
    it('should handle all MEPs not found', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockRejectedValue(
        new Error('Not found')
      );

      const result = await handleComparativeIntelligence({ mepIds: [999, 998] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataAvailable: boolean;
        profiles: { overallScore: number }[];
      };

      // Should still return a result but with zero scores
      expect(data.dataAvailable).toBe(false);
      expect(data.profiles).toHaveLength(2);
      expect(data.profiles.every(p => p.overallScore === 0)).toBe(true);
    });
  });

  describe('Dimension Filtering', () => {
    it('should only include requested dimensions', async () => {
      const result = await handleComparativeIntelligence({
        mepIds: [1, 2],
        dimensions: ['voting', 'attendance']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dimensions: string[];
        rankingByDimension: { dimension: string }[];
      };

      expect(data.dimensions).toEqual(['voting', 'attendance']);
      expect(data.rankingByDimension).toHaveLength(2);
      expect(data.rankingByDimension.map(r => r.dimension)).toEqual(['voting', 'attendance']);
    });
  });

  describe('Scoring Logic', () => {
    it('should give higher attendance score to MEP with higher attendance rate', async () => {
      const result = await handleComparativeIntelligence({
        mepIds: [1, 2],
        dimensions: ['attendance']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        rankingByDimension: { dimension: string; ranking: { mepId: string; score: number }[] }[];
      };

      const attendanceRanking = data.rankingByDimension.find(r => r.dimension === 'attendance');
      // MEP 1 has 88.5% attendance, MEP 2 has 72% — MEP 1 should rank higher
      expect(attendanceRanking?.ranking[0]?.mepId).toBe('1');
    });
  });

  describe('Error Handling', () => {
    it('should return error response on unexpected exception', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

      const result = await handleComparativeIntelligence({ mepIds: [1, 2] });
      expect(result.isError).toBe(true);
    });
  });
});
