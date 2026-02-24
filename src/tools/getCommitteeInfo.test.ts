/**
 * Tests for get_committee_info MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetCommitteeInfo } from './getCommitteeInfo.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCommitteeInfo: vi.fn()
  }
}));

describe('get_committee_info Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
      id: 'ENVI',
      name: 'Committee on Environment, Public Health and Food Safety',
      abbreviation: 'ENVI',
      members: ['person/124810', 'person/124811'],
      chair: 'person/124810',
      viceChairs: ['person/124811'],
      responsibilities: ['COMMITTEE_PARLIAMENTARY_STANDING']
    });
  });

  describe('Input Validation', () => {
    it('should accept valid committee abbreviation', async () => {
      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid committee ID', async () => {
      const result = await handleGetCommitteeInfo({ id: 'COMMITTEE-001' });
      expect(result).toHaveProperty('content');
    });

    it('should accept both ID and abbreviation', async () => {
      const result = await handleGetCommitteeInfo({ 
        id: 'COMMITTEE-001',
        abbreviation: 'ENVI'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject abbreviation that is too long', async () => {
      const longAbbr = 'A'.repeat(21);
      await expect(handleGetCommitteeInfo({ abbreviation: longAbbr }))
        .rejects.toThrow();
    });

    it('should reject ID that is too long', async () => {
      const longId = 'A'.repeat(101);
      await expect(handleGetCommitteeInfo({ id: longId }))
        .rejects.toThrow();
    });

    it('should reject non-string abbreviation', async () => {
      await expect(handleGetCommitteeInfo({ abbreviation: 123 }))
        .rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should include required committee fields', async () => {
      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      const text = result.content[0]?.text ?? '{}';
      const committee: unknown = JSON.parse(text);

      if (typeof committee === 'object' && committee !== null) {
        expect(committee).toHaveProperty('id');
        expect(committee).toHaveProperty('name');
        expect(committee).toHaveProperty('abbreviation');
        expect(committee).toHaveProperty('members');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      await expect(handleGetCommitteeInfo({ abbreviation: 123 }))
        .rejects.toThrow();
    });

    it('should provide clean error messages', async () => {
      try {
        await handleGetCommitteeInfo({ abbreviation: '' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toBeTruthy();
      }
    });

    it('should not expose internal errors', async () => {
      const spy = vi.spyOn(epClientModule.epClient, 'getCommitteeInfo')
        .mockRejectedValueOnce(new Error('Database connection failed'));

      try {
        await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toContain('Failed to retrieve committee information');
      }

      spy.mockRestore();
    });
  });
});
