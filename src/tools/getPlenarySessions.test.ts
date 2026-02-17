/**
 * Tests for get_plenary_sessions MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetPlenarySessions } from './getPlenarySessions.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

describe('get_plenary_sessions Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept request with no filters', async () => {
      const result = await handleGetPlenarySessions({});
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid date range', async () => {
      const result = await handleGetPlenarySessions({ 
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid date format', async () => {
      await expect(handleGetPlenarySessions({ dateFrom: '01/01/2024' }))
        .rejects.toThrow();
    });

    it('should accept valid location', async () => {
      const result = await handleGetPlenarySessions({ location: 'Strasbourg' });
      expect(result).toHaveProperty('content');
    });

    it('should accept valid limit', async () => {
      const result = await handleGetPlenarySessions({ limit: 50 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleGetPlenarySessions({ limit: 0 }))
        .rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleGetPlenarySessions({ limit: 101 }))
        .rejects.toThrow();
    });

    it('should accept valid offset', async () => {
      const result = await handleGetPlenarySessions({ offset: 20 });
      expect(result).toHaveProperty('content');
    });

    it('should reject negative offset', async () => {
      await expect(handleGetPlenarySessions({ offset: -1 }))
        .rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetPlenarySessions({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetPlenarySessions({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleGetPlenarySessions({});
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
        await handleGetPlenarySessions({ limit: -5 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toBeTruthy();
      }
    });

    it('should not expose internal errors', async () => {
      const spy = vi.spyOn(epClientModule.epClient, 'getPlenarySessions')
        .mockRejectedValueOnce(new Error('Database error'));

      try {
        await handleGetPlenarySessions({});
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toContain('Failed to retrieve plenary sessions');
      }

      spy.mockRestore();
    });
  });

  describe('Default Values', () => {
    it('should apply default limit', async () => {
      const result = await handleGetPlenarySessions({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      if (typeof data === 'object' && data !== null && 'limit' in data) {
        expect(data.limit).toBe(50); // Default limit
      }
    });

    it('should apply default offset', async () => {
      const result = await handleGetPlenarySessions({});
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      if (typeof data === 'object' && data !== null && 'offset' in data) {
        expect(data.offset).toBe(0); // Default offset
      }
    });
  });
});
