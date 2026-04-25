/**
 * MCP Tool: get_procedures_feed
 *
 * Get recently updated European Parliament procedures from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /procedures/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetProceduresFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { ToolError } from './shared/errors.js';
import {
  isUpstream404,
  buildEmptyFeedResponse,
  isErrorInBody,
  buildFeedSuccessResponse,
  extractUpstreamStatusCode,
  type FeedErrorMeta,
} from './shared/feedUtils.js';
import { APIError } from '../clients/ep/baseClient.js';
import { TimeoutError } from '../utils/timeout.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/** Parameters passed to the degraded fallback, used to build an accurate warning. */
interface FallbackParams {
  timeframe?: string | undefined;
  startDate?: string | undefined;
  processType?: string | undefined;
}

/**
 * Attempt to fetch a degraded fallback from the non-feed procedures endpoint.
 *
 * Called when the feed's enrichment step fails (error-in-body). Returns a
 * degraded feed response with a warning, or `null` if the fallback also fails.
 *
 * **Note on envelope shape:** `GET /procedures` returns a
 * {@link PaginatedResponse} without the JSON-LD `@context` field that the
 * feed envelope normally carries.  To keep the uniform feed envelope stable
 * for downstream consumers, we spread the fallback payload into an object
 * with a default empty `@context: []` before passing it to
 * {@link buildFeedSuccessResponse}.
 *
 * **Note on filters:** the fallback uses `GET /procedures` which does not
 * accept `timeframe`, `startDate`, or `processType`.  Any caller-supplied
 * filters are listed in the warning so consumers do not misinterpret the
 * degraded payload as a properly-filtered result.
 *
 * @param rawError - The raw error string from the error-in-body payload
 * @param params   - Caller-supplied parameters (surfaced in the warning)
 * @returns Degraded ToolResult on success, or `null` on failure
 * @internal
 */
async function tryProceduresFallback(
  rawError: string,
  params: FallbackParams,
): Promise<ToolResult | null> {
  try {
    const fallbackResult = await epClient.getProcedures({ limit: 50, offset: 0 });
    const errorSuffix = rawError ? ` (upstream: ${rawError})` : '';
    const ignoredFilters: string[] = [];
    if (params.timeframe !== undefined) ignoredFilters.push(`timeframe="${params.timeframe}"`);
    if (params.startDate !== undefined) ignoredFilters.push(`startDate="${params.startDate}"`);
    if (params.processType !== undefined) ignoredFilters.push(`processType="${params.processType}"`);
    const ignoredSuffix =
      ignoredFilters.length > 0
        ? ` The following caller-supplied filters are NOT applied in degraded mode: ${ignoredFilters.join(', ')}.`
        : '';
    const fallbackWarning =
      `ENRICHMENT_FAILED: EP API enrichment step failed${errorSuffix}. ` +
      `Degraded mode: showing recent procedures from GET /procedures (non-feed endpoint).` +
      ` Items are procedure summaries rather than feed entries and may differ in shape from normal feed items.${ignoredSuffix}` +
      ` Consider retrying get_procedures_feed.`;
    // GET /procedures returns a PaginatedResponse without the JSON-LD `@context`
    // that the uniform feed envelope normally carries; inject an empty default
    // so the envelope shape stays stable for downstream consumers.
    const envelope = { '@context': [] as unknown[], ...fallbackResult };
    return buildFeedSuccessResponse(envelope, [fallbackWarning]);
  } catch {
    return null;
  }
}

/**
 * Build an in-band response for an error-in-body reply.
 *
 * Classifies the failure as `ENRICHMENT_FAILED`, parses any upstream
 * HTTP status code from the error message, and returns the full
 * machine-readable envelope.
 *
 * @param rawError - The raw error string from the EP API response body
 * @internal
 */
function buildEnrichmentFailedResponse(rawError: string): ToolResult {
  const upstreamStatusCode = extractUpstreamStatusCode(rawError);
  const upstream =
    upstreamStatusCode !== undefined || rawError !== ''
      ? {
          ...(upstreamStatusCode !== undefined && { statusCode: upstreamStatusCode }),
          ...(rawError !== '' && { errorMessage: rawError }),
        }
      : undefined;
  const meta: FeedErrorMeta = {
    errorCode: 'ENRICHMENT_FAILED',
    retryable: true,
    ...(upstream !== undefined ? { upstream } : {}),
  };
  const errorSuffix = rawError ? ` (upstream: ${rawError})` : '';
  return buildEmptyFeedResponse(
    `EP API returned an error-in-body response for get_procedures_feed — the upstream enrichment step may have failed${errorSuffix}.`,
    meta,
  );
}

/**
 * Classify and handle a caught upstream error, returning an in-band feed response
 * for well-known transient failure modes (404, timeout, rate limit).
 * Returns `null` for unclassified errors that should be re-thrown.
 *
 * @param error - The caught error
 * @returns In-band ToolResult for known transient failures, or `null`
 * @internal
 */
function handleUpstreamCatchError(error: unknown): ToolResult | null {
  if (isUpstream404(error)) return buildEmptyFeedResponse();

  if (error instanceof TimeoutError || (error instanceof Error && error.message.includes('timed out'))) {
    return buildEmptyFeedResponse(
      `EP API request timed out for get_procedures_feed — the endpoint is known to be slow. ` +
        `Consider retrying or using get_procedures with a limit parameter instead.`,
      { errorCode: 'UPSTREAM_TIMEOUT', retryable: true },
    );
  }

  if (error instanceof APIError && error.statusCode === 429) {
    return buildEmptyFeedResponse(
      `EP API rate limit reached for get_procedures_feed — retry after a short delay.`,
      {
        errorCode: 'RATE_LIMIT',
        retryable: true,
        upstream: {
          statusCode: 429,
          ...(error.message ? { errorMessage: error.message } : {}),
        },
      },
    );
  }

  return null;
}

/**
 * Inspect a single procedure-like item and return whether it carries a
 * current-year token in either `dateLastActivity` or its `reference`. Also
 * reports the oldest-observed reference year for diagnostic context.
 *
 * @internal
 */
function inspectProcedureItem(
  item: unknown,
  yearStr: string,
  refRegex: RegExp,
): { hasCurrentYear: boolean; observedYear: number | undefined } {
  if (item === null || typeof item !== 'object') {
    return { hasCurrentYear: false, observedYear: undefined };
  }
  const obj = item as Record<string, unknown>;
  const dateLastActivity = obj['dateLastActivity'];
  if (typeof dateLastActivity === 'string' && dateLastActivity.startsWith(yearStr)) {
    return { hasCurrentYear: true, observedYear: undefined };
  }
  const reference = obj['reference'];
  if (typeof reference !== 'string') {
    return { hasCurrentYear: false, observedYear: undefined };
  }
  if (refRegex.test(reference)) {
    return { hasCurrentYear: true, observedYear: undefined };
  }
  const m = /^(\d{4})\//.exec(reference);
  if (m?.[1] === undefined) return { hasCurrentYear: false, observedYear: undefined };
  return { hasCurrentYear: false, observedYear: parseInt(m[1], 10) };
}

/**
 * Build STALENESS_WARNING entries when the procedures-feed payload contains
 * no items dated within the current calendar year.
 *
 * Background: the Hack23/euparliamentmonitor 2026-04-24 breaking-run
 * reliability audit §1.4 reported that `get_procedures_feed` was returning
 * historical-tail ordering (1972/0003, 1980/0013) instead of date-sorted
 * newest-first results — even though the envelope was structurally healthy.
 * That means consumers applying the JSON envelope alone could not tell
 * whether the result was current. We inspect the canonical
 * `dateLastActivity` field and the procedure `reference` (`YYYY/NNNN(...)`)
 * for the current calendar year and emit a structured warning when neither
 * surfaces a current-year token. The check is conservative: any single
 * current-year item suppresses the warning.
 *
 * @internal
 */
/**
 * Scan a list of procedure-like items to determine whether any carries a
 * current-year token, and report the oldest reference year observed across
 * non-matching items (used purely for diagnostic context in the warning).
 *
 * @internal
 */
function scanProceduresForCurrentYear(
  items: readonly unknown[],
  yearStr: string,
  refRegex: RegExp,
): { hasCurrentYear: boolean; oldestYearObserved: number | undefined } {
  let oldestYearObserved: number | undefined;
  for (const item of items) {
    const { hasCurrentYear: cy, observedYear } = inspectProcedureItem(item, yearStr, refRegex);
    if (cy) return { hasCurrentYear: true, oldestYearObserved: undefined };
    if (observedYear !== undefined &&
        (oldestYearObserved === undefined || observedYear < oldestYearObserved)) {
      oldestYearObserved = observedYear;
    }
  }
  return { hasCurrentYear: false, oldestYearObserved };
}

function buildStalenessWarnings(result: unknown): readonly string[] {
  const source = (result ?? {}) as Record<string, unknown>;
  const items = Array.isArray(source['data']) ? (source['data'] as unknown[]) : [];
  if (items.length === 0) return [];
  const yearStr = String(new Date().getUTCFullYear());
  const refRegex = new RegExp(`^${yearStr}/`);
  const { hasCurrentYear, oldestYearObserved } = scanProceduresForCurrentYear(items, yearStr, refRegex);
  if (hasCurrentYear) return [];
  const ageSuffix =
    oldestYearObserved !== undefined
      ? ` Oldest reference observed in payload: ${String(oldestYearObserved)}.`
      : '';
  return [
    `STALENESS_WARNING: EP /procedures/feed returned ${String(items.length)} item(s) but none carry a ` +
      `${yearStr} reference or dateLastActivity. The upstream feed has been observed returning historical-tail ` +
      `ordering instead of date-sorted newest-first results.${ageSuffix} Consider falling back to ` +
      `get_procedures(limit=100) and sorting client-side by dateLastActivity descending.`,
  ];
}

/**
 * Handles the get_procedures_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetProceduresFeedSchema}
 * @returns MCP tool result containing recently updated procedure data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetProceduresFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetProceduresFeedSchema.parse>;
  try {
    params = GetProceduresFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_procedures_feed',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const apiParams: Record<string, unknown> = {};
    apiParams['timeframe'] = params.timeframe;
    if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
    if (params.processType !== undefined) apiParams['processType'] = params.processType;
    const result = await epClient.getProceduresFeed(apiParams);
    if (isErrorInBody(result)) {
      const rawError = typeof result['error'] === 'string' ? result['error'] : '';
      const fallback = await tryProceduresFallback(rawError, {
        timeframe: params.timeframe,
        startDate: params.startDate,
        processType: params.processType,
      });
      if (fallback !== null) return fallback;
      return buildEnrichmentFailedResponse(rawError);
    }
    const emptyReason = `EP API procedures/feed returned no data for timeframe '${params.timeframe}' — no procedures were updated in the requested period. This is expected during parliamentary recess or low-activity weeks. Use get_procedures (with limit/offset) to browse a paginated list of procedures as a reliable fallback.`;
    // Detect the historical-tail-ordering regression flagged in the
    // Hack23/euparliamentmonitor 2026-04-24 breaking audit §1.4: the EP API
    // sometimes returns 1972/1980 procedure IDs first instead of date-sorted
    // newest-first. When no item carries a current-year reference / activity
    // date we surface a STALENESS_WARNING so consumers can detect the
    // regression mechanically rather than by parsing prose.
    const stalenessWarnings = buildStalenessWarnings(result);
    return buildFeedSuccessResponse(result, stalenessWarnings, emptyReason);
  } catch (error: unknown) {
    const inBand = handleUpstreamCatchError(error);
    if (inBand !== null) return inBand;
    throw new ToolError({
      toolName: 'get_procedures_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve procedures feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_procedures_feed */
export const getProceduresFeedToolMetadata = {
  name: 'get_procedures_feed',
  description:
    'Get recently updated European Parliament procedures from the feed. Returns procedures published or updated during the specified timeframe. Data source: European Parliament Open Data Portal. NOTE: The EP API procedures/feed endpoint is significantly slower than other feeds — "one-month" queries may take around 120 seconds and can still time out. If you see timeouts, increase the global timeout with --timeout or EP_REQUEST_TIMEOUT_MS. When no procedures were updated in the requested timeframe (common during parliamentary recess or low-activity periods), the response will have status:"unavailable" and empty items — this is expected behaviour, not an error. In that case, use get_procedures (with limit/offset) to browse a paginated list of procedures as a reliable fallback. The response also surfaces a STALENESS_WARNING entry in dataQualityWarnings whenever the upstream returns historical-tail ordering with no current-year items (a known degraded-upstream pattern), so consumers can detect the regression programmatically.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      timeframe: {
        type: 'string',
        description: 'Timeframe for the feed (today, one-day, one-week, one-month, custom)',
        enum: ['today', 'one-day', 'one-week', 'one-month', 'custom'],
        default: 'one-week',
      },
      startDate: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD) — required when timeframe is "custom"',
      },
      processType: { type: 'string', description: 'Process type filter' },
    },
  },
};
