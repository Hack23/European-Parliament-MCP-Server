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
import { parsePaginatedMCPResponse, parseMCPResponse, validateMCPResponse, retryOrSkip } from '../helpers/testUtils.js';

/**
 * E2E test timeout: 65 seconds
 * - API timeout: up to 60s when EP_REQUEST_TIMEOUT_MS=60000 (default 10s / 10000ms)
 * - Test overhead: ~5s (MCP protocol, framework)
 * 
 * Increased from 35s to 65s because European Parliament API can take 30-60+ seconds
 * to respond during peak usage or when data is not cached.
 */
const E2E_TEST_TIMEOUT_MS = 65000;

/**
 * Extended timeout for multi-step workflow tests that make 3+ sequential EP API calls.
 * EP_REQUEST_TIMEOUT_MS=60000 in CI means each call can take up to 60s before timing out.
 * Three sequential successful-but-slow calls can individually take 20-25s each, totalling
 * 60-75s — exceeding E2E_TEST_TIMEOUT_MS.  Using 3× the single-call timeout to be safe.
 */
const E2E_WORKFLOW_TIMEOUT_MS = E2E_TEST_TIMEOUT_MS * 3; // 195s

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
    it('should verify all 45 MCP tools are registered', async () => {
      const tools = await client.listTools();
      const toolNames = tools.map(t => t.name);

      // Core tools (7)
      expect(toolNames).toContain('get_meps');
      expect(toolNames).toContain('get_mep_details');
      expect(toolNames).toContain('get_plenary_sessions');
      expect(toolNames).toContain('get_voting_records');
      expect(toolNames).toContain('search_documents');
      expect(toolNames).toContain('get_committee_info');
      expect(toolNames).toContain('get_parliamentary_questions');

      // Advanced tools (3)
      expect(toolNames).toContain('analyze_voting_patterns');
      expect(toolNames).toContain('track_legislation');
      expect(toolNames).toContain('generate_report');

      // OSINT Phase 1 tools (6)
      expect(toolNames).toContain('assess_mep_influence');
      expect(toolNames).toContain('analyze_coalition_dynamics');
      expect(toolNames).toContain('detect_voting_anomalies');
      expect(toolNames).toContain('compare_political_groups');
      expect(toolNames).toContain('analyze_legislative_effectiveness');
      expect(toolNames).toContain('monitor_legislative_pipeline');

      // OSINT Phase 2 tools (2)
      expect(toolNames).toContain('analyze_committee_activity');
      expect(toolNames).toContain('track_mep_attendance');

      // OSINT Phase 3 tools (2)
      expect(toolNames).toContain('analyze_country_delegation');
      expect(toolNames).toContain('generate_political_landscape');

      // Phase 6 Advanced OSINT tools (4)
      expect(toolNames).toContain('network_analysis');
      expect(toolNames).toContain('sentiment_tracker');
      expect(toolNames).toContain('early_warning_system');
      expect(toolNames).toContain('comparative_intelligence');

      // EP API v2 extended tools (19)
      expect(toolNames).toContain('get_current_meps');
      expect(toolNames).toContain('get_speeches');
      expect(toolNames).toContain('get_adopted_texts');
      expect(toolNames).toContain('get_events');
      expect(toolNames).toContain('get_meeting_activities');
      expect(toolNames).toContain('get_meeting_decisions');
      expect(toolNames).toContain('get_mep_declarations');
      expect(toolNames).toContain('get_incoming_meps');
      expect(toolNames).toContain('get_outgoing_meps');
      expect(toolNames).toContain('get_homonym_meps');
      expect(toolNames).toContain('get_plenary_documents');
      expect(toolNames).toContain('get_committee_documents');
      expect(toolNames).toContain('get_plenary_session_documents');
      expect(toolNames).toContain('get_plenary_session_document_items');
      expect(toolNames).toContain('get_controlled_vocabularies');
      expect(toolNames).toContain('get_external_documents');
      expect(toolNames).toContain('get_meeting_foreseen_activities');
      expect(toolNames).toContain('get_procedure_events');
      expect(toolNames).toContain('get_procedures');

      expect(toolNames.length).toBeGreaterThanOrEqual(45);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_meps tool', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 3 }),
        'get_meps basic'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_plenary_sessions tool', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_plenary_sessions', {
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
          limit: 3
        }),
        'get_plenary_sessions'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_voting_records tool', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_voting_records', {
          dateFrom: '2024-01-01',
          limit: 3
        }),
        'get_voting_records'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute search_documents tool', async () => {
      const response = await retryOrSkip(
        () => client.callTool('search_documents', {
          keyword: 'climate',
          limit: 3
        }),
        'search_documents'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_committee_info tool', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_committee_info', {
          abbreviation: 'ENVI'
        }),
        'get_committee_info'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      const data = parseMCPResponse(response.content); // Non-paginated response
      expect(typeof data).toBe('object');
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute get_parliamentary_questions tool', async () => {
      const response = await retryOrSkip(
        () => client.callTool('get_parliamentary_questions', {
          dateFrom: '2024-01-01',
          limit: 3
        }),
        'get_parliamentary_questions'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      const data = parsePaginatedMCPResponse(response.content);
      expect(Array.isArray(data)).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute analyze_voting_patterns tool', async () => {
      // First get a real MEP ID
      const mepsResponse = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 1 }),
        'get_meps for analyze_voting_patterns'
      );
      if (mepsResponse === undefined) return; // Skipped due to rate limit/timeout
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
      const response = await retryOrSkip(
        () => client.callTool('track_legislation', {
          procedureId: '2024/0006(COD)'
        }),
        'track_legislation'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      const data = parseMCPResponse(response.content); // Non-paginated response
      expect(typeof data).toBe('object');
    }, E2E_TEST_TIMEOUT_MS);

    it('should execute generate_report tool', async () => {
      const response = await retryOrSkip(
        () => client.callTool('generate_report', {
          reportType: 'MEP_ACTIVITY'
        }),
        'generate_report'
      );
      if (response === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(response);
      expect(response.content[0]?.type).toBe('text');
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('Workflow: Research MEP Activity', () => {
    it('should complete MEP research workflow', async () => {
      // Step 1: Get list of MEPs
      const mepsResponse = await retryOrSkip(
        () => client.callTool('get_meps', { country: 'SE', limit: 1 }),
        'get_meps for MEP research workflow'
      );
      if (mepsResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(mepsResponse);
      const meps = parsePaginatedMCPResponse(mepsResponse.content);
      expect(Array.isArray(meps)).toBe(true);

      if (meps.length === 0) {
        console.log('No MEPs available for workflow test');
        return;
      }

      // Step 2: Get MEP details
      const mep = meps[0] as { id: string };
      const detailsResponse = await retryOrSkip(
        () => client.callTool('get_mep_details', { id: mep.id }),
        'get_mep_details in research workflow'
      );
      if (detailsResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(detailsResponse);

      // Step 3: Get voting records
      const votingResponse = await retryOrSkip(
        () => client.callTool('get_voting_records', { mepId: mep.id, limit: 5 }),
        'get_voting_records in research workflow'
      );
      if (votingResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(votingResponse);

      // Step 4: Analyze voting patterns
      const analysisResponse = await retryOrSkip(
        () => client.callTool('analyze_voting_patterns', {
          mepId: mep.id,
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        }),
        'analyze_voting_patterns in research workflow'
      );
      if (analysisResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(analysisResponse);

      // All steps completed successfully
      expect(true).toBe(true);
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('Workflow: Track Legislation', () => {
    it('should complete legislation tracking workflow', async () => {
      // Step 1: Search for documents
      const docsResponse = await retryOrSkip(
        () => client.callTool('search_documents', { keyword: 'climate', limit: 3 }),
        'search_documents in legislation workflow'
      );
      if (docsResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(docsResponse);
      const docs = parsePaginatedMCPResponse(docsResponse.content);
      expect(Array.isArray(docs)).toBe(true);

      // Step 2: Track legislation
      const trackResponse = await retryOrSkip(
        () => client.callTool('track_legislation', { procedureId: '2024/0006(COD)' }),
        'track_legislation in legislation workflow'
      );
      if (trackResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(trackResponse);

      // Step 3: Generate report
      const reportResponse = await retryOrSkip(
        () => client.callTool('generate_report', { reportType: 'LEGISLATION_PROGRESS' }),
        'generate_report in legislation workflow'
      );
      if (reportResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(reportResponse);

      // All steps completed successfully
      expect(true).toBe(true);
    }, E2E_WORKFLOW_TIMEOUT_MS);
  });

  describe('Error Recovery', () => {
    it('should recover from tool errors and continue workflow', async () => {
      // Make a valid call
      const validResponse = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 1 }),
        'get_meps for error recovery (first valid)'
      );
      if (validResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(validResponse);

      // Make an invalid call
      try {
        await client.callTool('get_meps', { limit: 0 });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Make another valid call to verify client still works
      const recoveryResponse = await retryOrSkip(
        () => client.callTool('get_meps', { limit: 1 }),
        'get_meps for error recovery (second valid)'
      );
      if (recoveryResponse === undefined) return; // Skipped due to rate limit/timeout
      validateMCPResponse(recoveryResponse);

      expect(true).toBe(true);
    }, 30000);
  });
});
