/**
 * Tests for get_events MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetEvents, getEventsToolMetadata } from './getEvents.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getEvents: vi.fn(),
    getEventById: vi.fn()
  }
}));

describe('get_events Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getEvents).mockResolvedValue({
      data: [
        {
          id: 'event/EVT-2024-001',
          title: 'Public hearing on AI Act implementation',
          date: '2024-06-15',
          endDate: '2024-06-16',
          type: 'HEARING',
          location: 'Brussels',
          organizer: 'IMCO',
          status: 'CONFIRMED'
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
      const result = await handleGetEvents({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid date range', async () => {
      const result = await handleGetEvents({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid limit and offset', async () => {
      const result = await handleGetEvents({ limit: 25, offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetEvents({ limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetEvents({ limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetEvents({ offset: -1 })).rejects.toThrow();
    });

    it('should reject invalid date format', async () => {
      await expect(handleGetEvents({ dateFrom: '15-06-2024' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetEvents({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetEvents({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response with event data', async () => {
      const result = await handleGetEvents({});
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
      vi.mocked(epClientModule.epClient.getEvents)
        .mockRejectedValueOnce(new Error('Rate limit exceeded'));

      await expect(handleGetEvents({})).rejects.toThrow('Rate limit exceeded');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetEvents({ limit: 'bad' })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass date filters to client when provided', async () => {
      await handleGetEvents({ dateFrom: '2024-01-01', dateTo: '2024-12-31', limit: 10, offset: 5 });

      expect(epClientModule.epClient.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
          limit: 10,
          offset: 5
        })
      );
    });

    it('should not pass undefined date filters to client', async () => {
      await handleGetEvents({ limit: 20 });

      const callArgs = vi.mocked(epClientModule.epClient.getEvents).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('dateFrom');
      expect(callArgs).not.toHaveProperty('dateTo');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getEventsToolMetadata).toHaveProperty('name', 'get_events');
    });

    it('should export tool metadata with description', () => {
      expect(getEventsToolMetadata).toHaveProperty('description');
      expect(getEventsToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getEventsToolMetadata).toHaveProperty('inputSchema');
      expect(getEventsToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getEventsToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define dateFrom, dateTo, limit, offset in schema', () => {
      const props = getEventsToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('dateFrom');
      expect(props).toHaveProperty('dateTo');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });
  });

  describe('eventId lookup branch', () => {
    it('should call getEventById when eventId is provided', async () => {
      const mockEvent = {
        id: 'EVT-2024-001',
        title: 'Plenary Session',
        date: '2024-03-13',
        type: 'PLENARY',
        location: 'Strasbourg'
      };
      vi.mocked(epClientModule.epClient.getEventById).mockResolvedValue(mockEvent);

      const result = await handleGetEvents({ eventId: 'EVT-2024-001' });
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as { id: string };
      expect(parsed.id).toBe('EVT-2024-001');
    });
  });
});
