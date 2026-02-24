/**
 * Tests for get_meeting_activities MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetMeetingActivities, getMeetingActivitiesToolMetadata } from './getMeetingActivities.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMeetingActivities: vi.fn()
  }
}));

describe('get_meeting_activities Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getMeetingActivities).mockResolvedValue({
      data: [
        {
          id: 'act/MTG-PL-2024-001-01',
          title: 'Debate on AI regulation',
          type: 'DEBATE',
          date: '2024-03-15',
          order: 1,
          reference: 'A9-0001/2024',
          responsibleBody: 'IMCO'
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept valid sittingId with defaults', async () => {
      const result = await handleGetMeetingActivities({ sittingId: 'MTG-PL-2024-001' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept sittingId with limit and offset', async () => {
      const result = await handleGetMeetingActivities({
        sittingId: 'MTG-PL-2024-001',
        limit: 25,
        offset: 10
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject missing sittingId', async () => {
      await expect(handleGetMeetingActivities({})).rejects.toThrow();
    });

    it('should reject empty sittingId', async () => {
      await expect(handleGetMeetingActivities({ sittingId: '' })).rejects.toThrow();
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetMeetingActivities({ sittingId: 'MTG-1', limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetMeetingActivities({ sittingId: 'MTG-1', limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetMeetingActivities({ sittingId: 'MTG-1', offset: -1 })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetMeetingActivities({ sittingId: 'MTG-PL-2024-001' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetMeetingActivities({ sittingId: 'MTG-PL-2024-001' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response with activity data', async () => {
      const result = await handleGetMeetingActivities({ sittingId: 'MTG-PL-2024-001' });
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
      vi.mocked(epClientModule.epClient.getMeetingActivities)
        .mockRejectedValueOnce(new Error('Meeting not found'));

      await expect(handleGetMeetingActivities({ sittingId: 'INVALID-ID' }))
        .rejects.toThrow('Meeting not found');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetMeetingActivities({ sittingId: 123 })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass sittingId and pagination to client', async () => {
      await handleGetMeetingActivities({ sittingId: 'MTG-PL-2024-001', limit: 10, offset: 5 });

      expect(epClientModule.epClient.getMeetingActivities).toHaveBeenCalledWith(
        'MTG-PL-2024-001',
        { limit: 10, offset: 5 }
      );
    });

    it('should pass default pagination values', async () => {
      await handleGetMeetingActivities({ sittingId: 'MTG-PL-2024-001' });

      expect(epClientModule.epClient.getMeetingActivities).toHaveBeenCalledWith(
        'MTG-PL-2024-001',
        { limit: 50, offset: 0 }
      );
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getMeetingActivitiesToolMetadata).toHaveProperty('name', 'get_meeting_activities');
    });

    it('should export tool metadata with description', () => {
      expect(getMeetingActivitiesToolMetadata).toHaveProperty('description');
      expect(getMeetingActivitiesToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getMeetingActivitiesToolMetadata).toHaveProperty('inputSchema');
      expect(getMeetingActivitiesToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getMeetingActivitiesToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should mark sittingId as required', () => {
      expect(getMeetingActivitiesToolMetadata.inputSchema).toHaveProperty('required');
      expect(getMeetingActivitiesToolMetadata.inputSchema.required).toContain('sittingId');
    });

    it('should define sittingId, limit, offset in schema', () => {
      const props = getMeetingActivitiesToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('sittingId');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });
  });
});
