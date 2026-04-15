/**
 * Parliamentary activity Zod validation schemas.
 *
 * Covers speeches, procedures, adopted texts, events,
 * meeting activities/decisions, declarations, and vocabularies.
 *
 * @module schemas/ep/activities
 */

import { z } from 'zod';
import { DateStringSchema } from './common.js';

/**
 * Get speeches input schema.
 *
 * **EP API /speeches filtering:** The EP API does not support a `year`
 * parameter.  Use `dateFrom` / `dateTo` (YYYY-MM-DD) which are mapped to
 * the EP API `sitting-date` / `sitting-date-end` parameters.
 */
export const GetSpeechesSchema = z.object({
  speechId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Speech ID for single speech lookup'),
  dateFrom: DateStringSchema.optional()
    .describe('Start date filter (YYYY-MM-DD). Mapped to EP API sitting-date parameter.'),
  dateTo: DateStringSchema.optional()
    .describe('End date filter (YYYY-MM-DD). Mapped to EP API sitting-date-end parameter.'),
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
 * Get procedures input schema.
 *
 * **EP API /procedures filtering:** The EP API does not support a `year`
 * parameter — only `process-type` is available.  Callers needing
 * year-specific counts must filter client-side.
 */
export const GetProceduresSchema = z.object({
  processId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Process ID for single procedure lookup'),
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
  docId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Document ID for single adopted text lookup'),
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
 * Get events input schema.
 *
 * **EP API /events filtering:** The EP API `/events` endpoint has no date
 * filtering at all — only pagination (limit/offset) is supported.
 */
export const GetEventsSchema = z.object({
  eventId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Event ID for single event lookup'),
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
 * Get meeting activities input schema.
 * Note: The EP API activities endpoint can be slow for large meetings;
 * a lower default limit (20) reduces response time.
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
    .default(20)
    .describe('Maximum results to return (default 20 — activities endpoint can be slow)'),
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
  docId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Declaration document ID for single declaration lookup'),
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

/**
 * Get controlled vocabularies input schema
 */
export const GetControlledVocabulariesSchema = z.object({
  vocId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Vocabulary ID for single vocabulary lookup'),
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
 * Get meeting foreseen activities input schema.
 * Note: The EP API foreseen-activities endpoint can be slow for large meetings;
 * a lower default limit (20) reduces response time.
 */
export const GetMeetingForeseenActivitiesSchema = z.object({
  sittingId: z.string()
    .min(1)
    .max(200)
    .describe('Meeting / sitting identifier'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Maximum results to return (default 20 — foreseen-activities endpoint can be slow)'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get procedure events input schema
 */
export const GetProcedureEventsSchema = z.object({
  processId: z.string()
    .min(1)
    .max(200)
    .describe('Procedure process ID'),
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
 * Get meeting plenary session documents input schema.
 * Maps to `GET /meetings/{sitting-id}/plenary-session-documents`
 * Note: This EP API endpoint can be slow; a lower default limit (20) reduces response time.
 */
export const GetMeetingPlenarySessionDocumentsSchema = z.object({
  sittingId: z.string()
    .min(1)
    .max(200)
    .describe('Meeting / sitting identifier'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Maximum results to return (default 20 — plenary-session-documents endpoint can be slow)'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});

/**
 * Get meeting plenary session document items input schema.
 * Maps to `GET /meetings/{sitting-id}/plenary-session-document-items`
 * Note: This EP API endpoint can be slow; a lower default limit (20) reduces response time.
 */
export const GetMeetingPlenarySessionDocumentItemsSchema = z.object({
  sittingId: z.string()
    .min(1)
    .max(200)
    .describe('Meeting / sitting identifier'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Maximum results to return (default 20 — plenary-session-document-items endpoint can be slow)'),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe('Pagination offset')
});
