import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleTrackLegislation, trackLegislationToolMetadata, toProcessId } from './trackLegislation.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProcedureById: vi.fn()
  }
}));

describe('track_legislation Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getProcedureById).mockResolvedValue({
      id: '2024/0001(COD)',
      title: 'Digital Markets Act Amendment',
      reference: '2024/0001(COD)',
      type: 'COD',
      subjectMatter: 'Internal Market',
      stage: 'Awaiting committee decision',
      status: 'Ongoing',
      dateInitiated: '2024-01-15',
      dateLastActivity: '2024-06-20',
      responsibleCommittee: 'IMCO',
      rapporteur: 'Test Rapporteur',
      documents: ['COM(2024)0001', 'A9-0123/2024'],
    });
  });

  describe('Input Validation', () => {
    it('should accept valid procedure ID', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      expect(result.content[0].type).toBe('text');
      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('procedureId' in parsed).toBe(true);
      }
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
    });

    it('should include procedure ID derived from API', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('procedureId' in parsed).toBe(true);
        expect('procedureId' in parsed && parsed.procedureId).toBe('2024/0001(COD)');
      }
    });

    it('should include title from API data', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { title: string };
      expect(parsed.title).toBe('Digital Markets Act Amendment');
    });

    it('should include status from API data', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { status: string };
      expect(parsed.status).toBe('Ongoing');
    });

    it('should include timeline derived from API dates', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { timeline: { date: string; stage: string }[] };
      expect(Array.isArray(parsed.timeline)).toBe(true);
      expect(parsed.timeline.length).toBeGreaterThan(0);
      expect(parsed.timeline[0].date).toBe('2024-01-15');
    });

    it('should include committees from API data', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { committees: { abbreviation: string; role: string }[] };
      expect(Array.isArray(parsed.committees)).toBe(true);
      expect(parsed.committees.length).toBeGreaterThan(0);
      expect(parsed.committees[0].abbreviation).toBe('IMCO');
    });

    it('should include amendments structure', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { amendments: { proposed: number; adopted: number; rejected: number } };
      expect(parsed.amendments).toHaveProperty('proposed');
      expect(parsed.amendments).toHaveProperty('adopted');
      expect(parsed.amendments).toHaveProperty('rejected');
    });

    it('should include voting records array', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { voting: unknown[] };
      expect(Array.isArray(parsed.voting)).toBe(true);
    });

    it('should include documents from API data', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { documents: { id: string }[] };
      expect(Array.isArray(parsed.documents)).toBe(true);
      expect(parsed.documents.length).toBe(2);
      expect(parsed.documents[0].id).toBe('COM(2024)0001');
      expect(parsed.documents[0].title).toBe('Reference: COM(2024)0001');
    });

    it('should include next steps', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { nextSteps: string[] };
      expect(Array.isArray(parsed.nextSteps)).toBe(true);
    });

    it('should have MEDIUM confidence level (real API data)', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { confidenceLevel: string };
      expect(parsed.confidenceLevel).toBe('MEDIUM');
    });

    it('should reference EP API in methodology', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed = JSON.parse(result.content[0].text) as { methodology: string };
      expect(parsed.methodology).toContain('EP API');
      expect(parsed.methodology).toContain('/procedures');
    });
  });

  describe('Error Handling', () => {
    it('should wrap API errors', async () => {
      vi.mocked(epClientModule.epClient.getProcedureById)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(handleTrackLegislation({ procedureId: '2024/0001(COD)' }))
        .rejects.toThrow('Failed to track legislation');
    });
  });

  describe('Tool Metadata', () => {
    it('should have correct tool name', () => {
      expect(trackLegislationToolMetadata.name).toBe('track_legislation');
    });

    it('should have description', () => {
      expect(trackLegislationToolMetadata.description).toBeTruthy();
      expect(trackLegislationToolMetadata.description.length).toBeGreaterThan(50);
    });

    it('should have input schema', () => {
      expect(trackLegislationToolMetadata.inputSchema).toBeDefined();
      expect(trackLegislationToolMetadata.inputSchema.type).toBe('object');
      expect(trackLegislationToolMetadata.inputSchema.required).toContain('procedureId');
    });

    it('should define procedureId constraints', () => {
      const schema = trackLegislationToolMetadata.inputSchema;
      expect(schema.properties?.procedureId).toBeDefined();
      const procedureId = schema.properties?.procedureId;
      expect(typeof procedureId === 'object' && procedureId !== null).toBe(true);
    });
  });

  describe('toProcessId conversion', () => {
    it('should convert reference format to process-id', () => {
      expect(toProcessId('2024/0006(COD)')).toBe('2024-0006');
    });

    it('should convert reference with different type suffix', () => {
      expect(toProcessId('2024/0003(BUD)')).toBe('2024-0003');
    });

    it('should pass through already-valid process-id', () => {
      expect(toProcessId('2024-0006')).toBe('2024-0006');
    });

    it('should handle reference with slash only (fallback)', () => {
      expect(toProcessId('2024/0001')).toBe('2024-0001');
    });

    it('should handle non-standard format via fallback', () => {
      expect(toProcessId('proc/2024/extra')).toBe('proc-2024-extra');
    });
  });
});
