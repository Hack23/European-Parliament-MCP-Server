/**
 * Tests for early_warning_system MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleEarlyWarningSystem } from './earlyWarningSystem.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn()
  }
}));

const makeMEPList = (count: number, group: string) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${group}-MEP-${String(i)}`,
    name: `MEP ${String(i)} ${group}`,
    country: 'DE',
    politicalGroup: group,
    committees: [],
    active: true as const,
    termStart: '2019-07-02'
  }));

describe('early_warning_system Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
      data: [
        ...makeMEPList(180, 'EPP'),
        ...makeMEPList(136, 'S&D'),
        ...makeMEPList(77, 'Renew'),
        ...makeMEPList(53, 'Greens/EFA'),
        ...makeMEPList(78, 'ECR'),
        ...makeMEPList(49, 'ID'),
        ...makeMEPList(37, 'GUE/NGL'),
        ...makeMEPList(44, 'NI')
      ],
      total: 654,
      limit: 100,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept empty params', async () => {
      const result = await handleEarlyWarningSystem({});
      expect(result).toHaveProperty('content');
    });

    it('should accept sensitivity param', async () => {
      const result = await handleEarlyWarningSystem({ sensitivity: 'high' });
      expect(result).toHaveProperty('content');
    });

    it('should accept focusArea param', async () => {
      const result = await handleEarlyWarningSystem({ focusArea: 'coalitions' });
      expect(result).toHaveProperty('content');
    });

    it('should accept all valid combinations', async () => {
      const combos = [
        { sensitivity: 'low' as const, focusArea: 'attendance' as const },
        { sensitivity: 'medium' as const, focusArea: 'voting' as const },
        { sensitivity: 'high' as const, focusArea: 'all' as const }
      ];
      for (const combo of combos) {
        const result = await handleEarlyWarningSystem(combo);
        expect(result).toHaveProperty('content');
      }
    });

    it('should reject invalid sensitivity', async () => {
      await expect(handleEarlyWarningSystem({ sensitivity: 'extreme' })).rejects.toThrow();
    });

    it('should reject invalid focusArea', async () => {
      await expect(handleEarlyWarningSystem({ focusArea: 'economy' })).rejects.toThrow();
    });
  });

  describe('Response Structure', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleEarlyWarningSystem({});
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleEarlyWarningSystem({});
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
    });

    it('should include required fields', async () => {
      const result = await handleEarlyWarningSystem({});
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('warnings');
      expect(data).toHaveProperty('riskLevel');
      expect(data).toHaveProperty('stabilityScore');
      expect(data).toHaveProperty('trendIndicators');
      expect(data).toHaveProperty('lastAssessmentTime');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('dataAvailable');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('dataFreshness');
      expect(data).toHaveProperty('sourceAttribution');
      expect(data).toHaveProperty('methodology');
    });

    it('should include computedAttributes fields', async () => {
      const result = await handleEarlyWarningSystem({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('criticalWarnings');
      expect(data.computedAttributes).toHaveProperty('highWarnings');
      expect(data.computedAttributes).toHaveProperty('totalWarnings');
      expect(data.computedAttributes).toHaveProperty('overallStabilityTrend');
      expect(data.computedAttributes).toHaveProperty('keyRiskFactor');
    });

    it('should return valid riskLevel', async () => {
      const result = await handleEarlyWarningSystem({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { riskLevel: string };
      expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(data.riskLevel);
    });

    it('should return stabilityScore in 0-100 range', async () => {
      const result = await handleEarlyWarningSystem({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { stabilityScore: number };
      expect(data.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(data.stabilityScore).toBeLessThanOrEqual(100);
    });

    it('should have correct sourceAttribution', async () => {
      const result = await handleEarlyWarningSystem({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { sourceAttribution: string };
      expect(data.sourceAttribution).toBe('European Parliament Open Data Portal - data.europarl.europa.eu');
    });

    it('should generate more warnings with high sensitivity', async () => {
      const lowResult = await handleEarlyWarningSystem({ sensitivity: 'low' });
      const highResult = await handleEarlyWarningSystem({ sensitivity: 'high' });

      const lowData = JSON.parse(lowResult.content[0]?.text ?? '{}') as {
        computedAttributes: { totalWarnings: number };
      };
      const highData = JSON.parse(highResult.content[0]?.text ?? '{}') as {
        computedAttributes: { totalWarnings: number };
      };

      // High sensitivity should produce >= warnings than low sensitivity
      expect(highData.computedAttributes.totalWarnings).toBeGreaterThanOrEqual(
        lowData.computedAttributes.totalWarnings
      );
    });

    it('should include trendIndicators array', async () => {
      const result = await handleEarlyWarningSystem({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        trendIndicators: unknown[];
      };
      expect(Array.isArray(data.trendIndicators)).toBe(true);
    });
  });

  describe('dataAvailable: false scenario', () => {
    it('should return dataAvailable false when no MEPs', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 100,
        offset: 0,
        hasMore: false
      });

      const result = await handleEarlyWarningSystem({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataAvailable: boolean;
        confidenceLevel: string;
        warnings: unknown[];
      };

      expect(data.dataAvailable).toBe(false);
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.warnings).toHaveLength(0);
    });
  });

  describe('Focus Area Filtering', () => {
    it('should filter to coalitions only', async () => {
      const result = await handleEarlyWarningSystem({ focusArea: 'coalitions' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        warnings: { type: string }[];
      };
      // Warnings should only be coalition-related types
      const nonCoalitionWarnings = data.warnings.filter(w =>
        w.type === 'SMALL_GROUP_QUORUM_RISK'
      );
      expect(nonCoalitionWarnings).toHaveLength(0);
    });

    it('should include quorum warnings for attendance focus', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [
          ...makeMEPList(100, 'EPP'),
          ...makeMEPList(3, 'SmallGroup') // very small group to trigger quorum warning
        ],
        total: 103,
        limit: 100,
        offset: 0,
        hasMore: false
      });

      const result = await handleEarlyWarningSystem({ focusArea: 'attendance', sensitivity: 'high' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        warnings: { type: string }[];
      };
      const quorumWarnings = data.warnings.filter(w => w.type === 'SMALL_GROUP_QUORUM_RISK');
      expect(quorumWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return error response on API failure', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(new Error('API Error'));

      const result = await handleEarlyWarningSystem({});
      expect(result.isError).toBe(true);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue({ code: 500 });

      const result = await handleEarlyWarningSystem({});
      expect(result.isError).toBe(true);
    });
  });
});
