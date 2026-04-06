/**
 * Tests for analyze_coalition_dynamics MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAnalyzeCoalitionDynamics } from './analyzeCoalitionDynamics.js';
import * as mepFetcherModule from '../utils/mepFetcher.js';
import { auditLogger } from '../utils/auditLogger.js';

// Mock the MEP fetcher utility
vi.mock('../utils/mepFetcher.js', () => ({
  fetchAllCurrentMEPs: vi.fn()
}));

describe('analyze_coalition_dynamics Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditLogger.clear();

    vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
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
    ], complete: true });
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

    it('should include dataQualityWarnings array in response', async () => {
      const result = await handleAnalyzeCoalitionDynamics({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });
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
      expect(() => JSON.parse(result.content[0]?.text ?? '{}') as unknown).not.toThrow();
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
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(handleAnalyzeCoalitionDynamics({ groupIds: ['EPP'] }))
        .rejects.toThrow('Failed to analyze coalition dynamics');
    });

    it('should log an audit error entry when the EP API rejects', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(handleAnalyzeCoalitionDynamics({ groupIds: ['EPP'] })).rejects.toThrow();

      const errorLogs = auditLogger.getLogs().filter(
        e => e.action === 'analyze_coalition_dynamics' && e.result.success === false
      );
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]?.result.error).toBe('API Error');
    });
  });

  describe('Branch Coverage - Unity and Cohesion Classification', () => {
    it('should report UNKNOWN unity trend since voting stats are unavailable from EP API', async () => {
      // Arrange: EP API /meps/{id} does not provide voting stats
      // so cohesion/stress metrics are null → UNKNOWN, confidence=LOW
      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP'] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupMetrics: { stressIndicator: { value: null; availability: string; confidence: string }; dataAvailability: string; computedAttributes: { unityTrend: string } }[];
        confidenceLevel: string;
      };

      // Assert: Without voting data, stress=UNAVAILABLE null, dataAvailability=UNAVAILABLE, confidence=LOW
      const group = data.groupMetrics[0];
      expect(group?.computedAttributes.unityTrend).toBe('UNKNOWN');
      expect(group?.stressIndicator.value).toBeNull();
      expect(group?.stressIndicator.availability).toBe('UNAVAILABLE');
      expect(group?.dataAvailability).toBe('UNAVAILABLE');
      expect(data.confidenceLevel).toBe('LOW');
    });

    it('should classify cohesion trend as WEAKENING when groups have unequal sizes', async () => {
      // Arrange: Two groups with very different member counts
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `MEP-A${i}`, name: `MEP A${i}`, country: 'DE', politicalGroup: 'BigGroup',
          committees: [] as string[], active: true as const, termStart: '2019-07-02'
        })),
        { id: 'MEP-B1', name: 'MEP B1', country: 'FR', politicalGroup: 'SmallGroup',
          committees: [] as string[], active: true as const, termStart: '2019-07-02' }
      ], complete: true });

      // Act
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['BigGroup', 'SmallGroup'],
        minimumCohesion: 0.5
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        coalitionPairs: { trend: string; cohesionScore: number }[];
      };

      // Assert: balance = min(1,10)/max(1,10) = 0.1 → WEAKENING
      const weakeningPairs = data.coalitionPairs.filter(p => p.trend === 'WEAKENING');
      expect(weakeningPairs.length).toBeGreaterThan(0);
      expect(weakeningPairs[0]?.cohesionScore).toBeLessThanOrEqual(0.4);
    });
  });
});
