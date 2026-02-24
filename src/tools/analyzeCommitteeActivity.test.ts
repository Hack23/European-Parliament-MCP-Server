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

  describe('Workload Intensity Computation', () => {
    it('should classify VERY_HIGH workload for large committees', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'ENVI', name: 'Environment', abbreviation: 'ENVI',
        members: Array.from({ length: 60 }, (_, i) => `MEP-${i}`)
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.computedAttributes.workloadIntensity).toBe('VERY_HIGH');
    });

    it('should classify HIGH workload for medium-large committees', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'ITRE', name: 'Industry', abbreviation: 'ITRE',
        members: Array.from({ length: 25 }, (_, i) => `MEP-${i}`)
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ITRE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.computedAttributes.workloadIntensity).toBe('HIGH');
    });

    it('should classify MODERATE workload for medium committees', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'AFET', name: 'Foreign Affairs', abbreviation: 'AFET',
        members: Array.from({ length: 12 }, (_, i) => `MEP-${i}`)
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'AFET' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.computedAttributes.workloadIntensity).toBe('MODERATE');
    });

    it('should classify LOW workload for small committees', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'DROI', name: 'Human Rights', abbreviation: 'DROI',
        members: ['MEP-1', 'MEP-2']
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'DROI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.computedAttributes.workloadIntensity).toBe('LOW');
    });
  });

  describe('Engagement and Impact Computation', () => {
    it('should classify HIGH engagement for large committees', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'ENVI', name: 'Environment', abbreviation: 'ENVI',
        members: Array.from({ length: 50 }, (_, i) => `MEP-${i}`)
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.computedAttributes.engagementLevel).toBe('HIGH');
    });

    it('should classify MODERATE engagement for small committees', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'DROI', name: 'Human Rights', abbreviation: 'DROI',
        members: ['MEP-1']
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'DROI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(['MODERATE', 'LOW']).toContain(data.computedAttributes.engagementLevel);
    });

    it('should handle empty members array', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'TEST', name: 'Test Committee', abbreviation: 'TEST',
        members: []
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'TEST' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.memberEngagement.totalMembers).toBe(0);
      expect(data.workload.activeLegislativeFiles).toBeGreaterThanOrEqual(5);
    });

    it('should compute policy impact rating based on reports and success rate', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'ENVI', name: 'Environment', abbreviation: 'ENVI',
        members: Array.from({ length: 40 }, (_, i) => `MEP-${i}`)
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(data.computedAttributes.policyImpactRating);
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
