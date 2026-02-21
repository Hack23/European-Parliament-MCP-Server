/**
 * Tests for monitor_legislative_pipeline MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleMonitorLegislativePipeline } from './monitorLegislativePipeline.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getPlenarySessions: vi.fn()
  }
}));

describe('monitor_legislative_pipeline Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getPlenarySessions).mockResolvedValue({
      data: [
        {
          id: 'SESSION-1',
          date: '2024-03-15',
          location: 'Strasbourg',
          agendaItems: [
            'Digital Services Act implementation',
            'Climate adaptation strategy',
            'Agricultural reform proposal'
          ],
          attendanceCount: 650,
          documents: ['DOC-1', 'DOC-2']
        },
        {
          id: 'SESSION-2',
          date: '2024-04-10',
          location: 'Brussels',
          agendaItems: [
            'AI regulation framework',
            'Migration policy reform'
          ],
          attendanceCount: 600,
          documents: ['DOC-3']
        }
      ],
      total: 2,
      limit: 20,
      offset: 0,
      hasMore: false
    });
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
      const result = await handleMonitorLegislativePipeline({});
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('pipeline');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('bottlenecks');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
    });

    it('should include summary counts', async () => {
      const result = await handleMonitorLegislativePipeline({});
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
      const result = await handleMonitorLegislativePipeline({});
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

    it('should include pipeline item details', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        pipeline: { computedAttributes: Record<string, unknown> }[];
      };

      if (data.pipeline.length > 0) {
        const item = data.pipeline[0];
        expect(item).toHaveProperty('procedureId');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('currentStage');
        expect(item?.computedAttributes).toHaveProperty('progressPercentage');
        expect(item?.computedAttributes).toHaveProperty('velocityScore');
        expect(item?.computedAttributes).toHaveProperty('bottleneckRisk');
      }
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
      vi.mocked(epClientModule.epClient.getPlenarySessions)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(handleMonitorLegislativePipeline({}))
        .rejects.toThrow('Failed to monitor legislative pipeline');
    });
  });
});
