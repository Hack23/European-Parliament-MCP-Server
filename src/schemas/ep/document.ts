/**
 * Legislative document Zod validation schemas.
 *
 * @module schemas/ep/document
 */

import { z } from 'zod';
import { DateStringSchema } from './common.js';

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
    .min(1)
    .max(200)
    .optional()
    .describe('Document ID for single document lookup (bypasses keyword search)'),
  keyword: z.string()
    .min(1)
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
 * Get committee documents input schema
 */
export const GetCommitteeDocumentsSchema = z.object({
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
 * Get external documents input schema
 */
export const GetExternalDocumentsSchema = z.object({
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
