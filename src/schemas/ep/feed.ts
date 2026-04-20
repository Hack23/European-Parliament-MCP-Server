/**
 * Feed-endpoint Zod validation schemas.
 *
 * EP API v2 `/…/feed` endpoints fall into two groups:
 *
 * **Group A — Fixed-window feeds** (no timeframe parameter per OpenAPI spec):
 *   `documents/feed`, `plenary-documents/feed`, `committee-documents/feed`,
 *   `plenary-session-documents/feed`, `parliamentary-questions/feed`,
 *   `corporate-bodies/feed`, `controlled-vocabularies/feed`
 *   These return updates from a server-defined default window (typically one month).
 *
 * **Group B — Configurable-window feeds** (accept `timeframe` + `start-date`):
 *   `meps/feed`, `events/feed`, `procedures/feed`, `adopted-texts/feed`,
 *   `meps-declarations/feed`, `external-documents/feed`
 *   Some also accept a domain-specific type filter (`workType`, `activityType`,
 *   `processType`).
 *
 * @see https://data.europarl.europa.eu/api/v2/ (OpenAPI spec)
 * @module schemas/ep/feed
 */

import { z } from 'zod';
import { DateStringSchema } from './common.js';

// ── Shared primitives ─────────────────────────────────────────────────────

/**
 * Feed timeframe values accepted by configurable-window feed endpoints.
 */
export const FeedTimeframeSchema = z
  .enum(['today', 'one-day', 'one-week', 'one-month', 'custom'])
  .default('one-week')
  .describe('Timeframe for the feed (default: one-week)');

/**
 * Base feed parameters for configurable-window feed endpoints (Group B).
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

/**
 * Schema for fixed-window feed endpoints (Group A).
 *
 * These EP API endpoints do NOT accept a `timeframe` or `start-date`
 * parameter.  They always return updates from a server-defined default
 * window (typically one month).
 *
 * For API-contract uniformity across all feed tools, this schema still
 * accepts the common feed parameters (`timeframe`, `startDate`, `limit`,
 * `offset`) as **informational-only** — they are silently ignored at the
 * upstream call site.  This allows consumers that model all feeds with a
 * single shape (e.g. `FeedBaseOptions extends { timeframe, startDate,
 * limit, offset }`) to call these tools without hard-failing at runtime.
 *
 * Unknown extra keys are also tolerated (no `.strict()`) so additional
 * future feed primitives are forward-compatible.
 *
 * @see Option 1 in issue #379 (uniform feed input schema).
 */
const FixedWindowFeedSchema = z
  .object({
    timeframe: FeedTimeframeSchema.optional().describe(
      'Informational-only — this feed uses a server-defined default window (typically one month) and ignores this parameter. Accepted for contract uniformity with sliding-window feed tools.'
    ),
    startDate: DateStringSchema.optional().describe(
      'Informational-only — ignored by this fixed-window feed. Accepted for contract uniformity with sliding-window feed tools.'
    ),
    limit: z.number().int().min(1).max(100).optional().describe(
      'Informational-only — the upstream EP API does not paginate this fixed-window feed. Accepted for contract uniformity.'
    ),
    offset: z.number().int().min(0).optional().describe(
      'Informational-only — the upstream EP API does not paginate this fixed-window feed. Accepted for contract uniformity.'
    ),
  })
  .describe(
    'Fixed-window feed — the EP API always returns updates from a server-defined default window (typically one month). All parameters are informational-only and silently ignored.'
  );

// ── Group A – fixed-window feeds (no timeframe parameter) ─────────────────

/** GET /documents/feed — server-default window */
export const GetDocumentsFeedSchema = FixedWindowFeedSchema;

/** GET /plenary-documents/feed — server-default window */
export const GetPlenaryDocumentsFeedSchema = FixedWindowFeedSchema;

/** GET /committee-documents/feed — server-default window */
export const GetCommitteeDocumentsFeedSchema = FixedWindowFeedSchema;

/** GET /plenary-session-documents/feed — server-default window */
export const GetPlenarySessionDocumentsFeedSchema = FixedWindowFeedSchema;

/** GET /parliamentary-questions/feed — server-default window */
export const GetParliamentaryQuestionsFeedSchema = FixedWindowFeedSchema;

/** GET /corporate-bodies/feed — server-default window */
export const GetCorporateBodiesFeedSchema = FixedWindowFeedSchema;

/** GET /controlled-vocabularies/feed — server-default window */
export const GetControlledVocabulariesFeedSchema = FixedWindowFeedSchema;

// ── Group B – configurable-window feeds (accept timeframe + optional filter) ─

/** GET /meps/feed */
export const GetMEPsFeedSchema = BaseFeedParamsSchema;

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
