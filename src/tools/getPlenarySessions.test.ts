/**
 * Tests for get_plenary_sessions MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetPlenarySessions } from './getPlenarySessions.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';
import { setupToolTest } from '../../tests/helpers/mockFactory.js';
import { expectValidMCPResponse, expectValidPaginatedMCPResponse } from '../../tests/helpers/assertions.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getPlenarySessions: vi.fn(),
    getMeetingById: vi.fn()
  }
}));

// Registers beforeEach(vi.clearAllMocks) for all tests in this file
setupToolTest();

describe('get_plenary_sessions Tool', () => {
  beforeEach(() => {
    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getPlenarySessions).mockResolvedValue({
      data: [
        {
          id: 'PLENARY-2024-01',
          date: '2024-01-15',
          location: 'Strasbourg',
          agendaItems: ['Budget Discussion'],
          attendanceCount: 650,
          documents: ['DOC-2024-001']
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept request with no filters', async () => {
      const result = await handleGetPlenarySessions({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid date range', async () => {
      const result = await handleGetPlenarySessions({ 
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid date format', async () => {
      await expect(handleGetPlenarySessions({ dateFrom: '01/01/2024' }))
        .rejects.toThrow();
    });

    it('should accept valid location', async () => {
      const result = await handleGetPlenarySessions({ location: 'Strasbourg' });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid limit', async () => {
      const result = await handleGetPlenarySessions({ limit: 50 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetPlenarySessions({ limit: 0 }))
        .rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetPlenarySessions({ limit: 101 }))
        .rejects.toThrow();
    });

    it('should accept valid offset', async () => {
      const result = await handleGetPlenarySessions({ offset: 20 });
      expect(result).toHaveProperty('content');
    });

    it('should reject negative offset', async () => {
      await expect(handleGetPlenarySessions({ offset: -1 }))
        .rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetPlenarySessions({});
      expectValidMCPResponse(result);
    });

    it('should include mock session data with id, date and location in payload', async () => {
      const result = await handleGetPlenarySessions({});
      const parsed = expectValidPaginatedMCPResponse(result);
      const first = parsed.data[0] as Record<string, unknown> | undefined;
      expect(first).toBeDefined();
      expect(first?.['id']).toBe('PLENARY-2024-01');
      expect(first?.['date']).toBe('2024-01-15');
      expect(first?.['location']).toBe('Strasbourg');
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetPlenarySessions({});
      expectValidPaginatedMCPResponse(result);
    });
  });

  describe('Error Handling', () => {
    it('should provide clean error messages', async () => {
      try {
        await handleGetPlenarySessions({ limit: -5 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toBeTruthy();
      }
    });

    it('should not expose internal errors', async () => {
      const spy = vi.spyOn(epClientModule.epClient, 'getPlenarySessions')
        .mockRejectedValueOnce(new Error('Database error'));

      try {
        await handleGetPlenarySessions({});
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toContain('Failed to retrieve plenary sessions');
      }

      spy.mockRestore();
    });
  });

  describe('Default Values', () => {
    it('should apply default limit', async () => {
      const result = await handleGetPlenarySessions({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      if (typeof data === 'object' && data !== null && 'limit' in data) {
        expect(data.limit).toBe(50); // Default limit
      }
    });

    it('should apply default offset', async () => {
      const result = await handleGetPlenarySessions({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      if (typeof data === 'object' && data !== null && 'offset' in data) {
        expect(data.offset).toBe(0); // Default offset
      }
    });
  });

  describe('eventId lookup branch', () => {
    it('should call getMeetingById when eventId is provided', async () => {
      const mockMeeting = {
        id: 'MTG-2024-001',
        title: 'Plenary Session March 2024',
        date: '2024-03-11',
        location: 'Strasbourg',
        type: 'PLENARY'
      };
      vi.mocked(epClientModule.epClient.getMeetingById).mockResolvedValue(mockMeeting);

      const result = await handleGetPlenarySessions({ eventId: 'MTG-2024-001' });
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as { id: string };
      expect(parsed.id).toBe('MTG-2024-001');
    });
  });
});
