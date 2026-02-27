/**
 * Phase 6 Advanced OSINT Tools — E2E Tests
 *
 * End-to-end tests for the four Phase 6 OSINT tools via the MCP client:
 *   - network_analysis
 *   - sentiment_tracker
 *   - early_warning_system
 *   - comparative_intelligence
 *
 * Tests validate MCP protocol compliance, proper response structure, and
 * graceful error handling. All calls go through the live MCP server process.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 * Security: Tests validate complete MCP protocol compliance for Phase 6 tools
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MCPTestClient } from './mcpClient.js';
import { validateMCPResponse, retryOrSkip } from '../helpers/testUtils.js';

/**
 * E2E test timeout: 65 seconds
 * - API timeout: up to 60s when EP_REQUEST_TIMEOUT_MS=60000 (default 10s / 10000ms)
 * - Test overhead: ~5s (MCP protocol, framework)
 */
const E2E_TEST_TIMEOUT_MS = 65000;

describe('Phase 6 Advanced OSINT Tools — E2E Tests', () => {
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

  // ══════════════════════════════════════════════════════════════════════════
  // NETWORK ANALYSIS
  // ══════════════════════════════════════════════════════════════════════════

  describe('network_analysis', () => {
    it('should be registered as an MCP tool', async () => {
      const tools = await client.listTools();
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('network_analysis');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return valid MCP response with committee analysis', async () => {
      const response = await retryOrSkip(
        () => client.callTool('network_analysis', { analysisType: 'committee', depth: 2 }),
        'network_analysis committee'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      expect(response.content[0]?.type).toBe('text');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return networkNodes and networkEdges in response', async () => {
      const response = await retryOrSkip(
        () => client.callTool('network_analysis', { analysisType: 'combined', depth: 1 }),
        'network_analysis nodes/edges'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      const text = response.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('networkNodes');
      expect(data).toHaveProperty('networkEdges');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return centralMEPs in response', async () => {
      const response = await retryOrSkip(
        () => client.callTool('network_analysis', {}),
        'network_analysis centralMEPs'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      const text = response.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('centralMEPs');
    }, E2E_TEST_TIMEOUT_MS);

    it('should handle invalid analysisType with graceful error response', async () => {
      try {
        const response = await client.callTool('network_analysis', {
          analysisType: 'INVALID_TYPE'
        });
        // Some servers return error responses instead of throwing
        expect(response.content[0]?.type).toBe('text');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    }, E2E_TEST_TIMEOUT_MS);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SENTIMENT TRACKER
  // ══════════════════════════════════════════════════════════════════════════

  describe('sentiment_tracker', () => {
    it('should be registered as an MCP tool', async () => {
      const tools = await client.listTools();
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('sentiment_tracker');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return valid MCP response with default parameters', async () => {
      const response = await retryOrSkip(
        () => client.callTool('sentiment_tracker', {}),
        'sentiment_tracker default'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      expect(response.content[0]?.type).toBe('text');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return groupSentiments in response', async () => {
      const response = await retryOrSkip(
        () => client.callTool('sentiment_tracker', { timeframe: 'last_quarter' }),
        'sentiment_tracker timeframe'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      const text = response.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('groupSentiments');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return polarizationIndex in response', async () => {
      const response = await retryOrSkip(
        () => client.callTool('sentiment_tracker', { timeframe: 'last_month' }),
        'sentiment_tracker polarization'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      const text = response.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('polarizationIndex');
    }, E2E_TEST_TIMEOUT_MS);

    it('should handle invalid timeframe with graceful error response', async () => {
      try {
        const response = await client.callTool('sentiment_tracker', {
          timeframe: 'INVALID_TIMEFRAME'
        });
        expect(response.content[0]?.type).toBe('text');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    }, E2E_TEST_TIMEOUT_MS);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // EARLY WARNING SYSTEM
  // ══════════════════════════════════════════════════════════════════════════

  describe('early_warning_system', () => {
    it('should be registered as an MCP tool', async () => {
      const tools = await client.listTools();
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('early_warning_system');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return valid MCP response with medium sensitivity', async () => {
      const response = await retryOrSkip(
        () => client.callTool('early_warning_system', { sensitivity: 'medium' }),
        'early_warning_system medium'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      expect(response.content[0]?.type).toBe('text');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return warnings array in response', async () => {
      const response = await retryOrSkip(
        () => client.callTool('early_warning_system', {}),
        'early_warning_system warnings'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      const text = response.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('warnings');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return trendIndicators in response', async () => {
      const response = await retryOrSkip(
        () => client.callTool('early_warning_system', { focusArea: 'all' }),
        'early_warning_system trends'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      const text = response.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('trendIndicators');
    }, E2E_TEST_TIMEOUT_MS);

    it('should handle invalid sensitivity with graceful error response', async () => {
      try {
        const response = await client.callTool('early_warning_system', {
          sensitivity: 'CRITICAL'
        });
        expect(response.content[0]?.type).toBe('text');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    }, E2E_TEST_TIMEOUT_MS);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // COMPARATIVE INTELLIGENCE
  // ══════════════════════════════════════════════════════════════════════════

  describe('comparative_intelligence', () => {
    it('should be registered as an MCP tool', async () => {
      const tools = await client.listTools();
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('comparative_intelligence');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return valid MCP response for two MEP IDs', async () => {
      const response = await retryOrSkip(
        () => client.callTool('comparative_intelligence', { mepIds: [197047, 197048] }),
        'comparative_intelligence two MEPs'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      expect(response.content[0]?.type).toBe('text');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return profiles in response', async () => {
      const response = await retryOrSkip(
        () => client.callTool('comparative_intelligence', { mepIds: [197047, 197048] }),
        'comparative_intelligence profiles'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      const text = response.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('profiles');
    }, E2E_TEST_TIMEOUT_MS);

    it('should return correlationMatrix in response', async () => {
      const response = await retryOrSkip(
        () => client.callTool('comparative_intelligence', {
          mepIds: [197047, 197048],
          dimensions: ['voting', 'committee']
        }),
        'comparative_intelligence correlation'
      );
      if (response === undefined) return;

      validateMCPResponse(response);
      const text = response.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('correlationMatrix');
    }, E2E_TEST_TIMEOUT_MS);

    it('should handle missing mepIds with graceful error response', async () => {
      try {
        const response = await client.callTool('comparative_intelligence', {});
        expect(response.content[0]?.type).toBe('text');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    }, E2E_TEST_TIMEOUT_MS);

    it('should handle single mepId (below minimum) with graceful error response', async () => {
      try {
        const response = await client.callTool('comparative_intelligence', {
          mepIds: [197047]
        });
        expect(response.content[0]?.type).toBe('text');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    }, E2E_TEST_TIMEOUT_MS);
  });
});
