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
 * MEP identifier validation.
 * Accepts numeric IDs, "MEP-{number}", or "person/{number}" formats.
 */
export const MepIdSchema = z.string()
  .min(1)
  .max(100)
  .regex(
    /^(MEP-)?(\d+|person\/\d+)$/,
    'MEP ID must be numeric, "MEP-{number}", or "person/{number}"'
  )
  .describe('MEP identifier');

/**
 * Session identifier validation.
 * Accepts alphanumeric characters with hyphens and underscores.
 */
export const SessionIdSchema = z.string()
  .min(1)
  .max(100)
  .regex(
    /^[a-zA-Z0-9\-_]+$/,
    'Session ID must be alphanumeric with hyphens and underscores'
  )
  .describe('Plenary session identifier');

/**
 * Cross-field date range refinement helper.
 * Ensures dateFrom is before or equal to dateTo when both are provided.
 */
export function refineDateRange(
  data: { dateFrom?: string | undefined; dateTo?: string | undefined }
): boolean {
  if (data.dateFrom !== undefined && data.dateTo !== undefined) {
    return data.dateFrom <= data.dateTo;
  }
  return true;
}

/** Error message for invalid date ranges */
export const DATE_RANGE_ERROR = 'dateFrom must be before or equal to dateTo';

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
