/**
 * Zod validation schemas for European Parliament data.
 *
 * Barrel re-export from domain-specific modules organized by bounded context.
 *
 * @module schemas/europeanParliament
 * @see https://data.europarl.europa.eu/api/v2/
 */

export {
  PaginatedResponseSchema,

  GetMEPsSchema,
  GetMEPDetailsSchema,
  MEPSchema,
  MEPDetailsSchema,
  GetCurrentMEPsSchema,
  GetIncomingMEPsSchema,
  GetOutgoingMEPsSchema,
  GetHomonymMEPsSchema,

  GetPlenarySessionsSchema,
  PlenarySessionSchema,
  GetVotingRecordsSchema,
  VotingRecordSchema,

  GetCommitteeInfoSchema,
  CommitteeSchema,

  SearchDocumentsSchema,
  LegislativeDocumentSchema,
  GetPlenaryDocumentsSchema,
  GetCommitteeDocumentsSchema,
  GetPlenarySessionDocumentsSchema,
  GetPlenarySessionDocumentItemsSchema,
  GetExternalDocumentsSchema,

  GetParliamentaryQuestionsSchema,
  ParliamentaryQuestionSchema,

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

  FeedTimeframeSchema,
  GetMEPsFeedSchema,
  GetCorporateBodiesFeedSchema,
  GetCommitteeDocumentsFeedSchema,
  GetControlledVocabulariesFeedSchema,
  GetDocumentsFeedSchema,
  GetPlenaryDocumentsFeedSchema,
  GetParliamentaryQuestionsFeedSchema,
  GetPlenarySessionDocumentsFeedSchema,
  GetEventsFeedSchema,
  GetProceduresFeedSchema,
  GetAdoptedTextsFeedSchema,
  GetMEPDeclarationsFeedSchema,
  GetExternalDocumentsFeedSchema,
  GetProcedureEventByIdSchema,
} from './ep/index.js';
