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
 * When invoked with `--update`, the script writes API-verified values back
 * into `src/data/generatedStats.ts` and updates the `generatedAt` timestamp.
 * Only fields where the API returned a valid count are updated.
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
  --update        Write API-verified values back into generatedStats.ts
  --help, -h      Show this help message

Examples:
  npx tsx scripts/generate-stats.ts
  npx tsx scripts/generate-stats.ts --year 2024
  npx tsx scripts/generate-stats.ts --all
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
 * Count the total number of items for a metric by paginating through
 * the EP API.  Pages are fetched with `limit = EP_API_MAX_PAGE_SIZE`
 * (the server-side cap) and the item counts are summed.  Pagination
 * stops when a page returns fewer items than the limit.
 *
 * This replaces the earlier `limit: 1` probe approach which always
 * returned `total = 1` because the client computes
 * `PaginatedResponse.total` as `items.length + offset`.
 *
 * Returns the total count or null on failure.
 */
async function countItems(
  label: string,
  fetcher: (params: { limit: number; offset: number }) => Promise<{ data: unknown[]; hasMore: boolean }>
): Promise<{ total: number | null; error?: string }> {
  let totalCount = 0;
  let offset = 0;
  try {
    for (;;) {
      const result = await fetcher({ limit: EP_API_MAX_PAGE_SIZE, offset });
      totalCount += result.data.length;
      if (!result.hasMore || result.data.length < EP_API_MAX_PAGE_SIZE) break;
      offset += EP_API_MAX_PAGE_SIZE;
    }
    return { total: totalCount };
  } catch (err: unknown) {
    // If we already counted some items before the error, the last page
    // likely returned an empty body (the EP API does this when offset
    // exceeds available data).  The accumulated count is correct.
    if (totalCount > 0) {
      return { total: totalCount };
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`  ${DIM}⚠ API error fetching ${label}: ${message}${RESET}`);
    return { total: null, error: message };
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
 * Uses pagination-based counting (`limit = 1000` per page) to obtain
 * real record counts from the EP API.  The EP API does not return a
 * `totalItems` header, so the only reliable way to count records is
 * to iterate through all pages.
 */
async function validateYearAgainstAPI(
  client: EuropeanParliamentClient,
  yearStats: YearlyStats
): Promise<YearValidation> {
  const year = yearStats.year;
  const comparisons: MetricComparison[] = [];
  const dateFrom = `${String(year)}-01-01`;
  const dateTo = `${String(year)}-12-31`;

  console.log(`\n${BOLD}${CYAN}── Fetching API data for ${String(year)} ──${RESET}`);

  // Define metric fetch configuration using pagination counting
  const metrics: Array<{
    label: string;
    storedKey: keyof YearlyStats;
    count: () => Promise<{ total: number | null; error?: string }>;
  }> = [
    {
      label: 'Adopted Texts',
      storedKey: 'adoptedTexts',
      count: () => countItems('Adopted Texts', (p) => client.getAdoptedTexts({ year, ...p })),
    },
    {
      label: 'Procedures',
      storedKey: 'procedures',
      count: () => countItems('Procedures', (p) => client.getProcedures({ year, ...p })),
    },
    {
      label: 'Plenary Documents',
      storedKey: 'documents',
      // Document count = sum of plenary + committee + external documents.
      // Uses Promise.all to fetch the three sub-categories in parallel.
      count: async () => {
        // Sum plenary + committee + external documents for total document count
        const [plenary, committee, external] = await Promise.all([
          countItems('Plenary Docs', (p) => client.getPlenaryDocuments({ year, ...p })),
          countItems('Committee Docs', (p) => client.getCommitteeDocuments({ year, ...p })),
          countItems('External Docs', (p) => client.getExternalDocuments({ year, ...p })),
        ]);
        // If any component errored, aggregate the error messages
        const errors: string[] = [];
        if (plenary.error) errors.push(`Plenary: ${plenary.error}`);
        if (committee.error) errors.push(`Committee: ${committee.error}`);
        if (external.error) errors.push(`External: ${external.error}`);

        const total = (plenary.total ?? 0) + (committee.total ?? 0) + (external.total ?? 0);
        // Only report as error if ALL sub-fetches failed
        if (plenary.total === null && committee.total === null && external.total === null) {
          return { total: null, error: errors.join(' | ') };
        }
        return { total, error: errors.length > 0 ? errors.join(' | ') : undefined };
      },
    },
    {
      label: 'Parliamentary Questions',
      storedKey: 'parliamentaryQuestions',
      count: () => countItems('Parliamentary Questions', (p) =>
        client.getParliamentaryQuestions({ dateFrom, dateTo, ...p })
      ),
    },
    {
      label: 'MEP Declarations',
      storedKey: 'declarations',
      count: () => countItems('MEP Declarations', (p) => client.getMEPDeclarations({ year, ...p })),
    },
    {
      label: 'Plenary Sessions',
      storedKey: 'plenarySessions',
      count: () => countItems('Plenary Sessions', (p) =>
        client.getPlenarySessions({ dateFrom, dateTo, ...p })
      ),
    },
    {
      label: 'Speeches',
      storedKey: 'speeches',
      count: () => countItems('Speeches', (p) =>
        client.getSpeeches({ dateFrom, dateTo, ...p })
      ),
    },
    {
      label: 'Events',
      storedKey: 'events',
      count: () => countItems('Events', (p) =>
        client.getEvents({ dateFrom, dateTo, ...p })
      ),
    },
  ];

  // Fetch all metrics sequentially to respect rate limits
  for (const metric of metrics) {
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
 * Check whether an API value is credible enough to overwrite the stored value.
 *
 * Returns false when the API clearly returned incomplete data:
 * - API value is below the credibility threshold, AND
 * - stored value is much larger (> 5× the API value)
 *
 * This protects curated historical estimates from being overwritten by
 * incomplete EP API data while still allowing genuine corrections.
 */
function isCredibleApiValue(apiValue: number, storedValue: number): boolean {
  if (apiValue >= MIN_CREDIBLE_VALUE) return true;
  // API returned a tiny value — only trust it if stored is also small
  return storedValue <= apiValue * 5;
}

/**
 * Write API-verified values back into `src/data/generatedStats.ts`.
 *
 * For each year's validation results, updates the numeric fields in the
 * `RAW_YEARLY` array where the API returned a valid, credible count.
 * Also updates the `generatedAt` timestamp.
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

  for (const yv of yearValidations) {
    for (const comparison of yv.comparisons) {
      if (comparison.apiValue === null) continue; // skip API errors
      if (comparison.status === 'API_ERROR') continue;

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
        console.log(
          `  ${DIM}⊘ Skipped ${String(yv.year)}.${field}: API=${String(comparison.apiValue)} looks incomplete (stored=${String(comparison.storedValue)})${RESET}`
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
  const startTime = Date.now();

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
  const client = new EuropeanParliamentClient({
    timeoutMs: 60_000,
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

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`${DIM}Completed in ${elapsed}s${RESET}\n`);

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
