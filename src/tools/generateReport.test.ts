import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGenerateReport, generateReportToolMetadata } from './generateReport.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { ToolError } from './shared/errors.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn(),
    getCommitteeInfo: vi.fn(),
    getParliamentaryQuestions: vi.fn().mockResolvedValue({ data: [] }),
    getCommitteeDocuments: vi.fn().mockResolvedValue({ data: [] }),
    getAdoptedTexts: vi.fn().mockResolvedValue({ data: [] }),
    getPlenarySessions: vi.fn().mockResolvedValue({ data: [] }),
    getProcedures: vi.fn().mockResolvedValue({ data: [] })
  }
}));

describe('generate_report Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mock implementations (clearAllMocks only clears call history)
    vi.mocked(epClient.getMEPDetails).mockResolvedValue(undefined as never);
    vi.mocked(epClient.getCommitteeInfo).mockResolvedValue(undefined as never);
    vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue({ data: [] });
    vi.mocked(epClient.getCommitteeDocuments).mockResolvedValue({ data: [] });
    vi.mocked(epClient.getAdoptedTexts).mockResolvedValue({ data: [] });
    vi.mocked(epClient.getPlenarySessions).mockResolvedValue({ data: [] });
    vi.mocked(epClient.getProcedures).mockResolvedValue({ data: [] });
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
    it('should throw ToolError for MEP reports when all EP API calls fail', async () => {
      vi.mocked(epClient.getMEPDetails).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClient.getParliamentaryQuestions).mockRejectedValue(new Error('API Error'));

      await expect(
        handleGenerateReport({
          reportType: 'MEP_ACTIVITY',
          subjectId: 'MEP-124810'
        })
      ).rejects.toThrow('EP API data unavailable for MEP_ACTIVITY report');
    });

    it('should return partial report for MEP when getMEPDetails fails but questions succeed', async () => {
      vi.mocked(epClient.getMEPDetails).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue({ data: [{ id: 'q1' }] });

      const result = await handleGenerateReport({
        reportType: 'MEP_ACTIVITY',
        subjectId: 'MEP-124810'
      });

      const parsed = JSON.parse(result.content[0].text) as { subject: string; statistics: { questionsSubmitted: number } };
      expect(parsed.subject).toBe('Unknown MEP');
      expect(parsed.statistics.questionsSubmitted).toBe(1);
    });

    it('should throw ToolError for committee reports when all EP API calls fail', async () => {
      vi.mocked(epClient.getCommitteeInfo).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClient.getCommitteeDocuments).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClient.getAdoptedTexts).mockRejectedValue(new Error('API Error'));

      await expect(
        handleGenerateReport({
          reportType: 'COMMITTEE_PERFORMANCE',
          subjectId: 'COMM-ENVI'
        })
      ).rejects.toThrow('EP API data unavailable for COMMITTEE_PERFORMANCE report');
    });
  });

  describe('EP API Unavailable - All Data Sources Failed', () => {
    it('should throw ToolError for VOTING_STATISTICS when all EP API calls fail', async () => {
      vi.mocked(epClient.getPlenarySessions).mockRejectedValue(new Error('Network Error'));
      vi.mocked(epClient.getAdoptedTexts).mockRejectedValue(new Error('Network Error'));

      await expect(
        handleGenerateReport({
          reportType: 'VOTING_STATISTICS',
          dateFrom: '2025-01-01',
          dateTo: '2025-03-31'
        })
      ).rejects.toThrow('EP API data unavailable for VOTING_STATISTICS report');
    });

    it('should throw retryable ToolError for VOTING_STATISTICS when EP API is down', async () => {
      vi.mocked(epClient.getPlenarySessions).mockRejectedValue(new Error('ECONNREFUSED'));
      vi.mocked(epClient.getAdoptedTexts).mockRejectedValue(new Error('ECONNREFUSED'));

      try {
        await handleGenerateReport({
          reportType: 'VOTING_STATISTICS'
        });
        expect.unreachable('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ToolError);
        const toolError = error as ToolError;
        expect(toolError.isRetryable).toBe(true);
        expect(toolError.errorCode).toBe('UPSTREAM_503');
        expect(toolError.httpStatus).toBe(503);
      }
    });

    it('should throw ToolError for LEGISLATION_PROGRESS when all EP API calls fail', async () => {
      vi.mocked(epClient.getProcedures).mockRejectedValue(new Error('Network Error'));
      vi.mocked(epClient.getAdoptedTexts).mockRejectedValue(new Error('Network Error'));

      await expect(
        handleGenerateReport({
          reportType: 'LEGISLATION_PROGRESS',
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31'
        })
      ).rejects.toThrow('EP API data unavailable for LEGISLATION_PROGRESS report');
    });

    it('should throw ToolError for COMMITTEE_PERFORMANCE when all EP API calls fail (no subjectId)', async () => {
      vi.mocked(epClient.getCommitteeDocuments).mockRejectedValue(new Error('Network Error'));
      vi.mocked(epClient.getAdoptedTexts).mockRejectedValue(new Error('Network Error'));

      await expect(
        handleGenerateReport({
          reportType: 'COMMITTEE_PERFORMANCE'
        })
      ).rejects.toThrow('EP API data unavailable for COMMITTEE_PERFORMANCE report');
    });

    it('should still return report for VOTING_STATISTICS when at least one API call succeeds', async () => {
      vi.mocked(epClient.getPlenarySessions).mockRejectedValue(new Error('Network Error'));
      vi.mocked(epClient.getAdoptedTexts).mockResolvedValue({ data: [{ id: '1' }] });

      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS'
      });

      const parsed = JSON.parse(result.content[0].text) as { statistics: { adopted: number } };
      expect(parsed.statistics.adopted).toBe(1);
    });

    it('should still return report for LEGISLATION_PROGRESS when at least one API call succeeds', async () => {
      vi.mocked(epClient.getProcedures).mockResolvedValue({ data: [{ id: '1' }, { id: '2' }] });
      vi.mocked(epClient.getAdoptedTexts).mockRejectedValue(new Error('Network Error'));

      const result = await handleGenerateReport({
        reportType: 'LEGISLATION_PROGRESS'
      });

      const parsed = JSON.parse(result.content[0].text) as { statistics: { totalProcedures: number } };
      expect(parsed.statistics.totalProcedures).toBe(2);
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

  describe('Data Quality Warnings', () => {
    it('should include non-empty dataQualityWarnings in VOTING_STATISTICS report', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS'
      });

      const parsed = JSON.parse(result.content[0].text) as { dataQualityWarnings?: string[] };
      expect(parsed.dataQualityWarnings).toBeDefined();
      expect(Array.isArray(parsed.dataQualityWarnings)).toBe(true);
      expect(parsed.dataQualityWarnings!.length).toBeGreaterThan(0);
      expect(parsed.dataQualityWarnings!.some((w: string) => w.includes('turnout'))).toBe(true);
    });

    it('should include non-empty dataQualityWarnings in LEGISLATION_PROGRESS report', async () => {
      const result = await handleGenerateReport({
        reportType: 'LEGISLATION_PROGRESS'
      });

      const parsed = JSON.parse(result.content[0].text) as { dataQualityWarnings?: string[] };
      expect(parsed.dataQualityWarnings).toBeDefined();
      expect(Array.isArray(parsed.dataQualityWarnings)).toBe(true);
      expect(parsed.dataQualityWarnings!.length).toBeGreaterThan(0);
      expect(parsed.dataQualityWarnings!.some((w: string) => w.includes('lower bounds'))).toBe(true);
    });

    it('should include non-empty dataQualityWarnings in MEP_ACTIVITY report', async () => {
      const mockMEP = {
        id: 'MEP-124810',
        name: 'John Doe',
        country: 'SE',
        politicalGroup: 'EPP',
        active: true,
        committees: ['ENVI'],
      };
      vi.mocked(epClient.getMEPDetails).mockResolvedValue(mockMEP);

      const result = await handleGenerateReport({
        reportType: 'MEP_ACTIVITY',
        subjectId: 'MEP-124810'
      });

      const parsed = JSON.parse(result.content[0].text) as { dataQualityWarnings?: string[] };
      expect(parsed.dataQualityWarnings).toBeDefined();
      expect(Array.isArray(parsed.dataQualityWarnings)).toBe(true);
      expect(parsed.dataQualityWarnings!.length).toBeGreaterThan(0);
      expect(parsed.dataQualityWarnings!.some((w: string) => w.includes('Reports authored'))).toBe(true);
    });

    it('should include non-empty dataQualityWarnings in COMMITTEE_PERFORMANCE report', async () => {
      const mockCommittee = {
        id: 'COMM-ENVI',
        abbreviation: 'ENVI',
        name: 'Committee on the Environment',
        members: [{ id: 'MEP-1', name: 'Member 1', role: 'CHAIR' }]
      };
      vi.mocked(epClient.getCommitteeInfo).mockResolvedValue(mockCommittee);

      const result = await handleGenerateReport({
        reportType: 'COMMITTEE_PERFORMANCE',
        subjectId: 'COMM-ENVI'
      });

      const parsed = JSON.parse(result.content[0].text) as { dataQualityWarnings?: string[] };
      expect(parsed.dataQualityWarnings).toBeDefined();
      expect(Array.isArray(parsed.dataQualityWarnings)).toBe(true);
      expect(parsed.dataQualityWarnings!.length).toBeGreaterThan(0);
      expect(parsed.dataQualityWarnings!.some((w: string) => w.includes('Meeting count'))).toBe(true);
    });

    it('should warn about partial-year range in VOTING_STATISTICS report', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS',
        dateFrom: '2024-06-01',
        dateTo: '2024-12-31'
      });

      const parsed = JSON.parse(result.content[0].text) as { dataQualityWarnings?: string[] };
      expect(parsed.dataQualityWarnings).toBeDefined();
      expect(parsed.dataQualityWarnings!.some((w: string) => w.includes('partial-year'))).toBe(true);
    });

    it('should not warn about partial-year range for full-year range', async () => {
      const result = await handleGenerateReport({
        reportType: 'VOTING_STATISTICS',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });

      const parsed = JSON.parse(result.content[0].text) as { dataQualityWarnings?: string[] };
      expect(parsed.dataQualityWarnings).toBeDefined();
      expect(parsed.dataQualityWarnings!.some((w: string) => w.includes('partial-year'))).toBe(false);
    });
  });
});
