/**
 * Tests for analyze_coalition_dynamics MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAnalyzeCoalitionDynamics } from './analyzeCoalitionDynamics.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn()
  }
}));

describe('analyze_coalition_dynamics Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
      data: [
        {
          id: 'MEP-1',
          name: 'Test MEP One',
          country: 'SE',
          politicalGroup: 'EPP',
          committees: ['AGRI'],
          active: true,
          termStart: '2019-07-02'
        },
        {
          id: 'MEP-2',
          name: 'Test MEP Two',
          country: 'DE',
          politicalGroup: 'EPP',
          committees: ['ENVI'],
          active: true,
          termStart: '2019-07-02'
        }
      ],
      total: 2,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept empty args (all groups)', async () => {
      const result = await handleAnalyzeCoalitionDynamics({});
      expect(result).toHaveProperty('content');
    });

    it('should accept specific groupIds', async () => {
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP', 'S&D']
      });
      expect(result).toHaveProperty('content');
    });

    it('should accept date range', async () => {
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP', 'S&D'],
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid minimumCohesion', async () => {
      await expect(handleAnalyzeCoalitionDynamics({ minimumCohesion: 1.5 }))
        .rejects.toThrow();
    });
  });

  describe('Response Structure', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP', 'S&D']
      });
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP', 'S&D']
      });
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
    });

    it('should include group metrics and coalition pairs', async () => {
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP', 'S&D']
      });
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('groupMetrics');
      expect(data).toHaveProperty('coalitionPairs');
      expect(data).toHaveProperty('dominantCoalition');
      expect(data).toHaveProperty('stressIndicators');
      expect(data).toHaveProperty('computedAttributes');
    });

    it('should include computed attributes', async () => {
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP', 'S&D']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('parliamentaryFragmentation');
      expect(data.computedAttributes).toHaveProperty('effectiveNumberOfParties');
      expect(data.computedAttributes).toHaveProperty('grandCoalitionViability');
      expect(data.computedAttributes).toHaveProperty('oppositionStrength');
    });

    it('should include group cohesion metrics', async () => {
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupMetrics: { computedAttributes: Record<string, unknown> }[];
      };

      const group = data.groupMetrics[0];
      expect(group?.computedAttributes).toHaveProperty('disciplineScore');
      expect(group?.computedAttributes).toHaveProperty('fragmentationRisk');
      expect(group?.computedAttributes).toHaveProperty('unityTrend');
      expect(group?.computedAttributes).toHaveProperty('activeParticipationRate');
    });
  });

  describe('Error Handling', () => {
    it('should wrap API errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPs)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(handleAnalyzeCoalitionDynamics({ groupIds: ['EPP'] }))
        .rejects.toThrow('Failed to analyze coalition dynamics');
    });
  });
});
