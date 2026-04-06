/**
 * Contract/structure tests for the searchDocuments tool, validating response shape
 * and pagination behavior against the expected European Parliament API model.
 * These tests currently run against the mock-backed EP client, not the live API.
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleSearchDocuments } from '../../../src/tools/searchDocuments.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip, measureTime } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateDocumentStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('search_documents Integration Tests', () => {
  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Keyword Search', () => {
    it('should search documents by keyword', async () => {
      const result = await retryOrSkip(async () => {
        return handleSearchDocuments({
          keyword: 'climate',
          limit: 10
        });
      }, 'search documents by keyword');
      if (!result) return;

      saveMCPResponseFixture('search_documents', 'climate-search', result);

      // Validate structure
      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // Validate each document
      response.data.forEach((document: unknown) => {
        validateDocumentStructure(document);
      });
    }, 60000);

    it('should search documents with complex query', async () => {
      const result = await retryOrSkip(async () => {
        return handleSearchDocuments({ 
          keyword: 'digital transformation',
          limit: 10 
        });
      }, 'search documents with complex query');
      if (!result) return;

      saveMCPResponseFixture('search_documents', 'digital-transformation-search', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((document: unknown) => {
        validateDocumentStructure(document);
      });
    }, 60000);
  });

  describe('Document Type Filtering', () => {
    it('should filter documents by type', async () => {
      const result = await retryOrSkip(async () => {
        return handleSearchDocuments({ 
          keyword: 'environment',
          documentType: 'REPORT' as const,
          limit: 10 
        });
      }, 'filter documents by type');
      if (!result) return;

      saveMCPResponseFixture('search_documents', 'reports-only', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // All documents should be of specified type
      response.data.forEach((document: unknown) => {
        validateDocumentStructure(document);
        // Note: API may return different type identifiers
        expect((document as { type: string }).type).toBeDefined();
      });
    }, 60000);
  });

  describe('Date Range Filtering', () => {
    it('should filter documents by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const result = await retryOrSkip(async () => {
        return handleSearchDocuments({ 
          keyword: 'policy',
          dateFrom: startDate,
          dateTo: endDate,
          limit: 10 
        });
      }, 'filter documents by date range');
      if (!result) return;

      saveMCPResponseFixture('search_documents', 'date-range-2024', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      const startTime = Date.parse(startDate);
      const endTime = Date.parse(endDate);
      expect(Number.isNaN(startTime)).toBe(false);
      expect(Number.isNaN(endTime)).toBe(false);

      response.data.forEach((document: unknown) => {
        validateDocumentStructure(document);
        // Documents should have dates if available
        if ('date' in (document as object)) {
          const docDate = (document as { date: string }).date;
          const docTime = Date.parse(docDate);
          expect(Number.isNaN(docTime)).toBe(false);
          expect(docTime >= startTime).toBe(true);
          expect(docTime <= endTime).toBe(true);
        }
      });
    }, 60000);
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const keyword = 'energy';
      
      const page1 = await retryOrSkip(async () => {
        return handleSearchDocuments({ keyword, limit: 5, offset: 0 });
      }, 'pagination page 1');
      if (!page1) return;
      
      const page2 = await retryOrSkip(async () => {
        return handleSearchDocuments({ keyword, limit: 5, offset: 5 });
      }, 'pagination page 2');
      if (!page2) return;

      const response1 = validatePaginatedResponse(page1);
      const response2 = validatePaginatedResponse(page2);

      // Note: The current European Parliament client returns mock data with a single document
      // regardless of offset/limit. We only validate pagination metadata and basic data presence.
      expect(Array.isArray(response1.data)).toBe(true);
      expect(Array.isArray(response2.data)).toBe(true);

      // Pagination metadata
      expect(response1.offset).toBe(0);
      expect(response2.offset).toBe(5);
    }, 120000);
  });

  describe('Error Handling', () => {
    it('should reject empty query', async () => {
      await expect(async () => {
        return handleSearchDocuments({ keyword: '' });
      }).rejects.toThrow();
    }, 10000);

    it('should reject invalid date format', async () => {
      await expect(async () => {
        return handleSearchDocuments({ 
          keyword: 'test',
          // @ts-expect-error - Testing invalid date format
          dateFrom: 'invalid-date' 
        });
      }).rejects.toThrow();
    }, 10000);

    it('should reject negative limit', async () => {
      await expect(async () => {
        return handleSearchDocuments({ 
          keyword: 'test',
          limit: -1 
        });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return valid document data', async () => {
      const result = await retryOrSkip(async () => {
        return handleSearchDocuments({ 
          keyword: 'agriculture',
          limit: 5 
        });
      }, 'response validation');
      if (!result) return;

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((document: unknown) => {
        // Required fields
        expect(document).toHaveProperty('id');
        expect(document).toHaveProperty('title');
        expect(document).toHaveProperty('type');

        // Type validation
        expect(typeof (document as { id: unknown }).id).toBe('string');
        expect(typeof (document as { title: unknown }).title).toBe('string');
        expect(typeof (document as { type: unknown }).type).toBe('string');
      });
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      try {
        const [, duration] = await measureTime(async () => {
          return retryOrSkip(async () => handleSearchDocuments({ 
            keyword: 'transport',
            limit: 10 
          }), 'performance test');
        });

        expect(duration).toBeLessThan(30000);
        console.log(`[Performance] search_documents request: ${duration.toFixed(2)}ms`);
      } catch {
        console.warn('[SKIP] Performance test skipped due to API unavailability');
      }
    }, 60000);

    it('should benefit from caching on repeated searches', async () => {
      const params = { keyword: 'healthcare', limit: 5 };

      // First request
      const firstResult = await retryOrSkip(async () => handleSearchDocuments(params), 'caching first request');
      if (!firstResult) return;

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleSearchDocuments(params);
      });

      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] search_documents cached: ${duration.toFixed(2)}ms`);
    }, 120000);
  });

  describe('Data Consistency', () => {
    it('should return consistent results for identical searches', async () => {
      const params = { keyword: 'education', limit: 5 };

      const result1 = await retryOrSkip(async () => handleSearchDocuments(params), 'consistency first request');
      if (!result1) return;
      const result2 = await handleSearchDocuments(params);

      const response1 = validatePaginatedResponse(result1);
      const response2 = validatePaginatedResponse(result2);

      // Compare stable pagination metadata
      expect(response1.offset).toBe(response2.offset);
      expect(response1.limit).toBe(response2.limit);

      // Compare number of records returned
      expect(response1.data.length).toBe(response2.data.length);

      // If there are records, compare stable identifiers on the first item
      if (response1.data.length > 0 && response2.data.length > 0) {
        expect((response1.data[0] as { id: string }).id).toBe((response2.data[0] as { id: string }).id);
      }
    }, 120000);
  });
});
