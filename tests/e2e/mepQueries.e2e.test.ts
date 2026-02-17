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
import { parsePaginatedMCPResponse, parseMCPResponse, validateMCPResponse } from '../helpers/testUtils.js';
import type { MEP } from '../../src/types/europeanParliament.js';

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
      const response = await client.callTool('get_meps', {
        limit: 5
      });

      validateMCPResponse(response);
      expect(response.content).toBeDefined();
      expect(response.content[0]?.type).toBe('text');

      const data = parsePaginatedMCPResponse<MEP>(response.content);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(5);
    }, 15000);

    it('should filter MEPs by country', async () => {
      const response = await client.callTool('get_meps', {
        country: 'SE',
        limit: 10
      });

      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse<MEP>(response.content);

      expect(Array.isArray(data)).toBe(true);
      data.forEach((mep) => {
        expect(mep.country).toBe('SE');
      });
    }, 15000);

    it('should validate input parameters', async () => {
      await expect(async () => {
        await client.callTool('get_meps', {
          country: 'INVALID' // Invalid country code
        });
      }).rejects.toThrow();
    }, 15000);

    it('should handle pagination parameters', async () => {
      const response = await client.callTool('get_meps', {
        limit: 3,
        offset: 0
      });

      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse<MEP>(response.content);

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(3);
    }, 15000);
  });

  describe('get_mep_details Tool', () => {
    it('should retrieve detailed MEP information', async () => {
      // First get a MEP ID
      const listResponse = await client.callTool('get_meps', { limit: 1 });
      validateMCPResponse(listResponse);
      const meps = parsePaginatedMCPResponse<MEP>(listResponse.content);
      
      if (meps.length === 0) {
        console.log('No MEPs available for details test');
        return;
      }

      const mepId = meps[0]!.id;

      // Get details
      const detailsResponse = await client.callTool('get_mep_details', {
        id: mepId
      });

      validateMCPResponse(detailsResponse);
      expect(detailsResponse.content[0]?.type).toBe('text');

      const details = parseMCPResponse(detailsResponse.content);
      expect(typeof details).toBe('object');
      expect(details).not.toBeNull();
    }, 15000);

    it('should validate MEP ID format', async () => {
      await expect(async () => {
        await client.callTool('get_mep_details', {
          mepId: '' // Empty ID
        });
      }).rejects.toThrow();
    }, 15000);
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
    }, 15000);

    it('should return valid MCP response format', async () => {
      const response = await client.callTool('get_meps', { limit: 1 });

      // MCP response should have content array
      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content.length).toBeGreaterThan(0);

      // Content items should have type
      response.content.forEach((item) => {
        expect(item).toHaveProperty('type');
        expect(typeof item.type).toBe('string');
      });
    }, 15000);

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
    }, 15000);
  });

  describe('Data Validation', () => {
    it('should return valid MEP data structure', async () => {
      const response = await client.callTool('get_meps', { limit: 5 });
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
        expect(mep.country).toMatch(/^[A-Z]{2}$/);
      });
    }, 15000);
  });
});
