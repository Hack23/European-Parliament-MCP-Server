/**
 * Tests for compare_political_groups MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleComparePoliticalGroups } from './comparePoliticalGroups.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn()
  }
}));

describe('compare_political_groups Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
      data: [
        {
          id: 'MEP-1',
          name: 'Test MEP',
          country: 'SE',
          politicalGroup: 'EPP',
          committees: ['AGRI'],
          active: true,
          termStart: '2019-07-02'
        },
        {
          id: 'MEP-2',
          name: 'Another MEP',
          country: 'DE',
          politicalGroup: 'EPP',
          committees: ['ENVI'],
          active: true,
          termStart: '2019-07-02'
        }
      ],
      total: 2,
      limit: 100,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept valid group comparison', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D']
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject less than 2 groups', async () => {
      await expect(handleComparePoliticalGroups({ groupIds: ['EPP'] }))
        .rejects.toThrow();
    });

    it('should reject missing groupIds', async () => {
      await expect(handleComparePoliticalGroups({}))
        .rejects.toThrow();
    });

    it('should accept multiple groups', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D', 'Renew']
      });
      expect(result).toHaveProperty('content');
    });

    it('should accept dimension filter', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D'],
        dimensions: ['voting_discipline', 'attendance']
      });
      expect(result).toHaveProperty('content');
    });
  });

  describe('Response Structure', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D']
      });
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D']
      });
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
    });

    it('should include group comparison data', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D']
      });
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('groups');
      expect(data).toHaveProperty('rankings');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('groupCount');
    });

    it('should include computed summary attributes', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('mostDisciplined');
      expect(data.computedAttributes).toHaveProperty('mostActive');
      expect(data.computedAttributes).toHaveProperty('highestAttendance');
      expect(data.computedAttributes).toHaveProperty('mostCohesive');
      expect(data.computedAttributes).toHaveProperty('strongestOverall');
      expect(data.computedAttributes).toHaveProperty('parliamentaryBalance');
      expect(data.computedAttributes).toHaveProperty('competitiveIndex');
    });

    it('should include per-group computed attributes', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        groups: { computedAttributes: Record<string, unknown> }[];
      };

      const group = data.groups[0];
      expect(group?.computedAttributes).toHaveProperty('overallPerformanceScore');
      expect(group?.computedAttributes).toHaveProperty('relativeStrength');
      expect(group?.computedAttributes).toHaveProperty('seatShare');
      expect(group?.computedAttributes).toHaveProperty('effectivenessPerMember');
      expect(group?.computedAttributes).toHaveProperty('engagementIntensity');
    });
  });

  describe('Rankings', () => {
    it('should include rankings per dimension', async () => {
      const result = await handleComparePoliticalGroups({
        groupIds: ['EPP', 'S&D']
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        rankings: { dimension: string; ranking: unknown[] }[];
      };

      expect(data.rankings.length).toBeGreaterThan(0);
      for (const ranking of data.rankings) {
        expect(ranking).toHaveProperty('dimension');
        expect(ranking).toHaveProperty('ranking');
        expect(ranking.ranking.length).toBe(2);
      }
    });
  });

  describe('Error Handling', () => {
    it('should wrap API errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPs)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(handleComparePoliticalGroups({ groupIds: ['EPP', 'S&D'] }))
        .rejects.toThrow('Failed to compare political groups');
    });
  });
});
