/**
 * Tests for get_voting_records MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetVotingRecords } from './getVotingRecords.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getVotingRecords: vi.fn()
  }
}));

describe('get_voting_records Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getVotingRecords).mockResolvedValue({
      data: [
        {
          id: 'VOTE-2024-001',
          sessionId: 'MTG-PL-2024-01-15',
          topic: 'Resolution on climate change',
          date: '2024-01-15',
          votesFor: 450,
          votesAgainst: 150,
          abstentions: 50,
          result: 'ADOPTED'
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
      const result = await handleGetVotingRecords({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid session ID', async () => {
      const result = await handleGetVotingRecords({ sessionId: 'PLENARY-2024-01' });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid MEP ID', async () => {
      const result = await handleGetVotingRecords({ mepId: 'MEP-124810' });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid topic', async () => {
      const result = await handleGetVotingRecords({ topic: 'Climate Change' });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid date range', async () => {
      const result = await handleGetVotingRecords({ 
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid date format', async () => {
      await expect(handleGetVotingRecords({ dateFrom: '01/01/2024' }))
        .rejects.toThrow();
    });

    it('should accept valid limit', async () => {
      const result = await handleGetVotingRecords({ limit: 50 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetVotingRecords({ limit: 0 }))
        .rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetVotingRecords({ limit: 101 }))
        .rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetVotingRecords({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetVotingRecords({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetVotingRecords({});
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
    it('should provide clean error messages', async () => {
      try {
        await handleGetVotingRecords({ limit: -5 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toBeTruthy();
      }
    });

    it('should not expose internal errors', async () => {
      const spy = vi.spyOn(epClientModule.epClient, 'getVotingRecords')
        .mockRejectedValueOnce(new Error('Database error'));

      try {
        await handleGetVotingRecords({});
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toContain('Failed to retrieve voting records');
      }

      spy.mockRestore();
    });
  });
});
