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
 * 2. **API spot-check** (advisory) — fetches `limit: 1` probes against the
 *    European Parliament Open Data Portal API to detect gross data staleness.
 *    Because the EP client's `PaginatedResponse.total` is computed as
 *    `items.length + offset` (not a server-side count), these API comparisons
 *    are informational only and do not affect the exit code. A `hasMore: true`
 *    response confirms at least 1 item exists; discrepancies should be
 *    investigated manually rather than treated as hard failures.
 *
 * **Usage:**
 * ```bash
 * npx tsx scripts/generate-stats.ts              # validate latest covered year
 * npx tsx scripts/generate-stats.ts --year 2024  # validate specific year
 * npx tsx scripts/generate-stats.ts --all        # validate all years (2004–latest)
 * ```
 *
 * **Exit codes:**
 * - 0: Success (may include advisory API warnings)
 * - 1: Political landscape consistency errors
 *
 * **ISMS Compliance:**
 * - SC-002: Input validation on CLI arguments
 * - AU-002: Structured logging of validation results
 * - PE-001: Minimal API footprint (limit: 1 per query)
 *
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 * @module scripts/generate-stats
 */

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
function parseArgs(): { years: number[] } {
  const args = process.argv.slice(2);
  const latestCoveredYear = GENERATED_STATS.coveragePeriod.to;

  // --help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/generate-stats.ts [options]

Options:
  --year <YYYY>   Validate a specific year (default: latest covered year ${String(latestCoveredYear)})
  --all           Validate all years in the dataset (2004–${String(latestCoveredYear)})
  --help, -h      Show this help message

Examples:
  npx tsx scripts/generate-stats.ts
  npx tsx scripts/generate-stats.ts --year 2024
  npx tsx scripts/generate-stats.ts --all
`);
    process.exit(0);
  }

  // --all
  if (args.includes('--all')) {
    const allYears = GENERATED_STATS.yearlyStats.map((y) => y.year);
    return { years: allYears };
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
    return { years: [year] };
  }

  // Default: latest covered year in the dataset
  return { years: [latestCoveredYear] };
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
 * Fetch a single metric probe from the EP API.
 *
 * Uses `limit: 1` to minimise bandwidth. Because the EP client computes
 * `PaginatedResponse.total` as `items.length + offset` (not a server-side
 * count), the returned total is only an existence check (0 or 1), not a
 * real record count. Comparisons against stored yearly totals are therefore
 * advisory.
 *
 * Returns the total count or null on failure.
 */
async function fetchTotal(
  label: string,
  fetcher: () => Promise<{ total: number }>
): Promise<{ total: number | null; error?: string }> {
  try {
    const result = await fetcher();
    return { total: result.total };
  } catch (err: unknown) {
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
 * Fetch live probes from the EP API for a given year and compare
 * them against the stored RAW_YEARLY data.
 *
 * **Advisory:** Because the EP client's `total` is `items.length + offset`
 * (not a real server-side count), `limit: 1` requests return `total = 1`
 * for any non-empty result set. Comparisons are therefore informational
 * spot-checks—a response > 0 confirms data still exists in the API, but
 * exact-match assertions are not meaningful.
 */
async function validateYearAgainstAPI(
  client: EuropeanParliamentClient,
  yearStats: YearlyStats
): Promise<YearValidation> {
  const year = yearStats.year;
  const comparisons: MetricComparison[] = [];

  console.log(`\n${BOLD}${CYAN}── Fetching API data for ${String(year)} ──${RESET}`);

  // Define metric fetch configuration
  const metrics: Array<{
    label: string;
    storedKey: keyof YearlyStats;
    fetch: () => Promise<{ total: number }>;
  }> = [
    {
      label: 'Adopted Texts',
      storedKey: 'adoptedTexts',
      fetch: () => client.getAdoptedTexts({ year, limit: 1 }),
    },
    {
      label: 'Procedures',
      storedKey: 'procedures',
      fetch: () => client.getProcedures({ year, limit: 1 }),
    },
    {
      label: 'Plenary Documents',
      storedKey: 'documents',
      fetch: async () => {
        // Sum plenary + committee + external documents for total document count
        const [plenary, committee, external] = await Promise.all([
          fetchTotal('Plenary Docs', () => client.getPlenaryDocuments({ year, limit: 1 })),
          fetchTotal('Committee Docs', () => client.getCommitteeDocuments({ year, limit: 1 })),
          fetchTotal('External Docs', () => client.getExternalDocuments({ year, limit: 1 })),
        ]);
        const total = (plenary.total ?? 0) + (committee.total ?? 0) + (external.total ?? 0);
        return { total };
      },
    },
    {
      label: 'Parliamentary Questions',
      storedKey: 'parliamentaryQuestions',
      fetch: () => client.getParliamentaryQuestions({ dateFrom: `${String(year)}-01-01`, dateTo: `${String(year)}-12-31`, limit: 1 }),
    },
    {
      label: 'MEP Declarations',
      storedKey: 'declarations',
      fetch: () => client.getMEPDeclarations({ year, limit: 1 }),
    },
  ];

  // Fetch all metrics sequentially to respect rate limits
  for (const metric of metrics) {
    const { total, error } = await fetchTotal(metric.label, metric.fetch);
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
    const { total: currentTotal, error: currentError } = await fetchTotal(
      'Current MEPs',
      () => client.getCurrentMEPs({ limit: 1 }),
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
    const { total: incomingTotal, error: incomingError } = await fetchTotal(
      'Incoming MEPs',
      () => client.getIncomingMEPs({ limit: 1 }),
    );
    const { total: outgoingTotal, error: outgoingError } = await fetchTotal(
      'Outgoing MEPs',
      () => client.getOutgoingMEPs({ limit: 1 }),
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
  const MAX_SEAT_DISCREPANCY = 10;
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
      `${String(summary.discrepancies)} API spot-check(s) show discrepancies (advisory only — EP client total is page-based, not a real count). Investigate manually if needed.`
    );
  }
  if (summary.close > 0) {
    summary.recommendations.push(
      `${String(summary.close)} API spot-check(s) are close but not exact (within 10%). Advisory only.`
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

// ── Main ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { years } = parseArgs();
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

  // Create client with conservative timeout for validation
  const client = new EuropeanParliamentClient({
    timeoutMs: 30_000,
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

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`${DIM}Completed in ${elapsed}s${RESET}\n`);

  // Exit code: 1 only for landscape consistency errors (deterministic)
  // API discrepancies are advisory (EP client total is items.length + offset, not a real count)
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
