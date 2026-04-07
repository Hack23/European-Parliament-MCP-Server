/**
 * Shared utilities for feed tool handlers.
 *
 * During EP recess or low-activity periods the upstream Open Data Portal
 * may return HTTP 404 for feeds with no recent updates.  These helpers
 * convert that 404 into an empty-but-successful MCP response so that
 * downstream consumers receive `{ feed: [] }` instead of a hard error.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { APIError } from '../../clients/ep/baseClient.js';
import { buildToolResponse } from './responseBuilder.js';
import type { ToolResult } from './types.js';

/**
 * Check whether an error is an upstream EP API 404.
 *
 * The EP Open Data Portal returns 404 for feed endpoints that have no
 * recent updates within the requested timeframe (e.g. during recess).
 */
export function isUpstream404(error: unknown): boolean {
  return error instanceof APIError && error.statusCode === 404;
}

/**
 * Build an empty feed response with a {@link dataQualityWarning} indicating
 * that the upstream EP API returned 404 — likely no updates in the requested
 * timeframe.
 */
export function buildEmptyFeedResponse(): ToolResult {
  return buildToolResponse({
    feed: [],
    dataQualityWarning:
      'EP Open Data Portal returned 404 for this feed — likely no updates in the requested timeframe',
  });
}
