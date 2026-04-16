#!/usr/bin/env tsx
/**
 * European Parliament Stats Validator & Comparison Tool
 *
 * Validates the static data in `src/data/generatedStats.ts` via two methods:
 *
 * 1. **Political landscape consistency** — internal validation of group seat
 *    shares, fragmentation indices, and structural invariants. These checks
 *    are deterministic and drive the exit code.
 *
 * 2. **API comparison** — fetches real record counts from the European
 *    Parliament Open Data Portal API using pagination-based counting
 *    (limit: 1000 per page, the API's server-side cap). Because the EP API
 *    does not provide a `totalItems` response header, all records are
 *    iterated to obtain accurate counts. Discrepancies are logged but do
 *    not affect the exit code (data may legitimately drift between releases).
 *
 * **Endpoint strategy — all endpoints counted, client-side bucketing where needed:**
 * - ✅ /meetings, /adopted-texts, /plenary-documents, /meps-declarations,
 *   /parliamentary-questions — support `year` param; server-filtered.
 * - ✅ /speeches — supports `sitting-date`/`sitting-date-end`; server-filtered.
 * - ✅ /events — NO server-side year filter; dates extracted from event IDs
 *   (e.g. `...-DEPOT-2025-03-26`); paginated with client-side year bucketing.
 *   Early termination stops once the target year's block is exhausted.
 * - ✅ /procedures — NO server-side year filter; year extracted from
 *   `dateInitiated` when available, or from procedure references in both
 *   dash form (`2024-0123`) and slash form (`2023/0123(COD)`).
 * - ✅ /external-documents — NO year filter; date from `document_date` field;
 *   counted as part of "Plenary Documents" total via client-side bucketing.
 * - ⏭ /committee-documents — NO year filter AND no date field; excluded.
 *
 * When invoked with `--update`, the script writes API-verified values back
 * into `src/data/generatedStats.ts` and updates the `generatedAt` timestamp.
 * Only fields where the API returned a valid count are updated.
 *
 * **Data quality safeguards (--update mode):**
 * - Partial fetches (pagination errors mid-stream) are never written back.
 * - API values below 10 are rejected when stored value is > 5× larger.
 * - API values representing > 50% drop from substantial stored values
 *   (> 100 items) are rejected as likely incomplete EP API data.
 * - All API calls are sequential to respect EP API rate limits.
 *
 * **Usage:**
 * ```bash
 * npx tsx scripts/generate-stats.ts              # validate latest covered year
 * npx tsx scripts/generate-stats.ts --year 2024  # validate specific year
 * npx tsx scripts/generate-stats.ts --all        # validate all years (2004–latest)
 * npx tsx scripts/generate-stats.ts --update     # validate and update stored stats
 * ```
 *
 * **Exit codes:**
 * - 0: Success (may include advisory API warnings)
 * - 1: Political landscape consistency errors
 *
 * **ISMS Compliance:**
 * - SC-002: Input validation on CLI arguments
 * - AU-002: Structured logging of validation results
 * - PE-001: Pagination-based counting with 1000-item pages
 *
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 * @module scripts/generate-stats
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EuropeanParliamentClient } from '../src/clients/europeanParliamentClient.js';
import { GENERATED_STATS } from '../src/data/generatedStats.js';
import type { YearlyStats, PoliticalGroupSnapshot, PoliticalLandscapeData } from '../src/data/generatedStats.js';

// ── Types ─────────────────────────────────────────────────────────

/** Comparison status for a single metric. */
type ComparisonStatus = 'MATCH' | 'CLOSE' | 'DISCREPANCY' | 'API_ERROR';

/** Result of comparing one metric between stored data and the live API. */
interface MetricComparison {
  /** Human-readable metric label */
  metric: string;
  /** Value currently stored in generatedStats.ts */
  storedValue: number;
  /** Value returned by the EP API (null if API call failed) */
  apiValue: number | null;
  /** Comparison status */
  status: ComparisonStatus;
  /** Percentage difference (positive = API higher, negative = API lower) */
  diffPercent: number | null;
  /** Optional note (e.g. error message on failure) */
  note?: string;
  /** Per-month counts (12 elements, Jan=0..Dec=11) when available */
  monthlyCounts?: number[];
}

/** Results for a single year's validation. */
interface YearValidation {
  /** Calendar year */
  year: number;
  /** Per-metric comparison results */
  comparisons: MetricComparison[];
}

/** Result of validating the political landscape internal consistency. */
interface LandscapeValidation {
  /** Calendar year */
  year: number;
  /** List of issues found */
  issues: string[];
}

/** Overall validation summary. */
interface ValidationSummary {
  /** Total metrics checked */
  totalChecks: number;
  /** Metrics that matched exactly */
  matches: number;
  /** Metrics within 10% tolerance */
  close: number;
  /** Metrics with significant discrepancy */
  discrepancies: number;
  /** Metrics where the API call failed */
  apiErrors: number;
  /** Political landscape validation issues */
  landscapeIssues: number;
  /** Recommendations for data updates */
  recommendations: string[];
}

// ── CLI argument parsing ──────────────────────────────────────────

/**
 * Number of recent years to validate when using `--recent`.
 * Covers the current partial year plus two prior full years,
 * which is sufficient for weekly scheduled refreshes since
 * older years rarely change.
 */
const RECENT_YEAR_COUNT = 3;

/** Parse command-line arguments. */
function parseArgs(): { years: number[]; update: boolean } {
  const args = process.argv.slice(2);
  const latestCoveredYear = GENERATED_STATS.coveragePeriod.to;
  const update = args.includes('--update');

  // --help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/generate-stats.ts [options]

Options:
  --year <YYYY>   Validate a specific year (default: latest covered year ${String(latestCoveredYear)})
  --all           Validate all years in the dataset (2004–${String(latestCoveredYear)})
  --recent        Validate the last ${String(RECENT_YEAR_COUNT)} years only (faster, suitable for scheduled runs)
  --update        Write API-verified values back into generatedStats.ts
  --help, -h      Show this help message

Examples:
  npx tsx scripts/generate-stats.ts
  npx tsx scripts/generate-stats.ts --year 2024
  npx tsx scripts/generate-stats.ts --all
  npx tsx scripts/generate-stats.ts --recent --update
  npx tsx scripts/generate-stats.ts --update
  npx tsx scripts/generate-stats.ts --all --update
`);
    process.exit(0);
  }

  // --all
  if (args.includes('--all')) {
    const allYears = GENERATED_STATS.yearlyStats.map((y) => y.year);
    return { years: allYears, update };
  }

  // --recent: validate the last RECENT_YEAR_COUNT years
  if (args.includes('--recent')) {
    const allYears = GENERATED_STATS.yearlyStats.map((y) => y.year);
    const recentYears = allYears.slice(-RECENT_YEAR_COUNT);
    return { years: recentYears, update };
  }

  // --year <YYYY>
  const yearIdx = args.indexOf('--year');
  if (yearIdx !== -1) {
    const yearStr = args[yearIdx + 1];
    if (!yearStr || !/^\d{4}$/.test(yearStr)) {
      console.error('Error: --year requires a valid 4-digit year (e.g. --year 2024)');
      process.exit(1);
    }
    const year = Number.parseInt(yearStr, 10);
    if (year < 2004 || year > latestCoveredYear) {
      console.error(`Error: Year must be between 2004 and ${String(latestCoveredYear)}`);
      process.exit(1);
    }
    return { years: [year], update };
  }

  // Default: latest covered year in the dataset
  return { years: [latestCoveredYear], update };
}

// ── Console formatting helpers ────────────────────────────────────

const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/**
 * Format elapsed milliseconds as a human-readable duration.
 *
 * @param ms - Elapsed time in milliseconds.
 */
function formatElapsed(ms: number): string {
  const secs = ms / 1000;
  if (secs < 60) {
    return `${secs.toFixed(1)}s`;
  }
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const remainSecs = totalSeconds % 60;
  const paddedSecs = String(remainSecs).padStart(2, '0');
  return `${String(mins)}m${paddedSecs}s`;
}

/** Global start time for elapsed tracking. */
const GLOBAL_START = Date.now();

/** Print a progress message with elapsed time. */
function progress(message: string): void {
  const elapsed = formatElapsed(Date.now() - GLOBAL_START);
  console.log(`  ${DIM}[${elapsed}]${RESET} ${message}`);
}

function statusIcon(status: ComparisonStatus): string {
  switch (status) {
    case 'MATCH':
      return `${GREEN}✓${RESET}`;
    case 'CLOSE':
      return `${YELLOW}≈${RESET}`;
    case 'DISCREPANCY':
      return `${RED}✗${RESET}`;
    case 'API_ERROR':
      return `${DIM}?${RESET}`;
  }
}

function formatDiff(diff: number | null): string {
  if (diff === null) return `${DIM}N/A${RESET}`;
  const sign = diff >= 0 ? '+' : '';
  const color = Math.abs(diff) <= 1 ? GREEN : Math.abs(diff) <= 10 ? YELLOW : RED;
  return `${color}${sign}${diff.toFixed(1)}%${RESET}`;
}

function padRight(str: string, len: number): string {
  // Strip ANSI codes for length calculation
  const stripped = str.replace(/\x1b\[[0-9;]*m/g, '');
  const padding = Math.max(0, len - stripped.length);
  return str + ' '.repeat(padding);
}

// ── API fetching ──────────────────────────────────────────────────

/**
 * Maximum page size accepted by the EP Open Data API.
 * Requests with larger `limit` values are silently capped to this.
 */
const EP_API_MAX_PAGE_SIZE = 1000;

/**
 * Maximum consecutive pages with zero matches before early termination.
 *
 * Some EP API endpoints (`/speeches`, `/events`, `/procedures`,
 * `/committee-documents`, `/external-documents`) do NOT support the
 * `year` query parameter — the API silently ignores it and returns
 * ALL records regardless.  Without early termination the script would
 * paginate through the entire dataset (100k+ records for speeches)
 * with zero year-matched results, wasting time and API quota.
 *
 * When this many consecutive pages yield no records matching the
 * target year, pagination stops and the result is reported as an
 * API_ERROR with a descriptive message.
 */
const MAX_CONSECUTIVE_EMPTY_PAGES = 3;

/**
 * Absolute upper bound on pages fetched per metric.
 *
 * Safety net to prevent runaway pagination even for endpoints that
 * do support year filtering — if the dataset is enormous (e.g.
 * parliamentary questions spanning decades) this caps the effort.
 */
const MAX_PAGES_PER_METRIC = 200;

/**
 * Count the total number of items for a metric by paginating through
 * the EP API.  Pages are fetched with `limit = EP_API_MAX_PAGE_SIZE`
 * (the server-side cap) and the item counts are summed.  Pagination
 * stops when a page returns fewer items than the limit, or when the
 * absolute page limit ({@link MAX_PAGES_PER_METRIC}) is reached.
 *
 * When the page limit is reached, a lightweight probe (limit: 1) is
 * sent to confirm whether more data actually exists — the EP client
 * uses a heuristic (`items.length === limit`) for `hasMore`, which
 * gives a false positive when a dataset ends on a page-aligned
 * boundary.  If the probe returns 0 items, the count is treated as
 * complete.
 *
 * Returns the total count or null on failure.
 */
async function countItems(
  label: string,
  fetcher: (params: { limit: number; offset: number }) => Promise<{ data: unknown[]; hasMore: boolean }>
): Promise<{ total: number | null; error?: string }> {
  let totalCount = 0;
  let offset = 0;
  let pageNum = 0;
  const fetchStart = Date.now();
  try {
    for (;;) {
      pageNum++;
      const result = await fetcher({ limit: EP_API_MAX_PAGE_SIZE, offset });
      totalCount += result.data.length;
      if (pageNum === 1 || pageNum % 3 === 0 || !result.hasMore || result.data.length < EP_API_MAX_PAGE_SIZE) {
        progress(`📊 ${label}: page ${String(pageNum)}, ${String(totalCount)} items so far (${formatElapsed(Date.now() - fetchStart)})`);
      }
      // Natural termination — check BEFORE the safety cap so that
      // a dataset that happens to end exactly on page MAX_PAGES_PER_METRIC
      // returns a successful count instead of an error.
      if (!result.hasMore || result.data.length < EP_API_MAX_PAGE_SIZE) break;

      // Safety: absolute page limit — reached only when hasMore is still
      // true (natural termination was checked first above).
      // Because the EP client uses a heuristic for hasMore
      // (items.length === limit), a dataset ending exactly on page
      // MAX_PAGES_PER_METRIC with a full page would still report
      // hasMore=true.  Do a lightweight probe (limit: 1) to confirm
      // whether more data actually exists before declaring incomplete.
      if (pageNum >= MAX_PAGES_PER_METRIC) {
        try {
          const probe = await fetcher({ limit: 1, offset: offset + EP_API_MAX_PAGE_SIZE });
          if (probe.data.length === 0) {
            // Dataset exhausted — the heuristic hasMore was a false positive
            progress(`✅ ${label}: ${String(totalCount)} items total (probe confirmed complete, ${formatElapsed(Date.now() - fetchStart)})`);
            return { total: totalCount };
          }
          // Probe returned data — genuinely incomplete
        } catch {
          // Probe failed — treat conservatively as incomplete
        }
        const note = `Reached max page limit (${String(MAX_PAGES_PER_METRIC)}) for ${label} — count of ${String(totalCount)} is incomplete.`;
        progress(`⚠️  ${label}: ${note}`);
        return { total: null, error: note };
      }
      offset += EP_API_MAX_PAGE_SIZE;
    }
    progress(`✅ ${label}: ${String(totalCount)} items total (${formatElapsed(Date.now() - fetchStart)})`);
    return { total: totalCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // If we already counted some items before the error, the accumulated
    // count is a lower bound but NOT necessarily the complete count.
    // Return the partial count with an error marker so callers (--update)
    // don't overwrite stored values with incomplete data.
    if (totalCount > 0) {
      const partialNote = `Partial count (${String(totalCount)} items) — error on page ${String(pageNum)}: ${message}`;
      progress(`⚠️  ${label}: ${partialNote}`);
      return { total: totalCount, error: partialNote };
    }
    console.error(`  ${DIM}⚠ API error fetching ${label}: ${message}${RESET}`);
    return { total: null, error: message };
  }
}

/**
 * Extract a YYYY-MM-DD date string from an EP API record.
 *
 * EP API endpoints return dates in different shapes depending on the
 * endpoint and whether the client has normalised the response:
 *
 * - **Normalised records:** `item.date` is a `YYYY-MM-DD` string.
 * - **Raw EP API shapes:** date may be in nested objects like
 *   `activity_date.@value` (speeches), `activity_start_date.@value`
 *   (events), or `had_activity_date.@value` (various).
 * - **ID-embedded dates:** Plenary sessions (`MTG-PL-2025-01-20`),
 *   Events (`eli/dl/event/1972-0003-ANPRO-1972-11-06`), and Speeches
 *   (`eli/dl/event/MTG-PL-2023-10-17-OTH-20390000`) embed dates in
 *   the record ID.
 *
 * This function tries each strategy in order: normalised `date` field,
 * known nested EP API date objects, regex extraction from the `id`,
 * and finally procedure-style `YYYY-NNNN` year extraction from
 * `reference` / `id` fields (returns synthetic `YYYY-01-01` — only
 * the year is available, so monthly bucketing shows all procedures in
 * January; the yearly total remains accurate).
 */
const DATE_PATTERN = /\b(\d{4})-(\d{2})-(\d{2})\b/;

/**
 * Pattern for procedure-style identifiers.  Matches both:
 *   - Dash form:  `2024-0123`, `2011-0901A`   (from `process_id`)
 *   - Slash form: `2023/0123(COD)`             (from `reference`)
 *
 * Captures the 4-digit year in group 1.  Used as a last-resort
 * year-only extraction for `/procedures` records when `dateInitiated`
 * is not available.
 */
const PROCEDURE_YEAR_PATTERN = /\b(\d{4})[-/]\d{3,5}/;

function extractRecordDate(item: Record<string, unknown>): string | null {
  // 1. Prefer the normalised `date` field if it looks like a date
  const dateField = item['date'];
  if (typeof dateField === 'string' && DATE_PATTERN.test(dateField)) {
    return dateField.substring(0, 10);
  }

  // 2. Try known EP API nested date shapes
  const nestedDateFields = [
    'activity_date',
    'activity_start_date',
    'had_activity_date',
  ] as const;
  for (const field of nestedDateFields) {
    const nested: unknown = item[field];
    if (nested && typeof nested === 'object' && nested !== null) {
      const value = (nested as Record<string, unknown>)['@value'];
      if (typeof value === 'string' && DATE_PATTERN.test(value)) {
        return value.substring(0, 10);
      }
    }
  }

  // 3. Fall back to extracting a full date (YYYY-MM-DD) from the `id` field.
  //    Works for events: `eli/dl/event/...-DEPOT-2025-03-26`
  //    Works for speeches: `MTG-PL-2023-10-17-OTH-...`
  //    Works for plenary sessions: `MTG-PL-2025-01-20`
  const idField = item['id'];
  if (typeof idField === 'string') {
    const match = DATE_PATTERN.exec(idField);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  // 4. Try `dateInitiated` / `dateLastActivity` — available on procedure records.
  //    These are proper YYYY-MM-DD dates set by the transformer.
  for (const field of ['dateInitiated', 'dateLastActivity'] as const) {
    const val = item[field];
    if (typeof val === 'string' && DATE_PATTERN.test(val)) {
      return val.substring(0, 10);
    }
  }

  // 5. Last resort: extract year from procedure-style reference field.
  //    Procedures have `reference: "2023/0123(COD)"` or `process_id: "2024-0123"`.
  //    Return `YYYY-01-01` as a synthetic date so the year matches.
  //    Monthly bucketing will show all procedures in January (acceptable
  //    since yearly total is the primary use case).
  const refField = item['reference'];
  if (typeof refField === 'string') {
    const procMatch = PROCEDURE_YEAR_PATTERN.exec(refField);
    if (procMatch) {
      return `${procMatch[1]}-01-01`;
    }
  }
  // Also try the `id` field for procedure-style patterns
  if (typeof idField === 'string') {
    const procMatch = PROCEDURE_YEAR_PATTERN.exec(idField);
    if (procMatch) {
      return `${procMatch[1]}-01-01`;
    }
  }

  return null;
}

/**
 * Count items by month for a given year using client-side date bucketing.
 *
 * Works with both server-filtered and unfiltered endpoints:
 *
 * - **Server-filtered** (e.g. `/meetings` with `year`): The server returns
 *   only the target year's data.  Date extraction provides monthly distribution.
 *
 * - **Unfiltered** (e.g. `/events`, `/procedures`): This function fetches
 *   ALL pages, extracts dates from each record (from `date` field, nested
 *   EP API date objects, `id`-embedded dates, or procedure `reference`
 *   YYYY-NNNN), and buckets items by month client-side.
 *
 * **Early termination** (ordered endpoints):
 * - When `yearFilterSupported` is true (default) and
 *   {@link MAX_CONSECUTIVE_EMPTY_PAGES} consecutive pages have zero matches
 *   with totalCount === 0: stops with null (date extraction issue).
 * - When `yearFilterSupported` is false (events, procedures): the "zero
 *   matches" early stop is DISABLED — allows scanning through older records
 *   until the target year's block is reached.  Once matches ARE found,
 *   early termination kicks in after the block is exhausted (totalCount > 0
 *   and consecutive empty pages >= threshold).
 *
 * Returns per-month counts (12 elements, Jan=0..Dec=11) and the total.
 * Items whose date doesn't match the target year are excluded from
 * both the total and monthly counts.
 */
async function countItemsGroupedByMonth(
  label: string,
  year: number,
  fetcher: (params: { limit: number; offset: number }) => Promise<{ data: Array<Record<string, unknown>>; hasMore: boolean }>,
  options?: { ordered?: boolean; yearFilterSupported?: boolean }
): Promise<{ total: number | null; monthlyCounts: number[]; error?: string }> {
  const isOrdered = options?.ordered !== false; // default: true (ordered)
  const supportsYearFilter = options?.yearFilterSupported !== false; // default: true
  const monthlyCounts: number[] = new Array<number>(12).fill(0);
  let totalCount = 0;
  let outsideYearOrUndated = 0;
  let offset = 0;
  let pageNum = 0;
  let consecutiveEmptyPages = 0;
  const yearStr = String(year);
  const fetchStart = Date.now();

  progress(`🔍 ${label} (${yearStr}): starting monthly bucketing...`);

  try {
    for (;;) {
      pageNum++;
      const result = await fetcher({ limit: EP_API_MAX_PAGE_SIZE, offset });
      let pageMatches = 0;
      for (const item of result.data) {
        const dateStr = extractRecordDate(item);
        if (!dateStr || !dateStr.startsWith(yearStr)) {
          outsideYearOrUndated++;
          continue; // skip items without a parseable date or outside the target year
        }
        totalCount++;
        pageMatches++;
        const monthIdx = Number.parseInt(dateStr.substring(5, 7), 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          monthlyCounts[monthIdx]++;
        }
      }

      // Track consecutive pages with zero matches for early termination
      consecutiveEmptyPages = pageMatches > 0 ? 0 : consecutiveEmptyPages + 1;

      // Show progress every page
      progress(`📊 ${label}: page ${String(pageNum)}, ${String(totalCount)} matched ${yearStr}, ${String(outsideYearOrUndated)} outside year or undated (${formatElapsed(Date.now() - fetchStart)})`);

      // Early termination (ordered endpoints only): too many consecutive
      // pages without matches AND the endpoint has server-side year filter.
      // If the server supposedly filters by year but returns 0 matches after
      // several pages, date extraction probably failed — give up.
      //
      // For endpoints WITHOUT server-side year filtering (events, procedures),
      // 0 matches on early pages is expected — the target year's records are
      // deeper in the dataset.  Skip this check; rely on the "found then
      // exhausted" branch (totalCount > 0) or the MAX_PAGES safety cap.
      if (isOrdered && supportsYearFilter && consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY_PAGES && totalCount === 0) {
        const note = `0 parseable dates matched year ${yearStr} for ${label} after ${String(pageNum)} pages — ` +
          `date extraction may have failed or the year has no data.`;
        progress(`⚠️  ${label}: early termination after ${String(pageNum)} pages with 0 matches`);
        return { total: null, monthlyCounts, error: note };
      }

      // Early termination (all ordered endpoints): we found some matches
      // earlier but now seeing consecutive empty pages — likely exhausted
      // all records for this year.  Works for both server-filtered and
      // client-filtered endpoints because once we've passed through the
      // target year's contiguous block, there are no more matches.
      if (isOrdered && consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY_PAGES && totalCount > 0) {
        progress(`✅ ${label}: ${String(totalCount)} items in ${yearStr} (early stop after ${String(consecutiveEmptyPages)} empty pages, ${formatElapsed(Date.now() - fetchStart)})`);
        break;
      }

      // Natural termination — check BEFORE the safety cap so that
      // a dataset ending exactly on page MAX_PAGES_PER_METRIC returns
      // successfully instead of being flagged as incomplete.
      if (!result.hasMore || result.data.length < EP_API_MAX_PAGE_SIZE) break;

      // Safety: absolute page limit — only reached when hasMore is still
      // true (natural termination was checked first above).
      // Because the EP client uses a heuristic for hasMore
      // (items.length === limit), do a lightweight probe to confirm
      // whether more data actually exists before declaring incomplete.
      if (pageNum >= MAX_PAGES_PER_METRIC) {
        try {
          const probe = await fetcher({ limit: 1, offset: offset + EP_API_MAX_PAGE_SIZE });
          if (probe.data.length === 0) {
            // Dataset exhausted — heuristic hasMore was a false positive
            break; // fall through to the success summary below
          }
        } catch {
          // Probe failed — treat conservatively as incomplete
        }
        const note = `Reached max page limit (${String(MAX_PAGES_PER_METRIC)}) for ${label} — count of ${String(totalCount)} is incomplete.`;
        progress(`⚠️  ${label}: ${note}`);
        return { total: null, monthlyCounts, error: note };
      }

      offset += EP_API_MAX_PAGE_SIZE;
    }

    // Log monthly summary
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthSummary = monthlyCounts
      .map((c, i) => `${monthNames[i] ?? ''}:${String(c)}`)
      .join(' ');
    const outsideNote = outsideYearOrUndated > 0 ? ` (${String(outsideYearOrUndated)} outside year or undated for ${yearStr})` : '';
    console.log(`    ${DIM}📅 ${monthSummary} = ${String(totalCount)}${outsideNote}${RESET}`);
    progress(`✅ ${label}: ${String(totalCount)} items in ${yearStr} (${formatElapsed(Date.now() - fetchStart)})`);

    return { total: totalCount, monthlyCounts };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`  ${DIM}⚠ API error fetching ${label}: ${message}${RESET}`);
    if (totalCount > 0) {
      // Preserve partial counts for diagnostics, but surface the error so callers
      // don't treat this as a fully successful count (e.g. when running --update).
      progress(`⚠️  ${label}: ${String(totalCount)} items (partial, error on page ${String(pageNum)})`);
      return { total: totalCount, monthlyCounts, error: message };
    }
    return { total: null, monthlyCounts, error: message };
  }
}

/**
 * Determine comparison status between stored and API values.
 * - MATCH: values are identical
 * - CLOSE: within 10% tolerance
 * - DISCREPANCY: more than 10% difference
 */
function compareValues(stored: number, api: number | null): { status: ComparisonStatus; diffPercent: number | null } {
  if (api === null) {
    return { status: 'API_ERROR', diffPercent: null };
  }
  if (stored === api) {
    return { status: 'MATCH', diffPercent: 0 };
  }
  // Avoid division by zero
  const base = stored === 0 ? 1 : stored;
  const diffPercent = ((api - stored) / base) * 100;
  if (Math.abs(diffPercent) <= 10) {
    return { status: 'CLOSE', diffPercent };
  }
  return { status: 'DISCREPANCY', diffPercent };
}

// ── Year validation (API comparison) ──────────────────────────────

/**
 * Fetch live counts from the EP API for a given year and compare
 * them against the stored RAW_YEARLY data.
 *
 * Uses client-side date bucketing for endpoints whose records have
 * a `date` field — fetches all items for the year once, then groups
 * them by month.  This gives real monthly counts without relying on
 * server-side date-range filtering (which the EP API ignores).
 *
 * Endpoints without usable date fields use simple pagination counting.
 *
 * The EP API does not return a `totalItems` header, so the only
 * reliable way to count records is to iterate through all pages.
 */
async function validateYearAgainstAPI(
  client: EuropeanParliamentClient,
  yearStats: YearlyStats
): Promise<YearValidation> {
  const year = yearStats.year;
  const comparisons: MetricComparison[] = [];

  console.log(`\n${BOLD}${CYAN}── Fetching API data for ${String(year)} (with monthly bucketing) ──${RESET}`);

  // ── Metrics with date bucketing ────────────────────────────────
  // Records from these endpoints have dates extractable from their
  // `date` field, ID, or reference.  For endpoints with server-side
  // year filtering, the API returns only the target year's data.
  // For endpoints without year filtering, we iterate through ALL
  // records and count client-side — client-side counting is trusted.
  //
  // EP API year-filter support per endpoint (from OpenAPI spec):
  //   /meetings (plenary sessions): ✅ supports `year` param
  //   /speeches:                     ✅ supports `sitting-date` + `sitting-date-end`
  //   /events:                       ❌ NO year/date params — date extracted from ID suffix
  //   /procedures:                   ❌ NO year — year extracted from YYYY-NNNN reference
  const monthlyMetrics: Array<{
    label: string;
    storedKey: keyof YearlyStats;
    count: () => Promise<{ total: number | null; monthlyCounts: number[]; error?: string }>;
  }> = [
    {
      label: 'Plenary Sessions',
      storedKey: 'plenarySessions',
      // EP API `/meetings` supports `year` ✅ — server-side filtered.
      // Session IDs contain dates: MTG-PL-2025-01-20
      count: () => countItemsGroupedByMonth('Plenary Sessions', year, (p) =>
        client.getPlenarySessions({ year, ...p })
      ),
    },
    {
      label: 'Speeches',
      storedKey: 'speeches',
      // EP API `/speeches` supports `sitting-date` + `sitting-date-end` ✅.
      // The client maps dateFrom/dateTo to these API params.
      // Server-side filtering returns only speeches for this year; client-
      // side date extraction from IDs (MTG-PL-YYYY-MM-DD-*) gives monthly
      // bucketing.
      count: () => countItemsGroupedByMonth('Speeches', year, (p) =>
        client.getSpeeches({ dateFrom: `${String(year)}-01-01`, dateTo: `${String(year)}-12-31`, ...p })
      ),
    },
    {
      label: 'Events',
      storedKey: 'events',
      // EP API `/events` does NOT support `year` or any date filter ❌.
      // Event IDs contain full dates: `...-DEPOT-2025-03-26`.
      // Records are ordered by procedure ID (roughly year-ordered).
      // We iterate ALL records, extract dates from IDs, and count
      // client-side.  Early termination kicks in after finding and
      // then exhausting the target year's contiguous block.
      count: () => countItemsGroupedByMonth('Events', year, (p) =>
        client.getEvents(p),
        { ordered: true, yearFilterSupported: false }
      ),
    },
    {
      label: 'Procedures',
      storedKey: 'procedures',
      // EP API `/procedures` does NOT support `year` ❌.
      // Procedure references have YYYY-NNNN format (e.g. `2024-0123`).
      // Records are ordered by ID (year-ordered).  Year is extracted
      // from the `reference` field; monthly bucketing puts all items
      // in January (only year is available, not month).
      count: () => countItemsGroupedByMonth('Procedures', year, (p) =>
        client.getProcedures(p),
        { ordered: true, yearFilterSupported: false }
      ),
    },
  ];

  // ── Metrics using simple pagination counting ───────────────────
  // These endpoints have server-side `year` filtering, making
  // full-item download unnecessary — just count pages.
  //
  // EP API year-filter support (from OpenAPI spec):
  //   /adopted-texts:            ✅ supports `year`
  //   /parliamentary-questions:  ✅ supports `year` (via dateFrom → year extraction)
  //   /plenary-documents:        ✅ supports `year`
  //   /external-documents:       ❌ NO `year` — included in the "Plenary Documents"
  //                              metric via `countItemsGroupedByMonth`, using
  //                              `document_date` for client-side year/month bucketing
  //   /committee-documents:      ❌ NO `year`, NO date field — excluded
  //   /meps-declarations:        ✅ supports `year`
  const yearlyMetrics: Array<{
    label: string;
    storedKey: keyof YearlyStats;
    count: () => Promise<{ total: number | null; error?: string }>;
  }> = [
    {
      label: 'Parliamentary Questions',
      storedKey: 'parliamentaryQuestions',
      // EP API `/parliamentary-questions` supports `year` ✅.
      // The client maps dateFrom to the `year` query parameter.
      // Use simple pagination counting since the server already filters
      // by year — client-side date bucketing fails because transformed
      // question records often lack parseable date fields.
      count: () => countItems('Parliamentary Questions', (p) =>
        client.getParliamentaryQuestions({ dateFrom: `${String(year)}-01-01`, ...p })
      ),
    },
    {
      label: 'Adopted Texts',
      storedKey: 'adoptedTexts',
      count: () => countItems('Adopted Texts', (p) => client.getAdoptedTexts({ year, ...p })),
    },
    {
      label: 'Plenary Documents',
      storedKey: 'documents',
      // Document count = plenary docs (year-filtered ✅) + external docs
      // (date-extracted from `document_date` field ✅).
      // /committee-documents has neither year filtering nor date fields
      // in its response — excluded from per-year count.
      count: async () => {
        // Fetch plenary docs and external docs SEQUENTIALLY to respect
        // EP API rate limits.  External docs require full pagination
        // (no year filter) so this can be slow — sequential ordering
        // avoids concurrent requests that may trigger rate limiting.
        progress('🔍 Plenary Documents: fetching plenary (year-filtered) then external (date-bucketed) sequentially...');
        const plenary = await countItems('Plenary Docs', (p) => client.getPlenaryDocuments({ year, ...p }));
        const external = await countItemsGroupedByMonth('External Docs', year, (p) =>
          client.getExternalDocuments(p),
          { ordered: true, yearFilterSupported: false }
        );
        const errors: string[] = [];
        if (plenary.error) errors.push(`Plenary: ${plenary.error}`);
        if (external.error) errors.push(`External: ${external.error}`);

        const plenaryCount = plenary.total ?? 0;
        const externalCount = external.total ?? 0;
        const total = plenaryCount + externalCount;
        if (plenary.total === null && external.total === null) {
          return { total: null, error: errors.join(' | ') };
        }
        progress(`✅ Plenary Documents: ${String(plenaryCount)} plenary + ${String(externalCount)} external = ${String(total)}`);
        return { total, error: errors.length > 0 ? errors.join(' | ') : undefined };
      },
    },
    {
      label: 'MEP Declarations',
      storedKey: 'declarations',
      count: () => countItems('MEP Declarations', (p) => client.getMEPDeclarations({ year, ...p })),
    },
  ];

  // Fetch monthly-batched metrics sequentially to respect rate limits
  const totalMetrics = monthlyMetrics.length + yearlyMetrics.length;
  let metricIdx = 0;
  for (const metric of monthlyMetrics) {
    metricIdx++;
    console.log(`\n  ${BOLD}[${String(metricIdx)}/${String(totalMetrics)}] ${metric.label}${RESET}`);
    const { total, monthlyCounts, error } = await metric.count();
    const storedValue = yearStats[metric.storedKey] as number;
    const { status, diffPercent } = compareValues(storedValue, total);

    comparisons.push({
      metric: metric.label,
      storedValue,
      apiValue: total,
      status,
      diffPercent,
      note: error,
      monthlyCounts,
    });
  }

  // Fetch yearly metrics sequentially
  for (const metric of yearlyMetrics) {
    metricIdx++;
    console.log(`\n  ${BOLD}[${String(metricIdx)}/${String(totalMetrics)}] ${metric.label}${RESET}`);
    const { total, error } = await metric.count();
    const storedValue = yearStats[metric.storedKey] as number;
    const { status, diffPercent } = compareValues(storedValue, total);

    comparisons.push({
      metric: metric.label,
      storedValue,
      apiValue: total,
      status,
      diffPercent,
      note: error,
    });
  }

  // MEP counts (not year-filtered — reflects current state)
  const latestCoveredYear = GENERATED_STATS.coveragePeriod.to;
  if (year === latestCoveredYear) {
    console.log(`\n  ${BOLD}MEP Counts (latest year only)${RESET}`);
    // Current MEPs vs stored mepCount
    const { total: currentTotal, error: currentError } = await countItems(
      'Current MEPs',
      (p) => client.getCurrentMEPs(p),
    );
    {
      const storedValue = yearStats.mepCount as number;
      const { status, diffPercent } = compareValues(storedValue, currentTotal);

      comparisons.push({
        metric: 'Current MEPs',
        storedValue,
        apiValue: currentTotal,
        status,
        diffPercent,
        note: currentError,
      });
    }

    // Turnover = incoming + outgoing
    const { total: incomingTotal, error: incomingError } = await countItems(
      'Incoming MEPs',
      (p) => client.getIncomingMEPs(p),
    );
    const { total: outgoingTotal, error: outgoingError } = await countItems(
      'Outgoing MEPs',
      (p) => client.getOutgoingMEPs(p),
    );

    const turnoverApiValue =
      incomingTotal != null && outgoingTotal != null
        ? incomingTotal + outgoingTotal
        : null;

    const turnoverNoteParts: string[] = [];
    if (incomingError) {
      turnoverNoteParts.push(`Incoming: ${incomingError}`);
    }
    if (outgoingError) {
      turnoverNoteParts.push(`Outgoing: ${outgoingError}`);
    }
    const turnoverNote = turnoverNoteParts.length > 0 ? turnoverNoteParts.join(' | ') : undefined;

    {
      const storedValue = yearStats.mepTurnover as number;
      const { status, diffPercent } = compareValues(storedValue, turnoverApiValue);

      comparisons.push({
        metric: 'MEP Turnover (incoming + outgoing)',
        storedValue,
        apiValue: turnoverApiValue,
        status,
        diffPercent,
        note: turnoverNote,
      });
    }
  }

  return { year, comparisons };
}

// ── Political landscape validation ────────────────────────────────

/**
 * Validate internal consistency of the political landscape data
 * for a given year.
 */
function validatePoliticalLandscape(yearStats: YearlyStats): LandscapeValidation {
  const issues: string[] = [];
  const landscape: PoliticalLandscapeData = yearStats.politicalLandscape;
  const groups: PoliticalGroupSnapshot[] = landscape.groups;

  if (groups.length === 0) {
    issues.push('No political groups defined');
    return { year: yearStats.year, issues };
  }

  // 1. Seat shares should sum to ~100%
  const totalSeatShare = groups.reduce((sum, g) => sum + g.seatShare, 0);
  if (Math.abs(totalSeatShare - 100) > 1.5) {
    issues.push(
      `Seat shares sum to ${totalSeatShare.toFixed(1)}% (expected ~100%, tolerance ±1.5%)`
    );
  }

  // 2. totalGroups should match non-NI group count
  const nonNIGroups = groups.filter((g) => g.name !== 'NI');
  if (landscape.totalGroups !== nonNIGroups.length) {
    issues.push(
      `totalGroups is ${String(landscape.totalGroups)} but found ${String(nonNIGroups.length)} non-NI groups`
    );
  }

  // 3. largestGroup should match the group with the most seats
  const sorted = [...groups].sort((a, b) => b.seats - a.seats);
  const actualLargest = sorted[0];
  if (actualLargest && landscape.largestGroup !== actualLargest.name) {
    issues.push(
      `largestGroup is '${landscape.largestGroup}' but '${actualLargest.name}' has the most seats (${String(actualLargest.seats)})`
    );
  }

  // 4. largestGroupSeatShare should match
  if (actualLargest && Math.abs(landscape.largestGroupSeatShare - actualLargest.seatShare) > 0.1) {
    issues.push(
      `largestGroupSeatShare is ${String(landscape.largestGroupSeatShare)}% but '${actualLargest.name}' has ${String(actualLargest.seatShare)}%`
    );
  }

  // 5. Fragmentation index (Laakso-Taagepera: 1 / Σ(p_i²))
  const sumSquares = groups.reduce((sum, g) => {
    const proportion = g.seatShare / 100;
    return sum + proportion * proportion;
  }, 0);
  const expectedFragmentation = sumSquares > 0 ? 1 / sumSquares : 0;
  const roundedExpected = Math.round(expectedFragmentation * 100) / 100;
  if (Math.abs(landscape.fragmentationIndex - roundedExpected) > 0.15) {
    issues.push(
      `fragmentationIndex is ${String(landscape.fragmentationIndex)} but Laakso-Taagepera computation gives ${String(roundedExpected)}`
    );
  }

  // 6. Seats should be positive integers
  for (const group of groups) {
    if (group.seats <= 0 || !Number.isInteger(group.seats)) {
      issues.push(`Group '${group.name}' has invalid seat count: ${String(group.seats)}`);
    }
    if (group.seatShare < 0 || group.seatShare > 100) {
      issues.push(`Group '${group.name}' has invalid seatShare: ${String(group.seatShare)}%`);
    }
  }

  // 7. Total seats should be roughly the mepCount.
  // Tolerance accounts for transitional periods and vacant seats.
  const MAX_SEAT_DISCREPANCY = 15;
  const totalSeats = groups.reduce((sum, g) => sum + g.seats, 0);
  if (Math.abs(totalSeats - yearStats.mepCount) > MAX_SEAT_DISCREPANCY) {
    issues.push(
      `Total seats across groups (${String(totalSeats)}) differs from mepCount (${String(yearStats.mepCount)}) by more than ${String(MAX_SEAT_DISCREPANCY)}`
    );
  }

  return { year: yearStats.year, issues };
}

// ── Output formatting ─────────────────────────────────────────────

/** Print a comparison table for a single year. */
function printYearComparison(validation: YearValidation): void {
  console.log(`\n${BOLD}Year ${String(validation.year)} — API Comparison:${RESET}`);
  console.log('─'.repeat(80));
  console.log(
    `  ${padRight('Metric', 28)}${padRight('Stored', 10)}${padRight('API', 10)}${padRight('Diff', 12)}Status`
  );
  console.log('─'.repeat(80));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (const c of validation.comparisons) {
    const storedStr = String(c.storedValue);
    const apiStr = c.apiValue !== null ? String(c.apiValue) : 'N/A';
    const diffStr = formatDiff(c.diffPercent);
    const icon = statusIcon(c.status);

    console.log(
      `  ${icon} ${padRight(c.metric, 26)}${padRight(storedStr, 10)}${padRight(apiStr, 10)}${padRight(diffStr, 20)}${c.status}`
    );
    if (c.note) {
      console.log(`    ${DIM}↳ ${c.note}${RESET}`);
    }
    // Print monthly breakdown if available
    if (c.monthlyCounts) {
      const monthDetail = c.monthlyCounts
        .map((count, i) => `${monthNames[i] ?? ''}:${String(count).padStart(4)}`)
        .join(' ');
      console.log(`    ${DIM}📅 ${monthDetail}${RESET}`);
    }
  }
}

/** Print political landscape validation for a year. */
function printLandscapeValidation(validation: LandscapeValidation): void {
  if (validation.issues.length === 0) {
    console.log(`  ${GREEN}✓${RESET} Political landscape for ${String(validation.year)}: all checks passed`);
    return;
  }

  console.log(`  ${RED}✗${RESET} Political landscape for ${String(validation.year)}: ${String(validation.issues.length)} issue(s)`);
  for (const issue of validation.issues) {
    console.log(`    ${YELLOW}⚠${RESET} ${issue}`);
  }
}

/** Compute and print overall validation summary. */
function printSummary(
  yearValidations: YearValidation[],
  landscapeValidations: LandscapeValidation[]
): ValidationSummary {
  const summary: ValidationSummary = {
    totalChecks: 0,
    matches: 0,
    close: 0,
    discrepancies: 0,
    apiErrors: 0,
    landscapeIssues: 0,
    recommendations: [],
  };

  for (const yv of yearValidations) {
    for (const c of yv.comparisons) {
      summary.totalChecks++;
      switch (c.status) {
        case 'MATCH':
          summary.matches++;
          break;
        case 'CLOSE':
          summary.close++;
          break;
        case 'DISCREPANCY':
          summary.discrepancies++;
          break;
        case 'API_ERROR':
          summary.apiErrors++;
          break;
      }
    }
  }

  for (const lv of landscapeValidations) {
    summary.landscapeIssues += lv.issues.length;
  }

  // Build recommendations
  if (summary.discrepancies > 0) {
    summary.recommendations.push(
      `${String(summary.discrepancies)} API comparison(s) show significant discrepancies (>10%). Review stored data in generatedStats.ts.`
    );
  }
  if (summary.close > 0) {
    summary.recommendations.push(
      `${String(summary.close)} API comparison(s) are close but not exact (within 10%). Minor data drift expected.`
    );
  }
  if (summary.apiErrors > 0) {
    summary.recommendations.push(
      `${String(summary.apiErrors)} API call(s) failed. Re-run the script later or check API availability.`
    );
  }
  if (summary.landscapeIssues > 0) {
    summary.recommendations.push(
      `${String(summary.landscapeIssues)} political landscape consistency issue(s) found. Review group data manually.`
    );
  }
  if (summary.discrepancies === 0 && summary.close === 0 && summary.landscapeIssues === 0) {
    summary.recommendations.push('All validations passed. No data updates needed.');
  }

  // Print summary
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`${BOLD}VALIDATION SUMMARY${RESET}`);
  console.log(`${'═'.repeat(80)}`);
  console.log(`  Total API checks:     ${String(summary.totalChecks)}`);
  console.log(`  ${GREEN}✓${RESET} Exact matches:      ${String(summary.matches)}`);
  console.log(`  ${YELLOW}≈${RESET} Close (±10%):       ${String(summary.close)}`);
  console.log(`  ${RED}✗${RESET} Discrepancies:      ${String(summary.discrepancies)}`);
  console.log(`  ${DIM}?${RESET} API errors:         ${String(summary.apiErrors)}`);
  console.log(`  Landscape issues:     ${String(summary.landscapeIssues)}`);
  console.log();
  console.log(`${BOLD}Recommendations:${RESET}`);
  for (const rec of summary.recommendations) {
    console.log(`  • ${rec}`);
  }
  console.log();

  return summary;
}

// ── File update logic ─────────────────────────────────────────────

/** Fields in RAW_YEARLY that can be verified and updated from the API. */
const UPDATABLE_FIELDS = [
  'adoptedTexts',
  'procedures',
  'documents',
  'parliamentaryQuestions',
  'declarations',
  'plenarySessions',
  'speeches',
  'events',
] as const;

/** Fields updated only for the latest covered year. */
const LATEST_YEAR_FIELDS = ['mepCount', 'mepTurnover'] as const;

/** Map metric labels to RAW_YEARLY field names. */
const METRIC_TO_FIELD: Record<string, string> = {
  'Adopted Texts': 'adoptedTexts',
  'Procedures': 'procedures',
  'Plenary Documents': 'documents',
  'Parliamentary Questions': 'parliamentaryQuestions',
  'MEP Declarations': 'declarations',
  'Plenary Sessions': 'plenarySessions',
  'Speeches': 'speeches',
  'Events': 'events',
  'Current MEPs': 'mepCount',
  'MEP Turnover (incoming + outgoing)': 'mepTurnover',
};

/**
 * Minimum credibility threshold for API values.
 *
 * The EP Open Data API has incomplete historical data for certain
 * endpoints (e.g. adopted-texts returns 1–2 items for years before 2014).
 * When the API returns a value below this threshold AND the stored value
 * is substantially higher, the API value is treated as unreliable and
 * the stored value is preserved.
 */
const MIN_CREDIBLE_VALUE = 10;

/**
 * Maximum allowed percentage drop from stored value before the API value
 * is treated as incomplete/unreliable.
 *
 * EP API endpoints sometimes return partial datasets due to:
 * - Server-side pagination issues or timeouts
 * - Data reorganisation or migration
 * - Incomplete database loads
 *
 * When the stored value is substantial (> {@link MIN_STORED_FOR_DROP_CHECK})
 * and the API returns a value more than this percentage below the stored
 * value, the update is rejected as likely incomplete.
 *
 * Set to 50% to catch clearly incomplete data (e.g. 80% drops in speeches,
 * 73% drops in documents) while still allowing genuine corrections.
 */
const MAX_ALLOWED_DROP_PERCENT = 50;

/**
 * Minimum stored value before the "significant drop" guard activates.
 *
 * Small stored values (≤ 100) are allowed to fluctuate freely since
 * even large percentage changes represent small absolute differences.
 */
const MIN_STORED_FOR_DROP_CHECK = 100;

/**
 * Check whether an API value is credible enough to overwrite the stored value.
 *
 * Returns false when the API clearly returned incomplete data:
 *
 * **Guard 1 — tiny API value:** API value is below {@link MIN_CREDIBLE_VALUE}
 * AND stored value is much larger (> 5× the API value).
 *
 * **Guard 2 — significant drop:** Stored value is substantial
 * (> {@link MIN_STORED_FOR_DROP_CHECK}) AND the API value represents a drop
 * of more than {@link MAX_ALLOWED_DROP_PERCENT}% from stored. This catches
 * scenarios where the EP API returns a plausible-looking number (e.g. 1998
 * speeches) that is nonetheless far below the known count (10000), indicating
 * incomplete pagination or partial data loads.
 *
 * Both guards protect curated data from being overwritten by incomplete
 * EP API responses while still allowing genuine corrections (increases
 * and small decreases).
 */
function isCredibleApiValue(apiValue: number, storedValue: number): boolean {
  // Guard 1: Very small API value when stored is much larger
  if (apiValue < MIN_CREDIBLE_VALUE && storedValue > apiValue * 5) return false;

  // Guard 2: Significant drop from a substantial stored value.
  // Increases are always trusted (API has more data than stored).
  // Only decreases beyond the threshold are flagged.
  if (
    storedValue > MIN_STORED_FOR_DROP_CHECK &&
    apiValue < storedValue &&
    ((storedValue - apiValue) / storedValue) * 100 > MAX_ALLOWED_DROP_PERCENT
  ) {
    return false;
  }

  return true;
}

/**
 * Sync POLITICAL_LANDSCAPE NI group seats with the updated mepCount.
 *
 * When mepCount is updated from the API (e.g. due to vacancies or new
 * members), the sum of group seats in POLITICAL_LANDSCAPE may no longer
 * match. This function adjusts the NI (non-attached) group seat count
 * to absorb the difference, keeping the data internally consistent.
 *
 * Applies to all years sharing the same parliamentary term as the latest
 * covered year (e.g. EP10 covers 2025–2026, transition year 2024 has its
 * own term label and is not affected).
 */
function syncPoliticalLandscapeWithMepCount(
  content: string,
  yearValidations: YearValidation[],
  latestCoveredYear: number
): string {
  // Find the mepCount comparison for the latest year
  const latestValidation = yearValidations.find((yv) => yv.year === latestCoveredYear);
  if (!latestValidation) return content;

  const mepCountComparison = latestValidation.comparisons.find(
    (c) => METRIC_TO_FIELD[c.metric] === 'mepCount'
  );
  if (!mepCountComparison) return content;
  if (mepCountComparison.apiValue === null) return content;
  if (mepCountComparison.note) return content; // skip partial fetches

  const newMepCount = mepCountComparison.apiValue;

  // Guard against zero/implausible mepCount
  if (newMepCount <= 0) return content;

  // Read the current POLITICAL_LANDSCAPE data for the latest year
  const yearStats = GENERATED_STATS.yearlyStats.find((y) => y.year === latestCoveredYear);
  if (!yearStats) return content;

  const groups = yearStats.politicalLandscape.groups;
  const totalSeats = groups.reduce((sum, g) => sum + g.seats, 0);

  // If already consistent, no adjustment needed
  if (totalSeats === newMepCount) return content;

  // Find the NI group to adjust
  const niGroup = groups.find((g) => g.name === 'NI');
  if (!niGroup) return content;

  const seatDiff = newMepCount - totalSeats;
  const newNiSeats = niGroup.seats + seatDiff;

  // Sanity check: NI seats should remain non-negative
  if (newNiSeats < 0) {
    console.log(
      `  ${YELLOW}⚠${RESET} Cannot sync NI seats for ${String(latestCoveredYear)}: adjustment would make NI seats negative (${String(newNiSeats)})`
    );
    return content;
  }

  // Sync NI seats for all years sharing the same parliamentary term as the
  // latest covered year. Within a single EP term the group composition is
  // inherited, so all years must stay in sync to maintain consistency.
  let updated = content;
  const latestTerm = yearStats.parliamentaryTerm;
  const yearsToSync = GENERATED_STATS.yearlyStats
    .filter((y) => y.parliamentaryTerm === latestTerm)
    .map((y) => y.year);

  for (const year of yearsToSync) {
    // Look up this year's NI seats for accurate logging
    const yearData = GENERATED_STATS.yearlyStats.find((y) => y.year === year);
    const yearNiGroup = yearData?.politicalLandscape.groups.find((g) => g.name === 'NI');
    const oldNiSeats = yearNiGroup?.seats ?? niGroup.seats;

    // Match the NI group entry within this year's POLITICAL_LANDSCAPE line
    // Pattern: within a line starting with "  YYYY:", find "name: 'NI', seats: NN"
    const niPattern = new RegExp(
      `^(\\s*${String(year)}:.*?name:\\s*'NI',\\s*seats:\\s*)\\d+(.*$)`,
      'm'
    );
    const newContent = updated.replace(niPattern, `$1${String(newNiSeats)}$2`);
    if (newContent !== updated) {
      // Also update the NI seatShare (handle both "4.7" and "4" formats)
      const newSeatShare = Math.round((newNiSeats / newMepCount) * 1000) / 10;
      const sharePattern = new RegExp(
        `^(\\s*${String(year)}:.*?name:\\s*'NI',\\s*seats:\\s*${String(newNiSeats)},\\s*seatShare:\\s*)\\d+(?:\\.\\d+)?(.*$)`,
        'm'
      );
      const shareUpdated = newContent.replace(sharePattern, `$1${String(newSeatShare)}$2`);
      updated = shareUpdated;
      console.log(
        `  ${GREEN}↻${RESET} Synced ${String(year)} POLITICAL_LANDSCAPE NI seats: ${String(oldNiSeats)} → ${String(newNiSeats)} (seatShare: ${String(newSeatShare)}%)`
      );
    }
  }

  return updated;
}

/**
 * Write API-verified values back into `src/data/generatedStats.ts`.
 *
 * For each year's validation results, updates the numeric fields in the
 * `RAW_YEARLY` array where the API returned a valid, credible count.
 * Also updates the `generatedAt` timestamp and writes real monthly
 * data into `RAW_MONTHLY_DATA` when available from monthly-batched fetches.
 *
 * Only updates fields where:
 * - The API returned a valid value (not null/API_ERROR)
 * - The API value passes the credibility check (not obviously incomplete)
 * - The field is in the set of API-verifiable fields
 */
function updateStatsFile(
  yearValidations: YearValidation[],
  latestCoveredYear: number
): { updatedFields: number; skippedFields: number; updatedFile: boolean } {
  const statsFilePath = path.resolve(
    import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url)),
    '../src/data/generatedStats.ts'
  );

  let content = fs.readFileSync(statsFilePath, 'utf-8');
  const originalContent = content;
  let updatedFields = 0;
  let skippedFields = 0;

  // Collect monthly data per year for RAW_MONTHLY_DATA update
  const monthlyUpdates: Record<number, Record<string, number[]>> = {};

  for (const yv of yearValidations) {
    for (const comparison of yv.comparisons) {
      if (comparison.apiValue === null) continue; // skip API errors
      if (comparison.status === 'API_ERROR') continue;

      // Skip partial/errored fetches — note indicates incomplete data
      if (comparison.note) {
        skippedFields++;
        console.log(
          `  ${DIM}⊘ Skipped ${String(yv.year)}.${comparison.metric}: partial fetch (${comparison.note})${RESET}`
        );
        continue;
      }

      // Collect monthly data only for successful fetches (no note/error)
      // and only when the monthly counts contain useful data (not all zeros).
      // Monthly data is gated by the same credibility check as yearly totals
      // to prevent writing incomplete monthly distributions.
      if (comparison.monthlyCounts && comparison.apiValue !== null) {
        const mField = METRIC_TO_FIELD[comparison.metric];
        const hasNonZeroMonth = comparison.monthlyCounts.some((c) => c > 0);
        if (mField && isUpdatableField(mField) && hasNonZeroMonth) {
          // Apply credibility check: only collect monthly data if the total is credible
          const storedVal = comparison.storedValue;
          if (isCredibleApiValue(comparison.apiValue, storedVal)) {
            if (!monthlyUpdates[yv.year]) {
              monthlyUpdates[yv.year] = {};
            }
            monthlyUpdates[yv.year][mField] = comparison.monthlyCounts;
          }
        }
      }

      const field = METRIC_TO_FIELD[comparison.metric];
      if (!field) continue;

      // Only update fields that are API-verifiable
      if (!isUpdatableField(field) && !isLatestYearField(field)) continue;

      // Only update latest-year-only fields for the latest year
      if (
        (isLatestYearField(field)) &&
        yv.year !== latestCoveredYear
      ) {
        continue;
      }

      // Only update if value actually changed
      if (comparison.apiValue === comparison.storedValue) continue;

      // Credibility check: skip obviously incomplete API data
      if (!isCredibleApiValue(comparison.apiValue, comparison.storedValue)) {
        skippedFields++;
        const dropPercent = comparison.storedValue > 0
          ? ((comparison.storedValue - comparison.apiValue) / comparison.storedValue * 100).toFixed(1)
          : '∞';
        console.log(
          `  ${DIM}⊘ Skipped ${String(yv.year)}.${field}: API=${String(comparison.apiValue)} looks incomplete (stored=${String(comparison.storedValue)}, ${dropPercent}% drop)${RESET}`
        );
        continue;
      }

      // Find the RAW_YEARLY line for this year and update the field.
      // Each entry starts with `  { year: YYYY,` on a single line.
      const yearPattern = new RegExp(
        `^(\\s*\\{\\s*year:\\s*${String(yv.year)},.*?)${field}:\\s*\\d+(.*$)`,
        'm'
      );
      const replacement = `$1${field}: ${String(comparison.apiValue)}$2`;
      const newContent = content.replace(yearPattern, replacement);
      if (newContent !== content) {
        content = newContent;
        updatedFields++;
        console.log(
          `  ${GREEN}↻${RESET} Updated ${String(yv.year)}.${field}: ${String(comparison.storedValue)} → ${String(comparison.apiValue)}`
        );
      }
    }
  }

  // Update RAW_MONTHLY_DATA entries with real monthly counts
  const monthlyEntryCount = updateMonthlyData(monthlyUpdates, content);
  if (monthlyEntryCount.newContent !== content) {
    content = monthlyEntryCount.newContent;
    updatedFields += monthlyEntryCount.count;
    console.log(
      `  ${GREEN}↻${RESET} Updated RAW_MONTHLY_DATA: ${String(monthlyEntryCount.count)} monthly metric(s)`
    );
  }

  // Sync POLITICAL_LANDSCAPE NI seats with mepCount to maintain consistency.
  // When the API returns a new mepCount, the NI group seats are adjusted so
  // that the sum of all group seats equals mepCount. This prevents the test
  // `should have total seats across all groups within ±5 of mepCount` from
  // failing due to mepCount being updated independently of group seats.
  const syncedContent = syncPoliticalLandscapeWithMepCount(content, yearValidations, latestCoveredYear);
  if (syncedContent !== content) {
    content = syncedContent;
    updatedFields += 1;
  }

  // Update generatedAt timestamp if any fields changed
  if (content !== originalContent) {
    const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    content = content.replace(
      /generatedAt:\s*'[^']+'/,
      `generatedAt: '${now}'`
    );
    fs.writeFileSync(statsFilePath, content, 'utf-8');
    console.log(`\n  ${GREEN}✓${RESET} Updated generatedStats.ts (${String(updatedFields)} field(s) updated, ${String(skippedFields)} skipped as unreliable, generatedAt: ${now})`);
    return { updatedFields, skippedFields, updatedFile: true };
  }

  if (skippedFields > 0) {
    console.log(`\n  ${DIM}No credible updates — ${String(skippedFields)} field(s) skipped as unreliable API data.${RESET}`);
  } else {
    console.log(`\n  ${DIM}No updates needed — stored values match API data.${RESET}`);
  }
  return { updatedFields: 0, skippedFields, updatedFile: false };
}

/**
 * Update RAW_MONTHLY_DATA entries in the stats file content.
 *
 * Replaces or inserts per-year entries in the RAW_MONTHLY_DATA map.
 * Each year's entry contains metric names mapped to 12-element arrays.
 */
function updateMonthlyData(
  monthlyUpdates: Record<number, Record<string, number[]>>,
  content: string
): { newContent: string; count: number } {
  let newContent = content;
  let count = 0;

  // Find the RAW_MONTHLY_DATA block boundaries so regex replacements
  // only operate within this block and don't accidentally match
  // year-keyed entries in other sections (e.g. POLITICAL_LANDSCAPE).
  const blockStart = newContent.indexOf('const RAW_MONTHLY_DATA');
  const blockOpenBrace = blockStart >= 0 ? newContent.indexOf('{', blockStart) : -1;
  if (blockStart < 0 || blockOpenBrace < 0) return { newContent, count };

  // Find the matching closing brace by counting brace depth
  let depth = 0;
  let blockEnd = -1;
  for (let i = blockOpenBrace; i < newContent.length; i++) {
    if (newContent[i] === '{') depth++;
    else if (newContent[i] === '}') {
      depth--;
      if (depth === 0) {
        blockEnd = i + 1; // include the '}'
        break;
      }
    }
  }
  if (blockEnd < 0) return { newContent, count };

  // Extract the RAW_MONTHLY_DATA block for targeted editing
  let block = newContent.substring(blockOpenBrace, blockEnd);

  for (const [yearStr, metrics] of Object.entries(monthlyUpdates)) {
    const year = Number(yearStr);
    if (Object.keys(metrics).length === 0) continue;

    // Build the year entry string
    const lines: string[] = [];
    for (const [field, counts] of Object.entries(metrics)) {
      lines.push(`    ${field}: [${counts.join(', ')}]`);
      count++;
    }
    const yearEntry = `  ${String(year)}: {\n${lines.join(',\n')},\n  }`;

    // Check if this year already exists within the block
    const existingYearPattern = new RegExp(
      `  ${String(year)}:\\s*\\{[^}]*\\}`,
      's'
    );
    if (existingYearPattern.test(block)) {
      block = block.replace(existingYearPattern, yearEntry);
    } else {
      // Insert new year entry before the closing brace of the block
      const lastBrace = block.lastIndexOf('}');
      block = block.substring(0, lastBrace) + yearEntry + ',\n' + block.substring(lastBrace);
    }
  }

  // Reassemble the file with the updated block
  newContent = newContent.substring(0, blockOpenBrace) + block + newContent.substring(blockEnd);
  return { newContent, count };
}

/** Check if a field is latest-year-only. */
function isLatestYearField(field: string): boolean {
  return (LATEST_YEAR_FIELDS as readonly string[]).includes(field);
}

/** Check if a field is in the set of API-verifiable updatable fields. */
function isUpdatableField(field: string): boolean {
  return (UPDATABLE_FIELDS as readonly string[]).includes(field);
}

// ── Main ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { years, update } = parseArgs();

  console.log(`${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║  European Parliament Stats Validator                        ║${RESET}`);
  console.log(`${BOLD}${CYAN}║  Comparing generatedStats.ts against EP Open Data API       ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${RESET}`);
  console.log();
  console.log(`  Dataset coverage: ${String(GENERATED_STATS.coveragePeriod.from)}–${String(GENERATED_STATS.coveragePeriod.to)}`);
  console.log(`  Generated at:     ${GENERATED_STATS.generatedAt}`);
  console.log(`  Methodology:      v${GENERATED_STATS.methodologyVersion}`);
  console.log(`  Years to check:   ${years.join(', ')}`);
  if (update) {
    console.log(`  ${BOLD}${YELLOW}Mode:               UPDATE (will write back API-verified values)${RESET}`);
  }
  // Create client with generous timeouts and response size limits for CLI validation.
  // The EP API can return up to ~20 MiB for adopted-texts with limit=1000.
  // Monthly batching reduces per-request data volume significantly.
  // 180 s timeout gives slow endpoints (meps-declarations, adopted-texts)
  // enough headroom while still failing fast on truly broken endpoints.
  const client = new EuropeanParliamentClient({
    timeoutMs: 180_000,
    maxResponseBytes: 50 * 1024 * 1024, // 50 MiB — CLI tool, not a server
  });

  const yearValidations: YearValidation[] = [];
  const landscapeValidations: LandscapeValidation[] = [];

  for (const year of years) {
    // Look up stored stats for the year
    const yearStats = GENERATED_STATS.yearlyStats.find((y) => y.year === year);

    if (!yearStats) {
      console.log(`\n${YELLOW}⚠ No stored data for year ${String(year)} — skipping API comparison${RESET}`);
      continue;
    }

    // 1. Compare against EP API
    const yearValidation = await validateYearAgainstAPI(client, yearStats);
    yearValidations.push(yearValidation);
    printYearComparison(yearValidation);

    // 2. Validate political landscape consistency
    const landscapeValidation = validatePoliticalLandscape(yearStats);
    landscapeValidations.push(landscapeValidation);
  }

  // Print landscape validation results
  if (landscapeValidations.length > 0) {
    console.log(`\n${BOLD}${CYAN}── Political Landscape Consistency ──${RESET}`);
    for (const lv of landscapeValidations) {
      printLandscapeValidation(lv);
    }
  }

  // Print summary
  const summary = printSummary(yearValidations, landscapeValidations);

  // Update generatedStats.ts if --update was specified and landscape checks passed
  if (update && summary.landscapeIssues === 0) {
    console.log(`\n${BOLD}${CYAN}── Updating generatedStats.ts ──${RESET}`);
    const { updatedFields } = updateStatsFile(
      yearValidations,
      GENERATED_STATS.coveragePeriod.to
    );
    if (updatedFields > 0) {
      summary.recommendations.push(
        `Updated ${String(updatedFields)} field(s) in generatedStats.ts from API data.`
      );
    }
  } else if (update && summary.landscapeIssues > 0) {
    console.log(
      `\n${YELLOW}⚠ Skipping file update — ${String(summary.landscapeIssues)} political landscape issue(s) must be resolved first.${RESET}`
    );
  }

  const elapsed = formatElapsed(Date.now() - GLOBAL_START);
  console.log(`${DIM}Completed in ${elapsed}${RESET}\n`);

  // Exit code: 1 only for landscape consistency errors (deterministic)
  // API discrepancies are advisory (data may legitimately drift between releases)
  if (summary.landscapeIssues > 0) {
    process.exit(1);
  }
  process.exit(0);
}

// ── Entry point ───────────────────────────────────────────────────

main().catch((err: unknown) => {
  console.error(`\n${RED}Fatal error:${RESET}`, err instanceof Error ? err.message : err);
  process.exit(1);
});
