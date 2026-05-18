/**
 * Tests for assess_mep_influence MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAssessMepInfluence } from './assessMepInfluence.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';
import * as doceoClientModule from '../clients/ep/doceoClient.js';
import { clearDoceoMepAggregatorCache } from '../utils/doceoMepAggregator.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn(),
    getParliamentaryQuestions: vi.fn()
  }
}));

// Mock the DOCEO client so tests do not hit the network.
vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn()
  }
}));

const emptyDoceoResponse = {
  data: [],
  total: 0,
  datesAvailable: [],
  datesUnavailable: [],
  source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
  limit: 100,
  offset: 0,
  hasMore: false,
};

describe('assess_mep_influence Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearDoceoMepAggregatorCache();

    vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
      id: 'MEP-1',
      name: 'Test MEP',
      country: 'SE',
      politicalGroup: 'EPP',
      committees: ['AGRI', 'ENVI'],
      active: true,
      termStart: '2019-07-02',
      roles: ['Rapporteur - Committee on Agriculture', 'Vice-Chair - ENVI'],
      votingStatistics: {
        totalVotes: 1250,
        votesFor: 850,
        votesAgainst: 200,
        abstentions: 200,
        attendanceRate: 92.5
      }
    });

    vi.mocked(epClientModule.epClient.getParliamentaryQuestions).mockResolvedValue({
      data: [],
      total: 0,
      limit: 100,
      offset: 0,
      hasMore: false,
    });

    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue(emptyDoceoResponse);
  });

  describe('Input Validation', () => {
    it('should accept valid mepId', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should reject missing mepId', async () => {
      await expect(handleAssessMepInfluence({}))
        .rejects.toThrow();
    });

    it('should accept optional date parameters', async () => {
      const result = await handleAssessMepInfluence({
        mepId: 'MEP-1',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should accept includeDetails flag', async () => {
      const result = await handleAssessMepInfluence({
        mepId: 'MEP-1',
        includeDetails: true
      });
      expect(result).toHaveProperty('content');
    });
  });

  describe('Response Structure', () => {

    it('should include dataQualityWarnings array in response', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });
    it('should return MCP-compliant response', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const text = result.content[0]?.text ?? '{}';
      expect(() => JSON.parse(text) as unknown).not.toThrow();
    });

    it('should include overall score and dimensions', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('overallScore');
      expect(data).toHaveProperty('rank');
      expect(data).toHaveProperty('dimensions');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
    });

    it('should have 5 scoring dimensions', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dimensions: unknown[] };

      expect(data.dimensions).toHaveLength(5);
    });

    it('should include computed attributes', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('participationRate');
      expect(data.computedAttributes).toHaveProperty('loyaltyScore');
      expect(data.computedAttributes).toHaveProperty('diversityIndex');
      expect(data.computedAttributes).toHaveProperty('effectivenessRatio');
      expect(data.computedAttributes).toHaveProperty('leadershipIndicator');
    });

    it('should include detailed metrics when includeDetails is true', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1', includeDetails: true });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dimensions: { metrics: Record<string, unknown> }[];
      };

      const firstDim = data.dimensions[0];
      expect(Object.keys(firstDim?.metrics ?? {}).length).toBeGreaterThan(0);
    });

    it('should return MEDIUM confidence when EP API has votes but DOCEO is unavailable', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { confidenceLevel: string; dataSource: string };

      // No DOCEO data + >100 EP API votes = MEDIUM (HIGH requires real DOCEO RCV observations).
      expect(data.confidenceLevel).toBe('MEDIUM');
      expect(data.dataSource).toBe('EP_API');
    });
  });

  describe('Scoring Logic', () => {
    it('should produce overallScore between 0 and 100', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { overallScore: number };

      expect(data.overallScore).toBeGreaterThanOrEqual(0);
      expect(data.overallScore).toBeLessThanOrEqual(100);
    });

    it('should assign rank label', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { rank: string };

      expect(['Very High Influence', 'High Influence', 'Moderate Influence', 'Low Influence', 'Minimal Influence'])
        .toContain(data.rank);
    });

    it('should handle MEP with no voting statistics', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValueOnce({
        id: 'MEP-99999',
        name: 'New MEP',
        country: 'DE',
        politicalGroup: 'S&D',
        committees: [],
        active: true,
        termStart: '2024-07-01'
      });

      const result = await handleAssessMepInfluence({ mepId: 'MEP-99999' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { confidenceLevel: string; overallScore: number };

      expect(data.confidenceLevel).toBe('LOW');
      expect(data.overallScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should wrap API errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails)
        .mockRejectedValueOnce(new Error('MEP not found'));

      await expect(handleAssessMepInfluence({ mepId: '999999' }))
        .rejects.toThrow('Failed to assess MEP influence');
    });
  });

  describe('DOCEO RCV Enrichment', () => {
    const doceoVoteWithMep = {
      id: 'RCV-10-2026-05-15-001',
      date: '2026-05-15',
      term: 10,
      subject: 'Test vote',
      reference: 'A10-0001/2026',
      votesFor: 300,
      votesAgainst: 200,
      abstentions: 50,
      result: 'ADOPTED' as const,
      mepVotes: { 'MEP-1': 'FOR' as const, 'MEP-2': 'AGAINST' as const, 'MEP-3': 'FOR' as const },
      groupBreakdown: {
        EPP: { for: 150, against: 10, abstain: 5 },
        'S&D': { for: 5, against: 120, abstain: 8 },
      },
      sourceUrl: 'https://www.europarl.europa.eu/doceo/test.xml',
      dataSource: 'RCV' as const,
      sittingDate: '2026-05-15',
    };

    const doceoVoteAgainst = {
      ...doceoVoteWithMep,
      id: 'RCV-10-2026-05-15-002',
      mepVotes: { 'MEP-1': 'AGAINST' as const },
      groupBreakdown: {
        EPP: { for: 140, against: 20, abstain: 5 },
      },
    };

    it('should use DOCEO data and set dataSource to EP_API+DOCEO when both sources have data', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: [doceoVoteWithMep, doceoVoteAgainst],
        total: 2,
      });

      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataSource: string;
        confidenceLevel: string;
        computedAttributes: { loyaltyScore: number; participationRate: number };
        dataQualityWarnings: string[];
      };

      expect(data.dataSource).toBe('EP_API+DOCEO');
      expect(data.confidenceLevel).toBe('HIGH');
      // MEP-1 voted FOR once, AGAINST once → loyalty = 1 agreement (FOR aligns with EPP majority FOR) / 2 decisive = 50%
      expect(data.computedAttributes.loyaltyScore).toBe(50);
      // No fallback warning when DOCEO succeeded.
      expect(data.dataQualityWarnings.some(w => w.includes('DOCEO RCV enrichment unavailable'))).toBe(false);
    });

    it('should set dataSource to DOCEO when EP API has no voting statistics', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValueOnce({
        id: 'MEP-1',
        name: 'Test MEP',
        country: 'SE',
        politicalGroup: 'EPP',
        committees: ['ENVI'],
        active: true,
        termStart: '2024-07-01',
      });
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: [doceoVoteWithMep],
        total: 1,
      });

      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataSource: string; confidenceLevel: string };

      expect(data.dataSource).toBe('DOCEO');
      expect(data.confidenceLevel).toBe('HIGH');
    });

    it('should fall back to EP_API and emit warning when DOCEO call rejects', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(new Error('Network down'));

      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataSource: string;
        confidenceLevel: string;
        dataQualityWarnings: string[];
      };

      expect(data.dataSource).toBe('EP_API');
      expect(data.confidenceLevel).toBe('MEDIUM');
      expect(data.dataQualityWarnings.some(w => w.includes('DOCEO RCV enrichment unavailable'))).toBe(true);
    });

    it('should fall back to EP_API when DOCEO returns no votes (empty period)', async () => {
      // emptyDoceoResponse is the default mock; just assert behaviour.
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataSource: string };

      expect(data.dataSource).toBe('EP_API');
    });

    it('should cache DOCEO results across repeated calls', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        ...emptyDoceoResponse,
        data: [doceoVoteWithMep],
        total: 1,
      });

      await handleAssessMepInfluence({ mepId: 'MEP-1' });
      await handleAssessMepInfluence({ mepId: 'MEP-1' });
      await handleAssessMepInfluence({ mepId: 'MEP-1' });

      // First call hits DOCEO, second/third are cache hits → exactly one DOCEO fetch.
      expect(vi.mocked(doceoClientModule.doceoClient.getLatestVotes)).toHaveBeenCalledTimes(1);
    });

    it('should fall back to EP_API when DOCEO times out', async () => {
      // Simulate a long-running DOCEO call by returning a promise that resolves after the timeout.
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockImplementation(
        async (params: { abortSignal?: AbortSignal } = {}) => {
          const signal = params.abortSignal;
          await new Promise<void>((resolve, reject) => {
            const onAbort = (): void => {
              if (signal !== undefined) signal.removeEventListener('abort', onAbort);
              reject(new Error('aborted'));
            };
            if (signal !== undefined) signal.addEventListener('abort', onAbort);
            // Safety: resolve after 10s if abort never fires (should not happen in test).
            setTimeout(() => { resolve(); }, 10_000);
          });
          return emptyDoceoResponse;
        }
      );

      // Override default 2s timeout to keep the test fast.
      const { computeMepVotingActivityFromDoceo } = await import('../utils/doceoMepAggregator.js');
      const result = await computeMepVotingActivityFromDoceo('MEP-1', { timeoutMs: 50 });
      expect(result).toBeNull();
    });

    it('should expose dataSource field in the response envelope', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataSource: string };

      expect(['EP_API', 'DOCEO', 'EP_API+DOCEO']).toContain(data.dataSource);
    });
  });
});
