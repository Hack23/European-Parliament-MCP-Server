/**
 * Integration Tests: search_documents Tool
 * 
 * Tests the searchDocuments tool against real European Parliament API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleSearchDocuments } from '../../../src/tools/searchDocuments.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validatePaginatedResponse, validateDocumentStructure } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

// Skip tests if integration tests are not enabled
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('search_documents Integration Tests', () => {
  beforeEach(async () => {
    // Wait between tests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Keyword Search', () => {
    it('should search documents by keyword', async () => {
      const result = await retry(async () => {
        return handleSearchDocuments({ 
          query: 'climate',
          limit: 10 
        });
      });

      saveMCPResponseFixture('search_documents', 'climate-search', result);

      // Validate structure
      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // Validate each document
      response.data.forEach((document: unknown) => {
        validateDocumentStructure(document);
      });
    }, 30000);

    it('should search documents with complex query', async () => {
      const result = await retry(async () => {
        return handleSearchDocuments({ 
          query: 'digital transformation',
          limit: 10 
        });
      });

      saveMCPResponseFixture('search_documents', 'digital-transformation-search', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((document: unknown) => {
        validateDocumentStructure(document);
      });
    }, 30000);
  });

  describe('Document Type Filtering', () => {
    it('should filter documents by type', async () => {
      const result = await retry(async () => {
        return handleSearchDocuments({ 
          query: 'environment',
          documentType: 'REPORT',
          limit: 10 
        });
      });

      saveMCPResponseFixture('search_documents', 'reports-only', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      // All documents should be of specified type
      response.data.forEach((document: unknown) => {
        validateDocumentStructure(document);
        // Note: API may return different type identifiers
        expect((document as { type: string }).type).toBeDefined();
      });
    }, 30000);
  });

  describe('Date Range Filtering', () => {
    it('should filter documents by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const result = await retry(async () => {
        return handleSearchDocuments({ 
          query: 'policy',
          startDate,
          endDate,
          limit: 10 
        });
      });

      saveMCPResponseFixture('search_documents', 'date-range-2024', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();

      response.data.forEach((document: unknown) => {
        validateDocumentStructure(document);
        // Documents should have dates if available
        if ('date' in (document as object)) {
          const docDate = (document as { date: string }).date;
          expect(docDate >= startDate).toBe(true);
          expect(docDate <= endDate).toBe(true);
        }
      });
    }, 30000);
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const query = 'energy';
      
      const page1 = await retry(async () => {
        return handleSearchDocuments({ query, limit: 5, offset: 0 });
      });
      
      const page2 = await retry(async () => {
        return handleSearchDocuments({ query, limit: 5, offset: 5 });
      });

      const response1 = validatePaginatedResponse(page1);
      const response2 = validatePaginatedResponse(page2);

      // Pages should have different data
      if (response1.data.length > 0 && response2.data.length > 0) {
        expect((response1.data[0] as { id: string }).id).not.toBe(
          (response2.data[0] as { id: string }).id
        );
      }

      // Pagination metadata
      expect(response1.offset).toBe(0);
      expect(response2.offset).toBe(5);
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should reject empty query', async () => {
      await expect(async () => {
        return handleSearchDocuments({ query: '' });
      }).rejects.toThrow();
    }, 10000);

    it('should reject invalid date format', async () => {
      await expect(async () => {
        return handleSearchDocuments({ 
          query: 'test',
          // @ts-expect-error - Testing invalid date format
          startDate: 'invalid-date' 
        });
      }).rejects.toThrow();
    }, 10000);

    it('should reject negative limit', async () => {
      await expect(async () => {
        return handleSearchDocuments({ 
          query: 'test',
          limit: -1 
        });
      }).rejects.toThrow();
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return valid document data', async () => {
      const result = await retry(async () => {
        return handleSearchDocuments({ 
          query: 'agriculture',
          limit: 5 
        });
      });

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
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete API requests within acceptable time', async () => {
      const [, duration] = await measureTime(async () => {
        return retry(async () => handleSearchDocuments({ 
          query: 'transport',
          limit: 10 
        }));
      });

      expect(duration).toBeLessThan(5000);
      console.log(`[Performance] search_documents request: ${duration.toFixed(2)}ms`);
    }, 30000);

    it('should benefit from caching on repeated searches', async () => {
      const params = { query: 'healthcare', limit: 5 };

      // First request
      await retry(async () => handleSearchDocuments(params));

      // Measure second request (should be cached)
      const [, duration] = await measureTime(async () => {
        return handleSearchDocuments(params);
      });

      expect(duration).toBeLessThan(1000);
      console.log(`[Performance] search_documents cached: ${duration.toFixed(2)}ms`);
    }, 60000);
  });

  describe('Data Consistency', () => {
    it('should return consistent results for identical searches', async () => {
      const params = { query: 'education', limit: 5 };

      const result1 = await retry(async () => handleSearchDocuments(params));
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
    }, 60000);
  });
});
