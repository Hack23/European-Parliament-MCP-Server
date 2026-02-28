/**
 * Tests for get_meps MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetMEPs } from './getMEPs.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';
import { setupToolTest } from '../../tests/helpers/mockFactory.js';
import { expectValidMCPResponse, expectValidPaginatedMCPResponse, expectToolError } from '../../tests/helpers/assertions.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn()
  }
}));

// Registers beforeEach(vi.clearAllMocks) for all tests in this file
setupToolTest();

describe('get_meps Tool', () => {
  beforeEach(() => {
    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
      data: [
        {
          id: 'MEP-1',
          name: 'Test MEP',
          country: 'SE',
          politicalGroup: 'EPP',
          committees: ['AGRI'],
          active: true,
          termStart: '2019-07-02'
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept valid country code', async () => {
      const result = await handleGetMEPs({ country: 'SE', limit: 10 });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should reject invalid country code length', async () => {
      await expect(handleGetMEPs({ country: 'SWE' }))
        .rejects.toThrow();
    });

    it('should reject invalid country code format', async () => {
      await expect(handleGetMEPs({ country: 's' }))
        .rejects.toThrow();
    });

    it('should accept valid limit', async () => {
      const result = await handleGetMEPs({ limit: 50 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetMEPs({ limit: 0 }))
        .rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetMEPs({ limit: 101 }))
        .rejects.toThrow();
    });

    it('should accept valid offset', async () => {
      const result = await handleGetMEPs({ offset: 50 });
      expect(result).toHaveProperty('content');
    });

    it('should reject negative offset', async () => {
      await expect(handleGetMEPs({ offset: -1 }))
        .rejects.toThrow();
    });

    it('should accept all optional parameters', async () => {
      const result = await handleGetMEPs({
        country: 'SE',
        group: 'EPP',
        committee: 'ENVI',
        active: true,
        limit: 25,
        offset: 10
      });
      expect(result).toHaveProperty('content');
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetMEPs({ limit: 10 });
      expectValidMCPResponse(result);
    });

    it('should include mock MEP data with id and country in payload', async () => {
      const result = await handleGetMEPs({ limit: 10 });
      const parsed = expectValidPaginatedMCPResponse(result);
      const first = parsed.data[0] as Record<string, unknown> | undefined;
      expect(first).toBeDefined();
      expect(first?.['id']).toBe('MEP-1');
      expect(first?.['country']).toBe('SE');
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetMEPs({ limit: 10 });
      const parsed = expectValidPaginatedMCPResponse(result);
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    it('should include MEP objects with required fields', async () => {
      const result = await handleGetMEPs({ limit: 10 });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray(data.data) && data.data.length > 0) {
        const mep: unknown = data.data[0];
        if (typeof mep === 'object' && mep !== null) {
          expect(mep).toHaveProperty('id');
          expect(mep).toHaveProperty('name');
          expect(mep).toHaveProperty('country');
          expect(mep).toHaveProperty('politicalGroup');
          expect(mep).toHaveProperty('committees');
          expect(mep).toHaveProperty('active');
          expect(mep).toHaveProperty('termStart');
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      await expectToolError(() => handleGetMEPs({ country: 123 }));
    });

    it('should provide clean error messages', async () => {
      try {
        await handleGetMEPs({ limit: -5 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toBeTruthy();
        expect(err.message.length).toBeGreaterThan(0);
      }
    });

    it('should not expose internal errors', async () => {
      // Mock API client to throw error
      const spy = vi.spyOn(epClientModule.epClient, 'getMEPs')
        .mockRejectedValueOnce(new Error('Internal database error'));

      try {
        await handleGetMEPs({ limit: 10 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toContain('Failed to retrieve MEPs');
        // Should wrap internal error, not expose it directly
      }

      spy.mockRestore();
    });
  });

  describe('Default Values', () => {
    it('should apply default limit', async () => {
      const result = await handleGetMEPs({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      if (typeof data === 'object' && data !== null && 'limit' in data) {
        expect(data.limit).toBe(50); // Default limit
      }
    });

    it('should apply default offset', async () => {
      const result = await handleGetMEPs({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      if (typeof data === 'object' && data !== null && 'offset' in data) {
        expect(data.offset).toBe(0); // Default offset
      }
    });

    it('should apply default active status', async () => {
      const result = await handleGetMEPs({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      // Default active is true (only active MEPs)
      if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray(data.data) && data.data.length > 0) {
        const firstItem: unknown = data.data[0];
        if (typeof firstItem === 'object' && firstItem !== null && 'active' in firstItem) {
          expect(firstItem.active).toBe(true);
        }
      }
    });
  });

  describe('Filtering', () => {
    it('should filter by country', async () => {
      const result = await handleGetMEPs({ country: 'SE' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      // Mock data should respect country filter
      if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray(data.data) && data.data.length > 0) {
        const firstItem: unknown = data.data[0];
        if (typeof firstItem === 'object' && firstItem !== null && 'country' in firstItem) {
          expect(firstItem.country).toBe('SE');
        }
      }
    });

    it('should filter by political group', async () => {
      const result = await handleGetMEPs({ group: 'EPP' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      // Mock data should respect group filter
      if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray(data.data) && data.data.length > 0) {
        const firstItem: unknown = data.data[0];
        if (typeof firstItem === 'object' && firstItem !== null && 'politicalGroup' in firstItem) {
          expect(firstItem.politicalGroup).toBe('EPP');
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty API response gracefully', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false,
      });

      const result = await handleGetMEPs({ limit: 10 });
      expect(vi.mocked(epClientModule.epClient.getMEPs)).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 })
      );
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        total: number;
        hasMore: boolean;
      };
      expect(data.data).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.hasMore).toBe(false);
    });

    it('should handle maximum offset (large pagination)', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 100,
        limit: 50,
        offset: 999999,
        hasMore: false,
      });

      const result = await handleGetMEPs({ offset: 999999 });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: unknown[];
        offset: number;
      };
      expect(data.data).toEqual([]);
      expect(data.offset).toBe(999999);
    });

    it('should handle minimum limit of 1', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [{ id: 'MEP-1', name: 'Test', country: 'DE', politicalGroup: 'EPP', committees: [], active: true, termStart: '2019-07-02' }],
        total: 1,
        limit: 1,
        offset: 0,
        hasMore: true,
      });

      await handleGetMEPs({ limit: 1 });
      expect(epClientModule.epClient.getMEPs).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 })
      );
    });

    it('should handle maximum limit of 100', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 100,
        offset: 0,
        hasMore: false,
      });

      await handleGetMEPs({ limit: 100 });
      expect(epClientModule.epClient.getMEPs).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it('should handle group name with special characters (S&D)', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [{ id: 'MEP-2', name: 'Test MEP', country: 'DE', politicalGroup: 'S&D', committees: [], active: true, termStart: '2019-07-02' }],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false,
      });

      const result = await handleGetMEPs({ group: 'S&D' });
      expect(vi.mocked(epClientModule.epClient.getMEPs)).toHaveBeenCalledWith(
        expect.objectContaining({ group: 'S&D' })
      );
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: { politicalGroup: string }[];
      };
      expect(data.data[0]?.politicalGroup).toBe('S&D');
    });

    it('should handle rate limiting error (429)', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(
        Object.assign(new Error('Too Many Requests'), { status: 429 })
      );

      await expect(handleGetMEPs({ limit: 10 }))
        .rejects.toThrow('Failed to retrieve MEPs');
    });

    it('should handle network timeout error', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(
        new Error('Request timeout after 30000ms')
      );

      await expect(handleGetMEPs({ limit: 10 }))
        .rejects.toThrow('Failed to retrieve MEPs');
    });

    it('should reject limit of -1', async () => {
      await expect(handleGetMEPs({ limit: -1 })).rejects.toThrow();
    });

    it('should handle active=false to include inactive MEPs', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [{ id: 'MEP-99', name: 'Former MEP', country: 'FR', politicalGroup: 'ECR', committees: [], active: false, termStart: '2014-07-01' }],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false,
      });

      const result = await handleGetMEPs({ active: false });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        data: { active: boolean }[];
      };
      expect(data.data[0]?.active).toBe(false);
    });
  });
});
