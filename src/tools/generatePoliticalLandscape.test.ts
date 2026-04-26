/**
 * Tests for generate_political_landscape MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGeneratePoliticalLandscape } from './generatePoliticalLandscape.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCurrentMEPs: vi.fn(),
    getPlenarySessions: vi.fn()
  }
}));

describe('generate_political_landscape Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
      data: [
        { id: 'MEP-1', name: 'MEP One', country: 'DE', politicalGroup: 'EPP', committees: ['ENVI'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-2', name: 'MEP Two', country: 'FR', politicalGroup: 'S&D', committees: ['ITRE'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-3', name: 'MEP Three', country: 'IT', politicalGroup: 'EPP', committees: ['AGRI'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-4', name: 'MEP Four', country: 'SE', politicalGroup: 'Greens/EFA', committees: ['ENVI'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-5', name: 'MEP Five', country: 'PL', politicalGroup: 'ECR', committees: ['AFET'], active: true, termStart: '2019-07-02' }
      ],
      total: 5,
      limit: 100,
      offset: 0,
      hasMore: false
    });

    vi.mocked(epClientModule.epClient.getPlenarySessions).mockResolvedValue({
      data: Array.from({ length: 12 }, (_, i) => ({
        id: `session-${i}`, date: '2024-03-01', title: `Session ${i}`,
        location: 'Strasbourg', status: 'COMPLETED'
      })), total: 12, limit: 100, offset: 0, hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept empty parameters', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept date range parameters', async () => {
      const result = await handleGeneratePoliticalLandscape({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid date format', async () => {
      await expect(handleGeneratePoliticalLandscape({
        dateFrom: 'not-a-date'
      })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {

    it('should include dataQualityWarnings array in response', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });
    it('should return MCP-compliant response', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data).toHaveProperty('period');
      expect(data).toHaveProperty('parliament');
      expect(data).toHaveProperty('groups');
      expect(data).toHaveProperty('powerDynamics');
      expect(data).toHaveProperty('activityMetrics');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
    });

    it('should include parliament summary', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.parliament).toHaveProperty('totalMEPs');
      expect(data.parliament).toHaveProperty('politicalGroups');
      expect(data.parliament).toHaveProperty('countriesRepresented');
      expect(data.parliament.totalMEPs).toBeGreaterThan(0);
    });

    it('should include sorted group list', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(Array.isArray(data.groups)).toBe(true);
      expect(data.groups.length).toBeGreaterThan(0);

      // Sorted by member count descending
      const groups = data.groups as Array<Record<string, unknown>>;
      for (let i = 1; i < groups.length; i++) {
        expect(groups[i - 1]?.memberCount as number)
          .toBeGreaterThanOrEqual(groups[i]?.memberCount as number);
      }
    });

    it('should include power dynamics', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.powerDynamics).toHaveProperty('largestGroup');
      expect(data.powerDynamics).toHaveProperty('majorityThreshold');
      expect(data.powerDynamics).toHaveProperty('grandCoalitionSize');
      expect(data.powerDynamics).toHaveProperty('progressiveBloc');
      expect(data.powerDynamics).toHaveProperty('conservativeBloc');
    });

    it('should include computed attributes', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.computedAttributes).toHaveProperty('fragmentationIndex');
      expect(data.computedAttributes).toHaveProperty('majorityType');
      expect(data.computedAttributes).toHaveProperty('politicalBalance');
      expect(data.computedAttributes).toHaveProperty('overallEngagement');
    });

    it('should classify blocs correctly', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      // S&D and Greens/EFA are progressive, ECR is conservative
      const powerDynamics = data.powerDynamics as Record<string, unknown>;
      expect(powerDynamics.progressiveBloc as number).toBeGreaterThan(0);
      expect(powerDynamics.conservativeBloc as number).toBeGreaterThan(0);
    });

    it('should include EP attribution in methodology', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.methodology).toContain('European Parliament');
    });

    it('should include group seat share percentages', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      for (const group of data.groups as Array<Record<string, unknown>>) {
        expect(group).toHaveProperty('seatShare');
        expect(group.seatShare as number).toBeGreaterThan(0);
        expect(group.seatShare as number).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Error Handling', () => {
    it('should return partial snapshot with warning when MEP pagination fails', async () => {
      // fetchAllCurrentMEPs catches pagination errors and returns partial
      // results with `complete: false` so a transient EP API outage
      // produces a degraded snapshot rather than a hard tool failure.
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockRejectedValue(
        new Error('API Error')
      );

      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        confidenceLevel: string;
        parliament: { totalMEPs: number };
        dataQualityWarnings: string[];
      };

      expect(data.confidenceLevel).toBe('LOW');
      expect(data.parliament.totalMEPs).toBe(0);
      expect(data.dataQualityWarnings.some(w => w.includes('MEP pagination failed'))).toBe(true);
    });

    it('should handle empty MEP list', async () => {
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 100,
        offset: 0,
        hasMore: false
      });

      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.parliament.totalMEPs).toBe(0);
    });
  });

  describe('Branch Coverage - Political Balance and Engagement', () => {
    it('should classify political balance as CONSERVATIVE_LEANING when ratio < 0.77', async () => {
      // Arrange: Mostly conservative groups (ECR, ID) with few progressive (S&D)
      // progressive=1 (S&D), conservative=4 (ECR*2 + ID*2), ratio=1/4=0.25 → CONSERVATIVE_LEANING
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: [
          { id: 'MEP-1', name: 'MEP One', country: 'PL', politicalGroup: 'ECR', committees: ['AFET'], active: true, termStart: '2019-07-02' },
          { id: 'MEP-2', name: 'MEP Two', country: 'IT', politicalGroup: 'ID', committees: ['LIBE'], active: true, termStart: '2019-07-02' },
          { id: 'MEP-3', name: 'MEP Three', country: 'HU', politicalGroup: 'ECR', committees: ['BUDG'], active: true, termStart: '2019-07-02' },
          { id: 'MEP-4', name: 'MEP Four', country: 'FR', politicalGroup: 'ID', committees: ['ITRE'], active: true, termStart: '2019-07-02' },
          { id: 'MEP-5', name: 'MEP Five', country: 'SE', politicalGroup: 'S&D', committees: ['ENVI'], active: true, termStart: '2019-07-02' }
        ],
        total: 5, limit: 100, offset: 0, hasMore: false
      });

      // Act
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { politicalBalance: string };
        powerDynamics: { progressiveBloc: number; conservativeBloc: number };
      };

      // Assert
      expect(data.computedAttributes.politicalBalance).toBe('CONSERVATIVE_LEANING');
      expect(data.powerDynamics.conservativeBloc).toBeGreaterThan(data.powerDynamics.progressiveBloc);
    });

    it('should classify political balance as BALANCED when ratio between 0.77 and 1.3', async () => {
      // Arrange: Equal progressive and conservative representation
      // progressive=1 (S&D), conservative=1 (ECR), center=1 (EPP), ratio=1/1=1.0 → BALANCED
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: [
          { id: 'MEP-1', name: 'MEP One', country: 'FR', politicalGroup: 'S&D', committees: ['ENVI'], active: true, termStart: '2019-07-02' },
          { id: 'MEP-2', name: 'MEP Two', country: 'PL', politicalGroup: 'ECR', committees: ['AFET'], active: true, termStart: '2019-07-02' },
          { id: 'MEP-3', name: 'MEP Three', country: 'DE', politicalGroup: 'EPP', committees: ['AGRI'], active: true, termStart: '2019-07-02' }
        ],
        total: 3, limit: 100, offset: 0, hasMore: false
      });

      // Act
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { politicalBalance: string };
      };

      // Assert
      expect(data.computedAttributes.politicalBalance).toBe('BALANCED');
    });

    it('should classify engagement as LOW when attendance data is not available from EP API', async () => {
      // Arrange: 8 distinct groups — attendance not available from EP API
      const groups = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID', 'The Left', 'NI'];
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: groups.map((g, i) => ({
          id: `MEP-${i}`, name: `MEP ${i}`, country: 'DE',
          politicalGroup: g, committees: [], active: true as const, termStart: '2019-07-02'
        })),
        total: groups.length, limit: 100, offset: 0, hasMore: false
      });

      // Act
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { overallEngagement: string; fragmentationIndex: string };
        activityMetrics: { recentSessionCount: number };
      };

      // Assert — engagement is LOW because EP API does not provide attendance data
      expect(data.computedAttributes.overallEngagement).toBe('LOW');
      expect(data.computedAttributes.fragmentationIndex).toBe('HIGH'); // 8 groups >= 8
      // Session count comes from real EP API data (mocked as 12)
      expect(data.activityMetrics.recentSessionCount).toBe(12);
    });
  });

  describe('Defect #3 / D-08 regression — full paginated MEP roster', () => {
    it('should fetch all MEPs via pagination, not a single 100-MEP page', async () => {
      // Arrange: simulate three pages totalling 250 MEPs to verify the tool
      // uses fetchAllCurrentMEPs() instead of a single getCurrentMEPs({limit:100}) call.
      // Previous bug (Hack23/euparliamentmonitor 2026-04-26 audits, Defect #3 / D-08)
      // reported `totalMEPs: 100` instead of the full Parliament composition.
      const buildPage = (start: number, count: number, hasMore: boolean) => ({
        data: Array.from({ length: count }, (_, i) => ({
          id: `MEP-${String(start + i)}`,
          name: `MEP ${String(start + i)}`,
          country: 'DE',
          politicalGroup: 'EPP',
          committees: [],
          active: true as const,
          termStart: '2024-07-16'
        })),
        total: 250,
        limit: 100,
        offset: start,
        hasMore
      });
      vi.mocked(epClientModule.epClient.getCurrentMEPs)
        .mockResolvedValueOnce(buildPage(0, 100, true))
        .mockResolvedValueOnce(buildPage(100, 100, true))
        .mockResolvedValueOnce(buildPage(200, 50, false));

      // Act
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        parliament: { totalMEPs: number };
        confidenceLevel: string;
      };

      // Assert — full 250-MEP roster aggregated (not just first page of 100)
      expect(epClientModule.epClient.getCurrentMEPs).toHaveBeenCalledTimes(3);
      expect(data.parliament.totalMEPs).toBe(250);
      expect(data.confidenceLevel).toBe('MEDIUM'); // 200 ≤ 250 < 600
    });

    it('should report HIGH confidence when full ~720-MEP roster is collected', async () => {
      // Arrange: 720 MEPs across two pages — emulates the EP10 composition
      const buildPage = (start: number, count: number, hasMore: boolean) => ({
        data: Array.from({ length: count }, (_, i) => ({
          id: `MEP-${String(start + i)}`,
          name: `MEP ${String(start + i)}`,
          country: 'DE',
          politicalGroup: 'EPP',
          committees: [],
          active: true as const,
          termStart: '2024-07-16'
        })),
        total: 720, limit: 600, offset: start, hasMore
      });
      vi.mocked(epClientModule.epClient.getCurrentMEPs)
        .mockResolvedValueOnce(buildPage(0, 100, true))
        .mockResolvedValueOnce(buildPage(100, 100, true))
        .mockResolvedValueOnce(buildPage(200, 100, true))
        .mockResolvedValueOnce(buildPage(300, 100, true))
        .mockResolvedValueOnce(buildPage(400, 100, true))
        .mockResolvedValueOnce(buildPage(500, 100, true))
        .mockResolvedValueOnce(buildPage(600, 100, true))
        .mockResolvedValueOnce(buildPage(700, 20, false));

      // Act
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        parliament: { totalMEPs: number };
        confidenceLevel: string;
      };

      // Assert
      expect(data.parliament.totalMEPs).toBe(720);
      expect(data.confidenceLevel).toBe('HIGH');
    });

    it('should normalise EP API native-language acronyms (e.g. PPE → EPP, Verts-ALE → Greens/EFA, ID → PfE)', async () => {
      // Arrange: the EP Open Data Portal returns French acronyms (PPE) and
      // URI suffixes (Verts-ALE) interchangeably with English short codes.
      // Without normalisation, the same group appears twice with split
      // member counts. See `analyze_coalition_dynamics` Defect #1 / D-01.
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValueOnce({
        data: [
          // EPP variants — French acronym `PPE`, English short code `EPP`,
          // and the full English group name should all collapse onto `EPP`.
          { id: 'MEP-1', name: 'A', country: 'DE', politicalGroup: 'PPE', committees: [], active: true, termStart: '2024-07-16' },
          { id: 'MEP-2', name: 'B', country: 'IT', politicalGroup: 'EPP', committees: [], active: true, termStart: '2024-07-16' },
          { id: 'MEP-3', name: 'C', country: 'PL', politicalGroup: "Group of the European People's Party (Christian Democrats)", committees: [], active: true, termStart: '2024-07-16' },
          // Greens/EFA variants — URI suffix `Verts-ALE` should collapse onto `Greens/EFA`.
          { id: 'MEP-4', name: 'D', country: 'SE', politicalGroup: 'Verts-ALE', committees: [], active: true, termStart: '2024-07-16' },
          { id: 'MEP-5', name: 'E', country: 'FR', politicalGroup: 'Greens/EFA', committees: [], active: true, termStart: '2024-07-16' },
          // Legacy ID → EP10 successor PfE.
          { id: 'MEP-6', name: 'F', country: 'IT', politicalGroup: 'ID', committees: [], active: true, termStart: '2024-07-16' },
          { id: 'MEP-7', name: 'G', country: 'FR', politicalGroup: 'PfE', committees: [], active: true, termStart: '2024-07-16' }
        ],
        total: 7, limit: 100, offset: 0, hasMore: false
      });

      // Act
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groups: { name: string; memberCount: number }[];
        parliament: { totalMEPs: number; politicalGroups: number };
      };

      // Assert — expect three canonical groups (EPP=3, Greens/EFA=2, PfE=2),
      // not six split entries.
      expect(data.parliament.totalMEPs).toBe(7);
      expect(data.parliament.politicalGroups).toBe(3);
      const byName = new Map(data.groups.map(g => [g.name, g.memberCount]));
      expect(byName.get('EPP')).toBe(3);
      expect(byName.get('Greens/EFA')).toBe(2);
      expect(byName.get('PfE')).toBe(2);
      expect(byName.has('PPE')).toBe(false);
      expect(byName.has('Verts-ALE')).toBe(false);
      expect(byName.has('ID')).toBe(false);
    });
  });
});
