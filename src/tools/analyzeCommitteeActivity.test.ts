/**
 * Tests for analyze_committee_activity MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAnalyzeCommitteeActivity } from './analyzeCommitteeActivity.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCommitteeInfo: vi.fn(),
    getCommitteeDocuments: vi.fn(),
    getProcedures: vi.fn(),
    getAdoptedTexts: vi.fn()
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

    // Mock real EP API data responses — use data arrays since tool uses data.length
    vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue({
      data: Array.from({ length: 45 }, (_, i) => ({ id: `doc-${i}`, title: `Doc ${i}`, type: 'REPORT', date: '2024-01-01', reference: `REF-${i}`, committee: 'ENVI' })),
      total: 45, limit: 100, offset: 0, hasMore: false
    });
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
      data: Array.from({ length: 60 }, (_, i) => ({ id: `proc-${i}`, title: `Procedure ${i}`, reference: `2024/${i}(COD)`, type: 'COD', subjectMatter: '', stage: '', status: 'OPEN', dates: {} })),
      total: 60, limit: 100, offset: 0, hasMore: false
    });
    vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue({
      data: Array.from({ length: 20 }, (_, i) => ({ id: `at-${i}`, title: `Adopted ${i}`, reference: `AT-${i}`, type: 'RESOLUTION', dateAdopted: '2024-06-01' })),
      total: 20, limit: 100, offset: 0, hasMore: false
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

  describe('Real Data Integration', () => {
    it('should use real procedure count for workload (data.length)', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
        data: Array.from({ length: 100 }, (_, i) => ({ id: `p-${i}`, title: `P ${i}`, reference: '', type: 'COD', subjectMatter: '', stage: '', status: 'OPEN', dates: {} })),
        total: 100, limit: 100, offset: 0, hasMore: true
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.workload.activeLegislativeFiles).toBe(100);
    });

    it('should use real document count (data.length)', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue({
        data: Array.from({ length: 80 }, (_, i) => ({ id: `d-${i}`, title: `D ${i}`, type: 'REPORT', date: '2024-01-01', reference: `REF-${i}`, committee: 'ENVI' })),
        total: 80, limit: 100, offset: 0, hasMore: false
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.workload.documentsProduced).toBe(80);
    });

    it('should use real adopted texts count (data.length)', async () => {
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue({
        data: Array.from({ length: 35 }, (_, i) => ({ id: `a-${i}`, title: `A ${i}`, reference: '', type: 'RESOLUTION', dateAdopted: '2024-06-01' })),
        total: 35, limit: 100, offset: 0, hasMore: false
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.legislativeOutput.reportsAdopted).toBe(35);
    });

    it('should set MEDIUM confidence when real data is available', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.confidenceLevel).toBe('MEDIUM');
    });

    it('should set LOW confidence when no real data is available', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue({
        data: [], total: 0, limit: 100, offset: 0, hasMore: false
      });
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
        data: [], total: 0, limit: 100, offset: 0, hasMore: false
      });
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue({
        data: [], total: 0, limit: 100, offset: 0, hasMore: false
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.confidenceLevel).toBe('LOW');
    });

    it('should handle API failures gracefully with zero values', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClientModule.epClient.getProcedures).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockRejectedValue(new Error('API Error'));
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.workload.activeLegislativeFiles).toBe(0);
      expect(data.workload.documentsProduced).toBe(0);
      expect(data.legislativeOutput.reportsAdopted).toBe(0);
    });
  });

  describe('Workload Intensity Computation', () => {
    it('should classify HIGH workload when procedures reach page limit (100)', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
        data: Array.from({ length: 100 }, (_, i) => ({ id: `p-${i}`, title: `P ${i}`, reference: '', type: 'COD', subjectMatter: '', stage: '', status: 'OPEN', dates: {} })),
        total: 100, limit: 100, offset: 0, hasMore: true
      });
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue({
        data: Array.from({ length: 30 }, (_, i) => ({ id: `d-${i}`, title: `D ${i}`, type: 'REPORT', date: '2024-01-01', reference: `REF-${i}`, committee: 'ENVI' })),
        total: 30, limit: 100, offset: 0, hasMore: false
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.computedAttributes.workloadIntensity).toBe('HIGH');
    });

    it('should classify LOW workload when no data is available', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
        data: [], total: 0, limit: 100, offset: 0, hasMore: false
      });
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue({
        data: [], total: 0, limit: 100, offset: 0, hasMore: false
      });
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue({
        data: [], total: 0, limit: 100, offset: 0, hasMore: false
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'DROI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.computedAttributes.workloadIntensity).toBe('LOW');
    });
  });

  describe('Engagement and Impact Computation', () => {
    it('should report LOW engagement when attendance is not available', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.computedAttributes.engagementLevel).toBe('LOW');
      expect(data.memberEngagement.averageAttendance).toBe(0);
    });

    it('should handle empty members array', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'TEST', name: 'Test Committee', abbreviation: 'TEST',
        members: []
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'TEST' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      expect(data.memberEngagement.totalMembers).toBe(0);
    });

    it('should compute policy impact rating based on reports and success rate', async () => {
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
