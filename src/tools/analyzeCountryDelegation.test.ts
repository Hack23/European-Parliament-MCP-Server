/**
 * Tests for analyze_country_delegation MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAnalyzeCountryDelegation } from './analyzeCountryDelegation.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn(),
    getMEPDetails: vi.fn()
  }
}));

describe('analyze_country_delegation Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
      data: [
        { id: 'MEP-1', name: 'MEP One', country: 'SE', politicalGroup: 'EPP', committees: ['ENVI'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-2', name: 'MEP Two', country: 'SE', politicalGroup: 'S&D', committees: ['ITRE'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-3', name: 'MEP Three', country: 'SE', politicalGroup: 'EPP', committees: ['AGRI'], active: true, termStart: '2019-07-02' }
      ],
      total: 3,
      limit: 100,
      offset: 0,
      hasMore: false
    });

    vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
      id: 'MEP-1',
      name: 'MEP One',
      country: 'SE',
      politicalGroup: 'EPP',
      committees: ['ENVI'],
      active: true,
      termStart: '2019-07-02',
      votingStatistics: {
        totalVotes: 1000,
        votesFor: 500,
        votesAgainst: 350,
        abstentions: 150,
        attendanceRate: 82
      }
    });
  });

  describe('Input Validation', () => {
    it('should accept valid country code', async () => {
      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should reject missing country', async () => {
      await expect(handleAnalyzeCountryDelegation({})).rejects.toThrow();
    });

    it('should reject invalid country code format', async () => {
      await expect(handleAnalyzeCountryDelegation({ country: 'invalid' })).rejects.toThrow();
    });

    it('should reject lowercase country code', async () => {
      await expect(handleAnalyzeCountryDelegation({ country: 'se' })).rejects.toThrow();
    });

    it('should accept optional date parameters', async () => {
      const result = await handleAnalyzeCountryDelegation({
        country: 'DE',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid date format', async () => {
      await expect(handleAnalyzeCountryDelegation({
        country: 'SE',
        dateFrom: 'invalid'
      })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('country', 'SE');
      expect(data).toHaveProperty('period');
      expect(data).toHaveProperty('delegation');
      expect(data).toHaveProperty('votingBehavior');
      expect(data).toHaveProperty('committeePresence');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
    });

    it('should include delegation group distribution', async () => {
      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.delegation).toHaveProperty('totalMEPs');
      expect(data.delegation).toHaveProperty('groupDistribution');
      expect(Array.isArray(data.delegation.groupDistribution)).toBe(true);
      expect(data.delegation.groupDistribution.length).toBeGreaterThan(0);
    });

    it('should include computed attributes', async () => {
      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.computedAttributes).toHaveProperty('delegationInfluence');
      expect(data.computedAttributes).toHaveProperty('nationalCohesionLevel');
      expect(data.computedAttributes).toHaveProperty('groupFragmentation');
      expect(data.computedAttributes).toHaveProperty('engagementLevel');
    });

    it('should include EP attribution in methodology', async () => {
      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.methodology).toContain('European Parliament');
    });

    it('should sort group distribution by count descending', async () => {
      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      const dist = data.delegation.groupDistribution;
      if (dist.length > 1) {
        for (let i = 1; i < dist.length; i++) {
          expect(dist[i - 1].count).toBeGreaterThanOrEqual(dist[i].count);
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should propagate API errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(
        new Error('API Error')
      );

      await expect(handleAnalyzeCountryDelegation({ country: 'SE' }))
        .rejects.toThrow('API Error');
    });

    it('should handle partial MEP detail failures', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails)
        .mockResolvedValueOnce({
          id: 'MEP-1', name: 'MEP One', country: 'SE', politicalGroup: 'EPP',
          committees: ['ENVI'], active: true, termStart: '2019-07-02',
          votingStatistics: { totalVotes: 500, votesFor: 300, votesAgainst: 150, abstentions: 50, attendanceRate: 85 }
        })
        .mockRejectedValueOnce(new Error('Not found'))
        .mockRejectedValueOnce(new Error('Not found'));

      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      // Should still return valid analysis
      expect(data.delegation.totalMEPs).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty MEP delegation', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 100,
        offset: 0,
        hasMore: false
      });

      const result = await handleAnalyzeCountryDelegation({ country: 'MT' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.delegation.totalMEPs).toBe(0);
      expect(data.delegation.groupDistribution).toEqual([]);
      expect(data.votingBehavior.averageAttendance).toBe(0);
      expect(data.computedAttributes.engagementLevel).toBe('LOW');
      expect(data.confidenceLevel).toBe('LOW');
    });

    it('should handle MEPs without voting statistics', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
        id: 'MEP-1', name: 'MEP One', country: 'SE', politicalGroup: 'EPP',
        committees: ['ENVI'], active: true, termStart: '2019-07-02'
        // No votingStatistics
      });

      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.votingBehavior.averageAttendance).toBe(0);
      expect(data.confidenceLevel).toBe('LOW');
    });

    it('should compute HIGH fragmentation for diverse delegation', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [
          { id: 'MEP-1', name: 'A', country: 'DE', politicalGroup: 'EPP', committees: [], active: true, termStart: '2019-07-02' },
          { id: 'MEP-2', name: 'B', country: 'DE', politicalGroup: 'S&D', committees: [], active: true, termStart: '2019-07-02' },
          { id: 'MEP-3', name: 'C', country: 'DE', politicalGroup: 'Renew', committees: [], active: true, termStart: '2019-07-02' },
          { id: 'MEP-4', name: 'D', country: 'DE', politicalGroup: 'Greens', committees: [], active: true, termStart: '2019-07-02' },
          { id: 'MEP-5', name: 'E', country: 'DE', politicalGroup: 'ECR', committees: [], active: true, termStart: '2019-07-02' },
        ],
        total: 5, limit: 100, offset: 0, hasMore: false
      });

      const result = await handleAnalyzeCountryDelegation({ country: 'DE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.computedAttributes.groupFragmentation).toBe('HIGH');
    });

    it('should compute LOW fragmentation for single-group delegation', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [
          { id: 'MEP-1', name: 'A', country: 'CY', politicalGroup: 'EPP', committees: [], active: true, termStart: '2019-07-02' },
          { id: 'MEP-2', name: 'B', country: 'CY', politicalGroup: 'EPP', committees: [], active: true, termStart: '2019-07-02' },
        ],
        total: 2, limit: 100, offset: 0, hasMore: false
      });

      const result = await handleAnalyzeCountryDelegation({ country: 'CY' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.computedAttributes.groupFragmentation).toBe('LOW');
    });

    it('should compute HIGH influence for large delegations with leadership', async () => {
      const largeDelegation = Array.from({ length: 96 }, (_, i) => ({
        id: `MEP-${i}`, name: `MEP ${i}`, country: 'DE', politicalGroup: 'EPP',
        committees: [], active: true, termStart: '2019-07-02'
      }));
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: largeDelegation, total: 96, limit: 100, offset: 0, hasMore: false
      });
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
        id: 'MEP-1', name: 'MEP One', country: 'DE', politicalGroup: 'EPP',
        committees: ['ENVI', 'ITRE'], active: true, termStart: '2019-07-02',
        roles: ['Chair of ENVI'],
        votingStatistics: { totalVotes: 1000, votesFor: 700, votesAgainst: 200, abstentions: 100, attendanceRate: 90 }
      });

      const result = await handleAnalyzeCountryDelegation({ country: 'DE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.computedAttributes.delegationInfluence).toBe('HIGH');
    });

    it('should compute HIGH confidence when most MEPs have stats', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
        id: 'MEP-1', name: 'MEP One', country: 'SE', politicalGroup: 'EPP',
        committees: ['ENVI'], active: true, termStart: '2019-07-02',
        votingStatistics: { totalVotes: 1000, votesFor: 700, votesAgainst: 200, abstentions: 100, attendanceRate: 90 }
      });

      const result = await handleAnalyzeCountryDelegation({ country: 'SE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.confidenceLevel).toBe('HIGH');
    });

    it('should compute HIGH national cohesion when delegation is dominated by one group', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [
          { id: 'MEP-1', name: 'A', country: 'HU', politicalGroup: 'EPP', committees: [], active: true, termStart: '2019-07-02' },
          { id: 'MEP-2', name: 'B', country: 'HU', politicalGroup: 'EPP', committees: [], active: true, termStart: '2019-07-02' },
          { id: 'MEP-3', name: 'C', country: 'HU', politicalGroup: 'EPP', committees: [], active: true, termStart: '2019-07-02' },
        ],
        total: 3, limit: 100, offset: 0, hasMore: false
      });

      const result = await handleAnalyzeCountryDelegation({ country: 'HU' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.computedAttributes.nationalCohesionLevel).toBe('HIGH');
    });
  });
});
