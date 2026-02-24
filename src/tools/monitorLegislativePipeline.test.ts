/**
 * Tests for monitor_legislative_pipeline MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleMonitorLegislativePipeline } from './monitorLegislativePipeline.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProcedures: vi.fn()
  }
}));

const mockProcedures = {
  data: [
    {
      id: 'PROC-001',
      title: 'Digital Services Act implementation',
      reference: '2024/0001(COD)',
      type: 'COD',
      subjectMatter: 'Digital',
      stage: 'Committee consideration',
      status: 'Ongoing',
      dateInitiated: '2024-01-15',
      dateLastActivity: '2024-06-20',
      responsibleCommittee: 'IMCO',
      rapporteur: 'MEP Test',
      documents: ['DOC-1'],
    },
    {
      id: 'PROC-002',
      title: 'Climate adaptation strategy',
      reference: '2024/0002(COD)',
      type: 'COD',
      subjectMatter: 'Environment',
      stage: 'Plenary vote',
      status: 'Ongoing',
      dateInitiated: '2023-06-01',
      dateLastActivity: '2024-03-15',
      responsibleCommittee: 'ENVI',
      rapporteur: 'MEP Climate',
      documents: ['DOC-2', 'DOC-3'],
    },
    {
      id: 'PROC-003',
      title: 'Agricultural reform proposal',
      reference: '2024/0003(NLE)',
      type: 'NLE',
      subjectMatter: 'Agriculture',
      stage: 'Adopted',
      status: 'Adopted',
      dateInitiated: '2023-01-01',
      dateLastActivity: '2024-01-01',
      responsibleCommittee: 'AGRI',
      rapporteur: 'MEP Agri',
      documents: [],
    },
  ],
  total: 3,
  limit: 20,
  offset: 0,
  hasMore: false,
};

describe('monitor_legislative_pipeline Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(mockProcedures);
  });

  describe('Input Validation', () => {
    it('should accept empty args (defaults)', async () => {
      const result = await handleMonitorLegislativePipeline({});
      expect(result).toHaveProperty('content');
    });

    it('should accept status filter', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'STALLED' });
      expect(result).toHaveProperty('content');
    });

    it('should accept committee filter', async () => {
      const result = await handleMonitorLegislativePipeline({ committee: 'ENVI' });
      expect(result).toHaveProperty('content');
    });

    it('should accept date range', async () => {
      const result = await handleMonitorLegislativePipeline({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should accept limit', async () => {
      const result = await handleMonitorLegislativePipeline({ limit: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid limit', async () => {
      await expect(handleMonitorLegislativePipeline({ limit: 0 }))
        .rejects.toThrow();
    });
  });

  describe('Response Structure', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleMonitorLegislativePipeline({});
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleMonitorLegislativePipeline({});
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
    });

    it('should include pipeline data', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('pipeline');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('bottlenecks');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
    });

    it('should include summary counts', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        summary: Record<string, unknown>;
      };

      expect(data.summary).toHaveProperty('totalProcedures');
      expect(data.summary).toHaveProperty('activeCount');
      expect(data.summary).toHaveProperty('stalledCount');
      expect(data.summary).toHaveProperty('completedCount');
      expect(data.summary).toHaveProperty('avgDaysInPipeline');
    });

    it('should include computed attributes', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('pipelineHealthScore');
      expect(data.computedAttributes).toHaveProperty('throughputRate');
      expect(data.computedAttributes).toHaveProperty('bottleneckIndex');
      expect(data.computedAttributes).toHaveProperty('stalledProcedureRate');
      expect(data.computedAttributes).toHaveProperty('estimatedClearanceTime');
      expect(data.computedAttributes).toHaveProperty('legislativeMomentum');
    });

    it('should include pipeline item details from real API data', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        pipeline: { procedureId: string; title: string; committee: string; computedAttributes: Record<string, unknown> }[];
      };

      if (data.pipeline.length > 0) {
        const item = data.pipeline[0];
        expect(item).toHaveProperty('procedureId');
        expect(item).toHaveProperty('title');
        expect(item?.computedAttributes).toHaveProperty('progressPercentage');
        expect(item?.computedAttributes).toHaveProperty('velocityScore');
        expect(item?.computedAttributes).toHaveProperty('bottleneckRisk');
        // Verify data comes from mock (real API structure)
        expect(item.procedureId).toBe('PROC-001');
        expect(item.title).toBe('Digital Services Act implementation');
        expect(item.committee).toBe('IMCO');
      }
    });

    it('should reference EP API in methodology', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { methodology: string };
      expect(data.methodology).toContain('EP API');
      expect(data.methodology).toContain('/procedures');
    });
  });

  describe('Pipeline Health', () => {
    it('should produce health score between 0 and 100', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { pipelineHealthScore: number };
      };

      expect(data.computedAttributes.pipelineHealthScore).toBeGreaterThanOrEqual(0);
      expect(data.computedAttributes.pipelineHealthScore).toBeLessThanOrEqual(100);
    });

    it('should assign legislative momentum label', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: { legislativeMomentum: string };
      };

      expect(['STRONG', 'MODERATE', 'SLOW', 'STALLED'])
        .toContain(data.computedAttributes.legislativeMomentum);
    });
  });

  describe('Error Handling', () => {
    it('should wrap API errors', async () => {
      vi.mocked(epClientModule.epClient.getProcedures)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(handleMonitorLegislativePipeline({}))
        .rejects.toThrow('Failed to monitor legislative pipeline');
    });
  });
});
