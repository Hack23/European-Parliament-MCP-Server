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
 * downstream consumers always receive the same envelope shape.
 *
 * ## Uniform feed response envelope
 *
 * Every feed handler emits the same body shape, regardless of whether
 * the upstream call succeeded, returned no data, or failed in-band:
 *
 * ```json
 * {
 *   "status": "operational" | "degraded" | "unavailable",
 *   "generatedAt": "2026-04-18T07:12:00Z",
 *   "items": [],
 *   "itemCount": 0,
 *   "reason": "Optional string when status !== 'operational'",
 *   "data": [],
 *   "@context": [],
 *   "dataQualityWarnings": []
 * }
 * ```
 *
 * - `status` — `"operational"` for fresh data without warnings,
 *   `"degraded"` for fresh data accompanied by data-quality warnings,
 *   `"unavailable"` when the upstream returned a 404 / error-in-body /
 *   empty body and we have no fresh data to report.
 * - `items` — canonical array field in the response contract.
 * - `data` — legacy compatibility field, normalized so serialized
 *   responses always expose it as an array with the same contents as
 *   `items` (note: responses are JSON-serialized, so consumers see
 *   structural equality, not referential identity).
 * - `itemCount` — length of `items`.
 * - `generatedAt` — ISO-8601 timestamp of when the response was built
 *   (not "last upstream success" — that would require state/caching).
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
 * Shared MCP `tools/list` inputSchema for fixed-window feed tools
 * (Group A: `get_documents_feed`, `get_plenary_documents_feed`, etc.).
 *
 * The underlying EP API endpoints do not accept `timeframe` / `startDate`
 * / `limit` / `offset` and always serve a server-defined default window
 * (typically one month).  For contract uniformity with the sliding-window
 * feed tools (Group B), this schema still advertises those parameters —
 * they are accepted by the Zod validator but silently ignored at the
 * upstream call site.  See `FixedWindowFeedSchema` in
 * `src/schemas/ep/feed.ts`.
 */
export const FIXED_WINDOW_FEED_INPUT_SCHEMA = {
  type: 'object' as const,
  properties: {
    timeframe: {
      type: 'string',
      description:
        'Informational-only — this feed uses a server-defined default window (typically one month) and ignores this parameter. Accepted for contract uniformity with sliding-window feed tools.',
      enum: ['today', 'one-day', 'one-week', 'one-month', 'custom'],
    },
    startDate: {
      type: 'string',
      description:
        'Informational-only — ignored by this fixed-window feed. Accepted for contract uniformity with sliding-window feed tools.',
    },
    limit: {
      type: 'number',
      description:
        'Informational-only — the upstream EP API does not paginate this fixed-window feed. Accepted for contract uniformity.',
      minimum: 1,
      maximum: 100,
    },
    offset: {
      type: 'number',
      description:
        'Informational-only — the upstream EP API does not paginate this fixed-window feed. Accepted for contract uniformity.',
      minimum: 0,
    },
  },
};

/** Default reason surfaced when an empty/no-data feed response is built. */
const EMPTY_FEED_REASON =
  'EP Open Data Portal returned no data for this feed — likely no updates in the requested timeframe';

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
 *
 * - `status` is **derived** from `items.length` and warnings:
 *   - `"unavailable"` when `items.length === 0` (covers the
 *     "HTTP 200 + empty array" upstream case);
 *   - `"degraded"` when items are present **and** any
 *     `dataQualityWarnings` are present (either supplied via `result`
 *     or passed explicitly);
 *   - `"operational"` when items are present and no warnings.
 * - `data` is normalized so that, after JSON serialization, consumers
 *   reading the legacy `data` field always see an array with the same
 *   contents as `items` (structural equality across the wire, not
 *   referential identity).
 * - Existing `dataQualityWarnings` from `result` are preserved and
 *   merged with any explicitly-supplied warnings (rather than
 *   clobbered). When `status` is `"unavailable"`, the empty-feed
 *   reason is appended for backwards compatibility with consumers
 *   reading the legacy field.
 * - `reason` is set whenever `status !== "operational"`.
 *
 * @param result - Raw upstream response payload (may contain `data`,
 *                 `@context`, and optionally `dataQualityWarnings`)
 * @param warnings - Optional extra data-quality warnings to merge into
 *                   the response.
 * @param customEmptyReason - Optional human-readable reason to use instead
 *                            of the shared {@link EMPTY_FEED_REASON} when
 *                            `items.length === 0`.  Useful when a specific
 *                            tool wants to surface a more descriptive message
 *                            while still preserving the upstream JSON-LD
 *                            payload (e.g. `@context`).  When omitted the
 *                            default shared reason is used.
 * @returns MCP-compliant ToolResult containing the uniform envelope
 */
export function buildFeedSuccessResponse(
  result: unknown,
  warnings: readonly string[] = [],
  customEmptyReason?: string,
): ToolResult {
  const source = (result ?? {}) as Record<string, unknown>;
  const items = Array.isArray(source['data']) ? (source['data'] as unknown[]) : [];

  const existingWarnings = Array.isArray(source['dataQualityWarnings'])
    ? (source['dataQualityWarnings'] as unknown[]).filter(
        (w): w is string => typeof w === 'string',
      )
    : [];
  const mergedWarnings = [...existingWarnings, ...warnings];

  let status: FeedStatus;
  let reason: string | undefined;
  if (items.length === 0) {
    status = 'unavailable';
    reason = customEmptyReason ?? EMPTY_FEED_REASON;
    // Surface the empty-feed reason in dataQualityWarnings for legacy consumers.
    if (!mergedWarnings.includes(reason)) {
      mergedWarnings.push(reason);
    }
  } else if (mergedWarnings.length > 0) {
    status = 'degraded';
    reason = mergedWarnings.join('; ');
  } else {
    status = 'operational';
  }

  return buildToolResponse({
    ...source,
    status,
    generatedAt: new Date().toISOString(),
    items,
    itemCount: items.length,
    data: items,
    ...(reason !== undefined ? { reason } : {}),
    dataQualityWarnings: mergedWarnings,
  });
}

/**
 * Build an empty feed response under the uniform contract.
 *
 * Returns the same envelope shape as {@link buildFeedSuccessResponse}
 * with `status: "unavailable"` and `items: []`. This helper is used
 * when the upstream returned 404 / empty body / error-in-body and we
 * have no fresh data to report.
 *
 * `"degraded"` is intentionally **not** accepted here because it
 * denotes "partial data with warnings" — for that case, call
 * {@link buildFeedSuccessResponse} with the partial payload and the
 * warnings (`status` will be derived as `"degraded"`).
 *
 * @param reason - Human-readable reason describing why the feed is empty
 *                 (also surfaced in `dataQualityWarnings` for backwards
 *                 compatibility with consumers reading the legacy field).
 */
export function buildEmptyFeedResponse(reason = EMPTY_FEED_REASON): ToolResult {
  const items: unknown[] = [];
  return buildToolResponse({
    status: 'unavailable' satisfies FeedStatus,
    generatedAt: new Date().toISOString(),
    items,
    itemCount: 0,
    reason,
    data: items,
    '@context': [],
    dataQualityWarnings: [reason],
  });
}
