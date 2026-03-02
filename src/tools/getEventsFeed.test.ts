/**
 * Tests for get_events_feed MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetEventsFeed, getEventsFeedToolMetadata } from './getEventsFeed.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getEventsFeed: vi.fn(),
  }
}));

describe('get_events_feed Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getEventsFeed).mockResolvedValue({
      data: [{ id: 'evt-1', type: 'Event' }],
      '@context': []
    });
  });

  describe('Input Validation', () => {
    it('should accept empty arguments and apply defaults', async () => {
      const result = await handleGetEventsFeed({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid timeframe', async () => {
      const result = await handleGetEventsFeed({ timeframe: 'one-month' });
      expect(result).toHaveProperty('content');
    });

    it('should accept activityType parameter', async () => {
      const result = await handleGetEventsFeed({ activityType: 'PLENARY' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid timeframe value', async () => {
      await expect(handleGetEventsFeed({ timeframe: 'invalid' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetEventsFeed({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetEventsFeed({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass timeframe to client', async () => {
      await handleGetEventsFeed({ timeframe: 'today' });

      expect(epClientModule.epClient.getEventsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ timeframe: 'today' })
      );
    });

    it('should pass activityType to client when provided', async () => {
      await handleGetEventsFeed({ activityType: 'COMMITTEE' });

      expect(epClientModule.epClient.getEventsFeed).toHaveBeenCalledWith(
        expect.objectContaining({ activityType: 'COMMITTEE' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate API client errors', async () => {
      vi.mocked(epClientModule.epClient.getEventsFeed)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetEventsFeed({})).rejects.toThrow('API unavailable');
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getEventsFeedToolMetadata).toHaveProperty('name', 'get_events_feed');
    });

    it('should export tool metadata with description', () => {
      expect(getEventsFeedToolMetadata).toHaveProperty('description');
      expect(getEventsFeedToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getEventsFeedToolMetadata).toHaveProperty('inputSchema');
      expect(getEventsFeedToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getEventsFeedToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
