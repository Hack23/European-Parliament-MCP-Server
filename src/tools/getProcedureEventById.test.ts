/**
 * Tests for get_procedure_event_by_id MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetProcedureEventById, getProcedureEventByIdToolMetadata } from './getProcedureEventById.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getProcedureEventById: vi.fn(),
  }
}));

describe('get_procedure_event_by_id Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getProcedureEventById).mockResolvedValue({
      id: 'evt-1',
      type: 'Event',
      processId: 'COD-2024-001'
    });
  });

  describe('Input Validation', () => {
    it('should accept valid processId and eventId', async () => {
      const result = await handleGetProcedureEventById({ processId: 'COD-2024-001', eventId: 'evt-1' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should reject missing processId', async () => {
      await expect(handleGetProcedureEventById({ eventId: 'evt-1' })).rejects.toThrow();
    });

    it('should reject missing eventId', async () => {
      await expect(handleGetProcedureEventById({ processId: 'COD-2024-001' })).rejects.toThrow();
    });

    it('should reject empty arguments', async () => {
      await expect(handleGetProcedureEventById({})).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetProcedureEventById({ processId: 'COD-2024-001', eventId: 'evt-1' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetProcedureEventById({ processId: 'COD-2024-001', eventId: 'evt-1' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass processId and eventId to client', async () => {
      await handleGetProcedureEventById({ processId: 'COD-2024-001', eventId: 'evt-1' });

      expect(epClientModule.epClient.getProcedureEventById).toHaveBeenCalledWith(
        'COD-2024-001',
        'evt-1'
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getProcedureEventById)
        .mockRejectedValueOnce(new Error('Event not found'));

      await expect(
        handleGetProcedureEventById({ processId: 'COD-2024-001', eventId: 'bad-id' })
      ).rejects.toThrow('Event not found');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getProcedureEventByIdToolMetadata).toHaveProperty('name', 'get_procedure_event_by_id');
    });

    it('should export tool metadata with description', () => {
      expect(getProcedureEventByIdToolMetadata).toHaveProperty('description');
      expect(getProcedureEventByIdToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getProcedureEventByIdToolMetadata).toHaveProperty('inputSchema');
      expect(getProcedureEventByIdToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getProcedureEventByIdToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
