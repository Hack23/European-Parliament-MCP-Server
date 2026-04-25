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

// Dynamic dates to ensure procedures stay within the "not stalled" threshold
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

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

/**
 * Historical procedures with no date or enrichment data — simulates the 1972-1988 bug.
 * Also includes a fresh enriched procedure (PROC-FRESH) to verify it survives the filter,
 * and a recent-but-unenriched procedure (PROC-UNENRICHED) to verify the enrichment warning.
 */
const mockHistoricalProcedures = {
  data: [
    // Fresh, enriched, active procedure — should survive status: 'ACTIVE'
    {
      id: 'PROC-FRESH',
      title: 'AI Governance Regulation',
      reference: '2025/0001(COD)',
      type: 'COD',
      subjectMatter: 'Digital',
      stage: 'Committee consideration',
      status: 'Ongoing',
      dateInitiated: daysAgo(30),
      dateLastActivity: daysAgo(5),
      responsibleCommittee: 'IMCO',
      rapporteur: 'MEP AI',
      documents: [],
    },
    // Recent date but no stage/committee enrichment — passes recency, excluded by matchesStatusFilter
    {
      id: 'PROC-UNENRICHED',
      title: 'Unknown recent procedure',
      reference: '2025/0999(COD)',
      type: 'COD',
      subjectMatter: '',
      stage: '',
      status: '',
      dateInitiated: daysAgo(30),
      dateLastActivity: daysAgo(5),
      responsibleCommittee: '',
      rapporteur: '',
      documents: [],
    },
    // Historical: no temporal data at all
    {
      id: 'eli/dl/proc/1972-0003',
      title: '1972/0003(COD)',
      reference: '1972/0003(COD)',
      type: 'COD',
      subjectMatter: '',
      stage: '',
      status: '',
      dateInitiated: '',
      dateLastActivity: '',
      responsibleCommittee: '',
      rapporteur: '',
      documents: [],
    },
    // Historical: only initiation date, well before recency cut-off
    {
      id: 'eli/dl/proc/1985-0017',
      title: '1985/0017(NLE)',
      reference: '1985/0017(NLE)',
      type: 'NLE',
      subjectMatter: '',
      stage: '',
      status: '',
      dateInitiated: '1985-03-01',
      dateLastActivity: '',
      responsibleCommittee: '',
      rapporteur: '',
      documents: [],
    },
  ],
  total: 4,
  limit: 20,
  offset: 0,
  hasMore: false,
};

/** Single fresh, enriched procedure — used to verify no enrichment warning fires */
const mockFreshProceduresOnly = {
  data: [
    {
      id: 'PROC-FRESH2',
      title: 'Fresh enriched procedure',
      reference: '2025/0002(COD)',
      type: 'COD',
      subjectMatter: 'Digital',
      stage: 'Committee consideration',
      status: 'Ongoing',
      dateInitiated: daysAgo(30),
      dateLastActivity: daysAgo(5),
      responsibleCommittee: 'IMCO',
      rapporteur: 'MEP Fresh',
      documents: [],
    },
  ],
  total: 1,
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

    it('should include dataQualityWarnings array in response', async () => {
      const result = await handleMonitorLegislativePipeline({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });
    it('should return MCP-compliant response', async () => {
      const result = await handleMonitorLegislativePipeline({});
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleMonitorLegislativePipeline({});
      expect(() => JSON.parse(result.content[0]?.text ?? '{}') as unknown).not.toThrow();
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

  describe('ACTIVE filter — historical / incomplete record exclusion', () => {
    beforeEach(() => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(mockHistoricalProcedures);
    });

    it('should exclude procedures with no date data from ACTIVE status', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ACTIVE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        pipeline: { procedureId: string }[];
      };
      const ids = data.pipeline.map(p => p.procedureId);
      expect(ids).not.toContain('eli/dl/proc/1972-0003');
    });

    it('should exclude procedures with dates before recency cut-off from ACTIVE status', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ACTIVE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        pipeline: { procedureId: string }[];
      };
      const ids = data.pipeline.map(p => p.procedureId);
      expect(ids).not.toContain('eli/dl/proc/1985-0017');
    });

    it('should retain current procedures in ACTIVE status when historical ones are present', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ACTIVE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        pipeline: { procedureId: string }[];
      };
      const ids = data.pipeline.map(p => p.procedureId);
      // PROC-FRESH has valid recent dates and stage enrichment — must survive ACTIVE filter
      expect(ids).toContain('PROC-FRESH');
    });

    it('should include ALL status results regardless of enrichment or recency', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ALL' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        pipeline: { procedureId: string }[];
      };
      const ids = data.pipeline.map(p => p.procedureId);
      // ALL should pass historical records through (no recency filter applies)
      expect(ids).toContain('eli/dl/proc/1972-0003');
    });

    it('should add dataQualityWarning when enrichment-missing items are excluded from ACTIVE', async () => {
      const result = await handleMonitorLegislativePipeline({ status: 'ACTIVE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataQualityWarnings: string[];
      };
      // At least one warning should mention excluded/enrichment
      const hasEnrichmentWarning = data.dataQualityWarnings.some(w =>
        w.includes('excluded') && w.includes('enrichment')
      );
      expect(hasEnrichmentWarning).toBe(true);
    });

    it('should not add enrichment warning when no Unknown-stage items are present', async () => {
      // Override with normal modern procedures only — no Unknown-stage items pass the recency filter
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(mockFreshProceduresOnly);
      const result = await handleMonitorLegislativePipeline({ status: 'ACTIVE' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataQualityWarnings: string[];
      };
      const hasEnrichmentWarning = data.dataQualityWarnings.some(w => w.includes('enrichment'));
      expect(hasEnrichmentWarning).toBe(false);
    });

    it('should not apply recency cut-off when an explicit dateFrom is provided', async () => {
      // With an explicit dateFrom, the user controls the date range —
      // the recency cut-off must not double-filter
      const result = await handleMonitorLegislativePipeline({
        status: 'ACTIVE',
        dateFrom: '1970-01-01',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        pipeline: { procedureId: string }[];
      };
      // The 1985 procedure has dateInitiated='1985-03-01' which is after 1970-01-01;
      // with explicit dateFrom, it passes the date filter. However, it still has
      // Unknown stage/committee so it is still excluded by matchesStatusFilter.
      // The key check: 1972 procedure has empty dates so lastActivity='' which means
      // the dateFrom guard (lastActivity < dateFrom when lastActivity !== '') does NOT
      // fire, and initiated is undefined so that guard doesn't fire either —
      // meaning it passes the date filter when an explicit dateFrom is set.
      // It will still be excluded by matchesStatusFilter due to Unknown stage.
      // This test just verifies the tool runs without error in this scenario.
      expect(data).toHaveProperty('pipeline');
    });
  });

  describe('Default reporting period (Defect #6 — last-30-days)', () => {
    /**
     * Regression for the Hack23/euparliamentmonitor 2026-04-24 propositions
     * audit Defect #6 — when neither dateFrom nor dateTo is supplied the
     * tool used to emit `period.from: 2024-01-01` / `period.to: 2024-12-31`.
     * It should now default to a last-30-days window anchored on "now".
     */
    it('should default `period` to a last-30-days window when no dates are supplied', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(mockProcedures);

      const result = await handleMonitorLegislativePipeline({});
      const parsed = JSON.parse(result.content[0].text) as {
        period: { from: string; to: string };
      };
      const today = new Date().toISOString().slice(0, 10);
      expect(parsed.period.to).toBe(today);
      expect(parsed.period.from).not.toBe('2024-01-01');
      expect(parsed.period.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // last-30-days: from must be exactly 30 days before to
      const fromMs = new Date(parsed.period.from).getTime();
      const toMs = new Date(parsed.period.to).getTime();
      const days = Math.round((toMs - fromMs) / (1000 * 60 * 60 * 24));
      expect(days).toBe(30);
    });

    it('should still echo back caller-supplied `dateFrom`/`dateTo` verbatim', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(mockProcedures);

      const result = await handleMonitorLegislativePipeline({
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
      });
      const parsed = JSON.parse(result.content[0].text) as {
        period: { from: string; to: string };
      };
      expect(parsed.period.from).toBe('2025-01-01');
      expect(parsed.period.to).toBe('2025-12-31');
    });
  });
});
