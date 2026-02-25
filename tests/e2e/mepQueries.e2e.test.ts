/**
 * MEP Query E2E Tests
 * 
 * End-to-end tests for MEP-related tools via MCP client
 * 
 * ISMS Policy: SC-002 (Secure Testing)
 * Security: Tests validate MCP protocol compliance, input validation, error handling
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MCPTestClient } from './mcpClient.js';
import { parsePaginatedMCPResponse, parseMCPResponse, validateMCPResponse, retryOrSkip } from '../helpers/testUtils.js';
import type { MEP } from '../../src/types/europeanParliament.js';

/**
 * E2E test timeout: 65 seconds
 * - API timeout: up to 60s when EP_REQUEST_TIMEOUT_MS=60000 (default 10s)
 * - Test overhead: ~5s (MCP protocol, framework)
 * 
 * Increased from 35s to 65s because European Parliament API can take 30-60+ seconds
 * to respond during peak usage or when data is not cached.
 */
const E2E_TEST_TIMEOUT_MS = 65000;

describe('MEP Query E2E Tests', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    client = new MCPTestClient();
    await client.connect();
  }, 30000);

  afterAll(async () => {
    if (client) {
      await client.disconnect();
    }
  }, 10000);

  describe('get_meps Tool', () => {
    it('should retrieve MEPs via MCP client', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 5 }),
        'get_meps retrieve'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout

      validateMCPResponse(response);
      expect(response.content).toBeDefined();
      expect(response.content[0]?.type).toBe('text');

      const data = parsePaginatedMCPResponse<MEP>(response.content);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(5);
    }, E2E_TEST_TIMEOUT_MS);

    it('should filter MEPs by country', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_meps', { country: 'SE', limit: 10 }),
        'get_meps filter by country'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout

      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse<MEP>(response.content);

      expect(Array.isArray(data)).toBe(true);
      
      // When filtering by country, results should either match the filter or be 'Unknown'
      // EP API may return 'Unknown' for some MEPs when country data is unavailable
      // This is a known data quality issue with the European Parliament API where:
      // - Some MEP records have incomplete country information
      // - Historical records may not have been fully migrated
      // - Recent appointments may not have complete profile data yet
      // We accept 'Unknown' to avoid test flakiness while still validating the filter works
      data.forEach((mep) => {
        expect(['SE', 'Unknown']).toContain(mep.country);
      });
    }, E2E_TEST_TIMEOUT_MS);

    it('should validate input parameters', async () => {
      await expect(async () => {
        await client.callTool('get_meps', {
          country: 'INVALID' // Invalid country code
        });
      }).rejects.toThrow();
    }, E2E_TEST_TIMEOUT_MS);

    it('should handle pagination parameters', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 3, offset: 0 }),
        'get_meps pagination'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout

      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse<MEP>(response.content);

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(3);
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('get_mep_details Tool', () => {
    it('should retrieve detailed MEP information', async () => {
      // First get a MEP ID
      const listResponse = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 1 }),
        'get_meps for MEP details'
      );
      if (listResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(listResponse);
      const meps = parsePaginatedMCPResponse<MEP>(listResponse.content);
      
      if (meps.length === 0) {
        console.log('No MEPs available for details test');
        return;
      }

      const mepId = meps[0]!.id;

      // Get details
      const detailsResponse = await retryOrSkip(
        () => client.callTool('get_mep_details', { id: mepId }),
        'get_mep_details'
      );
      if (detailsResponse === undefined) return; // Skipped due to rate limit/timeout

      validateMCPResponse(detailsResponse);
      expect(detailsResponse.content[0]?.type).toBe('text');

      const details = parseMCPResponse(detailsResponse.content);
      expect(typeof details).toBe('object');
      expect(details).not.toBeNull();
    }, E2E_TEST_TIMEOUT_MS);

    it('should validate MEP ID format', async () => {
      await expect(async () => {
        await client.callTool('get_mep_details', {
          id: '' // Empty ID
        });
      }).rejects.toThrow();
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('MCP Protocol Compliance', () => {
    it('should list all available tools', async () => {
      const tools = await client.listTools();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);

      // Verify MEP tools are available
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('get_meps');
      expect(toolNames).toContain('get_mep_details');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return valid MCP response format', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 1 }),
        'get_meps MCP format'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout

      // MCP response should have content array
      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content.length).toBeGreaterThan(0);

      // Content items should have type
      response.content.forEach((item) => {
        expect(item).toHaveProperty('type');
        expect(typeof item.type).toBe('string');
      });
    }, E2E_TEST_TIMEOUT_MS);

    it('should handle tool errors with proper error responses', async () => {
      try {
        await client.callTool('get_meps', {
          limit: 0 // Invalid limit
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toBeTruthy();
      }
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('Data Validation', () => {
    it('should return valid MEP data structure', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 5 }),
        'get_meps data validation'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse<MEP>(response.content);

      expect(Array.isArray(data)).toBe(true);
      
      data.forEach((mep) => {
        // Required fields
        expect(typeof mep.id).toBe('string');
        expect(mep.id.length).toBeGreaterThan(0);
        expect(typeof mep.name).toBe('string');
        expect(mep.name.length).toBeGreaterThan(0);
        expect(typeof mep.country).toBe('string');
        // Country should be either 2-letter ISO code or 'Unknown' when data is unavailable
        expect(mep.country).toMatch(/^([A-Z]{2}|Unknown)$/);
      });
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('Error Scenarios', () => {
    it('should reject empty MEP ID', async () => {
      await expect(async () => {
        await client.callTool('get_mep_details', { id: '' });
      }).rejects.toThrow();
    }, E2E_TEST_TIMEOUT_MS);

    it('should reject invalid limit (0)', async () => {
      await expect(async () => {
        await client.callTool('get_meps', { limit: 0 });
      }).rejects.toThrow();
    }, E2E_TEST_TIMEOUT_MS);

    it('should reject invalid limit (negative)', async () => {
      await expect(async () => {
        await client.callTool('get_meps', { limit: -1 });
      }).rejects.toThrow();
    }, E2E_TEST_TIMEOUT_MS);

    it('should reject invalid country code', async () => {
      await expect(async () => {
        await client.callTool('get_meps', { country: 'INVALID_COUNTRY' });
      }).rejects.toThrow();
    }, E2E_TEST_TIMEOUT_MS);

    it('should reject limit exceeding maximum', async () => {
      await expect(async () => {
        await client.callTool('get_meps', { limit: 9999 });
      }).rejects.toThrow();
    }, E2E_TEST_TIMEOUT_MS);

    it('should reject missing required parameter for get_mep_details', async () => {
      await expect(async () => {
        await client.callTool('get_mep_details', {});
      }).rejects.toThrow();
    }, E2E_TEST_TIMEOUT_MS);

    it('should return valid MCP error format on schema violation', async () => {
      try {
        await client.callTool('get_meps', { country: 'NOT_A_VALID_CC' });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBeTruthy();
      }
    }, E2E_TEST_TIMEOUT_MS);

    it('should recover from error and process next valid request', async () => {
      // Invalid request first
      try {
        await client.callTool('get_meps', { limit: 0 });
      } catch {
        // Expected to fail
      }

      // Valid request should still work
      const response = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 1 }),
        'get_meps recovery after error'
      );
      if (response === undefined) return;
      validateMCPResponse(response);
      expect(response.content.length).toBeGreaterThan(0);
    }, E2E_TEST_TIMEOUT_MS);
  });
});
