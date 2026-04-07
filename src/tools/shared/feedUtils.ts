/**
 * Shared utilities for feed tool handlers.
 *
 * During EP recess or low-activity periods the upstream Open Data Portal
 * may return HTTP 404 for feeds with no recent updates.  These helpers
 * convert that 404 into an empty-but-successful MCP response so that
 * downstream consumers receive an empty JSON-LD envelope instead of a
 * hard error.
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
 * Build an empty feed response with a `dataQualityWarnings` array indicating
 * that the upstream EP API returned 404 — likely no updates in the requested
 * timeframe.
 *
 * Returns the same JSON-LD envelope shape (`data` + `@context`) as the
 * normal success path so callers do not need to branch on response shape.
 */
export function buildEmptyFeedResponse(): ToolResult {
  return buildToolResponse({
    data: [],
    '@context': [],
    dataQualityWarnings: [
      'EP Open Data Portal returned 404 for this feed — likely no updates in the requested timeframe',
    ],
  });
}
