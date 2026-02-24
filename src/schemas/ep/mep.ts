/**
 * MEP-related Zod validation schemas.
 *
 * @module schemas/ep/mep
 */

import { z } from 'zod';
import { CountryCodeSchema } from './common.js';

/**
 * Get MEPs input schema
 */
export const GetMEPsSchema = z.object({
  country: CountryCodeSchema.optional(),
  group: z.string()
    .min(1)
    .max(50)
    .optional()
    .describe('Political group identifier'),
  committee: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Committee identifier'),
  active: z.boolean()
    .default(true)
    .describe('Filter by active status'),
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
 * Get MEP details input schema
 */
export const GetMEPDetailsSchema = z.object({
  id: z.string()
    .min(1)
    .max(100)
    .describe('MEP identifier')
});

/**
 * MEP output schema
 */
export const MEPSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  politicalGroup: z.string(),
  committees: z.array(z.string()),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  email: z.string().email('Invalid email format').optional(),
  active: z.boolean(),
  termStart: z.string(),
  termEnd: z.string().optional()
});

/**
 * Voting statistics schema
 * @internal - Used internally within MEPDetailsSchema
 */
const VotingStatisticsSchema = z.object({
  totalVotes: z.number().int().min(0),
  votesFor: z.number().int().min(0),
  votesAgainst: z.number().int().min(0),
  abstentions: z.number().int().min(0),
  attendanceRate: z.number().min(0).max(100)
});

/**
 * MEP details output schema
 */
export const MEPDetailsSchema = MEPSchema.extend({
  biography: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  website: z.string().url('Invalid URL format').optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  votingStatistics: VotingStatisticsSchema.optional(),
  roles: z.array(z.string()).optional()
});

/**
 * Get current MEPs input schema
 */
export const GetCurrentMEPsSchema = z.object({
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
 * Get incoming MEPs input schema
 */
export const GetIncomingMEPsSchema = z.object({
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
 * Get outgoing MEPs input schema
 */
export const GetOutgoingMEPsSchema = z.object({
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
 * Get homonym MEPs input schema
 */
export const GetHomonymMEPsSchema = z.object({
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
