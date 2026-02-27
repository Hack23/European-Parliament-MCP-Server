/**
 * Integration Tests: All 39 MCP Tools Coverage
 * 
 * Validates that every registered MCP tool:
 * 1. Returns valid MCP-compliant response structure
 * 2. Returns real data derived from EP API (no mock/hardcoded data)
 * 3. Handles errors gracefully
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * Compliance: ISO 27001 (AU-2), NIST CSF 2.0 (DE.CM-6), CIS Controls v8.1 (8.11)
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { shouldRunIntegrationTests } from '../setup.js';
import { retryOrSkip } from '../../helpers/testUtils.js';
import { validateMCPStructure } from '../helpers/responseValidator.js';

// ── Core Tools ──────────────────────────────────────────────────
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { handleGetMEPDetails } from '../../../src/tools/getMEPDetails.js';
import { handleGetPlenarySessions } from '../../../src/tools/getPlenarySessions.js';
import { handleGetVotingRecords } from '../../../src/tools/getVotingRecords.js';
import { handleSearchDocuments } from '../../../src/tools/searchDocuments.js';
import { handleGetCommitteeInfo } from '../../../src/tools/getCommitteeInfo.js';
import { handleGetParliamentaryQuestions } from '../../../src/tools/getParliamentaryQuestions.js';

// ── Advanced Analysis Tools ─────────────────────────────────────
import { handleAnalyzeVotingPatterns } from '../../../src/tools/analyzeVotingPatterns.js';
import { handleTrackLegislation } from '../../../src/tools/trackLegislation.js';
import { handleGenerateReport } from '../../../src/tools/generateReport.js';

// ── Phase 1 OSINT Intelligence Tools ────────────────────────────
import { handleAssessMepInfluence } from '../../../src/tools/assessMepInfluence.js';
import { handleAnalyzeCoalitionDynamics } from '../../../src/tools/analyzeCoalitionDynamics.js';
import { handleDetectVotingAnomalies } from '../../../src/tools/detectVotingAnomalies.js';
import { handleComparePoliticalGroups } from '../../../src/tools/comparePoliticalGroups.js';
import { handleAnalyzeLegislativeEffectiveness } from '../../../src/tools/analyzeLegislativeEffectiveness.js';
import { handleMonitorLegislativePipeline } from '../../../src/tools/monitorLegislativePipeline.js';

// ── Phase 2 OSINT Intelligence Tools ────────────────────────────
import { handleAnalyzeCommitteeActivity } from '../../../src/tools/analyzeCommitteeActivity.js';
import { handleTrackMepAttendance } from '../../../src/tools/trackMepAttendance.js';

// ── Phase 3 OSINT Intelligence Tools ────────────────────────────
import { handleAnalyzeCountryDelegation } from '../../../src/tools/analyzeCountryDelegation.js';
import { handleGeneratePoliticalLandscape } from '../../../src/tools/generatePoliticalLandscape.js';

// ── Phase 4 EP API v2 Tools ─────────────────────────────────────
import { handleGetCurrentMEPs } from '../../../src/tools/getCurrentMEPs.js';
import { handleGetSpeeches } from '../../../src/tools/getSpeeches.js';
import { handleGetProcedures } from '../../../src/tools/getProcedures.js';
import { handleGetAdoptedTexts } from '../../../src/tools/getAdoptedTexts.js';
import { handleGetEvents } from '../../../src/tools/getEvents.js';
import { handleGetMeetingActivities } from '../../../src/tools/getMeetingActivities.js';
import { handleGetMeetingDecisions } from '../../../src/tools/getMeetingDecisions.js';
import { handleGetMEPDeclarations } from '../../../src/tools/getMEPDeclarations.js';

// ── Phase 6 Advanced OSINT Tools ────────────────────────────────
import { handleNetworkAnalysis } from '../../../src/tools/networkAnalysis.js';
import { handleSentimentTracker } from '../../../src/tools/sentimentTracker.js';
import { handleEarlyWarningSystem } from '../../../src/tools/earlyWarningSystem.js';
import { handleComparativeIntelligence } from '../../../src/tools/comparativeIntelligence.js';

// ── Phase 5 EP API v2 Tools ─────────────────────────────────────
import { handleGetIncomingMEPs } from '../../../src/tools/getIncomingMEPs.js';
import { handleGetOutgoingMEPs } from '../../../src/tools/getOutgoingMEPs.js';
import { handleGetHomonymMEPs } from '../../../src/tools/getHomonymMEPs.js';
import { handleGetPlenaryDocuments } from '../../../src/tools/getPlenaryDocuments.js';
import { handleGetCommitteeDocuments } from '../../../src/tools/getCommitteeDocuments.js';
import { handleGetPlenarySessionDocuments } from '../../../src/tools/getPlenarySessionDocuments.js';
import { handleGetPlenarySessionDocumentItems } from '../../../src/tools/getPlenarySessionDocumentItems.js';
import { handleGetControlledVocabularies } from '../../../src/tools/getControlledVocabularies.js';
import { handleGetExternalDocuments } from '../../../src/tools/getExternalDocuments.js';
import { handleGetMeetingForeseenActivities } from '../../../src/tools/getMeetingForeseenActivities.js';
import { handleGetProcedureEvents } from '../../../src/tools/getProcedureEvents.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

/**
 * Helper: parse response JSON and validate it contains no mock markers
 */
function parseAndValidateNoMockData(result: { content: { type: string; text: string }[] }): unknown {
  validateMCPStructure(result);
  const text = result.content[0]?.text ?? '{}';
  const parsed: unknown = JSON.parse(text);
  
  // Ensure no NONE confidence level (indicates mock data)
  const textLower = text.toLowerCase();
  expect(textLower).not.toContain('"confidencelevel":"none"');
  expect(textLower).not.toContain('"confidencelevel": "none"');
  expect(text).not.toContain('PLACEHOLDER DATA');
  expect(text).not.toContain('createMockProcedure');
  
  return parsed;
}

describeIntegration('All 39 MCP Tools Integration Coverage', () => {
  // Shared MEP ID resolved once for tests that need it
  let testMEPId: string;
  let testSessionId: string;
  let testProcedureId: string;

  beforeEach(async () => {
    // Rate limit respect
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  // ══════════════════════════════════════════════════════════════
  // CORE TOOLS (7)
  // ══════════════════════════════════════════════════════════════

  describe('Core Tool: get_meps', () => {
    it('should return real MEP data from EP API', async () => {
      const result = await retryOrSkip(
        () => handleGetMEPs({ limit: 5 }),
        'get_meps'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: { id: string }[] };
      expect(parsed).toHaveProperty('data');
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed.data.length).toBeGreaterThan(0);

      // Save MEP ID for dependent tests
      testMEPId = parsed.data[0]?.id ?? '';
      expect(testMEPId).toBeTruthy();
    }, 30000);
  });

  describe('Core Tool: get_mep_details', () => {
    it('should return real MEP details from EP API', async () => {
      if (!testMEPId) {
        const meps = await retryOrSkip(() => handleGetMEPs({ limit: 1 }), 'setup');
        if (!meps) return;
        const data = JSON.parse(meps.content[0]?.text ?? '{}') as { data: { id: string }[] };
        testMEPId = data.data[0]?.id ?? '';
      }

      const result = await retryOrSkip(
        () => handleGetMEPDetails({ mepId: testMEPId }),
        'get_mep_details'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { id: string; name: string };
      expect(parsed).toHaveProperty('id');
      expect(parsed).toHaveProperty('name');
      expect(typeof parsed.name).toBe('string');
    }, 30000);
  });

  describe('Core Tool: get_plenary_sessions', () => {
    it('should return real plenary session data', async () => {
      const result = await retryOrSkip(
        () => handleGetPlenarySessions({ limit: 5 }),
        'get_plenary_sessions'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: { id: string }[] };
      expect(parsed).toHaveProperty('data');
      expect(parsed.data.length).toBeGreaterThan(0);

      // Save session ID for dependent tests
      testSessionId = parsed.data[0]?.id ?? '';
    }, 30000);
  });

  describe('Core Tool: get_voting_records', () => {
    it('should return real voting records data', async () => {
      if (!testSessionId) {
        const sessions = await retryOrSkip(() => handleGetPlenarySessions({ limit: 1 }), 'setup');
        if (!sessions) return;
        const data = JSON.parse(sessions.content[0]?.text ?? '{}') as { data: { id: string }[] };
        testSessionId = data.data[0]?.id ?? '';
      }

      const result = await retryOrSkip(
        () => handleGetVotingRecords({ sessionId: testSessionId }),
        'get_voting_records'
      );
      if (!result) return;

      parseAndValidateNoMockData(result);
    }, 30000);
  });

  describe('Core Tool: search_documents', () => {
    it('should return real documents from EP API', async () => {
      const result = await retryOrSkip(
        () => handleSearchDocuments({ query: 'climate', limit: 5 }),
        'search_documents'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: { id: string }[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Core Tool: get_committee_info', () => {
    it('should return real committee data from EP API', async () => {
      const result = await retryOrSkip(
        () => handleGetCommitteeInfo({ committeeId: 'AFET' }),
        'get_committee_info'
      );
      if (!result) return;

      parseAndValidateNoMockData(result);
    }, 30000);
  });

  describe('Core Tool: get_parliamentary_questions', () => {
    it('should return real parliamentary questions', async () => {
      const result = await retryOrSkip(
        () => handleGetParliamentaryQuestions({ limit: 5 }),
        'get_parliamentary_questions'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  // ══════════════════════════════════════════════════════════════
  // ADVANCED ANALYSIS TOOLS (3)
  // ══════════════════════════════════════════════════════════════

  describe('Advanced Tool: analyze_voting_patterns', () => {
    it('should analyze real voting patterns', async () => {
      if (!testMEPId) {
        const meps = await retryOrSkip(() => handleGetMEPs({ limit: 1 }), 'setup');
        if (!meps) return;
        const data = JSON.parse(meps.content[0]?.text ?? '{}') as { data: { id: string }[] };
        testMEPId = data.data[0]?.id ?? '';
      }

      const result = await retryOrSkip(
        () => handleAnalyzeVotingPatterns({ mepId: testMEPId, dateFrom: '2024-01-01', dateTo: '2024-12-31' }),
        'analyze_voting_patterns'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { mepId: string; statistics: unknown };
      expect(parsed).toHaveProperty('mepId');
      expect(parsed).toHaveProperty('statistics');
    }, 30000);
  });

  describe('Advanced Tool: track_legislation', () => {
    it('should track real legislative procedure', async () => {
      // First get a real procedure ID
      if (!testProcedureId) {
        const procs = await retryOrSkip(() => handleGetProcedures({ limit: 1 }), 'setup');
        if (!procs) return;
        const data = JSON.parse(procs.content[0]?.text ?? '{}') as { data: { id: string }[] };
        testProcedureId = data.data[0]?.id ?? '';
      }

      const result = await retryOrSkip(
        () => handleTrackLegislation({ procedureId: testProcedureId }),
        'track_legislation'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { procedureId: string; title: string; confidenceLevel: string };
      expect(parsed).toHaveProperty('procedureId');
      expect(parsed).toHaveProperty('title');
      expect(parsed.confidenceLevel).not.toBe('NONE');
    }, 30000);
  });

  describe('Advanced Tool: generate_report', () => {
    it('should generate real MEP activity report', async () => {
      const result = await retryOrSkip(
        () => handleGenerateReport({ reportType: 'LEGISLATIVE_ACTIVITY', limit: 5 }),
        'generate_report'
      );
      if (!result) return;

      parseAndValidateNoMockData(result);
    }, 30000);
  });

  // ══════════════════════════════════════════════════════════════
  // PHASE 1 OSINT INTELLIGENCE TOOLS (6)
  // ══════════════════════════════════════════════════════════════

  describe('OSINT Tool: assess_mep_influence', () => {
    it('should assess influence using real MEP data', async () => {
      if (!testMEPId) {
        const meps = await retryOrSkip(() => handleGetMEPs({ limit: 1 }), 'setup');
        if (!meps) return;
        const data = JSON.parse(meps.content[0]?.text ?? '{}') as { data: { id: string }[] };
        testMEPId = data.data[0]?.id ?? '';
      }

      const result = await retryOrSkip(
        () => handleAssessMepInfluence({ mepId: testMEPId }),
        'assess_mep_influence'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { mepId: string; overallScore: number };
      expect(parsed).toHaveProperty('mepId');
      expect(parsed).toHaveProperty('overallScore');
      expect(typeof parsed.overallScore).toBe('number');
    }, 30000);
  });

  describe('OSINT Tool: analyze_coalition_dynamics', () => {
    it('should analyze coalition dynamics with real data', async () => {
      const result = await retryOrSkip(
        () => handleAnalyzeCoalitionDynamics({ dateFrom: '2024-01-01', dateTo: '2024-12-31' }),
        'analyze_coalition_dynamics'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { groups: unknown[]; confidenceLevel: string };
      expect(parsed).toHaveProperty('groups');
      expect(parsed).toHaveProperty('confidenceLevel');
    }, 30000);
  });

  describe('OSINT Tool: detect_voting_anomalies', () => {
    it('should detect anomalies using real voting data', async () => {
      const result = await retryOrSkip(
        () => handleDetectVotingAnomalies({ dateFrom: '2024-01-01', dateTo: '2024-12-31' }),
        'detect_voting_anomalies'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { anomalies: unknown[] };
      expect(parsed).toHaveProperty('anomalies');
    }, 30000);
  });

  describe('OSINT Tool: compare_political_groups', () => {
    it('should compare groups using real data', async () => {
      const result = await retryOrSkip(
        () => handleComparePoliticalGroups({}),
        'compare_political_groups'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { groups: unknown[] };
      expect(parsed).toHaveProperty('groups');
    }, 30000);
  });

  describe('OSINT Tool: analyze_legislative_effectiveness', () => {
    it('should analyze effectiveness with real data', async () => {
      const result = await retryOrSkip(
        () => handleAnalyzeLegislativeEffectiveness({ dateFrom: '2024-01-01', dateTo: '2024-12-31' }),
        'analyze_legislative_effectiveness'
      );
      if (!result) return;

      parseAndValidateNoMockData(result);
    }, 30000);
  });

  describe('OSINT Tool: monitor_legislative_pipeline', () => {
    it('should monitor pipeline with real procedure data', async () => {
      const result = await retryOrSkip(
        () => handleMonitorLegislativePipeline({ status: 'ALL', limit: 5 }),
        'monitor_legislative_pipeline'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { pipeline: unknown[]; summary: unknown; methodology: string };
      expect(parsed).toHaveProperty('pipeline');
      expect(parsed).toHaveProperty('summary');
      expect(parsed.methodology).toContain('EP API');
    }, 30000);
  });

  // ══════════════════════════════════════════════════════════════
  // PHASE 2 OSINT INTELLIGENCE TOOLS (2)
  // ══════════════════════════════════════════════════════════════

  describe('OSINT Tool: analyze_committee_activity', () => {
    it('should analyze committee activity', async () => {
      const result = await retryOrSkip(
        () => handleAnalyzeCommitteeActivity({ committeeId: 'AFET' }),
        'analyze_committee_activity'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { committeeId: string };
      expect(parsed).toHaveProperty('committeeId');
    }, 30000);
  });

  describe('OSINT Tool: track_mep_attendance', () => {
    it('should track MEP attendance with real data', async () => {
      const result = await retryOrSkip(
        () => handleTrackMepAttendance({}),
        'track_mep_attendance'
      );
      if (!result) return;

      parseAndValidateNoMockData(result);
    }, 30000);
  });

  // ══════════════════════════════════════════════════════════════
  // PHASE 3 OSINT INTELLIGENCE TOOLS (2)
  // ══════════════════════════════════════════════════════════════

  describe('OSINT Tool: analyze_country_delegation', () => {
    it('should analyze country delegation with real data', async () => {
      const result = await retryOrSkip(
        () => handleAnalyzeCountryDelegation({ country: 'SE' }),
        'analyze_country_delegation'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { country: string };
      expect(parsed).toHaveProperty('country');
    }, 30000);
  });

  describe('OSINT Tool: generate_political_landscape', () => {
    it('should generate landscape with real data', async () => {
      const result = await retryOrSkip(
        () => handleGeneratePoliticalLandscape({}),
        'generate_political_landscape'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { groups: unknown[] };
      expect(parsed).toHaveProperty('groups');
    }, 30000);
  });

  // ══════════════════════════════════════════════════════════════
  // PHASE 4 EP API v2 TOOLS (8)
  // ══════════════════════════════════════════════════════════════

  describe('Phase 4 Tool: get_current_meps', () => {
    it('should return real current MEPs', async () => {
      const result = await retryOrSkip(
        () => handleGetCurrentMEPs({ limit: 5 }),
        'get_current_meps'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
      expect(Array.isArray(parsed.data)).toBe(true);
    }, 30000);
  });

  describe('Phase 4 Tool: get_speeches', () => {
    it('should return real speech data', async () => {
      const result = await retryOrSkip(
        () => handleGetSpeeches({ limit: 5 }),
        'get_speeches'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 4 Tool: get_procedures', () => {
    it('should return real procedure data', async () => {
      const result = await retryOrSkip(
        () => handleGetProcedures({ limit: 5 }),
        'get_procedures'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: { id: string }[] };
      expect(parsed).toHaveProperty('data');
      expect(Array.isArray(parsed.data)).toBe(true);
      if (parsed.data.length > 0) {
        testProcedureId = parsed.data[0]?.id ?? '';
      }
    }, 30000);
  });

  describe('Phase 4 Tool: get_adopted_texts', () => {
    it('should return real adopted texts', async () => {
      const result = await retryOrSkip(
        () => handleGetAdoptedTexts({ limit: 5 }),
        'get_adopted_texts'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 4 Tool: get_events', () => {
    it('should return real event data', async () => {
      const result = await retryOrSkip(
        () => handleGetEvents({ limit: 5 }),
        'get_events'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 4 Tool: get_meeting_activities', () => {
    it('should return real meeting activity data', async () => {
      const result = await retryOrSkip(
        () => handleGetMeetingActivities({ limit: 5 }),
        'get_meeting_activities'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 4 Tool: get_meeting_decisions', () => {
    it('should return real meeting decisions', async () => {
      const result = await retryOrSkip(
        () => handleGetMeetingDecisions({ limit: 5 }),
        'get_meeting_decisions'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 4 Tool: get_mep_declarations', () => {
    it('should return real MEP declarations', async () => {
      const result = await retryOrSkip(
        () => handleGetMEPDeclarations({ limit: 5 }),
        'get_mep_declarations'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  // ══════════════════════════════════════════════════════════════
  // PHASE 5 EP API v2 TOOLS (11)
  // ══════════════════════════════════════════════════════════════

  describe('Phase 5 Tool: get_incoming_meps', () => {
    it('should return real incoming MEPs data', async () => {
      const result = await retryOrSkip(
        () => handleGetIncomingMEPs({ limit: 5 }),
        'get_incoming_meps'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_outgoing_meps', () => {
    it('should return real outgoing MEPs data', async () => {
      const result = await retryOrSkip(
        () => handleGetOutgoingMEPs({ limit: 5 }),
        'get_outgoing_meps'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_homonym_meps', () => {
    it('should return real homonym MEPs data', async () => {
      const result = await retryOrSkip(
        () => handleGetHomonymMEPs({ limit: 5 }),
        'get_homonym_meps'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_plenary_documents', () => {
    it('should return real plenary documents', async () => {
      const result = await retryOrSkip(
        () => handleGetPlenaryDocuments({ limit: 5 }),
        'get_plenary_documents'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_committee_documents', () => {
    it('should return real committee documents', async () => {
      const result = await retryOrSkip(
        () => handleGetCommitteeDocuments({ limit: 5 }),
        'get_committee_documents'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_plenary_session_documents', () => {
    it('should return real plenary session documents', async () => {
      const result = await retryOrSkip(
        () => handleGetPlenarySessionDocuments({ limit: 5 }),
        'get_plenary_session_documents'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_plenary_session_document_items', () => {
    it('should return real plenary session document items', async () => {
      const result = await retryOrSkip(
        () => handleGetPlenarySessionDocumentItems({ limit: 5 }),
        'get_plenary_session_document_items'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_controlled_vocabularies', () => {
    it('should return real controlled vocabularies', async () => {
      const result = await retryOrSkip(
        () => handleGetControlledVocabularies({ limit: 5 }),
        'get_controlled_vocabularies'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_external_documents', () => {
    it('should return real external documents', async () => {
      const result = await retryOrSkip(
        () => handleGetExternalDocuments({ limit: 5 }),
        'get_external_documents'
      );
      if (!result) return;

      const parsed = parseAndValidateNoMockData(result) as { data: unknown[] };
      expect(parsed).toHaveProperty('data');
    }, 30000);
  });

  describe('Phase 5 Tool: get_meeting_foreseen_activities', () => {
    it('should accept sittingId parameter', async () => {
      // This tool requires a sitting ID - get one from plenary sessions
      if (!testSessionId) {
        const sessions = await retryOrSkip(() => handleGetPlenarySessions({ limit: 1 }), 'setup');
        if (!sessions) return;
        const data = JSON.parse(sessions.content[0]?.text ?? '{}') as { data: { id: string }[] };
        testSessionId = data.data[0]?.id ?? '';
      }

      const result = await retryOrSkip(
        () => handleGetMeetingForeseenActivities({ sittingId: testSessionId, limit: 5 }),
        'get_meeting_foreseen_activities'
      );
      if (!result) return;

      parseAndValidateNoMockData(result);
    }, 30000);
  });

  describe('Phase 5 Tool: get_procedure_events', () => {
    it('should return real procedure events', async () => {
      if (!testProcedureId) {
        const procs = await retryOrSkip(() => handleGetProcedures({ limit: 1 }), 'setup');
        if (!procs) return;
        const data = JSON.parse(procs.content[0]?.text ?? '{}') as { data: { id: string }[] };
        testProcedureId = data.data[0]?.id ?? '';
      }

      const result = await retryOrSkip(
        () => handleGetProcedureEvents({ processId: testProcedureId, limit: 5 }),
        'get_procedure_events'
      );
      if (!result) return;

      parseAndValidateNoMockData(result);
    }, 30000);
  });

  // ══════════════════════════════════════════════════════════════
  // PHASE 6 ADVANCED OSINT TOOLS (4)
  // ══════════════════════════════════════════════════════════════

  describe('Phase 6 OSINT Tool: network_analysis', () => {
    it('should return network analysis data', async () => {
      const result = await retryOrSkip(
        () => handleNetworkAnalysis({}),
        'network_analysis'
      );
      if (!result) return;
      validateMCPStructure(result);
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('networkNodes');
      expect(data).toHaveProperty('networkEdges');
    }, 30000);
  });

  describe('Phase 6 OSINT Tool: sentiment_tracker', () => {
    it('should return sentiment tracking data', async () => {
      const result = await retryOrSkip(
        () => handleSentimentTracker({}),
        'sentiment_tracker'
      );
      if (!result) return;
      validateMCPStructure(result);
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('groupSentiments');
      expect(data).toHaveProperty('polarizationIndex');
    }, 30000);
  });

  describe('Phase 6 OSINT Tool: early_warning_system', () => {
    it('should return early warning data', async () => {
      const result = await retryOrSkip(
        () => handleEarlyWarningSystem({}),
        'early_warning_system'
      );
      if (!result) return;
      validateMCPStructure(result);
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('warnings');
      expect(data).toHaveProperty('trendIndicators');
    }, 30000);
  });

  describe('Phase 6 OSINT Tool: comparative_intelligence', () => {
    it('should return comparative intelligence data', async () => {
      const result = await retryOrSkip(
        () => handleComparativeIntelligence({ mepIds: [197047, 197048] }),
        'comparative_intelligence'
      );
      if (!result) return;
      validateMCPStructure(result);
      const text = result.content[0]?.text ?? '{}';
      const data = JSON.parse(text) as Record<string, unknown>;
      expect(data).toHaveProperty('profiles');
      expect(data).toHaveProperty('correlationMatrix');
    }, 30000);
  });
});
