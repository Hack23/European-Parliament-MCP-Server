/**
 * Zod validation schemas for European Parliament data.
 *
 * Barrel re-export from domain-specific modules organized by bounded context.
 *
 * @module schemas/europeanParliament
 * @see https://data.europarl.europa.eu/api/v2/
 */

export {
  // Common primitives
  PaginatedResponseSchema,

  // MEP schemas
  GetMEPsSchema,
  GetMEPDetailsSchema,
  MEPSchema,
  MEPDetailsSchema,
  GetCurrentMEPsSchema,
  GetIncomingMEPsSchema,
  GetOutgoingMEPsSchema,
  GetHomonymMEPsSchema,

  // Plenary schemas
  GetPlenarySessionsSchema,
  PlenarySessionSchema,
  GetVotingRecordsSchema,
  VotingRecordSchema,

  // Committee schemas
  GetCommitteeInfoSchema,
  CommitteeSchema,

  // Document schemas
  SearchDocumentsSchema,
  LegislativeDocumentSchema,
  GetPlenaryDocumentsSchema,
  GetCommitteeDocumentsSchema,
  GetPlenarySessionDocumentsSchema,
  GetPlenarySessionDocumentItemsSchema,
  GetExternalDocumentsSchema,

  // Question schemas
  GetParliamentaryQuestionsSchema,
  ParliamentaryQuestionSchema,

  // Analysis/OSINT schemas
  AnalyzeVotingPatternsSchema,
  TrackLegislationSchema,
  GenerateReportSchema,
  AssessMepInfluenceSchema,
  AnalyzeCoalitionDynamicsSchema,
  DetectVotingAnomaliesSchema,
  ComparePoliticalGroupsSchema,
  AnalyzeLegislativeEffectivenessSchema,
  MonitorLegislativePipelineSchema,
  OsintStandardOutputSchema,
  CorrelateIntelligenceSchema,

  // Activity schemas
  GetSpeechesSchema,
  GetProceduresSchema,
  GetAdoptedTextsSchema,
  GetEventsSchema,
  GetMeetingActivitiesSchema,
  GetMeetingDecisionsSchema,
  GetMEPDeclarationsSchema,
  GetControlledVocabulariesSchema,
  GetMeetingForeseenActivitiesSchema,
  GetProcedureEventsSchema,
  GetMeetingPlenarySessionDocumentsSchema,
  GetMeetingPlenarySessionDocumentItemsSchema,
} from './ep/index.js';
