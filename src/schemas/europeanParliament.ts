/**
 * Zod validation schemas for European Parliament data
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
