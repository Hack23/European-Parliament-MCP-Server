/**
 * Tests for generate_political_landscape MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGeneratePoliticalLandscape } from './generatePoliticalLandscape.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn()
  }
}));

describe('generate_political_landscape Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
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
    it('should return MCP-compliant response', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

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
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.parliament).toHaveProperty('totalMEPs');
      expect(data.parliament).toHaveProperty('politicalGroups');
      expect(data.parliament).toHaveProperty('countriesRepresented');
      expect(data.parliament.totalMEPs).toBeGreaterThan(0);
    });

    it('should include sorted group list', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(Array.isArray(data.groups)).toBe(true);
      expect(data.groups.length).toBeGreaterThan(0);

      // Sorted by member count descending
      for (let i = 1; i < data.groups.length; i++) {
        expect(data.groups[i - 1].memberCount)
          .toBeGreaterThanOrEqual(data.groups[i].memberCount);
      }
    });

    it('should include power dynamics', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.powerDynamics).toHaveProperty('largestGroup');
      expect(data.powerDynamics).toHaveProperty('majorityThreshold');
      expect(data.powerDynamics).toHaveProperty('grandCoalitionSize');
      expect(data.powerDynamics).toHaveProperty('progressiveBloc');
      expect(data.powerDynamics).toHaveProperty('conservativeBloc');
    });

    it('should include computed attributes', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.computedAttributes).toHaveProperty('fragmentationIndex');
      expect(data.computedAttributes).toHaveProperty('majorityType');
      expect(data.computedAttributes).toHaveProperty('politicalBalance');
      expect(data.computedAttributes).toHaveProperty('overallEngagement');
    });

    it('should classify blocs correctly', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      // S&D and Greens/EFA are progressive, ECR is conservative
      expect(data.powerDynamics.progressiveBloc).toBeGreaterThan(0);
      expect(data.powerDynamics.conservativeBloc).toBeGreaterThan(0);
    });

    it('should include EP attribution in methodology', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.methodology).toContain('European Parliament');
    });

    it('should include group seat share percentages', async () => {
      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      for (const group of data.groups) {
        expect(group).toHaveProperty('seatShare');
        expect(group.seatShare).toBeGreaterThan(0);
        expect(group.seatShare).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Error Handling', () => {
    it('should propagate API errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(
        new Error('API Error')
      );

      await expect(handleGeneratePoliticalLandscape({}))
        .rejects.toThrow('API Error');
    });

    it('should handle empty MEP list', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 100,
        offset: 0,
        hasMore: false
      });

      const result = await handleGeneratePoliticalLandscape({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.parliament.totalMEPs).toBe(0);
    });
  });
});
