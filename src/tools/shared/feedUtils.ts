/**
 * Shared utilities for feed tool handlers.
 *
 * The EP Open Data Portal feed endpoints have several known behaviours
 * that require graceful handling:
 *
 * 1. **HTTP 404** — returned during recess or low-activity periods when
 *    no records were updated within the requested timeframe.
 * 2. **HTTP 204 No Content** — returned by feeds that have no updates
 *    (empty body, no Content-Type header).  Handled by baseClient.
 * 3. **HTTP 200 with error-in-body** — the EP API sometimes returns
 *    HTTP 200 with a JSON body containing an `error` field (e.g.
 *    `"error": "404 Not Found from POST …"`).  This happens when the
 *    EP API's internal enrichment/POST step fails.  These look like
 *    successful responses but contain no `data` array.
 *
 * These helpers convert all three cases into empty-but-successful MCP
 * responses so downstream consumers always receive a valid JSON-LD
 * envelope.
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
 * Detect an EP API "error-in-body" response.
 *
 * Some feed endpoints return HTTP 200 but with a JSON body that contains
 * an `error` field and no `data` array.  Example:
 * ```json
 * {
 *   "@id": "https://data.europarl.europa.eu/eli/dl/…",
 *   "error": "404 Not Found from POST …",
 *   "@context": { "error": { … } }
 * }
 * ```
 *
 * This function returns `true` when the parsed response has this shape,
 * allowing callers to convert it to an empty feed response.
 */
export function isErrorInBody(result: Record<string, unknown>): boolean {
  return (
    typeof result['error'] === 'string' &&
    result['error'] !== '' &&
    !Array.isArray(result['data'])
  );
}

/**
 * Build an empty feed response with a `dataQualityWarnings` array.
 *
 * Returns the same JSON-LD envelope shape (`data` + `@context`) as the
 * normal success path so callers do not need to branch on response shape.
 *
 * @param warning - Human-readable warning message describing why the feed is empty
 */
export function buildEmptyFeedResponse(
  warning = 'EP Open Data Portal returned no data for this feed — likely no updates in the requested timeframe',
): ToolResult {
  return buildToolResponse({
    data: [],
    '@context': [],
    dataQualityWarnings: [warning],
  });
}
