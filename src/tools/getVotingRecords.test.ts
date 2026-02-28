/**
 * Tests for get_voting_records MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetVotingRecords } from './getVotingRecords.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';
import { setupToolTest } from '../../tests/helpers/mockFactory.js';
import { expectValidMCPResponse, expectValidPaginatedMCPResponse } from '../../tests/helpers/assertions.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getVotingRecords: vi.fn()
  }
}));

// Registers beforeEach(vi.clearAllMocks) for all tests in this file
setupToolTest();

describe('get_voting_records Tool', () => {
  beforeEach(() => {
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
      expectValidMCPResponse(result);
    });

    it('should include mock vote data with id, topic and result in payload', async () => {
      const result = await handleGetVotingRecords({});
      const parsed = expectValidPaginatedMCPResponse(result);
      const first = parsed.data[0] as Record<string, unknown> | undefined;
      expect(first).toBeDefined();
      expect(first?.['id']).toBe('VOTE-2024-001');
      expect(first?.['topic']).toBe('Resolution on climate change');
      expect(first?.['result']).toBe('ADOPTED');
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetVotingRecords({});
      expectValidPaginatedMCPResponse(result);
    });
  });

  describe('mepId Deprecation Warning', () => {
    it('should include _warning field when mepId is provided', async () => {
      const result = await handleGetVotingRecords({ mepId: 'MEP-124810' });
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('_warning');
      expect(typeof data['_warning']).toBe('string');
      const warning = data['_warning'] as string;
      expect(warning).toContain('mepId');
      expect(warning.length).toBeGreaterThan(0);
    });

    it('should NOT include _warning field when mepId is not provided', async () => {
      const result = await handleGetVotingRecords({ topic: 'Climate' });
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).not.toHaveProperty('_warning');
    });

    it('should NOT include _warning field for empty request', async () => {
      const result = await handleGetVotingRecords({});
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).not.toHaveProperty('_warning');
    });

    it('should still return valid voting data alongside the warning', async () => {
      const result = await handleGetVotingRecords({ mepId: 'MEP-99999' });
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('hasMore');
      expect(data).toHaveProperty('_warning');
    });

    it('warning message should explain EP API limitation', async () => {
      const result = await handleGetVotingRecords({ mepId: 'MEP-11111' });
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      const warning = data['_warning'] as string;
      const lowerWarning = warning.toLowerCase();
      expect(lowerWarning).toContain('ep api');
      expect(lowerWarning).toContain('aggregate');
      expect(lowerWarning).toContain('no effect');
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
