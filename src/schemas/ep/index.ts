/**
 * European Parliament Zod validation schemas – barrel re-export.
 *
 * Organized by bounded context:
 * - **common** – shared primitives (CountryCode, DateString, PaginatedResponse)
 * - **mep** – MEP input/output schemas
 * - **plenary** – plenary session and voting record schemas
 * - **committee** – committee schemas
 * - **document** – legislative document schemas
 * - **question** – parliamentary question schemas
 * - **analysis** – OSINT intelligence analysis tool schemas
 * - **activities** – speeches, procedures, events, declarations
 *
 * @module schemas/ep
 */

export { CountryCodeSchema, DateStringSchema, PaginatedResponseSchema } from './common.js';
export {
  GetMEPsSchema,
  GetMEPDetailsSchema,
  MEPSchema,
  MEPDetailsSchema,
  GetCurrentMEPsSchema,
  GetIncomingMEPsSchema,
  GetOutgoingMEPsSchema,
  GetHomonymMEPsSchema,
} from './mep.js';
export {
  GetPlenarySessionsSchema,
  PlenarySessionSchema,
  GetVotingRecordsSchema,
  VotingRecordSchema,
} from './plenary.js';
export { GetCommitteeInfoSchema, CommitteeSchema } from './committee.js';
export {
  SearchDocumentsSchema,
  LegislativeDocumentSchema,
  GetPlenaryDocumentsSchema,
  GetCommitteeDocumentsSchema,
  GetPlenarySessionDocumentsSchema,
  GetPlenarySessionDocumentItemsSchema,
  GetExternalDocumentsSchema,
} from './document.js';
export { GetParliamentaryQuestionsSchema, ParliamentaryQuestionSchema } from './question.js';
export {
  AnalyzeVotingPatternsSchema,
  TrackLegislationSchema,
  GenerateReportSchema,
  AssessMepInfluenceSchema,
  AnalyzeCoalitionDynamicsSchema,
  DetectVotingAnomaliesSchema,
  ComparePoliticalGroupsSchema,
  AnalyzeLegislativeEffectivenessSchema,
  MonitorLegislativePipelineSchema,
} from './analysis.js';
export {
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
} from './activities.js';
