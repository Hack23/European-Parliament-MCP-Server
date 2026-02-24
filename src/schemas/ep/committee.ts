/**
 * Committee Zod validation schemas.
 *
 * @module schemas/ep/committee
 */

import { z } from 'zod';

/**
 * Get committee info input schema
 */
export const GetCommitteeInfoSchema = z.object({
  id: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('Committee identifier'),
  abbreviation: z.string()
    .min(1)
    .max(20)
    .optional()
    .describe('Committee abbreviation'),
  showCurrent: z.boolean()
    .default(false)
    .optional()
    .describe('If true, returns only current active bodies')
});

/**
 * Committee output schema
 */
export const CommitteeSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  members: z.array(z.string()),
  chair: z.string().optional(),
  viceChairs: z.array(z.string()).optional(),
  meetingSchedule: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional()
});
