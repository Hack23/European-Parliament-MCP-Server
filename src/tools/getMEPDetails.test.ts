/**
 * Tests for get_mep_details MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetMEPDetails } from './getMEPDetails.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn()
  }
}));

describe('get_mep_details Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
      id: 'MEP-124810',
      name: 'Test MEP',
      country: 'SE',
      politicalGroup: 'EPP',
      committees: ['AGRI', 'ENVI'],
      email: 'test@europarl.europa.eu',
      active: true,
      termStart: '2019-07-02',
      biography: 'Test biography',
      votingStatistics: {
        totalVotes: 1250,
        votesFor: 850,
        votesAgainst: 200,
        abstentions: 200,
        attendanceRate: 92.5
      }
    });
  });

  describe('Input Validation', () => {
    it('should accept valid MEP ID', async () => {
      const result = await handleGetMEPDetails({ id: 'MEP-124810' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should reject empty ID', async () => {
      await expect(handleGetMEPDetails({ id: '' }))
        .rejects.toThrow();
    });

    it('should reject missing ID', async () => {
      await expect(handleGetMEPDetails({}))
        .rejects.toThrow();
    });

    it('should reject ID that is too long', async () => {
      const longId = 'MEP-' + 'A'.repeat(200);
      await expect(handleGetMEPDetails({ id: longId }))
        .rejects.toThrow();
    });

    it('should reject non-string ID', async () => {
      await expect(handleGetMEPDetails({ id: 12345 }))
        .rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetMEPDetails({ id: 'MEP-124810' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetMEPDetails({ id: 'MEP-124810' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should include required MEP detail fields', async () => {
      const result = await handleGetMEPDetails({ id: 'MEP-124810' });
      const text = result.content[0]?.text ?? '{}';
      const mep: unknown = JSON.parse(text);

      if (typeof mep === 'object' && mep !== null) {
        expect(mep).toHaveProperty('id');
        expect(mep).toHaveProperty('name');
        expect(mep).toHaveProperty('country');
        expect(mep).toHaveProperty('politicalGroup');
        expect(mep).toHaveProperty('committees');
        expect(mep).toHaveProperty('biography');
        expect(mep).toHaveProperty('votingStatistics');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      await expect(handleGetMEPDetails({ id: 123 }))
        .rejects.toThrow();
    });

    it('should provide clean error messages', async () => {
      try {
        await handleGetMEPDetails({ id: '' });
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
      const spy = vi.spyOn(epClientModule.epClient, 'getMEPDetails')
        .mockRejectedValueOnce(new Error('Database connection failed'));

      try {
        await handleGetMEPDetails({ id: 'MEP-124810' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toContain('Failed to retrieve MEP details');
      }

      spy.mockRestore();
    });
  });
});
