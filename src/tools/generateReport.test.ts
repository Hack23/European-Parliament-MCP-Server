import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGenerateReport, generateReportToolMetadata } from './generateReport.js';
import { epClient } from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn(),
    getCommitteeInfo: vi.fn()
  }
}));

describe('generate_report Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept MEP_ACTIVITY report type', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: ['ENVI', 'ITRE'],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleGenerateReport({
        reportType: 'MEP_ACTIVITY',
        subjectId: 'MEP-124810'
      });

      expect(result.content[0].type).toBe('text');
      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('reportType' in parsed).toBe(true);
        expect('reportType' in parsed && parsed.reportType).toBe('MEP_ACTIVITY');
      }
    });

    it('should accept COMMITTEE_PERFORMANCE report type', async () => {
      const mockCommittee = {
        id: 'COMM-ENVI',
        abbreviation: 'ENVI',
        name: 'Committee on the Environment, Public Health and Food Safety',
        members: [
          { id: 'MEP-1', name: 'Member 1', role: 'CHAIR' },
          { id: 'MEP-2', name: 'Member 2', role: 'MEMBER' }
        ]
      };
      vi.mocked(epClient.getCommitteeInfo).mockResolvedValue(mockCommittee);

      const result = await handleGenerateReport({
        reportType: 'COMMITTEE_PERFORMANCE',
        subjectId: 'COMM-ENVI'
      });

      expect(result.content[0].type).toBe('text');
      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('reportType' in parsed && parsed.reportType).toBe('COMMITTEE_PERFORMANCE');
      }
    });

    it('should accept VOTING_STATISTICS report type', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS'
      });

      expect(result.content[0].type).toBe('text');
      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('reportType' in parsed && parsed.reportType).toBe('VOTING_STATISTICS');
      }
    });

    it('should accept LEGISLATION_PROGRESS report type', async () => {
      const result = await handleGenerateReport({
        reportType: 'LEGISLATION_PROGRESS'
      });

      expect(result.content[0].type).toBe('text');
      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('reportType' in parsed && parsed.reportType).toBe('LEGISLATION_PROGRESS');
      }
    });

    it('should accept date range parameters', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null && 'period' in parsed) {
        const period = parsed.period;
        expect(typeof period === 'object' && period !== null).toBe(true);
      }
    });

    it('should reject missing report type', async () => {
      await expect(handleGenerateReport({})).rejects.toThrow();
    });

    it('should reject invalid report type', async () => {
      await expect(
        handleGenerateReport({ reportType: 'INVALID_TYPE' })
      ).rejects.toThrow();
    });

    it('should reject invalid date format', async () => {
      await expect(
        handleGenerateReport({ reportType: 'VOTING_STATISTICS', dateFrom: 'invalid' })
      ).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS'
      });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should include report sections', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('sections' in parsed).toBe(true);
        if ('sections' in parsed) {
          expect(Array.isArray(parsed.sections)).toBe(true);
        }
      }
    });

    it('should include statistics', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('statistics' in parsed).toBe(true);
        expect('statistics' in parsed && typeof parsed.statistics === 'object').toBe(true);
      }
    });

    it('should include generatedAt timestamp', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('generatedAt' in parsed).toBe(true);
      }
    });
  });

  describe('MEP Activity Report', () => {
    it('should include MEP details in report', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: ['ENVI'],
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        }
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleGenerateReport({
        reportType: 'MEP_ACTIVITY',
        subjectId: 'MEP-124810'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('subject' in parsed).toBe(true);
      }
    });

    it('should include recommendations', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        dateOfBirth: '1970-01-01',
        email: 'john.doe@europarl.europa.eu',
        committees: []
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleGenerateReport({
        reportType: 'MEP_ACTIVITY',
        subjectId: 'MEP-124810'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('recommendations' in parsed).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors for MEP reports', async () => {
      vi.mocked(epClient.getMEPDetails).mockRejectedValue(new Error('API Error'));

      await expect(
        handleGenerateReport({
          reportType: 'MEP_ACTIVITY',
          subjectId: 'MEP-124810'
        })
      ).rejects.toThrow('Failed to generate report');
    });

    it('should handle API errors for committee reports', async () => {
      vi.mocked(epClient.getCommitteeInfo).mockRejectedValue(new Error('API Error'));

      await expect(
        handleGenerateReport({
          reportType: 'COMMITTEE_PERFORMANCE',
          subjectId: 'COMM-ENVI'
        })
      ).rejects.toThrow('Failed to generate report');
    });
  });

  describe('Tool Metadata', () => {
    it('should have correct tool name', () => {
      expect(generateReportToolMetadata.name).toBe('generate_report');
    });

    it('should have description', () => {
      expect(generateReportToolMetadata.description).toBeTruthy();
      expect(generateReportToolMetadata.description.length).toBeGreaterThan(50);
    });

    it('should have input schema', () => {
      expect(generateReportToolMetadata.inputSchema).toBeDefined();
      expect(generateReportToolMetadata.inputSchema.type).toBe('object');
      expect(generateReportToolMetadata.inputSchema.required).toContain('reportType');
    });

    it('should define report type enum', () => {
      const schema = generateReportToolMetadata.inputSchema;
      expect(schema.properties?.reportType).toBeDefined();
      const reportType = schema.properties?.reportType;
      expect(typeof reportType === 'object' && reportType !== null && 'enum' in reportType).toBe(true);
    });
  });
});
