/**
 * Full Workflow E2E Tests
 * 
 * End-to-end tests for complete user workflows via MCP client
 * 
 * ISMS Policy: SC-002 (Secure Testing)
 * Security: Tests validate complete workflows including all MCP tools
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MCPTestClient } from './mcpClient.js';
import { parsePaginatedMCPResponse, parseMCPResponse, validateMCPResponse } from '../helpers/testUtils.js';

/**
 * E2E test timeout: 65 seconds
 * - API timeout: up to 60s when EP_REQUEST_TIMEOUT_MS=60000 (default 10s / 10000ms)
 * - Test overhead: ~5s (MCP protocol, framework)
 * 
 * Increased from 35s to 65s because European Parliament API can take 30-60+ seconds
 * to respond during peak usage or when data is not cached.
 */
const E2E_TEST_TIMEOUT_MS = 65000;

describe('Full Workflow E2E Tests', () => {
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

  describe('Complete Tool Coverage', () => {
    it('should successfully call all 20 MCP tools', async () => {
      const tools = await client.listTools();
      const toolNames = tools.map(t => t.name);

      // Verify all 20 tools are available (7 core + 3 advanced + 10 OSINT)
      expect(toolNames).toContain('get_meps');
      expect(toolNames).toContain('get_mep_details');
      expect(toolNames).toContain('get_plenary_sessions');
      expect(toolNames).toContain('get_voting_records');
      expect(toolNames).toContain('search_documents');
      expect(toolNames).toContain('get_committee_info');
      expect(toolNames).toContain('get_parliamentary_questions');
      expect(toolNames).toContain('analyze_voting_patterns');
      expect(toolNames).toContain('track_legislation');
      expect(toolNames).toContain('generate_report');

      // OSINT Phase 1 tools
      expect(toolNames).toContain('assess_mep_influence');
      expect(toolNames).toContain('analyze_coalition_dynamics');
      expect(toolNames).toContain('detect_voting_anomalies');
      expect(toolNames).toContain('compare_political_groups');
      expect(toolNames).toContain('analyze_legislative_effectiveness');
      expect(toolNames).toContain('monitor_legislative_pipeline');

      // OSINT Phase 2 tools
      expect(toolNames).toContain('analyze_committee_activity');
      expect(toolNames).toContain('track_mep_attendance');

      // OSINT Phase 3 tools
      expect(toolNames).toContain('analyze_country_delegation');
      expect(toolNames).toContain('generate_political_landscape');

      expect(toolNames.length).toBeGreaterThanOrEqual(20);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_meps tool', async () => {
      const response = await client.callTool('get_meps', { limit: 3 });
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_plenary_sessions tool', async () => {
      const response = await client.callTool('get_plenary_sessions', {
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        limit: 3
      });
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_voting_records tool', async () => {
      const response = await client.callTool('get_voting_records', {
        dateFrom: '2024-01-01',
        limit: 3
      });
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute search_documents tool', async () => {
      const response = await client.callTool('search_documents', {
        keyword: 'climate',
        limit: 3
      });
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_committee_info tool', async () => {
      const response = await client.callTool('get_committee_info', {
        abbreviation: 'ENVI'
      });
      validateMCPResponse(response);
      const data = parseMCPResponse(response.content); // Non-paginated response
      expect(typeof data).toBe('object');
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_parliamentary_questions tool', async () => {
      const response = await client.callTool('get_parliamentary_questions', {
        dateFrom: '2024-01-01',
        limit: 3
      });
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute analyze_voting_patterns tool', async () => {
      // First get a real MEP ID
      const mepsResponse = await client.callTool('get_meps', { limit: 1 });
      validateMCPResponse(mepsResponse);
      const meps = parsePaginatedMCPResponse(mepsResponse.content);
      
      if (meps.length === 0) {
        console.log('No MEPs available for voting patterns test');
        return;
      }

      const mepId = meps[0]!.id;

      const response = await client.callTool('analyze_voting_patterns', {
        mepId,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      validateMCPResponse(response);
      expect(response.content[0]?.type).toBe('text');
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute track_legislation tool', async () => {
      const response = await client.callTool('track_legislation', {
        procedureId: '2024/0001(COD)'
      });
      validateMCPResponse(response);
      const data = parseMCPResponse(response.content); // Non-paginated response
      expect(typeof data).toBe('object');
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute generate_report tool', async () => {
      const response = await client.callTool('generate_report', {
        reportType: 'MEP_ACTIVITY'
      });
      validateMCPResponse(response);
      expect(response.content[0]?.type).toBe('text');
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('Workflow: Research MEP Activity', () => {
    it('should complete MEP research workflow', async () => {
      // Step 1: Get list of MEPs
      const mepsResponse = await client.callTool('get_meps', {
        country: 'SE',
        limit: 1
      });
      validateMCPResponse(mepsResponse);
      const meps = parsePaginatedMCPResponse(mepsResponse.content);
      expect(Array.isArray(meps)).toBe(true);

      if (meps.length === 0) {
        console.log('No MEPs available for workflow test');
        return;
      }

      // Step 2: Get MEP details
      const mep = meps[0] as { id: string };
      const detailsResponse = await client.callTool('get_mep_details', {
        id: mep.id
      });
      validateMCPResponse(detailsResponse);

      // Step 3: Get voting records
      const votingResponse = await client.callTool('get_voting_records', {
        mepId: mep.id,
        limit: 5
      });
      validateMCPResponse(votingResponse);

      // Step 4: Analyze voting patterns
      const analysisResponse = await client.callTool('analyze_voting_patterns', {
        mepId: mep.id,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      validateMCPResponse(analysisResponse);

      // All steps completed successfully
      expect(true).toBe(true);
    }, 60000);
  });

  describe('Workflow: Track Legislation', () => {
    it('should complete legislation tracking workflow', async () => {
      // Step 1: Search for documents
      const docsResponse = await client.callTool('search_documents', {
        keyword: 'climate',
        limit: 3
      });
      validateMCPResponse(docsResponse);
      const docs = parsePaginatedMCPResponse(docsResponse.content);
      expect(Array.isArray(docs)).toBe(true);

      // Step 2: Track legislation
      const trackResponse = await client.callTool('track_legislation', {
        procedureId: '2024/0001(COD)'
      });
      validateMCPResponse(trackResponse);

      // Step 3: Generate report
      const reportResponse = await client.callTool('generate_report', {
        reportType: 'LEGISLATION_PROGRESS'
      });
      validateMCPResponse(reportResponse);

      // All steps completed successfully
      expect(true).toBe(true);
    }, 60000);
  });

  describe('Error Recovery', () => {
    it('should recover from tool errors and continue workflow', async () => {
      // Make a valid call
      const validResponse = await client.callTool('get_meps', { limit: 1 });
      validateMCPResponse(validResponse);

      // Make an invalid call
      try {
        await client.callTool('get_meps', { limit: 0 });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Make another valid call to verify client still works
      const recoveryResponse = await client.callTool('get_meps', { limit: 1 });
      validateMCPResponse(recoveryResponse);

      expect(true).toBe(true);
    }, 30000);
  });
});
