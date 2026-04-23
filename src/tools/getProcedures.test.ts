/**
 * Tests for get_procedures MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetProcedures, getProceduresToolMetadata } from './getProcedures.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProcedures: vi.fn(),
    getProcedureById: vi.fn()
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

    it('should strip year parameter (EP API /procedures does not support it)', async () => {
      const result = await handleGetProcedures({ year: 2024 });
      expect(result).toHaveProperty('content');
      expect(vi.mocked(epClientModule.epClient.getProcedures)).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(epClientModule.epClient.getProcedures).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('year');
    });

    it('should accept valid limit and offset', async () => {
      const result = await handleGetProcedures({ limit: 25, offset: 10 });
      expect(result).toHaveProperty('content');
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

      await expect(handleGetProcedures({})).rejects.toThrow('Failed to retrieve procedures');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetProcedures({ limit: 'invalid' })).rejects.toThrow();
    });

    it('should translate APIError(404) on processId lookup to non-retryable UPSTREAM_404 ToolError', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getProcedureById).mockRejectedValueOnce(
        new APIError('EP API request failed: 404 Not Found', 404)
      );

      try {
        await handleGetProcedures({ processId: 'eli/dl/proc/2025-0261' });
        expect.fail('Expected handleGetProcedures to throw');
      } catch (error: unknown) {
        const { ToolError } = await import('./shared/errors.js');
        expect(error).toBeInstanceOf(ToolError);
        const toolError = error as InstanceType<typeof ToolError>;
        expect(toolError.errorCode).toBe('UPSTREAM_404');
        expect(toolError.httpStatus).toBe(404);
        expect(toolError.isRetryable).toBe(false);
        expect(toolError.message).toContain('eli/dl/proc/2025-0261');
        expect(toolError.message).toContain('not found');
      }
    });

    it('should include processId in UPSTREAM_404 ToolError message', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getProcedureById).mockRejectedValueOnce(
        new APIError('EP API request failed: 404', 404)
      );

      try {
        await handleGetProcedures({ processId: '2024/0001(COD)' });
        expect.fail('Expected handleGetProcedures to throw');
      } catch (error: unknown) {
        const { ToolError } = await import('./shared/errors.js');
        expect(error).toBeInstanceOf(ToolError);
        const toolError = error as InstanceType<typeof ToolError>;
        expect(toolError.message).toContain('2024/0001(COD)');
        expect(toolError.errorCode).toBe('UPSTREAM_404');
        expect(toolError.isRetryable).toBe(false);
      }
    });

    it('should NOT translate APIError(404) on list retrieval to UPSTREAM_404 (retryable generic failure instead)', async () => {
      const { APIError } = await import('../clients/ep/baseClient.js');
      vi.mocked(epClientModule.epClient.getProcedures).mockRejectedValueOnce(
        new APIError('EP API request failed: 404 Not Found', 404)
      );

      try {
        await handleGetProcedures({ limit: 10 });
        expect.fail('Expected handleGetProcedures to throw');
      } catch (error: unknown) {
        const { ToolError } = await import('./shared/errors.js');
        expect(error).toBeInstanceOf(ToolError);
        const toolError = error as InstanceType<typeof ToolError>;
        // List-path 404 must fall through to the generic retryable path —
        // it may indicate misconfiguration or transient upstream routing and
        // must NOT be masked as "not found".
        expect(toolError.errorCode).not.toBe('UPSTREAM_404');
        expect(toolError.httpStatus).not.toBe(404);
        expect(toolError.isRetryable).toBe(true);
        expect(toolError.message).toContain('Failed to retrieve procedures');
      }
    });
  });

  describe('Client Invocation', () => {
    it('should pass only pagination params to client', async () => {
      await handleGetProcedures({ limit: 10 });

      expect(epClientModule.epClient.getProcedures).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0
        })
      );
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

    it('should define limit, offset in schema (no year)', () => {
      const props = getProceduresToolMetadata.inputSchema.properties;
      expect(props).not.toHaveProperty('year');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });
  });

  describe('processId lookup branch', () => {
    it('should call getProcedureById when processId is provided', async () => {
      const mockProcedure = {
        id: 'COD/2024/0001',
        title: 'AI Act',
        reference: '2024/0001(COD)',
        type: 'COD',
        subjectMatter: 'Internal Market',
        stage: 'First reading',
        status: 'Ongoing',
        dateInitiated: '2024-01-15',
        dateLastActivity: '2024-06-20',
        responsibleCommittee: 'IMCO',
        rapporteur: 'Test MEP',
        documents: []
      };
      vi.mocked(epClientModule.epClient.getProcedureById).mockResolvedValue(mockProcedure);

      const result = await handleGetProcedures({ processId: 'COD/2024/0001' });
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as { id: string };
      expect(parsed.id).toBe('COD/2024/0001');
    });
  });
});
