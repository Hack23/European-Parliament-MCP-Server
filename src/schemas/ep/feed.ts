/**
 * Feed-endpoint Zod validation schemas.
 *
 * All EP API v2 `/…/feed` endpoints share a common parameter pattern:
 * - `timeframe` — one of `today | one-day | one-week | one-month | custom`
 * - `startDate` — YYYY-MM-DD, required when `timeframe` is `custom`
 *
 * Some feeds add a domain-specific type filter (`workType`, `activityType`,
 * `processType`).  Each schema below covers one feed endpoint.
 *
 * @module schemas/ep/feed
 */

import { z } from 'zod';
import { DateStringSchema } from './common.js';

// ── Shared primitives ─────────────────────────────────────────────────────

/**
 * Feed timeframe values accepted by every `/…/feed` endpoint.
 */
export const FeedTimeframeSchema = z
  .enum(['today', 'one-day', 'one-week', 'one-month', 'custom'])
  .default('one-week')
  .describe('Timeframe for the feed (default: one-week)');

/**
 * Base feed parameters shared by all feed endpoints.
 */
const BaseFeedParamsSchema = z
  .object({
    timeframe: FeedTimeframeSchema,
    startDate: DateStringSchema.optional()
      .describe('Start date (YYYY-MM-DD) — required when timeframe is "custom"'),
  })
  .superRefine((data, ctx) => {
    if (data.timeframe === 'custom' && (data.startDate === undefined || data.startDate === '')) {
      ctx.addIssue({
        code: 'custom',
        path: ['startDate'],
        message: 'startDate is required when timeframe is "custom"',
      });
    }
  });

// ── Group A – timeframe only ──────────────────────────────────────────────

/** GET /meps/feed */
export const GetMEPsFeedSchema = BaseFeedParamsSchema;

/** GET /corporate-bodies/feed */
export const GetCorporateBodiesFeedSchema = BaseFeedParamsSchema;

/** GET /committee-documents/feed */
export const GetCommitteeDocumentsFeedSchema = BaseFeedParamsSchema;

/** GET /controlled-vocabularies/feed */
export const GetControlledVocabulariesFeedSchema = BaseFeedParamsSchema;

/** GET /documents/feed */
export const GetDocumentsFeedSchema = BaseFeedParamsSchema;

/** GET /plenary-documents/feed */
export const GetPlenaryDocumentsFeedSchema = BaseFeedParamsSchema;

/** GET /parliamentary-questions/feed */
export const GetParliamentaryQuestionsFeedSchema = BaseFeedParamsSchema;

/** GET /plenary-session-documents/feed */
export const GetPlenarySessionDocumentsFeedSchema = BaseFeedParamsSchema;

// ── Group B – timeframe + type filter ─────────────────────────────────────

/** GET /events/feed */
export const GetEventsFeedSchema = BaseFeedParamsSchema.extend({
  activityType: z.string().max(200).optional()
    .describe('Activity type filter'),
});

/** GET /procedures/feed */
export const GetProceduresFeedSchema = BaseFeedParamsSchema.extend({
  processType: z.string().max(200).optional()
    .describe('Process type filter'),
});

/** GET /adopted-texts/feed */
export const GetAdoptedTextsFeedSchema = BaseFeedParamsSchema.extend({
  workType: z.string().max(200).optional()
    .describe('Work type filter'),
});

/** GET /meps-declarations/feed */
export const GetMEPDeclarationsFeedSchema = BaseFeedParamsSchema.extend({
  workType: z.string().max(200).optional()
    .describe('Work type filter'),
});

/** GET /external-documents/feed */
export const GetExternalDocumentsFeedSchema = BaseFeedParamsSchema.extend({
  workType: z.string().max(200).optional()
    .describe('Work type filter'),
});

// ── Optional endpoint ─────────────────────────────────────────────────────

/** GET /procedures/{process-id}/events/{event-id} */
export const GetProcedureEventByIdSchema = z.object({
  processId: z.string().min(1).max(200).describe('Procedure process ID'),
  eventId: z.string().min(1).max(200).describe('Event identifier'),
});
