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

  describe('Political group label normalization (EP10 coverage)', () => {
    it('should normalize full EP API group names to canonical short codes', async () => {
      // Arrange: EP API sometimes returns full group names instead of short codes.
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'DE',
          politicalGroup: "Group of the European People's Party (Christian Democrats)",
          committees: [], active: true, termStart: '2024-07-16' },
        { id: 'MEP-2', name: 'B', country: 'DE',
          politicalGroup: 'The Greens/European Free Alliance',
          committees: [], active: true, termStart: '2024-07-16' },
        { id: 'MEP-3', name: 'C', country: 'FR',
          politicalGroup: 'Patriots for Europe',
          committees: [], active: true, termStart: '2024-07-16' },
        { id: 'MEP-4', name: 'D', country: 'DE',
          politicalGroup: 'Europe of Sovereign Nations Group',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP', 'Greens/EFA', 'PfE', 'ESN']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupMetrics: { groupId: string; memberCount: number }[];
      };

      const counts = Object.fromEntries(data.groupMetrics.map(g => [g.groupId, g.memberCount]));
      expect(counts['EPP']).toBe(1);
      expect(counts['Greens/EFA']).toBe(1);
      expect(counts['PfE']).toBe(1);
      expect(counts['ESN']).toBe(1);
    });

    it('should strip URI prefixes from EP API group identifiers', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'DE',
          politicalGroup: 'http://publications.europa.eu/resource/authority/corporate-body/EPP',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP'] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupMetrics: { groupId: string; memberCount: number }[];
      };
      expect(data.groupMetrics[0]?.memberCount).toBe(1);
    });

    it('should map the historical ID label to its EP10 successor PfE', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'FR', politicalGroup: 'ID',
          committees: [], active: true, termStart: '2024-07-16' },
        { id: 'MEP-2', name: 'B', country: 'IT', politicalGroup: 'Identity and Democracy',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['PfE'] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupMetrics: { groupId: string; memberCount: number }[];
      };
      expect(data.groupMetrics[0]?.memberCount).toBe(2);
    });

    it('should default to the EP10 9-group composition when no groupIds provided', async () => {
      const result = await handleAnalyzeCoalitionDynamics({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupMetrics: { groupId: string }[];
      };
      const ids = data.groupMetrics.map(g => g.groupId);
      expect(ids).toEqual(['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'PfE', 'The Left', 'ESN', 'NI']);
    });

    it('should normalize and dedupe caller-supplied groupIds (legacy ID, URI, alias, duplicate)', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'IT', politicalGroup: 'PfE',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: [
        'ID', // legacy → PfE
        'authority/corporate-body/PfE', // URI suffix → PfE (duplicate)
        'European People\'s Party', // alias → EPP
        'EPP', // duplicate of previous
      ] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groupMetrics: { groupId: string; memberCount: number }[];
        coverage: { groupsTotal: number };
      };
      expect(data.groupMetrics.map(g => g.groupId)).toEqual(['PfE', 'EPP']);
      expect(data.coverage.groupsTotal).toBe(2);
      expect(data.groupMetrics.find(g => g.groupId === 'PfE')?.memberCount).toBe(1);
    });
  });

  describe('Coverage reporting and incomplete-data handling', () => {
    it('should expose groupsKnown/groupsTotal counters and mark full coverage', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'DE', politicalGroup: 'EPP',
          committees: [], active: true, termStart: '2024-07-16' },
        { id: 'MEP-2', name: 'B', country: 'ES', politicalGroup: 'S&D',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP', 'S&D'] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        coverage: { groupsKnown: number; groupsTotal: number; unrecognizedGroups: string[] };
      };
      expect(data.coverage.groupsTotal).toBe(2);
      expect(data.coverage.groupsKnown).toBe(2);
      expect(data.coverage.unrecognizedGroups).toEqual([]);
    });

    it('should return null ENP / fragmentation and emit warning when any target group has memberCount=0', async () => {
      // Arrange: EP API only returns one group (S&D), EPP is missing.
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'ES', politicalGroup: 'S&D',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP', 'S&D'] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: {
          parliamentaryFragmentation: number | null;
          effectiveNumberOfParties: number | null;
        };
        coverage: { groupsKnown: number; groupsTotal: number };
        dataQualityWarnings: string[];
      };

      expect(data.computedAttributes.parliamentaryFragmentation).toBeNull();
      expect(data.computedAttributes.effectiveNumberOfParties).toBeNull();
      expect(data.coverage.groupsKnown).toBe(1);
      expect(data.coverage.groupsTotal).toBe(2);
      expect(data.dataQualityWarnings.some(w => w.includes('Incomplete group coverage'))).toBe(true);
      expect(data.dataQualityWarnings.some(w => w.includes('EPP'))).toBe(true);
    });

    it('should collect unrecognized EP API group labels for out-of-target MEPs', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'DE', politicalGroup: 'EPP',
          committees: [], active: true, termStart: '2024-07-16' },
        { id: 'MEP-2', name: 'B', country: 'SK', politicalGroup: 'Mystery Group XYZ',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP'] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        coverage: { unrecognizedGroups: string[] };
        dataQualityWarnings: string[];
      };
      expect(data.coverage.unrecognizedGroups).toContain('Mystery Group XYZ');
      expect(data.dataQualityWarnings.some(w => w.includes('Mystery Group XYZ'))).toBe(true);
    });

    it('should sanitize unrecognized labels (strip control chars, collapse whitespace, cap length)', async () => {
      const longLabel = 'A'.repeat(200);
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'DE', politicalGroup: 'EPP',
          committees: [], active: true, termStart: '2024-07-16' },
        { id: 'MEP-2', name: 'B', country: 'XX', politicalGroup: 'Foo\nBar\tBaz  Qux\x00Zap',
          committees: [], active: true, termStart: '2024-07-16' },
        { id: 'MEP-3', name: 'C', country: 'XX', politicalGroup: longLabel,
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP'] });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        coverage: { unrecognizedGroups: string[] };
      };
      expect(data.coverage.unrecognizedGroups).toContain('Foo Bar Baz Qux Zap');
      for (const label of data.coverage.unrecognizedGroups) {
        expect(label).not.toMatch(/[\x00-\x1F\x7F]/);
        expect(label.length).toBeLessThanOrEqual(120); // MAX_UNRECOGNIZED_LABEL_LENGTH (including ellipsis)
      }
      expect(data.coverage.unrecognizedGroups.some(l => l.endsWith('…') && l.length === 120)).toBe(true);
    });

    it('should throw when groupIds normalizes to an empty set (e.g., whitespace-only)', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'DE', politicalGroup: 'EPP',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      await expect(handleAnalyzeCoalitionDynamics({ groupIds: ['   ', 'unknown'] }))
        .rejects.toThrow(/at least one recognizable political-group identifier/i);
    });
  });
});
