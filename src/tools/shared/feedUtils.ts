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
 * These helpers convert all three cases into uniform MCP responses so
 * downstream consumers always receive the same envelope shape — see
 * {@link FeedEnvelope} below.
 *
 * ## Uniform feed response envelope
 *
 * Every feed handler emits the same body shape, regardless of whether
 * the upstream call succeeded, returned no data, or failed in-band:
 *
 * ```json
 * {
 *   "status": "operational" | "degraded" | "unavailable",
 *   "lastSuccessfulProbe": "2026-04-18T07:12:00Z",
 *   "items": [],
 *   "itemCount": 0,
 *   "reason": "Optional string when status !== 'operational'",
 *   "data": [],
 *   "@context": [],
 *   "dataQualityWarnings": []
 * }
 * ```
 *
 * - `status` — `"operational"` for fresh data, `"unavailable"` when the
 *   upstream returned a 404 / error-in-body / empty body, `"degraded"`
 *   for partial data with warnings.
 * - `items` — alias for `data`; the canonical name in the contract.
 * - `itemCount` — length of `items`.
 * - `lastSuccessfulProbe` — ISO-8601 timestamp of the response build.
 * - `reason` — present only when `status !== "operational"`.
 *
 * The legacy `data` / `@context` / `dataQualityWarnings` fields are
 * preserved so existing consumers continue to work unchanged.
 *
 * Reserve HTTP 4xx / 5xx for genuine transport errors (auth, rate
 * limit, gateway timeout, endpoint removed permanently). Empty
 * timeframes / temporary upstream outages always yield HTTP 200 with
 * `status: "unavailable"`.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { APIError } from '../../clients/ep/baseClient.js';
import { buildToolResponse } from './responseBuilder.js';
import type { ToolResult } from './types.js';

/** Operational status for a feed response under the uniform contract. */
export type FeedStatus = 'operational' | 'degraded' | 'unavailable';

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
 * Wrap a successful upstream feed result in the uniform envelope.
 *
 * The original payload (typically `{ data, '@context' }`) is preserved
 * verbatim and augmented with the uniform contract fields:
 * `status: "operational"`, `items` (alias for `data`), `itemCount`,
 * `lastSuccessfulProbe`, and an empty `dataQualityWarnings` array.
 *
 * @param result - Raw upstream response payload
 * @returns MCP-compliant ToolResult containing the uniform envelope
 */
export function buildFeedSuccessResponse(result: unknown): ToolResult {
  const source = (result ?? {}) as Record<string, unknown>;
  const items = Array.isArray(source['data']) ? (source['data'] as unknown[]) : [];
  return buildToolResponse({
    ...source,
    status: 'operational' satisfies FeedStatus,
    lastSuccessfulProbe: new Date().toISOString(),
    items,
    itemCount: items.length,
    dataQualityWarnings: [],
  });
}

/**
 * Build an empty feed response under the uniform contract.
 *
 * Returns the same envelope shape as {@link buildFeedSuccessResponse}
 * so callers do not need to branch on response shape. The
 * `status` field defaults to `"unavailable"` because callers invoke
 * this helper when the upstream returned 404 / empty body / error-in-body.
 *
 * @param reason - Human-readable reason describing why the feed is empty
 *                 (also surfaced in `dataQualityWarnings` for backwards
 *                 compatibility with consumers reading the legacy field).
 * @param status - Feed status, defaults to `"unavailable"`. Use
 *                 `"degraded"` for partial-data scenarios.
 */
export function buildEmptyFeedResponse(
  reason = 'EP Open Data Portal returned no data for this feed — likely no updates in the requested timeframe',
  status: FeedStatus = 'unavailable',
): ToolResult {
  return buildToolResponse({
    status,
    lastSuccessfulProbe: new Date().toISOString(),
    items: [],
    itemCount: 0,
    reason,
    data: [],
    '@context': [],
    dataQualityWarnings: [reason],
  });
}
