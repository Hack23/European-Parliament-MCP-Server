/**
 * Tests for analyze_committee_activity MCP tool
 *
 * Covers the four-source resilient fan-out (documents, procedures, meetings,
 * decisions) plus the legacy adopted-texts proxy. Asserts full success,
 * partial source failure, empty result set, date-window filtering,
 * derived-metric correctness, and 10-minute cache behaviour.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleAnalyzeCommitteeActivity,
  clearAnalyzeCommitteeActivityCache,
} from './analyzeCommitteeActivity.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCommitteeInfo: vi.fn(),
    getCommitteeDocuments: vi.fn(),
    getProcedures: vi.fn(),
    getAdoptedTexts: vi.fn(),
    getPlenarySessions: vi.fn(),
    getMeetingDecisions: vi.fn(),
  },
}));

/**
 * Build a paginated response envelope matching the EP client contract.
 */
function paged<T>(data: T[]): { data: T[]; total: number; limit: number; offset: number; hasMore: boolean } {
  return { data, total: data.length, limit: 100, offset: 0, hasMore: false };
}

describe('analyze_committee_activity Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAnalyzeCommitteeActivityCache();

    vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
      id: 'ENVI',
      name: 'Environment, Public Health and Food Safety',
      abbreviation: 'ENVI',
      members: ['MEP-1', 'MEP-2', 'MEP-3', 'MEP-4', 'MEP-5',
                'MEP-6', 'MEP-7', 'MEP-8', 'MEP-9', 'MEP-10'],
    });

    // Documents: 45 ENVI documents inside the default trailing-6-month window
    vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue(paged(
      Array.from({ length: 45 }, (_, i) => ({
        id: `doc-${String(i)}`,
        title: `Doc ${String(i)}`,
        type: 'REPORT' as const,
        date: new Date().toISOString().slice(0, 10),
        reference: `REF-${String(i)}`,
        committee: 'ENVI',
        status: 'ADOPTED' as const,
      })),
    ));

    // Procedures: 60 ongoing ENVI procedures with recent activity
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged(
      Array.from({ length: 60 }, (_, i) => ({
        id: `proc-${String(i)}`,
        title: `Procedure ${String(i)}`,
        reference: `2024/${String(i)}(COD)`,
        type: 'COD',
        subjectMatter: '',
        stage: '',
        status: 'Ongoing',
        dateInitiated: new Date().toISOString().slice(0, 10),
        dateLastActivity: new Date().toISOString().slice(0, 10),
        responsibleCommittee: 'ENVI',
        rapporteur: '',
        documents: [],
      })),
    ));

    // Adopted texts (legacy reports-adopted proxy): 20 items
    vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(paged(
      Array.from({ length: 20 }, (_, i) => ({
        id: `at-${String(i)}`,
        title: `Adopted ${String(i)}`,
        reference: `AT-${String(i)}`,
        type: 'RESOLUTION',
        dateAdopted: '2024-06-01',
        procedureReference: '',
        subjectMatter: '',
      })),
    ));

    // Plenary sessions: 12 meetings in window
    vi.mocked(epClientModule.epClient.getPlenarySessions).mockResolvedValue(paged(
      Array.from({ length: 12 }, (_, i) => ({
        id: `P10-2024-${String(i + 1).padStart(2, '0')}-01`,
        date: new Date().toISOString().slice(0, 10),
        location: 'Brussels',
        status: 'completed',
        agendaItems: [],
      })),
    ));

    // Meeting decisions: 5 decisions per fanned-out meeting
    vi.mocked(epClientModule.epClient.getMeetingDecisions).mockImplementation(async (sittingId: string) => paged(
      Array.from({ length: 5 }, (_, i) => ({
        id: `dec-${sittingId}-${String(i)}`,
        title: `Decision ${String(i)}`,
        type: 'RESOLUTION' as const,
        date: new Date().toISOString().slice(0, 10),
        reference: `DEC-${String(i)}`,
        status: 'ADOPTED' as const,
      })),
    ));
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
        dateTo: '2024-12-31',
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid date format', async () => {
      await expect(handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI',
        dateFrom: 'invalid',
      })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should include dataQualityWarnings array in response', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });

    it('should return MCP-compliant response', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data).toHaveProperty('committeeId', 'ENVI');
      expect(data).toHaveProperty('committeeName');
      expect(data).toHaveProperty('period');
      expect(data).toHaveProperty('workload');
      expect(data).toHaveProperty('memberEngagement');
      expect(data).toHaveProperty('legislativeOutput');
      expect(data).toHaveProperty('derivedMetrics');
      expect(data).toHaveProperty('dataSources');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
    });

    it('should include all workload metrics including decisionsAdopted', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.workload).toHaveProperty('activeLegislativeFiles');
      expect(data.workload).toHaveProperty('documentsProduced');
      expect(data.workload).toHaveProperty('meetingsHeld');
      expect(data.workload).toHaveProperty('decisionsAdopted');
      expect(data.workload).toHaveProperty('opinionsIssued');
    });

    it('should include computed attributes', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.computedAttributes).toHaveProperty('workloadIntensity');
      expect(data.computedAttributes).toHaveProperty('productivityScore');
      expect(data.computedAttributes).toHaveProperty('engagementLevel');
      expect(data.computedAttributes).toHaveProperty('policyImpactRating');
    });

    it('should include derived metrics', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.derivedMetrics).toHaveProperty('decisionsPerMeeting');
      expect(data.derivedMetrics).toHaveProperty('documentsPerMonth');
      expect(data.derivedMetrics).toHaveProperty('activeFilesPerMember');
    });

    it('should include EP attribution in methodology', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.methodology).toContain('European Parliament');
    });

    it('should expose a dataSources block per source', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.dataSources).toHaveProperty('documents');
      expect(data.dataSources).toHaveProperty('procedures');
      expect(data.dataSources).toHaveProperty('meetings');
      expect(data.dataSources).toHaveProperty('decisions');
    });
  });

  describe('Real Data Integration (full success)', () => {
    it('should populate real procedure count when committee + date match', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.workload.activeLegislativeFiles).toBe(60);
      expect(data.dataSources.procedures).toBe('OK');
    });

    it('should populate real document count when committee + date match', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.workload.documentsProduced).toBe(45);
      expect(data.dataSources.documents).toBe('OK');
    });

    it('should populate meetingsHeld from getPlenarySessions', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.workload.meetingsHeld).toBe(12);
      expect(data.dataSources.meetings).toBe('OK');
    });

    it('should populate decisionsAdopted by fanning out getMeetingDecisions (capped at 8 meetings × 5 = 40)', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.workload.decisionsAdopted).toBe(40);
      expect(data.dataSources.decisions).toBe('OK');
    });

    it('should report HIGH confidence when ≥3 sources return OK', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.confidenceLevel).toBe('HIGH');
    });

    it('should retain legacy reportsAdopted via adopted-texts proxy', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.legislativeOutput.reportsAdopted).toBe(20);
    });
  });

  describe('Real Data Integration (partial / failure)', () => {
    it('should mark all sources UNAVAILABLE when every EP endpoint rejects (graceful degradation)', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClientModule.epClient.getProcedures).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClientModule.epClient.getPlenarySessions).mockRejectedValue(new Error('API Error'));
      vi.mocked(epClientModule.epClient.getMeetingDecisions).mockRejectedValue(new Error('API Error'));

      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.workload.activeLegislativeFiles).toBe(0);
      expect(data.workload.documentsProduced).toBe(0);
      expect(data.workload.meetingsHeld).toBe(0);
      expect(data.workload.decisionsAdopted).toBe(0);
      expect(data.legislativeOutput.reportsAdopted).toBe(0);
      expect(data.dataSources.documents).toBe('UNAVAILABLE');
      expect(data.dataSources.procedures).toBe('UNAVAILABLE');
      expect(data.dataSources.meetings).toBe('UNAVAILABLE');
      expect(data.confidenceLevel).toBe('LOW');
    });

    it('should keep other sources populated when one source fails (partial source failure)', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockRejectedValue(new Error('Procedures down'));

      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      // Failed source zeros out, but others remain populated
      expect(data.workload.activeLegislativeFiles).toBe(0);
      expect(data.dataSources.procedures).toBe('UNAVAILABLE');
      // Other three sources still working
      expect(data.workload.documentsProduced).toBe(45);
      expect(data.workload.meetingsHeld).toBe(12);
      expect(data.workload.decisionsAdopted).toBe(40);
      expect(data.dataSources.documents).toBe('OK');
      expect(data.dataSources.meetings).toBe('OK');
      expect(data.dataSources.decisions).toBe('OK');
      // Warning lists the failed source
      const warnings = data.dataQualityWarnings as string[];
      expect(warnings.some((w) => w.includes('procedures') && w.includes('unavailable'))).toBe(true);
    });

    it('should mark sources EMPTY when fetch succeeds but no items match filter', async () => {
      // Documents/procedures for a different committee → all filtered out
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue(paged([
        { id: 'd', title: '', type: 'REPORT', date: new Date().toISOString().slice(0, 10), reference: '', committee: 'AFCO', status: 'ADOPTED' },
      ]));
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([
        {
          id: 'p', title: '', reference: '', type: 'COD', subjectMatter: '',
          stage: '', status: 'Ongoing', dateInitiated: '2024-01-01',
          dateLastActivity: '2024-01-01', responsibleCommittee: 'AFCO', rapporteur: '', documents: [],
        },
      ]));
      vi.mocked(epClientModule.epClient.getPlenarySessions).mockResolvedValue(paged([]));

      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      expect(data.dataSources.documents).toBe('EMPTY');
      expect(data.dataSources.procedures).toBe('EMPTY');
      expect(data.dataSources.meetings).toBe('EMPTY');
      expect(data.workload.documentsProduced).toBe(0);
      expect(data.workload.activeLegislativeFiles).toBe(0);
    });
  });

  describe('Date-window filtering', () => {
    it('should exclude documents outside the explicit date window', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue(paged([
        { id: 'd1', title: '', type: 'REPORT', date: '2024-03-15', reference: '', committee: 'ENVI', status: 'ADOPTED' },
        { id: 'd2', title: '', type: 'REPORT', date: '2024-08-15', reference: '', committee: 'ENVI', status: 'ADOPTED' },
        { id: 'd3', title: '', type: 'REPORT', date: '2023-12-15', reference: '', committee: 'ENVI', status: 'ADOPTED' },
      ]));

      const result = await handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI',
        dateFrom: '2024-01-01',
        dateTo: '2024-06-30',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

      // Only d1 (2024-03-15) falls in the window
      expect(data.workload.documentsProduced).toBe(1);
    });

    it('should forward dateFrom/dateTo to getPlenarySessions', async () => {
      await handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI',
        dateFrom: '2024-01-01',
        dateTo: '2024-06-30',
      });
      expect(epClientModule.epClient.getPlenarySessions).toHaveBeenCalledWith(
        expect.objectContaining({ dateFrom: '2024-01-01', dateTo: '2024-06-30' }),
      );
    });

    it('should default to trailing 6-month window when dates omitted', async () => {
      await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const call = vi.mocked(epClientModule.epClient.getPlenarySessions).mock.calls[0]?.[0];
      expect(call).toBeDefined();
      const from = new Date(call?.dateFrom ?? '');
      const to = new Date(call?.dateTo ?? '');
      const diffMonths = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30);
      expect(diffMonths).toBeGreaterThan(5);
      expect(diffMonths).toBeLessThan(7);
    });
  });

  describe('Derived metrics', () => {
    it('should compute decisionsPerMeeting = decisions / meetings', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      // 40 decisions / 12 meetings ≈ 3.33
      expect(data.derivedMetrics.decisionsPerMeeting).toBeCloseTo(40 / 12, 1);
    });

    it('should compute documentsPerMonth from window length', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue(paged(
        Array.from({ length: 12 }, (_, i) => ({
          id: `d-${String(i)}`, title: '', type: 'REPORT' as const,
          date: '2024-03-15', reference: '', committee: 'ENVI', status: 'ADOPTED' as const,
        })),
      ));
      const result = await handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI',
        dateFrom: '2024-01-01',
        dateTo: '2024-06-30',
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(typeof data.derivedMetrics.documentsPerMonth).toBe('number');
      // 12 documents / ~6 months ≈ 2
      expect(data.derivedMetrics.documentsPerMonth).toBeGreaterThan(0);
      expect(data.derivedMetrics.documentsPerMonth).toBeLessThan(3);
    });

    it('should compute activeFilesPerMember = activeLegFiles / members', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      // 60 procedures / 10 members = 6
      expect(data.derivedMetrics.activeFilesPerMember).toBe(6);
    });

    it('should report 0 derived metrics when sources are empty', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue(paged([]));
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([]));
      vi.mocked(epClientModule.epClient.getPlenarySessions).mockResolvedValue(paged([]));

      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.derivedMetrics.decisionsPerMeeting).toBe(0);
      expect(data.derivedMetrics.activeFilesPerMember).toBe(0);
    });
  });

  describe('Caching', () => {
    it('should return cached result on second identical call within 10 min', async () => {
      const first = await handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI', dateFrom: '2024-01-01', dateTo: '2024-06-30',
      });
      const firstData = JSON.parse(first.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(firstData.cacheHit).toBe(false);

      const second = await handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI', dateFrom: '2024-01-01', dateTo: '2024-06-30',
      });
      const secondData = JSON.parse(second.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(secondData.cacheHit).toBe(true);

      // Only one fetch round-trip for each source
      expect(vi.mocked(epClientModule.epClient.getCommitteeDocuments)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(epClientModule.epClient.getProcedures)).toHaveBeenCalledTimes(1);
    });

    it('should miss the cache when the date window differs', async () => {
      await handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI', dateFrom: '2024-01-01', dateTo: '2024-06-30',
      });
      await handleAnalyzeCommitteeActivity({
        committeeId: 'ENVI', dateFrom: '2024-07-01', dateTo: '2024-12-31',
      });
      expect(vi.mocked(epClientModule.epClient.getCommitteeDocuments)).toHaveBeenCalledTimes(2);
    });
  });

  describe('Workload Intensity Computation', () => {
    it('should classify VERY_HIGH workload when active files + meetings > 100', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged(
        Array.from({ length: 100 }, (_, i) => ({
          id: `p-${String(i)}`, title: '', reference: '', type: 'COD',
          subjectMatter: '', stage: '', status: 'Ongoing',
          dateInitiated: new Date().toISOString().slice(0, 10),
          dateLastActivity: new Date().toISOString().slice(0, 10),
          responsibleCommittee: 'ENVI', rapporteur: '', documents: [],
        })),
      ));
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      // 100 procedures + 12 meetings > 100 → VERY_HIGH
      expect(data.computedAttributes.workloadIntensity).toBe('VERY_HIGH');
    });

    it('should classify LOW workload when no data is available', async () => {
      vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(paged([]));
      vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue(paged([]));
      vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(paged([]));
      vi.mocked(epClientModule.epClient.getPlenarySessions).mockResolvedValue(paged([]));

      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'DROI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.computedAttributes.workloadIntensity).toBe('LOW');
    });
  });

  describe('Engagement and Impact Computation', () => {
    it('should report LOW engagement when attendance is not available', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.computedAttributes.engagementLevel).toBe('LOW');
      expect(data.memberEngagement.averageAttendance).toBe(0);
    });

    it('should handle empty members array', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
        id: 'TEST', name: 'Test Committee', abbreviation: 'TEST', members: [],
      });
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'TEST' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(data.memberEngagement.totalMembers).toBe(0);
      expect(data.derivedMetrics.activeFilesPerMember).toBe(0);
    });

    it('should compute policy impact rating based on reports and success rate', async () => {
      const result = await handleAnalyzeCommitteeActivity({ committeeId: 'ENVI' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(data.computedAttributes.policyImpactRating);
    });
  });

  describe('Error Handling', () => {
    it('should propagate committee lookup errors (committeeInfo failure is fatal)', async () => {
      vi.mocked(epClientModule.epClient.getCommitteeInfo).mockRejectedValue(
        new Error('Committee not found'),
      );

      await expect(handleAnalyzeCommitteeActivity({ committeeId: 'INVALID' }))
        .rejects.toThrow('Committee not found');
    });
  });
});
