/**
 * Tests for get_meeting_foreseen_activities MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetMeetingForeseenActivities, getMeetingForeseenActivitiesToolMetadata } from './getMeetingForeseenActivities.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMeetingForeseenActivities: vi.fn()
  }
}));

describe('get_meeting_foreseen_activities Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getMeetingForeseenActivities).mockResolvedValue({
      data: [
        {
          id: 'act-1',
          title: 'Test Activity',
          type: 'DEBATE',
          date: '2024-01-15',
          order: 1,
          reference: '',
          responsibleBody: ''
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
      const result = await handleGetMeetingForeseenActivities({ sittingId: 'sitting-1' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid limit with sittingId', async () => {
      const result = await handleGetMeetingForeseenActivities({ sittingId: 'sitting-1', limit: 25 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid offset with sittingId', async () => {
      const result = await handleGetMeetingForeseenActivities({ sittingId: 'sitting-1', offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject missing sittingId', async () => {
      await expect(handleGetMeetingForeseenActivities({})).rejects.toThrow();
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetMeetingForeseenActivities({ sittingId: 'sitting-1', limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetMeetingForeseenActivities({ sittingId: 'sitting-1', limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetMeetingForeseenActivities({ sittingId: 'sitting-1', offset: -1 })).rejects.toThrow();
    });

    it('should reject non-number limit', async () => {
      await expect(handleGetMeetingForeseenActivities({ sittingId: 'sitting-1', limit: 'ten' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetMeetingForeseenActivities({ sittingId: 'sitting-1' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetMeetingForeseenActivities({ sittingId: 'sitting-1' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetMeetingForeseenActivities({ sittingId: 'sitting-1' });
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
      vi.mocked(epClientModule.epClient.getMeetingForeseenActivities)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetMeetingForeseenActivities({ sittingId: 'sitting-1' })).rejects.toThrow('API unavailable');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetMeetingForeseenActivities({ sittingId: 'sitting-1', limit: -5 })).rejects.toThrow();
    });

    it('should throw when required sittingId is missing', async () => {
      await expect(handleGetMeetingForeseenActivities({})).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass sittingId, limit and offset to client', async () => {
      await handleGetMeetingForeseenActivities({ sittingId: 'sitting-1', limit: 20, offset: 5 });

      expect(epClientModule.epClient.getMeetingForeseenActivities).toHaveBeenCalledWith('sitting-1', {
        limit: 20,
        offset: 5
      });
    });

    it('should pass default pagination values when not specified', async () => {
      await handleGetMeetingForeseenActivities({ sittingId: 'sitting-1' });

      expect(epClientModule.epClient.getMeetingForeseenActivities).toHaveBeenCalledWith('sitting-1', {
        limit: 50,
        offset: 0
      });
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getMeetingForeseenActivitiesToolMetadata).toHaveProperty('name', 'get_meeting_foreseen_activities');
    });

    it('should export tool metadata with description', () => {
      expect(getMeetingForeseenActivitiesToolMetadata).toHaveProperty('description');
      expect(getMeetingForeseenActivitiesToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getMeetingForeseenActivitiesToolMetadata).toHaveProperty('inputSchema');
      expect(getMeetingForeseenActivitiesToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getMeetingForeseenActivitiesToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define sittingId, limit and offset properties in schema', () => {
      const props = getMeetingForeseenActivitiesToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('sittingId');
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });

    it('should require sittingId in schema', () => {
      expect(getMeetingForeseenActivitiesToolMetadata.inputSchema).toHaveProperty('required');
      expect(getMeetingForeseenActivitiesToolMetadata.inputSchema.required).toContain('sittingId');
    });
  });
});
