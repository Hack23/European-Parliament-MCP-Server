/**
 * Shared validation primitives used across all EP schema modules.
 *
 * @module schemas/ep/common
 */

import { z } from 'zod';

/**
 * ISO 3166-1 alpha-2 country code validation
 */
export const CountryCodeSchema = z.string()
  .length(2)
  .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters')
  .describe('ISO 3166-1 alpha-2 country code (e.g., "SE")');

/**
 * Date validation (YYYY-MM-DD format)
 */
export const DateStringSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .describe('Date in YYYY-MM-DD format');

/**
 * Paginated response schema factory
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(
  dataSchema: T
): z.ZodObject<{
  data: z.ZodArray<T>;
  total: z.ZodNumber;
  limit: z.ZodNumber;
  offset: z.ZodNumber;
  hasMore: z.ZodBoolean;
}> =>
  z.object({
    data: z.array(dataSchema),
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    hasMore: z.boolean()
  });
