/**
 * Plenary session and voting record Zod validation schemas.
 *
 * @module schemas/ep/plenary
 */

import { z } from 'zod';
import { DateStringSchema } from './common.js';

/**
 * Get plenary sessions input schema
 */
export const GetPlenarySessionsSchema = z.object({
  eventId: z.string()
    .min(1)
    .max(200)
    .optional()
    .describe('Meeting event ID for single meeting lookup'),
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
