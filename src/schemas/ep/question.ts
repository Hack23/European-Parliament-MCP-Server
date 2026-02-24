/**
 * Parliamentary question Zod validation schemas.
 *
 * @module schemas/ep/question
 */

import { z } from 'zod';
import { DateStringSchema } from './common.js';

/**
 * Get parliamentary questions input schema
 */
export const GetParliamentaryQuestionsSchema = z.object({
  docId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Document ID for single question lookup'),
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
