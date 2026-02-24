/**
 * Zod validation schemas for European Parliament data
 * 
 * **Intelligence Perspective:** Schema definitions enforce data quality standards
 * critical for reliable intelligence analysis—invalid data produces flawed assessments.
 * 
 * **Business Perspective:** Runtime validation ensures API reliability and data contract
 * compliance for enterprise customers with strict data quality requirements.
 * 
 * **Marketing Perspective:** Comprehensive validation demonstrates enterprise-grade
 * data quality—key differentiator for developer trust and API adoption.
 * 
 * ISMS Policy: SC-002 (Input Validation), SI-10 (Information Input Validation)
 */

import { z } from 'zod';

/**
 * ISO 3166-1 alpha-2 country code validation
 */
const CountryCodeSchema = z.string()
  .length(2)
  .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters')
  .describe('ISO 3166-1 alpha-2 country code (e.g., "SE")');

/**
 * Date validation (YYYY-MM-DD format)
 */
const DateStringSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .describe('Date in YYYY-MM-DD format');

/**
 * Get MEPs input schema
 */
export const GetMEPsSchema = z.object({
  country: CountryCodeSchema.optional(),
  group: z.string()
    .min(1)
    .max(50)
    .optional()
    .describe('Political group identifier'),
  committee: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Committee identifier'),
  active: z.boolean()
    .default(true)
    .describe('Filter by active status'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get MEP details input schema
 */
export const GetMEPDetailsSchema = z.object({
  id: z.string()
    .min(1)
    .max(100)
    .describe('MEP identifier')
});

/**
 * MEP output schema
 */
export const MEPSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  politicalGroup: z.string(),
  committees: z.array(z.string()),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  email: z.string().email('Invalid email format').optional(),
  active: z.boolean(),
  termStart: z.string(),
  termEnd: z.string().optional()
});

/**
 * Voting statistics schema
 * @internal - Used internally within MEPDetailsSchema
 */
const VotingStatisticsSchema = z.object({
  totalVotes: z.number().int().min(0),
  votesFor: z.number().int().min(0),
  votesAgainst: z.number().int().min(0),
  abstentions: z.number().int().min(0),
  attendanceRate: z.number().min(0).max(100)
});

/**
 * MEP details output schema
 */
export const MEPDetailsSchema = MEPSchema.extend({
  biography: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  website: z.string().url('Invalid URL format').optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  votingStatistics: VotingStatisticsSchema.optional(),
  roles: z.array(z.string()).optional()
});

/**
 * Get plenary sessions input schema
 */
export const GetPlenarySessionsSchema = z.object({
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  location: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Session location'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Plenary session output schema
 */
export const PlenarySessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  location: z.string(),
  agendaItems: z.array(z.string()),
  votingRecords: z.array(z.string()).optional(),
  attendanceCount: z.number().int().min(0).optional(),
  documents: z.array(z.string()).optional()
});

/**
 * Get voting records input schema
 */
export const GetVotingRecordsSchema = z.object({
  sessionId: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Plenary session identifier'),
  mepId: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('MEP identifier'),
  topic: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Vote topic or keyword'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Voting record output schema
 */
export const VotingRecordSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  topic: z.string(),
  date: z.string(),
  votesFor: z.number().int().min(0),
  votesAgainst: z.number().int().min(0),
  abstentions: z.number().int().min(0),
  result: z.enum(['ADOPTED', 'REJECTED']),
  mepVotes: z.record(z.string(), z.enum(['FOR', 'AGAINST', 'ABSTAIN'])).optional()
});

/**
 * Document type enum
 * @internal - Used internally within SearchDocumentsSchema and other schemas
 */
const DocumentTypeSchema = z.enum([
  'REPORT',
  'RESOLUTION',
  'DECISION',
  'DIRECTIVE',
  'REGULATION',
  'OPINION',
  'AMENDMENT'
]);

/**
 * Search documents input schema
 */
export const SearchDocumentsSchema = z.object({
  keyword: z.string()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid characters in keyword')
    .describe('Search keyword or phrase'),
  documentType: DocumentTypeSchema
    .optional()
    .describe('Filter by document type'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  committee: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Committee identifier'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Legislative document output schema
 */
export const LegislativeDocumentSchema = z.object({
  id: z.string(),
  type: DocumentTypeSchema,
  title: z.string(),
  date: z.string(),
  authors: z.array(z.string()),
  committee: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'IN_COMMITTEE', 'PLENARY', 'ADOPTED', 'REJECTED']),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  pdfUrl: z.string().url('Invalid PDF URL format').optional(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  xmlUrl: z.string().url('Invalid XML URL format').optional(),
  summary: z.string().optional()
});

/**
 * Get committee info input schema
 */
export const GetCommitteeInfoSchema = z.object({
  id: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Committee identifier'),
  abbreviation: z.string()
    .min(1)
    .max(20)
    .optional()
    .describe('Committee abbreviation')
});

/**
 * Committee output schema
 */
export const CommitteeSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  members: z.array(z.string()),
  chair: z.string().optional(),
  viceChairs: z.array(z.string()).optional(),
  meetingSchedule: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional()
});

/**
 * Get parliamentary questions input schema
 */
export const GetParliamentaryQuestionsSchema = z.object({
  type: z.enum(['WRITTEN', 'ORAL'])
    .optional()
    .describe('Question type'),
  author: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('MEP identifier or name'),
  topic: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Question topic or keyword'),
  status: z.enum(['PENDING', 'ANSWERED'])
    .optional()
    .describe('Question status'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Parliamentary question output schema
 */
export const ParliamentaryQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['WRITTEN', 'ORAL']),
  author: z.string(),
  date: z.string(),
  topic: z.string(),
  questionText: z.string(),
  answerText: z.string().optional(),
  answerDate: z.string().optional(),
  status: z.enum(['PENDING', 'ANSWERED'])
});

/**
 * Analyze voting patterns input schema
 */
export const AnalyzeVotingPatternsSchema = z.object({
  mepId: z.string()
    .min(1)
    .max(100)
    .describe('MEP identifier'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  compareWithGroup: z.boolean()
    .default(true)
    .describe('Compare with political group average')
});

/**
 * Track legislation input schema
 */
export const TrackLegislationSchema = z.object({
  procedureId: z.string()
    .min(1)
    .max(100)
    .describe('Legislative procedure identifier')
});

/**
 * Generate report input schema
 */
export const GenerateReportSchema = z.object({
  reportType: z.enum(['MEP_ACTIVITY', 'COMMITTEE_PERFORMANCE', 'VOTING_STATISTICS', 'LEGISLATION_PROGRESS'])
    .describe('Type of report to generate'),
  subjectId: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Subject identifier (MEP ID, Committee ID, etc.)'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional()
});

// ────────────────────────────────────────────────────────────────
// Phase 1 OSINT Intelligence Tool Schemas
// ────────────────────────────────────────────────────────────────

/**
 * Assess MEP influence input schema
 */
export const AssessMepInfluenceSchema = z.object({
  mepId: z.string()
    .min(1)
    .max(100)
    .describe('MEP identifier'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  includeDetails: z.boolean()
    .default(false)
    .describe('Include detailed breakdown per dimension')
});

/**
 * Analyze coalition dynamics input schema
 */
export const AnalyzeCoalitionDynamicsSchema = z.object({
  groupIds: z.array(z.string().min(1).max(50))
    .min(1)
    .max(10)
    .optional()
    .describe('Political group identifiers to analyze (omit for all groups)'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  minimumCohesion: z.number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe('Minimum cohesion threshold for alliance detection')
});

/**
 * Detect voting anomalies input schema
 */
export const DetectVotingAnomaliesSchema = z.object({
  mepId: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('MEP identifier (omit for all MEPs)'),
  groupId: z.string()
    .min(1)
    .max(50)
    .optional()
    .describe('Political group to analyze'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  sensitivityThreshold: z.number()
    .min(0)
    .max(1)
    .default(0.3)
    .describe('Anomaly sensitivity (lower = more anomalies detected)')
}).refine(
  data => !(data.mepId !== undefined && data.groupId !== undefined),
  { message: 'Cannot specify both mepId and groupId — use one or neither' }
);

/**
 * Compare political groups input schema
 */
export const ComparePoliticalGroupsSchema = z.object({
  groupIds: z.array(z.string().min(1).max(50))
    .min(2)
    .max(10)
    .describe('Political group identifiers to compare'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  dimensions: z.array(z.enum([
    'voting_discipline',
    'activity_level',
    'legislative_output',
    'attendance',
    'cohesion'
  ])).optional()
    .describe('Comparison dimensions (omit for all)')
});

/**
 * Analyze legislative effectiveness input schema
 */
export const AnalyzeLegislativeEffectivenessSchema = z.object({
  subjectType: z.enum(['MEP', 'COMMITTEE'])
    .describe('Subject type to analyze'),
  subjectId: z.string()
    .min(1)
    .max(100)
    .describe('Subject identifier (MEP ID or committee abbreviation)'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional()
});

/**
 * Monitor legislative pipeline input schema
 */
export const MonitorLegislativePipelineSchema = z.object({
  committee: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Filter by committee'),
  status: z.enum(['ALL', 'ACTIVE', 'STALLED', 'COMPLETED'])
    .default('ACTIVE')
    .describe('Pipeline status filter'),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Maximum results to return')
});

/**
 * Paginated response schema
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(
  dataSchema: T
): z.ZodObject<{
  data: z.ZodArray<T>;
  total: z.ZodNumber;
  limit: z.ZodNumber;
  offset: z.ZodNumber;
  hasMore: z.ZodBoolean;
}> =>
  z.object({
    data: z.array(dataSchema),
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    hasMore: z.boolean()
  });

// ──────────────────────────────────────────────────────────────────
// Phase 4 Schemas – New EP API v2 endpoints
// ──────────────────────────────────────────────────────────────────

/**
 * Get current MEPs input schema
 */
export const GetCurrentMEPsSchema = z.object({
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get speeches input schema
 */
export const GetSpeechesSchema = z.object({
  dateFrom: DateStringSchema.optional()
    .describe('Start date filter (YYYY-MM-DD)'),
  dateTo: DateStringSchema.optional()
    .describe('End date filter (YYYY-MM-DD)'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get procedures input schema
 */
export const GetProceduresSchema = z.object({
  year: z.number()
    .int()
    .min(1990)
    .max(2040)
    .optional()
    .describe('Filter by year'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get adopted texts input schema
 */
export const GetAdoptedTextsSchema = z.object({
  year: z.number()
    .int()
    .min(1990)
    .max(2040)
    .optional()
    .describe('Filter by year of adoption'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get events input schema
 */
export const GetEventsSchema = z.object({
  dateFrom: DateStringSchema.optional()
    .describe('Start date filter (YYYY-MM-DD)'),
  dateTo: DateStringSchema.optional()
    .describe('End date filter (YYYY-MM-DD)'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get meeting activities input schema
 */
export const GetMeetingActivitiesSchema = z.object({
  sittingId: z.string()
    .min(1)
    .max(200)
    .describe('Meeting / sitting identifier'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get meeting decisions input schema
 */
export const GetMeetingDecisionsSchema = z.object({
  sittingId: z.string()
    .min(1)
    .max(200)
    .describe('Meeting / sitting identifier'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get MEP declarations input schema
 */
export const GetMEPDeclarationsSchema = z.object({
  year: z.number()
    .int()
    .min(1990)
    .max(2040)
    .optional()
    .describe('Filter by filing year'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum results to return'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});
