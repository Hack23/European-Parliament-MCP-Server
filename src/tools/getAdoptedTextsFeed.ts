/**
 * MCP Tool: get_adopted_texts_feed
 *
 * Get recently updated European Parliament adopted texts from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /adopted-texts/feed`
 *
 * **Freshness fallback (PRIORITY):** The EP `/adopted-texts/feed` endpoint
 * has been observed returning historical backfill (TA-9-2024 / TA-10-2025)
 * even under `timeframe: "today"` since at least 2026-04-14, with no
 * current-year items reaching consumers. See
 * Hack23/euparliamentmonitor 2026-04-24 breaking audit §1.2 and
 * 2026-04-24 propositions audit Defect #7. To make recent documents
 * findable while the upstream feed is degraded, this handler augments the
 * feed payload with the current calendar year of `/adopted-texts` (which
 * accepts a `year` filter) whenever the feed contains no current-year
 * items, and surfaces a `dataQualityWarning` so callers can distinguish
 * fallback augmentation from a healthy feed response.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetAdoptedTextsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { ToolError } from './shared/errors.js';
import { isUpstream404, buildEmptyFeedResponse, buildFeedSuccessResponse } from './shared/feedUtils.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

/**
 * Maximum number of current-year `/adopted-texts` items to merge into the
 * feed payload when the feed itself returned no fresh items.  Bounded so
 * the augmented response stays the same order of magnitude as a normal
 * feed reply.
 */
const FRESHNESS_FALLBACK_LIMIT = 50;

/**
 * Returns `true` when the supplied feed item carries no current-year
 * marker.  We inspect both the canonical `dateAdopted` field and the
 * generated TA-identifier (`TA-{term}-{year}-{nnnn}`) because the EP
 * feed payload is JSON-LD and individual items may lack one but not
 * both fields.  Anything else (missing string, malformed) is treated
 * as "not current-year" so the fallback runs.
 *
 * @internal
 */
function isCurrentYearItem(item: unknown, currentYear: number): boolean {
  if (item === null || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  const yearStr = String(currentYear);
  const dateAdopted = obj['dateAdopted'];
  if (typeof dateAdopted === 'string' && dateAdopted.startsWith(yearStr)) return true;
  const id = obj['id'];
  if (typeof id === 'string' && id.includes(`-${yearStr}-`)) return true;
  const reference = obj['reference'];
  if (typeof reference === 'string' && reference.includes(`(${yearStr})`)) return true;
  return false;
}

/**
 * Best-effort freshness augmentation: pull the current calendar year of
 * `/adopted-texts` and merge into the feed payload when no current-year
 * items were returned.  Failures are swallowed (the feed response is
 * still returned) but a warning is added.
 *
 * @internal
 */
async function augmentWithCurrentYear(
  feedResult: Record<string, unknown>,
  currentYear: number,
): Promise<{ result: Record<string, unknown>; warnings: string[] }> {
  const warnings: string[] = [];
  try {
    const recent = await epClient.getAdoptedTexts({
      year: currentYear,
      limit: FRESHNESS_FALLBACK_LIMIT,
      offset: 0,
    });
    if (recent.data.length === 0) {
      warnings.push(
        `FRESHNESS_FALLBACK: EP /adopted-texts/feed returned no items from the current year (${String(currentYear)}). ` +
          `Augmented with /adopted-texts?year=${String(currentYear)} but that endpoint also returned 0 items — ` +
          `consider retrying later or widening the search.`,
      );
      return { result: feedResult, warnings };
    }
    const existingData = Array.isArray(feedResult['data']) ? (feedResult['data'] as unknown[]) : [];
    const augmented = {
      ...feedResult,
      data: [...recent.data, ...existingData],
    };
    warnings.push(
      `FRESHNESS_FALLBACK: EP /adopted-texts/feed returned no items from the current year (${String(currentYear)}). ` +
        `Augmented response with ${String(recent.data.length)} item(s) from /adopted-texts?year=${String(currentYear)} ` +
        `(non-feed endpoint, sorted by EP API default). Items prefixed before any existing feed items.`,
    );
    return { result: augmented, warnings };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'unknown error';
    warnings.push(
      `FRESHNESS_FALLBACK_FAILED: EP /adopted-texts/feed returned no current-year items and the freshness ` +
        `fallback against /adopted-texts?year=${String(currentYear)} also failed (${msg}). ` +
        `Caller should retry or widen the timeframe.`,
    );
    return { result: feedResult, warnings };
  }
}

/**
 * Handles the get_adopted_texts_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetAdoptedTextsFeedSchema}
 * @returns MCP tool result containing recently updated adopted text data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetAdoptedTextsFeed(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: ReturnType<typeof GetAdoptedTextsFeedSchema.parse>;
  try {
    params = GetAdoptedTextsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_adopted_texts_feed',
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
    if (params.workType !== undefined) apiParams['workType'] = params.workType;
    const result = await epClient.getAdoptedTextsFeed(apiParams);

    // Freshness check: when the feed payload contains no current-year items
    // (a known degraded-upstream pattern observed since 2026-04-14), augment
    // with the current calendar year of /adopted-texts so callers can still
    // discover recent documents.
    const currentYear = new Date().getUTCFullYear();
    const items = Array.isArray(result['data']) ? (result['data'] as unknown[]) : [];
    const hasCurrentYear = items.some((item) => isCurrentYearItem(item, currentYear));
    if (!hasCurrentYear) {
      const { result: augmented, warnings } = await augmentWithCurrentYear(result, currentYear);
      return buildFeedSuccessResponse(augmented, warnings);
    }

    return buildFeedSuccessResponse(result);
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildEmptyFeedResponse();
    throw new ToolError({
      toolName: 'get_adopted_texts_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve adopted texts feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_adopted_texts_feed */
export const getAdoptedTextsFeedToolMetadata = {
  name: 'get_adopted_texts_feed',
  description:
    'Get recently updated European Parliament adopted texts from the feed. Returns adopted texts published or updated during the specified timeframe. Data source: European Parliament Open Data Portal. NOTE: When the EP /adopted-texts/feed endpoint returns no items from the current calendar year (a known degraded-upstream pattern), the response is automatically augmented with /adopted-texts?year={currentYear} so callers can still discover recent documents — a FRESHNESS_FALLBACK warning is surfaced in dataQualityWarnings whenever this happens.',
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
      workType: { type: 'string', description: 'Work type filter' },
    },
  },
};
