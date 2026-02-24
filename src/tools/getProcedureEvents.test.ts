/**
 * Tests for get_procedure_events MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetProcedureEvents, getProcedureEventsToolMetadata } from './getProcedureEvents.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProcedureEvents: vi.fn()
  }
}));

describe('get_procedure_events Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getProcedureEvents).mockResolvedValue({
      data: [
        {
          id: 'evt-1',
          title: 'Test Event',
          date: '2024-01-15',
          endDate: '',
          type: 'HEARING',
          location: '',
          organizer: '',
          status: ''
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept valid processId with defaults', async () => {
      const result = await handleGetProcedureEvents({ processId: 'proc-1' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid limit with processId', async () => {
      const result = await handleGetProcedureEvents({ processId: 'proc-1', limit: 25 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid offset with processId', async () => {
      const result = await handleGetProcedureEvents({ processId: 'proc-1', offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject missing processId', async () => {
      await expect(handleGetProcedureEvents({})).rejects.toThrow();
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetProcedureEvents({ processId: 'proc-1', limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetProcedureEvents({ processId: 'proc-1', limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetProcedureEvents({ processId: 'proc-1', offset: -1 })).rejects.toThrow();
    });

    it('should reject non-number limit', async () => {
      await expect(handleGetProcedureEvents({ processId: 'proc-1', limit: 'ten' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetProcedureEvents({ processId: 'proc-1' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetProcedureEvents({ processId: 'proc-1' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetProcedureEvents({ processId: 'proc-1' });
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
      vi.mocked(epClientModule.epClient.getProcedureEvents)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetProcedureEvents({ processId: 'proc-1' })).rejects.toThrow('API unavailable');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetProcedureEvents({ processId: 'proc-1', limit: -5 })).rejects.toThrow();
    });

    it('should throw when required processId is missing', async () => {
      await expect(handleGetProcedureEvents({})).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass processId, limit and offset to client', async () => {
      await handleGetProcedureEvents({ processId: 'proc-1', limit: 20, offset: 5 });

      expect(epClientModule.epClient.getProcedureEvents).toHaveBeenCalledWith('proc-1', {
        limit: 20,
        offset: 5
      });
    });

    it('should pass default pagination values when not specified', async () => {
      await handleGetProcedureEvents({ processId: 'proc-1' });

      expect(epClientModule.epClient.getProcedureEvents).toHaveBeenCalledWith('proc-1', {
        limit: 50,
        offset: 0
      });
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getProcedureEventsToolMetadata).toHaveProperty('name', 'get_procedure_events');
    });

    it('should export tool metadata with description', () => {
      expect(getProcedureEventsToolMetadata).toHaveProperty('description');
      expect(getProcedureEventsToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getProcedureEventsToolMetadata).toHaveProperty('inputSchema');
      expect(getProcedureEventsToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getProcedureEventsToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define processId, limit and offset properties in schema', () => {
      const props = getProcedureEventsToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('processId');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });

    it('should require processId in schema', () => {
      expect(getProcedureEventsToolMetadata.inputSchema).toHaveProperty('required');
      expect(getProcedureEventsToolMetadata.inputSchema.required).toContain('processId');
    });
  });
});
