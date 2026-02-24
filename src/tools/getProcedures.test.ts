/**
 * Tests for get_procedures MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetProcedures, getProceduresToolMetadata } from './getProcedures.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProcedures: vi.fn()
  }
}));

describe('get_procedures Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue({
      data: [
        {
          id: 'COD/2023/0123',
          title: 'Regulation on Artificial Intelligence',
          reference: '2023/0123(COD)',
          type: 'COD',
          subjectMatter: 'Internal Market',
          stage: 'Awaiting Parliament position',
          status: 'Ongoing',
          dateInitiated: '2023-04-21',
          dateLastActivity: '2024-06-15',
          responsibleCommittee: 'IMCO',
          rapporteur: 'Jane Andersson',
          documents: ['A9-0001/2024']
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetProcedures({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid year filter', async () => {
      const result = await handleGetProcedures({ year: 2024 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid limit and offset', async () => {
      const result = await handleGetProcedures({ limit: 25, offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject year below minimum', async () => {
      await expect(handleGetProcedures({ year: 1989 })).rejects.toThrow();
    });

    it('should reject year above maximum', async () => {
      await expect(handleGetProcedures({ year: 2041 })).rejects.toThrow();
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetProcedures({ limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetProcedures({ limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetProcedures({ offset: -1 })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetProcedures({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetProcedures({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response with procedure data', async () => {
      const result = await handleGetProcedures({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('offset');
      expect(data).toHaveProperty('hasMore');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getProcedures)
        .mockRejectedValueOnce(new Error('API timeout'));

      await expect(handleGetProcedures({})).rejects.toThrow('API timeout');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetProcedures({ year: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass year filter to client when provided', async () => {
      await handleGetProcedures({ year: 2024, limit: 10 });

      expect(epClientModule.epClient.getProcedures).toHaveBeenCalledWith(
        expect.objectContaining({
          year: 2024,
          limit: 10,
          offset: 0
        })
      );
    });

    it('should not pass undefined year to client', async () => {
      await handleGetProcedures({ limit: 20 });

      const callArgs = vi.mocked(epClientModule.epClient.getProcedures).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('year');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getProceduresToolMetadata).toHaveProperty('name', 'get_procedures');
    });

    it('should export tool metadata with description', () => {
      expect(getProceduresToolMetadata).toHaveProperty('description');
      expect(getProceduresToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getProceduresToolMetadata).toHaveProperty('inputSchema');
      expect(getProceduresToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getProceduresToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define year, limit, offset in schema', () => {
      const props = getProceduresToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('year');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });
  });
});
