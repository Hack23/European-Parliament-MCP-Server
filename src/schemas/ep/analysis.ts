/**
 * European Parliament Analysis Schemas
 *
 * Zod schemas for political analysis tools — coalition dynamics, voting anomalies,
 * political group comparisons, legislative effectiveness, and OSINT standard output.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';

/**
 * Schema for MEP IDs array (2-10 items) used by comparative intelligence
 */
export const MepIdsSchema = z.array(
  z.string().min(1, 'MEP ID must not be empty').max(100, 'MEP ID too long')
).min(2, 'At least 2 MEP IDs required').max(10, 'At most 10 MEP IDs');

/**
 * Schema for coalition dynamics analysis input
 */
export const AnalyzeCoalitionDynamicsSchema = z.object({
  groupIds: z.array(
    z.string().min(1).max(50)
  ).min(1).max(10).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  minimumCohesion: z.number().min(0).max(1).default(0.5).optional()
});

/**
 * Schema for voting anomaly detection input
 */
export const DetectVotingAnomaliesSchema = z.object({
  mepId: z.string().min(1).max(100).optional(),
  groupId: z.string().min(1).max(50).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  sensitivityThreshold: z.number().min(0).max(1).default(0.3).optional()
});

/**
 * Schema for political group comparison input
 */
export const ComparePoliticalGroupsSchema = z.object({
  groupIds: z.array(
    z.string().min(1).max(50)
  ).min(2, 'At least 2 political groups required').max(10),
  dimensions: z.array(
    z.enum(['voting_discipline', 'activity_level', 'legislative_output', 'attendance', 'cohesion'])
  ).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional()
});

/**
 * Schema for legislative effectiveness analysis input
 */
export const AnalyzeLegislativeEffectivenessSchema = z.object({
  subjectType: z.enum(['MEP', 'COMMITTEE']),
  subjectId: z.string().min(1).max(100),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional()
});

/**
 * Schema for legislative pipeline monitoring input
 */
export const MonitorLegislativePipelineSchema = z.object({
  status: z.enum(['ALL', 'ACTIVE', 'STALLED', 'COMPLETED']).default('ACTIVE').optional(),
  committee: z.string().min(1).max(100).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  limit: z.number().int().min(1).max(100).default(20).optional()
});

/**
 * Schema for committee activity analysis input
 */
export const AnalyzeCommitteeActivitySchema = z.object({
  committeeId: z.string().min(1).max(100),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional()
});

/**
 * Schema for MEP attendance tracking input
 */
export const TrackMepAttendanceSchema = z.object({
  mepId: z.string().min(1).max(100).optional(),
  country: z.string().length(2).optional(),
  groupId: z.string().min(1).max(50).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  limit: z.number().int().min(1).max(100).default(20).optional()
});

/**
 * Schema for country delegation analysis input
 */
export const AnalyzeCountryDelegationSchema = z.object({
  country: z.string().length(2, 'Country must be ISO 3166-1 alpha-2 code'),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional()
});

/**
 * Schema for political landscape generation input
 */
export const GeneratePoliticalLandscapeSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional()
});

/**
 * Schema for network analysis input
 */
export const NetworkAnalysisSchema = z.object({
  mepId: z.number().int().positive().optional(),
  analysisType: z.enum(['committee', 'voting', 'combined']).default('combined').optional(),
  depth: z.number().int().min(1).max(3).default(2).optional()
});

/**
 * Schema for sentiment tracker input
 */
export const SentimentTrackerSchema = z.object({
  groupId: z.string().min(1).max(50).optional(),
  timeframe: z.enum(['last_month', 'last_quarter', 'last_year']).default('last_quarter').optional()
});

/**
 * Schema for early warning system input
 */
export const EarlyWarningSystemSchema = z.object({
  sensitivity: z.enum(['low', 'medium', 'high']).default('medium').optional(),
  focusArea: z.enum(['coalitions', 'attendance', 'all']).default('all').optional()
});

/**
 * Schema for comparative intelligence input
 */
export const ComparativeIntelligenceSchema = z.object({
  mepIds: z.array(z.number().int().positive()).min(2).max(10),
  dimensions: z.array(
    z.enum(['voting', 'committee', 'legislative', 'attendance'])
  ).default(['voting', 'committee', 'legislative', 'attendance']).optional()
});

/**
 * Schema for intelligence correlation input
 */
export const CorrelateIntelligenceSchema = z.object({
  mepIds: z.array(
    z.string().min(1).max(100)
  ).min(1, 'At least 1 MEP ID required').max(5, 'At most 5 MEP IDs'),
  groups: z.array(
    z.string().min(1).max(50)
  ).max(8).optional(),
  sensitivityLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM').optional(),
  includeNetworkAnalysis: z.boolean().default(false).optional()
});

/**
 * Schema for OSINT standard output validation
 *
 * Every analysis tool output must include these fields per
 * FUTURE_ARCHITECTURE.md specification.
 */
export const OsintStandardOutputSchema = z.object({
  confidenceLevel: z.string()
    .describe('Analysis confidence level: HIGH, MEDIUM, or LOW'),
  methodology: z.string()
    .describe('Description of the analytical methodology used'),
  dataFreshness: z.string()
    .describe('Data freshness indicator or description of data currency'),
  sourceAttribution: z.string()
    .describe('Attribution to European Parliament Open Data Portal data sources'),
  dataQualityWarnings: z.array(z.string())
    .describe('Warnings about data quality issues, unavailable metrics, or limitations'),
});

/**
 * Schema for generated stats input
 */
export const GetAllGeneratedStatsSchema = z.object({
  yearFrom: z.number().int().min(2004).max(2031).optional(),
  yearTo: z.number().int().min(2004).max(2031).optional(),
  category: z.enum([
    'all', 'plenary_sessions', 'legislative_acts', 'roll_call_votes',
    'committee_meetings', 'parliamentary_questions', 'resolutions',
    'speeches', 'adopted_texts', 'political_groups', 'procedures',
    'events', 'documents', 'mep_turnover', 'declarations'
  ]).default('all').optional(),
  includeMonthlyBreakdown: z.boolean().default(false).optional(),
  includeRankings: z.boolean().default(true).optional(),
  includePredictions: z.boolean().default(true).optional()
});
