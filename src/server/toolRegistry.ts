/**
 * MCP tool registry – metadata and dispatch.
 *
 * Centralizes the mapping between tool names, their metadata (name,
 * description, inputSchema) and the handler functions that execute
 * tool calls. The {@link getToolMetadataArray} function feeds the
 * MCP `ListTools` response, while {@link dispatchToolCall} routes
 * incoming `CallTool` requests to the correct handler.
 *
 * @module server/toolRegistry
 */

// ── Core tool imports ─────────────────────────────────────────────
import { handleGetMEPs, getMEPsToolMetadata } from '../tools/getMEPs.js';
import { handleGetMEPDetails, getMEPDetailsToolMetadata } from '../tools/getMEPDetails.js';
import { handleGetPlenarySessions, getPlenarySessionsToolMetadata } from '../tools/getPlenarySessions.js';
import { handleGetVotingRecords, getVotingRecordsToolMetadata } from '../tools/getVotingRecords.js';
import { handleSearchDocuments, searchDocumentsToolMetadata } from '../tools/searchDocuments.js';
import { handleGetCommitteeInfo, getCommitteeInfoToolMetadata } from '../tools/getCommitteeInfo.js';
import { handleGetParliamentaryQuestions, getParliamentaryQuestionsToolMetadata } from '../tools/getParliamentaryQuestions.js';

// ── Advanced analysis tool imports ────────────────────────────────
import { handleAnalyzeVotingPatterns, analyzeVotingPatternsToolMetadata } from '../tools/analyzeVotingPatterns.js';
import { handleTrackLegislation, trackLegislationToolMetadata } from '../tools/trackLegislation.js';
import { handleGenerateReport, generateReportToolMetadata } from '../tools/generateReport.js';

// ── Phase 1 OSINT Intelligence Tools ──────────────────────────────
import { handleAssessMepInfluence, assessMepInfluenceToolMetadata } from '../tools/assessMepInfluence.js';
import { handleAnalyzeCoalitionDynamics, analyzeCoalitionDynamicsToolMetadata } from '../tools/analyzeCoalitionDynamics.js';
import { handleDetectVotingAnomalies, detectVotingAnomaliesToolMetadata } from '../tools/detectVotingAnomalies.js';
import { handleComparePoliticalGroups, comparePoliticalGroupsToolMetadata } from '../tools/comparePoliticalGroups.js';
import { handleAnalyzeLegislativeEffectiveness, analyzeLegislativeEffectivenessToolMetadata } from '../tools/analyzeLegislativeEffectiveness.js';
import { handleMonitorLegislativePipeline, monitorLegislativePipelineToolMetadata } from '../tools/monitorLegislativePipeline.js';

// ── Phase 2 OSINT Intelligence Tools ──────────────────────────────
import { handleAnalyzeCommitteeActivity, analyzeCommitteeActivityToolMetadata } from '../tools/analyzeCommitteeActivity.js';
import { handleTrackMepAttendance, trackMepAttendanceToolMetadata } from '../tools/trackMepAttendance.js';

// ── Phase 3 OSINT Intelligence Tools ──────────────────────────────
import { handleAnalyzeCountryDelegation, analyzeCountryDelegationToolMetadata } from '../tools/analyzeCountryDelegation.js';
import { handleGeneratePoliticalLandscape, generatePoliticalLandscapeToolMetadata } from '../tools/generatePoliticalLandscape.js';

// ── Phase 4 – New EP API v2 endpoint tools ────────────────────────
import { handleGetCurrentMEPs, getCurrentMEPsToolMetadata } from '../tools/getCurrentMEPs.js';
import { handleGetSpeeches, getSpeechesToolMetadata } from '../tools/getSpeeches.js';
import { handleGetProcedures, getProceduresToolMetadata } from '../tools/getProcedures.js';
import { handleGetAdoptedTexts, getAdoptedTextsToolMetadata } from '../tools/getAdoptedTexts.js';
import { handleGetEvents, getEventsToolMetadata } from '../tools/getEvents.js';
import { handleGetMeetingActivities, getMeetingActivitiesToolMetadata } from '../tools/getMeetingActivities.js';
import { handleGetMeetingDecisions, getMeetingDecisionsToolMetadata } from '../tools/getMeetingDecisions.js';
import { handleGetMEPDeclarations, getMEPDeclarationsToolMetadata } from '../tools/getMEPDeclarations.js';

// ── Phase 5 – Complete EP API v2 coverage tools ───────────────────
import { handleGetIncomingMEPs, getIncomingMEPsToolMetadata } from '../tools/getIncomingMEPs.js';
import { handleGetOutgoingMEPs, getOutgoingMEPsToolMetadata } from '../tools/getOutgoingMEPs.js';
import { handleGetHomonymMEPs, getHomonymMEPsToolMetadata } from '../tools/getHomonymMEPs.js';
import { handleGetPlenaryDocuments, getPlenaryDocumentsToolMetadata } from '../tools/getPlenaryDocuments.js';
import { handleGetCommitteeDocuments, getCommitteeDocumentsToolMetadata } from '../tools/getCommitteeDocuments.js';
import { handleGetPlenarySessionDocuments, getPlenarySessionDocumentsToolMetadata } from '../tools/getPlenarySessionDocuments.js';
import { handleGetPlenarySessionDocumentItems, getPlenarySessionDocumentItemsToolMetadata } from '../tools/getPlenarySessionDocumentItems.js';
import { handleGetControlledVocabularies, getControlledVocabulariesToolMetadata } from '../tools/getControlledVocabularies.js';
import { handleGetExternalDocuments, getExternalDocumentsToolMetadata } from '../tools/getExternalDocuments.js';
import { handleGetMeetingForeseenActivities, getMeetingForeseenActivitiesToolMetadata } from '../tools/getMeetingForeseenActivities.js';
import { handleGetProcedureEvents, getProcedureEventsToolMetadata } from '../tools/getProcedureEvents.js';

/** Tool result shape returned by every handler */
export interface ToolResult { content: { type: string; text: string }[] }

/**
 * Returns the full ordered list of tool metadata for the MCP `ListTools` response.
 */
export function getToolMetadataArray(): { name: string; description: string; inputSchema: unknown }[] {
  return [
    // Core tools
    getMEPsToolMetadata,
    getMEPDetailsToolMetadata,
    getPlenarySessionsToolMetadata,
    getVotingRecordsToolMetadata,
    searchDocumentsToolMetadata,
    getCommitteeInfoToolMetadata,
    getParliamentaryQuestionsToolMetadata,
    // Advanced analysis tools
    analyzeVotingPatternsToolMetadata,
    trackLegislationToolMetadata,
    generateReportToolMetadata,
    // Phase 1 OSINT Intelligence Tools
    assessMepInfluenceToolMetadata,
    analyzeCoalitionDynamicsToolMetadata,
    detectVotingAnomaliesToolMetadata,
    comparePoliticalGroupsToolMetadata,
    analyzeLegislativeEffectivenessToolMetadata,
    monitorLegislativePipelineToolMetadata,
    // Phase 2 OSINT Intelligence Tools
    analyzeCommitteeActivityToolMetadata,
    trackMepAttendanceToolMetadata,
    // Phase 3 OSINT Intelligence Tools
    analyzeCountryDelegationToolMetadata,
    generatePoliticalLandscapeToolMetadata,
    // Phase 4 – New EP API v2 endpoint tools
    getCurrentMEPsToolMetadata,
    getSpeechesToolMetadata,
    getProceduresToolMetadata,
    getAdoptedTextsToolMetadata,
    getEventsToolMetadata,
    getMeetingActivitiesToolMetadata,
    getMeetingDecisionsToolMetadata,
    getMEPDeclarationsToolMetadata,
    // Phase 5 – Complete EP API v2 coverage tools
    getIncomingMEPsToolMetadata,
    getOutgoingMEPsToolMetadata,
    getHomonymMEPsToolMetadata,
    getPlenaryDocumentsToolMetadata,
    getCommitteeDocumentsToolMetadata,
    getPlenarySessionDocumentsToolMetadata,
    getPlenarySessionDocumentItemsToolMetadata,
    getControlledVocabulariesToolMetadata,
    getExternalDocumentsToolMetadata,
    getMeetingForeseenActivitiesToolMetadata,
    getProcedureEventsToolMetadata,
  ];
}

/**
 * Name → handler dispatch map. Populated once, reused for every call.
 */
const toolHandlers: Record<string, (args: unknown) => Promise<ToolResult>> = {
  // Core tools
  'get_meps': handleGetMEPs,
  'get_mep_details': handleGetMEPDetails,
  'get_plenary_sessions': handleGetPlenarySessions,
  'get_voting_records': handleGetVotingRecords,
  'search_documents': handleSearchDocuments,
  'get_committee_info': handleGetCommitteeInfo,
  'get_parliamentary_questions': handleGetParliamentaryQuestions,
  // Advanced analysis tools
  'analyze_voting_patterns': handleAnalyzeVotingPatterns,
  'track_legislation': handleTrackLegislation,
  'generate_report': handleGenerateReport,
  // Phase 1 OSINT Intelligence Tools
  'assess_mep_influence': handleAssessMepInfluence,
  'analyze_coalition_dynamics': handleAnalyzeCoalitionDynamics,
  'detect_voting_anomalies': handleDetectVotingAnomalies,
  'compare_political_groups': handleComparePoliticalGroups,
  'analyze_legislative_effectiveness': handleAnalyzeLegislativeEffectiveness,
  'monitor_legislative_pipeline': handleMonitorLegislativePipeline,
  // Phase 2 OSINT Intelligence Tools
  'analyze_committee_activity': handleAnalyzeCommitteeActivity,
  'track_mep_attendance': handleTrackMepAttendance,
  // Phase 3 OSINT Intelligence Tools
  'analyze_country_delegation': handleAnalyzeCountryDelegation,
  'generate_political_landscape': handleGeneratePoliticalLandscape,
  // Phase 4 – New EP API v2 endpoint tools
  'get_current_meps': handleGetCurrentMEPs,
  'get_speeches': handleGetSpeeches,
  'get_procedures': handleGetProcedures,
  'get_adopted_texts': handleGetAdoptedTexts,
  'get_events': handleGetEvents,
  'get_meeting_activities': handleGetMeetingActivities,
  'get_meeting_decisions': handleGetMeetingDecisions,
  'get_mep_declarations': handleGetMEPDeclarations,
  // Phase 5 – Complete EP API v2 coverage tools
  'get_incoming_meps': handleGetIncomingMEPs,
  'get_outgoing_meps': handleGetOutgoingMEPs,
  'get_homonym_meps': handleGetHomonymMEPs,
  'get_plenary_documents': handleGetPlenaryDocuments,
  'get_committee_documents': handleGetCommitteeDocuments,
  'get_plenary_session_documents': handleGetPlenarySessionDocuments,
  'get_plenary_session_document_items': handleGetPlenarySessionDocumentItems,
  'get_controlled_vocabularies': handleGetControlledVocabularies,
  'get_external_documents': handleGetExternalDocuments,
  'get_meeting_foreseen_activities': handleGetMeetingForeseenActivities,
  'get_procedure_events': handleGetProcedureEvents,
};

/**
 * Dispatches a tool call to the registered handler.
 *
 * @param name - Tool name from the MCP `CallTool` request
 * @param args - Validated tool arguments
 * @returns Tool execution result
 * @throws {Error} If the tool name is not recognized
 */
export async function dispatchToolCall(
  name: string,
  args: unknown
): Promise<ToolResult> {
  const handler = toolHandlers[name];
  if (handler === undefined) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return await handler(args);
}
