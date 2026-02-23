/**
 * Tests for analyze_committee_activity MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAnalyzeCommitteeActivity } from './analyzeCommitteeActivity.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCommitteeInfo: vi.fn()
  }
}));

describe('analyze_committee_activity Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
      id: 'ENVI',
      name: 'Environment, Public Health and Food Safety',
      abbreviation: 'ENVI',
      members: ['MEP-1', 'MEP-2', 'MEP-3', 'MEP-4', 'MEP-5',
                'MEP-6', 'MEP-7', 'MEP-8', 'MEP-9', 'MEP-10']
    });
  });

  describe('Input Validation', () => {
    it('should accept valid committeeId', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should reject empty committeeId', async () => {
      await expect(handleAnalyzeCommitteeActivity({ committeeId: '' }))
        .rejects.toThrow();
    });

    it('should reject missing committeeId', async () => {
      await expect(handleAnalyzeCommitteeActivity({}))
        .rejects.toThrow();
    });

    it('should accept optional date params', async () => {
      const result = await handleAnalyzeCommitteeActivity({
        committeeId: 'ITRE',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid date format', async () => {
      await expect(handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI',
        dateFrom: 'invalid'
      })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('committeeId', 'ENVI');
      expect(data).toHaveProperty('committeeName');
      expect(data).toHaveProperty('period');
      expect(data).toHaveProperty('workload');
      expect(data).toHaveProperty('memberEngagement');
      expect(data).toHaveProperty('legislativeOutput');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
    });

    it('should include workload metrics', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.workload).toHaveProperty('activeLegislativeFiles');
      expect(data.workload).toHaveProperty('documentsProduced');
      expect(data.workload).toHaveProperty('meetingsHeld');
      expect(data.workload).toHaveProperty('opinionsIssued');
    });

    it('should include computed attributes', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.computedAttributes).toHaveProperty('workloadIntensity');
      expect(data.computedAttributes).toHaveProperty('productivityScore');
      expect(data.computedAttributes).toHaveProperty('engagementLevel');
      expect(data.computedAttributes).toHaveProperty('policyImpactRating');
    });

    it('should include EP attribution in methodology', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.methodology).toContain('European Parliament');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API errors', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockRejectedValue(
        new Error('API Error')
      );

      await expect(handleAnalyzeCommitteeActivity({ committeeId: 'INVALID' }))
        .rejects.toThrow('API Error');
    });
  });
});
