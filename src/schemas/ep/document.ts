/**
 * Legislative document Zod validation schemas.
 *
 * @module schemas/ep/document
 */

import { z } from 'zod';
import { DateStringSchema, refineDateRange, DATE_RANGE_ERROR } from './common.js';

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
  docId: z.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .describe('Document ID for single document lookup (bypasses keyword search)'),
  keyword: z.string()
    .trim()
    .min(2, 'Keyword must be at least 2 characters')
    .max(200)
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid characters in keyword')
    .optional()
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
}).refine(
  data => data.docId !== undefined || data.keyword !== undefined,
  { message: 'Either docId or keyword must be provided' }
).refine(
  refineDateRange,
  { message: DATE_RANGE_ERROR }
);

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
  pdfUrl: z.url({ message: 'Invalid PDF URL format' }).optional(),
  xmlUrl: z.url({ message: 'Invalid XML URL format' }).optional(),
  summary: z.string().optional()
});

/**
 * Get plenary documents input schema
 */
export const GetPlenaryDocumentsSchema = z.object({
  docId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Document ID for single document lookup'),
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
 * Get committee documents input schema.
 *
 * **EP API /committee-documents filtering:** The EP API does not support
 * a `year` parameter for this endpoint.  Only pagination is available.
 */
export const GetCommitteeDocumentsSchema = z.object({
  docId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Document ID for single document lookup'),
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
 * Get plenary session documents input schema
 */
export const GetPlenarySessionDocumentsSchema = z.object({
  docId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Document ID for single document lookup'),
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
 * Get plenary session document items input schema
 */
export const GetPlenarySessionDocumentItemsSchema = z.object({
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
 * Get external documents input schema.
 *
 * **EP API /external-documents filtering:** The EP API does not support
 * a `year` parameter for this endpoint.  Only pagination is available.
 */
export const GetExternalDocumentsSchema = z.object({
  docId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Document ID for single document lookup'),
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
