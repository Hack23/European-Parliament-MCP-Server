/**
 * OSINT intelligence analysis tool Zod validation schemas.
 *
 * @module schemas/ep/analysis
 */

import { z } from 'zod';
import { DateStringSchema } from './common.js';

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
