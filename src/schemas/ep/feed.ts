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
const baseFeedParams = {
  timeframe: FeedTimeframeSchema,
  startDate: DateStringSchema.optional()
    .describe('Start date (YYYY-MM-DD) — required when timeframe is "custom"'),
};

// ── Group A – timeframe only ──────────────────────────────────────────────

/** GET /meps/feed */
export const GetMEPsFeedSchema = z.object({ ...baseFeedParams });

/** GET /corporate-bodies/feed */
export const GetCorporateBodiesFeedSchema = z.object({ ...baseFeedParams });

/** GET /committee-documents/feed */
export const GetCommitteeDocumentsFeedSchema = z.object({ ...baseFeedParams });

/** GET /controlled-vocabularies/feed */
export const GetControlledVocabulariesFeedSchema = z.object({ ...baseFeedParams });

/** GET /documents/feed */
export const GetDocumentsFeedSchema = z.object({ ...baseFeedParams });

/** GET /plenary-documents/feed */
export const GetPlenaryDocumentsFeedSchema = z.object({ ...baseFeedParams });

/** GET /parliamentary-questions/feed */
export const GetParliamentaryQuestionsFeedSchema = z.object({ ...baseFeedParams });

/** GET /plenary-session-documents/feed */
export const GetPlenarySessionDocumentsFeedSchema = z.object({ ...baseFeedParams });

// ── Group B – timeframe + type filter ─────────────────────────────────────

/** GET /events/feed */
export const GetEventsFeedSchema = z.object({
  ...baseFeedParams,
  activityType: z.string().max(200).optional()
    .describe('Activity type filter'),
});

/** GET /procedures/feed */
export const GetProceduresFeedSchema = z.object({
  ...baseFeedParams,
  processType: z.string().max(200).optional()
    .describe('Process type filter'),
});

/** GET /adopted-texts/feed */
export const GetAdoptedTextsFeedSchema = z.object({
  ...baseFeedParams,
  workType: z.string().max(200).optional()
    .describe('Work type filter'),
});

/** GET /meps-declarations/feed */
export const GetMEPDeclarationsFeedSchema = z.object({
  ...baseFeedParams,
  workType: z.string().max(200).optional()
    .describe('Work type filter'),
});

/** GET /external-documents/feed */
export const GetExternalDocumentsFeedSchema = z.object({
  ...baseFeedParams,
  workType: z.string().max(200).optional()
    .describe('Work type filter'),
});

// ── Optional endpoint ─────────────────────────────────────────────────────

/** GET /procedures/{process-id}/events/{event-id} */
export const GetProcedureEventByIdSchema = z.object({
  processId: z.string().min(1).max(200).describe('Procedure process ID'),
  eventId: z.string().min(1).max(200).describe('Event identifier'),
});
