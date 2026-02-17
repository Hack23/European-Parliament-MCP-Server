import { describe, it, expect, beforeEach } from 'vitest';
import { handleTrackLegislation, trackLegislationToolMetadata } from './trackLegislation.js';

describe('track_legislation Tool', () => {
  beforeEach(() => {
    // No mocks needed - this tool returns mock data
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

    it('should include procedure ID in response', async () => {
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

    it('should include title', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('title' in parsed).toBe(true);
        expect('title' in parsed && typeof parsed.title === 'string').toBe(true);
      }
    });

    it('should include status', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('status' in parsed).toBe(true);
      }
    });

    it('should include timeline', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('timeline' in parsed).toBe(true);
        if ('timeline' in parsed) {
          expect(Array.isArray(parsed.timeline)).toBe(true);
        }
      }
    });

    it('should include committees', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('committees' in parsed).toBe(true);
        if ('committees' in parsed) {
          expect(Array.isArray(parsed.committees)).toBe(true);
        }
      }
    });

    it('should include amendments', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('amendments' in parsed).toBe(true);
        if ('amendments' in parsed) {
          const amendments = parsed.amendments;
          expect(typeof amendments === 'object' && amendments !== null).toBe(true);
          if (typeof amendments === 'object' && amendments !== null) {
            expect('proposed' in amendments).toBe(true);
            expect('adopted' in amendments).toBe(true);
            expect('rejected' in amendments).toBe(true);
          }
        }
      }
    });

    it('should include voting records', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('voting' in parsed).toBe(true);
        if ('voting' in parsed) {
          expect(Array.isArray(parsed.voting)).toBe(true);
        }
      }
    });

    it('should include documents', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('documents' in parsed).toBe(true);
        if ('documents' in parsed) {
          expect(Array.isArray(parsed.documents)).toBe(true);
        }
      }
    });

    it('should include next steps', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      if (typeof parsed === 'object' && parsed !== null) {
        expect('nextSteps' in parsed).toBe(true);
        if ('nextSteps' in parsed) {
          expect(Array.isArray(parsed.nextSteps)).toBe(true);
        }
      }
    });
  });

  describe('Data Structure', () => {
    it('should have valid timeline entries', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      if (typeof parsed === 'object' && parsed !== null && 'timeline' in parsed) {
        const timeline = parsed.timeline;
        if (Array.isArray(timeline) && timeline.length > 0) {
          const entry = timeline[0];
          expect(typeof entry === 'object' && entry !== null).toBe(true);
          if (typeof entry === 'object' && entry !== null) {
            expect('date' in entry).toBe(true);
            expect('stage' in entry).toBe(true);
            expect('description' in entry).toBe(true);
          }
        }
      }
    });

    it('should have valid committee entries', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      if (typeof parsed === 'object' && parsed !== null && 'committees' in parsed) {
        const committees = parsed.committees;
        if (Array.isArray(committees) && committees.length > 0) {
          const committee = committees[0];
          expect(typeof committee === 'object' && committee !== null).toBe(true);
          if (typeof committee === 'object' && committee !== null) {
            expect('abbreviation' in committee).toBe(true);
            expect('role' in committee).toBe(true);
          }
        }
      }
    });

    it('should have valid voting entries', async () => {
      const result = await handleTrackLegislation({
        procedureId: '2024/0001(COD)'
      });

      const parsed: unknown = JSON.parse(result.content[0].text);
      if (typeof parsed === 'object' && parsed !== null && 'voting' in parsed) {
        const voting = parsed.voting;
        if (Array.isArray(voting) && voting.length > 0) {
          const vote = voting[0];
          expect(typeof vote === 'object' && vote !== null).toBe(true);
          if (typeof vote === 'object' && vote !== null) {
            expect('date' in vote).toBe(true);
            expect('stage' in vote).toBe(true);
            expect('result' in vote).toBe(true);
            expect('votesFor' in vote).toBe(true);
            expect('votesAgainst' in vote).toBe(true);
            expect('abstentions' in vote).toBe(true);
          }
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful output for valid inputs', async () => {
      const result = await handleTrackLegislation({ procedureId: '2024/0001(COD)' });
      expect(result).toBeDefined();
      expect(result.content[0].type).toBe('text');
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
});
