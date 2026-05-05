/**
 * Tests for analyze_coalition_dynamics MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAnalyzeCoalitionDynamics } from './analyzeCoalitionDynamics.js';
import * as mepFetcherModule from '../utils/mepFetcher.js';
import * as doceoClientModule from '../clients/ep/doceoClient.js';
import { auditLogger } from '../utils/auditLogger.js';

// Mock the MEP fetcher utility
vi.mock('../utils/mepFetcher.js', () => ({
  fetchAllCurrentMEPs: vi.fn()
}));

// Mock the DOCEO client — default to empty response so existing cohesion-null tests pass
vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn()
  }
}));

describe('analyze_coalition_dynamics Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditLogger.clear();

    // Default DOCEO response: empty data — keeps existing cohesion-null assertions passing
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      data: [],
      total: 0,
      datesAvailable: [],
      datesUnavailable: [],
      source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
      limit: 100,
      offset: 0,
      hasMore: false,
    });

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

    it('should expose sizeSimilarityScore and null cohesion/trend on coalition pairs (issue #3)', async () => {
      // Regression guard: prior versions exposed a group-size ratio under the
      // misleading name `cohesionScore` with a `trend` string, leading consumers
      // to read it as Hix/Noury/Roland vote-level cohesion (e.g. Renew + ECR
      // scoring 0.95 purely because of similar seat counts). The contract is
      // now: `sizeSimilarityScore` carries the size-balance proxy; `cohesion`
      // and `trend` are explicitly null until vote-level data is available;
      // and `methodologyNote` makes the caveat machine-visible.
      const result = await handleAnalyzeCoalitionDynamics({
        groupIds: ['EPP', 'S&D', 'Renew']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        coalitionPairs: {
          groupA: string;
          groupB: string;
          sizeSimilarityScore: number;
          cohesion: number | null;
          trend: string | null;
          sharedVotes: number | null;
          totalVotes: number | null;
          allianceSignal: boolean;
        }[];
        dominantCoalition: {
          groups: string[];
          combinedStrength: number | null;
          cohesion: number | null;
          sizeSimilarityScore: number;
        };
        methodologyNote: string;
      };

      expect(data.coalitionPairs.length).toBeGreaterThan(0);
      for (const pair of data.coalitionPairs) {
        // The mislabelled field must be gone.
        expect(pair).not.toHaveProperty('cohesionScore');
        // Size-similarity proxy is present and bounded.
        expect(typeof pair.sizeSimilarityScore).toBe('number');
        expect(pair.sizeSimilarityScore).toBeGreaterThanOrEqual(0);
        expect(pair.sizeSimilarityScore).toBeLessThanOrEqual(1);
        // Vote-level fields are explicitly null while EP API does not expose them.
        expect(pair.cohesion).toBeNull();
        expect(pair.trend).toBeNull();
        expect(pair.sharedVotes).toBeNull();
        expect(pair.totalVotes).toBeNull();
      }

      // Dominant coalition mirrors the new field shape.
      expect(data.dominantCoalition).toHaveProperty('sizeSimilarityScore');
      expect(data.dominantCoalition.cohesion).toBeNull();

      // Machine-visible disclosure so the caveat cannot be missed.
      expect(typeof data.methodologyNote).toBe('string');
      expect(data.methodologyNote).toContain('sizeSimilarityScore');
      expect(data.methodologyNote.toLowerCase()).toContain('not vote-level cohesion');
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

    it('should suppress trend (null) and emit sizeSimilarityScore when sharedVotes are unavailable', async () => {
      // Arrange: Two groups with very different member counts.
      // After issue #3 the size-ratio proxy is exposed as `sizeSimilarityScore`
      // and `trend` is suppressed (null) whenever `sharedVotes === null`.
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
        coalitionPairs: {
          trend: string | null;
          sizeSimilarityScore: number;
          cohesion: number | null;
          sharedVotes: number | null;
        }[];
      };

      // Assert: balance = min(1,10)/max(1,10) = 0.1; trend & cohesion null
      expect(data.coalitionPairs.length).toBeGreaterThan(0);
      const pair = data.coalitionPairs[0];
      expect(pair?.sizeSimilarityScore).toBeLessThanOrEqual(0.4);
      expect(pair?.sharedVotes).toBeNull();
      expect(pair?.cohesion).toBeNull();
      expect(pair?.trend).toBeNull();
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

    it('should normalize and dedupe caller-supplied groupIds (predecessor ID, URI, alias, duplicate)', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({ meps: [
        { id: 'MEP-1', name: 'A', country: 'IT', politicalGroup: 'PfE',
          committees: [], active: true, termStart: '2024-07-16' },
      ], complete: true });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: [
        'ID', // EP9 predecessor → PfE
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

  describe('Political-group label normalization (Defect #4 — PPE/EPP alias)', () => {
    /**
     * Regression for the 2026-04-24 Hack23/euparliamentmonitor propositions
     * audit Defect #4: when the EP API exposes the EPP group via the French
     * acronym `PPE` (e.g. URI suffix `…/corporate-body/PPE`), the coalition
     * tool used to surface `memberCount: 0` for EPP and put `PPE` in
     * `coverage.unrecognizedGroups`. The alias table now normalises common
     * native-language variants so EPP/PPE, S&D/SOC and Greens/EFA / VERTS-ALE
     * collapse to the canonical short codes.
     */
    it('should fold the EP API French acronym `PPE` into the canonical `EPP` group', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({
        meps: [
          { id: 'MEP-A', name: 'A', country: 'DE', politicalGroup: 'PPE',
            committees: [], active: true, termStart: '2024-07-16' },
          { id: 'MEP-B', name: 'B', country: 'FR', politicalGroup: 'PPE',
            committees: [], active: true, termStart: '2024-07-16' },
          { id: 'MEP-C', name: 'C', country: 'IT', politicalGroup: 'S&D',
            committees: [], active: true, termStart: '2024-07-16' },
        ],
        complete: true,
      });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP', 'S&D'] });
      const parsed = JSON.parse(result.content[0].text) as {
        groupMetrics: Array<{ groupId: string; memberCount: number }>;
        coverage: { unrecognizedGroups: string[] };
      };
      const epp = parsed.groupMetrics.find((g) => g.groupId === 'EPP');
      expect(epp?.memberCount).toBe(2);
      expect(parsed.coverage.unrecognizedGroups).not.toContain('PPE');
    });

    it('should fold the URI suffix `Verts-ALE` into `Greens/EFA`', async () => {
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({
        meps: [
          { id: 'MEP-X', name: 'X', country: 'DE',
            politicalGroup: 'http://publications.europa.eu/resource/authority/corporate-body/Verts-ALE',
            committees: [], active: true, termStart: '2024-07-16' },
        ],
        complete: true,
      });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['Greens/EFA'] });
      const parsed = JSON.parse(result.content[0].text) as {
        groupMetrics: Array<{ groupId: string; memberCount: number }>;
      };
      const greens = parsed.groupMetrics.find((g) => g.groupId === 'Greens/EFA');
      expect(greens?.memberCount).toBe(1);
    });
  });

  describe('DOCEO XML cohesion integration', () => {
    it('should compute real cohesion from DOCEO roll-call vote data', async () => {
      // Provide two MEPs in EPP and S&D groups
      vi.mocked(mepFetcherModule.fetchAllCurrentMEPs).mockResolvedValue({
        meps: [
          { id: 'MEP-A', name: 'Alice EPP', country: 'DE', politicalGroup: 'EPP',
            committees: [], active: true, termStart: '2024-07-16' },
          { id: 'MEP-B', name: 'Bob SD', country: 'FR', politicalGroup: 'S&D',
            committees: [], active: true, termStart: '2024-07-16' },
        ],
        complete: true,
      });

      // Two votes: one where EPP+S&D both voted FOR (same), one where they split
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        data: [
          {
            id: 'vote-1', title: 'Vote A', date: '2025-01-20',
            result: 'ADOPTED' as const,
            forCount: 400, againstCount: 100, abstentionCount: 50,
            dataSource: 'RCV' as const,
            groupBreakdown: {
              EPP: { for: 80, against: 0, abstain: 0 },
              'S&D': { for: 70, against: 0, abstain: 0 },
            },
          },
          {
            id: 'vote-2', title: 'Vote B', date: '2025-01-20',
            result: 'REJECTED' as const,
            forCount: 150, againstCount: 350, abstentionCount: 50,
            dataSource: 'RCV' as const,
            groupBreakdown: {
              EPP: { for: 60, against: 20, abstain: 0 },
              'S&D': { for: 0, against: 65, abstain: 5 },
            },
          },
        ],
        total: 2,
        datesAvailable: ['2025-01-20'],
        datesUnavailable: [],
        source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
        limit: 100,
        offset: 0,
        hasMore: false,
      });

      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP', 'S&D'] });
      const parsed = JSON.parse(result.content[0].text) as {
        coalitionPairs: Array<{
          groupA: string; groupB: string;
          cohesion: number | null;
          sharedVotes: number | null;
          totalVotes: number | null;
          trend: string | null;
        }>;
        methodology: string;
      };

      const pair = parsed.coalitionPairs.find(
        (p) => (p.groupA === 'EPP' && p.groupB === 'S&D') ||
                (p.groupA === 'S&D' && p.groupB === 'EPP')
      );
      expect(pair).toBeDefined();
      // 1 shared vote out of 2 → cohesion = 0.5
      expect(pair?.cohesion).toBeCloseTo(0.5, 1);
      expect(pair?.totalVotes).toBe(2);
      expect(pair?.sharedVotes).toBe(1);
      // 0.5 is between 0.4 and 0.6 → STABLE
      expect(pair?.trend).toBe('STABLE');
      // Methodology should mention DOCEO
      expect(parsed.methodology.toLowerCase()).toContain('doceo');
    });

    it('should fall back gracefully when DOCEO returns empty data (cohesion stays null)', async () => {
      // doceoClient.getLatestVotes already mocked to return empty data in beforeEach
      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP', 'S&D'] });
      const parsed = JSON.parse(result.content[0].text) as {
        coalitionPairs: Array<{ cohesion: number | null; trend: string | null }>;
      };
      for (const pair of parsed.coalitionPairs) {
        expect(pair.cohesion).toBeNull();
        expect(pair.trend).toBeNull();
      }
    });

    it('should fall back gracefully when DOCEO throws an error (cohesion stays null)', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(
        new Error('Network error')
      );
      const result = await handleAnalyzeCoalitionDynamics({ groupIds: ['EPP', 'S&D'] });
      const parsed = JSON.parse(result.content[0].text) as {
        coalitionPairs: Array<{ cohesion: number | null }>;
      };
      for (const pair of parsed.coalitionPairs) {
        expect(pair.cohesion).toBeNull();
      }
    });
  });
});
