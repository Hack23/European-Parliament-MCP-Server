/**
 * Tests for get_outgoing_meps MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetOutgoingMEPs, getOutgoingMEPsToolMetadata } from './getOutgoingMEPs.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getOutgoingMEPs: vi.fn()
  }
}));

describe('get_outgoing_meps Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getOutgoingMEPs).mockResolvedValue({
      data: [
        {
          id: 'person/1',
          name: 'Test Outgoing MEP',
          country: 'DE',
          politicalGroup: 'S&D',
          committees: ['ENVI'],
          active: true,
          termStart: '2024-07-16'
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
      const result = await handleGetOutgoingMEPs({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid limit', async () => {
      const result = await handleGetOutgoingMEPs({ limit: 25 });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid offset', async () => {
      const result = await handleGetOutgoingMEPs({ offset: 10 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetOutgoingMEPs({ limit: 0 })).rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetOutgoingMEPs({ limit: 101 })).rejects.toThrow();
    });

    it('should reject negative offset', async () => {
      await expect(handleGetOutgoingMEPs({ offset: -1 })).rejects.toThrow();
    });

    it('should reject non-number limit', async () => {
      await expect(handleGetOutgoingMEPs({ limit: 'ten' })).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetOutgoingMEPs({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetOutgoingMEPs({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetOutgoingMEPs({});
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
      vi.mocked(epClientModule.epClient.getOutgoingMEPs)
        .mockRejectedValueOnce(new Error('API unavailable'));

      await expect(handleGetOutgoingMEPs({})).rejects.toThrow('API unavailable');
    });

    it('should propagate schema validation errors for invalid input', async () => {
      await expect(handleGetOutgoingMEPs({ limit: -5 })).rejects.toThrow();
    });
  });

  describe('Client Invocation', () => {
    it('should pass limit and offset to client', async () => {
      await handleGetOutgoingMEPs({ limit: 20, offset: 5 });

      expect(epClientModule.epClient.getOutgoingMEPs).toHaveBeenCalledWith({
        limit: 20,
        offset: 5
      });
    });

    it('should pass default values when not specified', async () => {
      await handleGetOutgoingMEPs({});

      expect(epClientModule.epClient.getOutgoingMEPs).toHaveBeenCalledWith({
        limit: 50,
        offset: 0
      });
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getOutgoingMEPsToolMetadata).toHaveProperty('name', 'get_outgoing_meps');
    });

    it('should export tool metadata with description', () => {
      expect(getOutgoingMEPsToolMetadata).toHaveProperty('description');
      expect(getOutgoingMEPsToolMetadata.description.length).toBeGreaterThan(0);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getOutgoingMEPsToolMetadata).toHaveProperty('inputSchema');
      expect(getOutgoingMEPsToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getOutgoingMEPsToolMetadata.inputSchema).toHaveProperty('properties');
    });

    it('should define limit and offset properties in schema', () => {
      const props = getOutgoingMEPsToolMetadata.inputSchema.properties;
      expect(props).toHaveProperty('limit');
      expect(props).toHaveProperty('offset');
    });
  });
});
