/**
 * Tests for assess_mep_influence MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAssessMepInfluence } from './assessMepInfluence.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn()
  }
}));

describe('assess_mep_influence Tool', () => {
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
      roles: ['Rapporteur - Committee on Agriculture', 'Vice-Chair - ENVI'],
      votingStatistics: {
        totalVotes: 1250,
        votesFor: 850,
        votesAgainst: 200,
        abstentions: 200,
        attendanceRate: 92.5
      }
    });
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
      expect(() => JSON.parse(text)).not.toThrow();
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

    it('should return proper confidence level based on vote count', async () => {
      const result = await handleAssessMepInfluence({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { confidenceLevel: string };

      expect(data.confidenceLevel).toBe('HIGH');
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
        id: 'MEP-NEW',
        name: 'New MEP',
        country: 'DE',
        politicalGroup: 'S&D',
        committees: [],
        active: true,
        termStart: '2024-07-01'
      });

      const result = await handleAssessMepInfluence({ mepId: 'MEP-NEW' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { confidenceLevel: string; overallScore: number };

      expect(data.confidenceLevel).toBe('LOW');
      expect(data.overallScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should wrap API errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails)
        .mockRejectedValueOnce(new Error('MEP not found'));

      await expect(handleAssessMepInfluence({ mepId: 'INVALID' }))
        .rejects.toThrow('Failed to assess MEP influence');
    });
  });
});
