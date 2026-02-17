/**
 * Tests for search_documents MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSearchDocuments } from './searchDocuments.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

describe('search_documents Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept valid keyword', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate change' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should reject empty keyword', async () => {
      await expect(handleSearchDocuments({ keyword: '' }))
        .rejects.toThrow();
    });

    it('should reject missing keyword', async () => {
      await expect(handleSearchDocuments({}))
        .rejects.toThrow();
    });

    it('should reject keyword that is too long', async () => {
      const longKeyword = 'A'.repeat(201);
      await expect(handleSearchDocuments({ keyword: longKeyword }))
        .rejects.toThrow();
    });

    it('should reject keyword with invalid characters', async () => {
      await expect(handleSearchDocuments({ keyword: '<script>alert("xss")</script>' }))
        .rejects.toThrow();
    });

    it('should accept valid document type', async () => {
      const result = await handleSearchDocuments({ 
        keyword: 'climate',
        documentType: 'REPORT'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid document type', async () => {
      await expect(handleSearchDocuments({ 
        keyword: 'climate',
        documentType: 'INVALID_TYPE'
      })).rejects.toThrow();
    });

    it('should accept valid date range', async () => {
      const result = await handleSearchDocuments({ 
        keyword: 'climate',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid date format', async () => {
      await expect(handleSearchDocuments({ 
        keyword: 'climate',
        dateFrom: '01/01/2024'
      })).rejects.toThrow();
    });

    it('should accept valid limit', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate', limit: 50 });
      expect(result).toHaveProperty('content');
    });

    it('should reject limit below minimum', async () => {
      await expect(handleSearchDocuments({ keyword: 'climate', limit: 0 }))
        .rejects.toThrow();
    });

    it('should reject limit above maximum', async () => {
      await expect(handleSearchDocuments({ keyword: 'climate', limit: 101 }))
        .rejects.toThrow();
    });

    it('should accept valid offset', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate', offset: 20 });
      expect(result).toHaveProperty('content');
    });

    it('should reject negative offset', async () => {
      await expect(handleSearchDocuments({ keyword: 'climate', offset: -1 }))
        .rejects.toThrow();
    });

    it('should accept all optional parameters', async () => {
      const result = await handleSearchDocuments({
        keyword: 'climate change',
        documentType: 'REPORT',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        committee: 'ENVI',
        limit: 25,
        offset: 10
      });
      expect(result).toHaveProperty('content');
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should return paginated response structure', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('offset');
      expect(data).toHaveProperty('hasMore');
      
      if (typeof data === 'object' && data !== null && 'data' in data) {
        expect(Array.isArray(data.data)).toBe(true);
      }
    });

    it('should include document objects with required fields', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);

      if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray(data.data) && data.data.length > 0) {
        const doc: unknown = data.data[0];
        if (typeof doc === 'object' && doc !== null) {
          expect(doc).toHaveProperty('id');
          expect(doc).toHaveProperty('title');
          expect(doc).toHaveProperty('type');
          expect(doc).toHaveProperty('date');
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      await expect(handleSearchDocuments({ keyword: 123 }))
        .rejects.toThrow();
    });

    it('should provide clean error messages', async () => {
      try {
        await handleSearchDocuments({ keyword: '' });
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
      const spy = vi.spyOn(epClientModule.epClient, 'searchDocuments')
        .mockRejectedValueOnce(new Error('Search index unavailable'));

      try {
        await handleSearchDocuments({ keyword: 'climate' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toContain('Failed to search documents');
      }

      spy.mockRestore();
    });
  });

  describe('Default Values', () => {
    it('should apply default limit', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      if (typeof data === 'object' && data !== null && 'limit' in data) {
        expect(data.limit).toBe(20); // Default limit
      }
    });

    it('should apply default offset', async () => {
      const result = await handleSearchDocuments({ keyword: 'climate' });
      const text = result.content[0]?.text ?? '{}';
      const data: unknown = JSON.parse(text);
      
      if (typeof data === 'object' && data !== null && 'offset' in data) {
        expect(data.offset).toBe(0); // Default offset
      }
    });
  });
});
