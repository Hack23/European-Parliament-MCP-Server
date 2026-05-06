/**
 * MCP Tool: get_all_generated_stats
 *
 * Returns precomputed European Parliament activity statistics covering
 * parliamentary terms EP6–EP10 (2004–2026), including monthly activity
 * breakdowns, category rankings with percentiles, analytical commentary,
 * and trend-based predictions for 2027–2031.
 *
 * The underlying historical dataset is static and designed to be refreshed
 * weekly by an agentic workflow. When rankings are requested for all activity or
 * roll-call votes, the response may also include a bounded, cached near-real-time
 * `recentVoteActivity` enrichment from EP DOCEO XML; that enrichment is omitted
 * on timeout or upstream failure.
 *
 * **Intelligence Perspective:** Enables rapid longitudinal analysis of
 * EP legislative productivity, committee workload, and parliamentary
 * engagement metrics across two decades—supporting trend identification,
 * term-over-term comparisons, and predictive modelling.
 *
 * **Business Perspective:** Provides pre-built analytics for policy
 * consultancies, think-tanks, and academic researchers who need
 * ready-made historical benchmarks without incurring API latency.
 *
 * **Marketing Perspective:** Showcases the depth of the MCP server's
 * analytical capabilities with rich, pre-formatted intelligence products.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 * Data source: European Parliament Open Data Portal — data.europarl.europa.eu
 *
 * @module tools/getAllGeneratedStats
 */

import { z } from 'zod';
import { doceoClient } from '../clients/ep/doceoClient.js';
import { GENERATED_STATS } from '../data/generatedStats.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import type { ToolResult } from './shared/types.js';
import { withTimeoutAndAbort } from '../utils/timeout.js';

export const GetAllGeneratedStatsSchema = z
  .object({
    yearFrom: z
      .number()
      .int()
      .min(2004)
      .max(2031)
      .optional()
      .describe('Start year for filtering (default: earliest available, 2004)'),
    yearTo: z
      .number()
      .int()
      .min(2004)
      .max(2031)
      .optional()
      .describe('End year for filtering (default: latest available, 2026)'),
    category: z
      .enum([
        'all',
        'plenary_sessions',
        'legislative_acts',
        'roll_call_votes',
        'committee_meetings',
        'parliamentary_questions',
        'resolutions',
        'speeches',
        'adopted_texts',
        'political_groups',
        'procedures',
        'events',
        'documents',
        'mep_turnover',
        'declarations',
      ])
      .optional()
      .default('all')
      .describe('Activity category to focus on (default: all)'),
    includePredictions: z
      .boolean()
      .optional()
      .default(true)
      .describe('Include trend-based predictions for 2027-2031 (default: true)'),
    includeMonthlyBreakdown: z
      .boolean()
      .optional()
      .default(false)
      .describe('Include month-by-month activity data (default: false for compact output)'),
    includeRankings: z
      .boolean()
      .optional()
      .default(true)
      .describe('Include percentile rankings and statistical analysis (default: true)'),
  })
  .refine(
    (data) =>
      data.yearFrom === undefined || data.yearTo === undefined || data.yearFrom <= data.yearTo,
    {
      message: 'yearFrom must be less than or equal to yearTo',
      path: ['yearFrom'],
    }
  );

export type GetAllGeneratedStatsParams = z.infer<typeof GetAllGeneratedStatsSchema>;

const CATEGORY_LABEL_MAP: Partial<Record<string, string>> = {
  plenary_sessions: 'Plenary Sessions',
  legislative_acts: 'Legislative Acts Adopted',
  roll_call_votes: 'Roll-Call Votes',
  committee_meetings: 'Committee Meetings',
  parliamentary_questions: 'Parliamentary Questions',
  resolutions: 'Resolutions',
  speeches: 'Speeches',
  adopted_texts: 'Adopted Texts',
  procedures: 'Procedures',
  events: 'Events',
  documents: 'Documents',
  mep_turnover: 'MEP Turnover',
  declarations: 'Declarations',
  // political_groups intentionally omitted — it has no numeric ranking
};

type RankingEntry = (typeof GENERATED_STATS.categoryRankings)[number];

const RECENT_VOTE_ACTIVITY_TIMEOUT_MS = 2_000;
const RECENT_VOTE_ACTIVITY_CACHE_TTL_MS = 5 * 60_000;
let recentVoteActivityCache:
  | { expiresAt: number; value: RecentVoteActivity | null }
  | undefined;

/** Test-only hook for resetting bounded DOCEO enrichment cache between isolated specs. @internal */
export function clearRecentVoteStatsCache(): void {
  recentVoteActivityCache = undefined;
}

/**
 * Compute mean, standard deviation, and median from a numeric array.
 * Used to recalculate ranking summary statistics for filtered year ranges.
 */
function computeStats(values: number[]): { mean: number; stdDev: number; median: number } {
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = n > 1 ? values.reduce((s, v) => s + (v - mean) ** 2, 0) / n : 0;
  const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
      : (sorted[mid] ?? 0);

  return { mean: Math.round(mean * 100) / 100, stdDev, median };
}

/**
 * Recompute ranking summary fields (mean, stdDev, median, topYear, bottomYear)
 * for a filtered year range. Re-sorts and re-ranks entries with fresh percentiles.
 */
function recomputeRankingSummary(r: RankingEntry, yearFrom: number, yearTo: number): RankingEntry {
  const filtered = r.rankings.filter((ry) => ry.year >= yearFrom && ry.year <= yearTo);

  if (filtered.length === 0) {
    return { ...r, rankings: [], mean: 0, stdDev: 0, median: 0, topYear: 0, bottomYear: 0 };
  }

  const values = filtered.map((e) => e.totalActivityScore);
  const n = values.length;
  const stats = computeStats(values);

  const reSorted = [...filtered].sort((a, b) => b.totalActivityScore - a.totalActivityScore);

  const reRanked = reSorted.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    percentile: n === 1 ? 100 : Math.round(((n - idx - 1) / (n - 1)) * 10000) / 100,
  }));

  return {
    ...r,
    rankings: reRanked,
    ...stats,
    topYear: reSorted[0]?.year ?? 0,
    bottomYear: reSorted[n - 1]?.year ?? 0,
  };
}

/**
 * Filter category rankings by the requested year range and optional category.
 * Returns recomputed summary statistics for the filtered subset.
 * `political_groups` has no numeric ranking and returns an empty array.
 */
function filterRankings(
  params: GetAllGeneratedStatsParams,
  yearFrom: number,
  yearTo: number
): typeof GENERATED_STATS.categoryRankings {
  if (!params.includeRankings) return [];

  const recompute = (r: RankingEntry): RankingEntry => recomputeRankingSummary(r, yearFrom, yearTo);

  if (params.category === 'all') {
    return GENERATED_STATS.categoryRankings.map(recompute);
  }

  // political_groups has no numeric ranking category
  if (params.category === 'political_groups') return [];

  const label = CATEGORY_LABEL_MAP[params.category];
  if (label === undefined) return [];
  return GENERATED_STATS.categoryRankings.filter((r) => r.category === label).map(recompute);
}

/** Recent DOCEO vote activity stats appended to the precomputed response. */
export interface RecentVoteActivity {
  recentVoteCount: number;
  adoptedCount: number;
  rejectedCount: number;
  /** Adoption rate as a percentage (0-100, one decimal place). */
  adoptionRate: number;
  datesWithData: string[];
  datesWithoutData: string[];
  /** Top-3 political groups by total vote participation across recent plenary sittings. */
  groupVotingLeaders: { group: string; totalVotes: number }[];
  dataFreshness: 'NEAR_REALTIME';
  dataSource: 'EP_DOCEO_XML';
}

/** Compute top-3 groups by total vote participation from a set of recent vote records. */
function computeGroupVotingLeaders(
  votes: { groupBreakdown?: Record<string, { for: number; against: number; abstain: number }> }[]
): { group: string; totalVotes: number }[] {
  const totals = new Map<string, number>();
  for (const vote of votes) {
    if (!vote.groupBreakdown) continue;
    for (const [group, counts] of Object.entries(vote.groupBreakdown)) {
      const existing = totals.get(group) ?? 0;
      totals.set(group, existing + counts.for + counts.against + counts.abstain);
    }
  }
  return [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([group, totalVotes]) => ({ group, totalVotes }));
}

/** Returns true when recent DOCEO activity should be appended to the response. */
function shouldIncludeRecentActivity(params: GetAllGeneratedStatsParams): boolean {
  return params.includeRankings && (params.category === 'all' || params.category === 'roll_call_votes');
}

/**
 * Fetch recent vote statistics from EP DOCEO XML for near-realtime enrichment.
 * Returns null on any upstream error — callers treat absence as degraded-upstream.
 */
export async function fetchRecentVoteStats(): Promise<RecentVoteActivity | null> {
  const now = Date.now();
  if (recentVoteActivityCache !== undefined && recentVoteActivityCache.expiresAt > now) {
    return recentVoteActivityCache.value;
  }

  try {
    const response = await withTimeoutAndAbort(
      (abortSignal) => doceoClient.getLatestVotes({
        includeIndividualVotes: false,
        limit: 100,
        abortSignal,
      }),
      RECENT_VOTE_ACTIVITY_TIMEOUT_MS,
      'DOCEO recent vote enrichment timed out'
    );
    const votes = response.data;
    const adoptedCount = votes.filter((v) => v.result === 'ADOPTED').length;
    const rejectedCount = votes.filter((v) => v.result === 'REJECTED').length;
    const recentVoteCount = votes.length;
    // Multiply by 1000 then divide by 10 to round to one decimal place (e.g. 50.5%)
    const adoptionRate =
      recentVoteCount > 0 ? Math.round((adoptedCount / recentVoteCount) * 1000) / 10 : 0;
    const value: RecentVoteActivity = {
      recentVoteCount,
      adoptedCount,
      rejectedCount,
      adoptionRate,
      datesWithData: response.datesAvailable,
      datesWithoutData: response.datesUnavailable,
      groupVotingLeaders: computeGroupVotingLeaders(votes),
      dataFreshness: 'NEAR_REALTIME',
      dataSource: 'EP_DOCEO_XML',
    };
    recentVoteActivityCache = {
      expiresAt: now + RECENT_VOTE_ACTIVITY_CACHE_TTL_MS,
      value,
    };
    return value;
  } catch {
    recentVoteActivityCache = {
      expiresAt: now + RECENT_VOTE_ACTIVITY_CACHE_TTL_MS,
      value: null,
    };
    return null;
  }
}

/** Build a coverage note for the analysis summary based on year filter bounds. */
function buildCoverageNote(yearFrom: number, yearTo: number): string {
  const full = `${String(GENERATED_STATS.coveragePeriod.from)}-${String(GENERATED_STATS.coveragePeriod.to)}`;
  const isFiltered =
    yearFrom > GENERATED_STATS.coveragePeriod.from || yearTo < GENERATED_STATS.coveragePeriod.to;
  if (isFiltered) {
    return `This summary reflects the full ${full} dataset; filtered results cover ${String(yearFrom)}-${String(yearTo)} only.`;
  }
  return `Covers the complete ${full} dataset.`;
}

/**
 * Retrieve precomputed EP activity statistics with optional year/category filtering.
 *
 * The response always includes `coveragePeriod` (the full dataset range, 2004–2026)
 * and `requestedPeriod` (the user-supplied year filter). The `analysisSummary` covers
 * the full dataset with a `coverageNote` clarifying scope when filters narrow the range.
 * When `recentVoteActivity` is provided (fetched from DOCEO XML), it is appended to
 * the result for near-realtime vote enrichment.
 */
export function getAllGeneratedStats(
  params: GetAllGeneratedStatsParams,
  recentVoteActivity?: RecentVoteActivity | null
): ToolResult {
  try {
    const yearFrom = params.yearFrom ?? GENERATED_STATS.coveragePeriod.from;
    const yearTo = params.yearTo ?? GENERATED_STATS.coveragePeriod.to;

    // Filter yearly stats by requested year range
    const filteredYearly = GENERATED_STATS.yearlyStats
      .filter((y) => y.year >= yearFrom && y.year <= yearTo)
      .map((y) => {
        if (params.includeMonthlyBreakdown) return y;
        // Omit monthly breakdown for compact output
        const { monthlyActivity: _monthly, ...rest } = y;
        void _monthly;
        return rest;
      });

    // Filter rankings by category if specified
    const filteredRankings = filterRankings(params, yearFrom, yearTo);

    // Include predictions only if requested — predictions are always returned in full
    // since they cover future years (2027–2031) beyond the historical yearTo default (2026)
    const filteredPredictions = params.includePredictions ? GENERATED_STATS.predictions : [];

    const result = {
      generatedAt: GENERATED_STATS.generatedAt,
      coveragePeriod: GENERATED_STATS.coveragePeriod,
      requestedPeriod: { from: yearFrom, to: yearTo },
      methodologyVersion: GENERATED_STATS.methodologyVersion,
      dataSource: GENERATED_STATS.dataSource,
      totalYearsReturned: filteredYearly.length,
      yearlyStats: filteredYearly,
      ...(filteredRankings.length > 0 && {
        categoryRankings: filteredRankings,
      }),
      ...(filteredPredictions.length > 0 && {
        predictions: filteredPredictions,
      }),
      analysisSummary: {
        ...GENERATED_STATS.analysisSummary,
        coverageNote: buildCoverageNote(yearFrom, yearTo),
      },
      confidenceLevel: 'HIGH' as const,
      methodology:
        'Precomputed statistics from European Parliament Open Data Portal, with optional cached DOCEO XML recentVoteActivity enrichment when rankings include all activity or roll-call votes. ' +
        'Rankings use ordinal ranking with percentile scores. ' +
        'Predictions use average-based extrapolation from 2021-2025 actuals with parliamentary term cycle adjustments. ' +
        'Data refreshed weekly by agentic workflow.',
      sourceAttribution: 'European Parliament Open Data Portal — data.europarl.europa.eu',
      ...(recentVoteActivity != null && { recentVoteActivity }),
    };

    return buildToolResponse(result);
  } catch (error: unknown) {
    throw new ToolError({
      toolName: 'get_all_generated_stats',
      operation: 'processData',
      message: 'Failed to process generated statistics',
      isRetryable: false,
      cause: error,
    });
  }
}

export const getAllGeneratedStatsToolMetadata = {
  name: 'get_all_generated_stats',
  description:
    'Retrieve precomputed European Parliament activity statistics (2004-2026) with monthly breakdowns, ' +
    'category rankings, percentile scores, statistical analysis, political landscape history (group composition, ' +
    'fragmentation index, coalition dynamics), analytical commentary, and trend-based predictions for 2027-2031. ' +
    'Data covers parliamentary terms EP6-EP10 including plenary sessions, legislative acts, roll-call votes, ' +
    'committee meetings, parliamentary questions, resolutions, speeches, adopted texts, procedures, events, ' +
    'documents, MEP turnover, and declarations. ' +
    'Static data refreshed weekly by agentic workflow; optional near-real-time DOCEO XML enrichment is bounded by a short timeout and omitted when unavailable.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      yearFrom: {
        type: 'number',
        description: 'Start year for filtering (default: 2004)',
        minimum: 2004,
        maximum: 2031,
      },
      yearTo: {
        type: 'number',
        description: 'End year for filtering (default: 2026)',
        minimum: 2004,
        maximum: 2031,
      },
      category: {
        type: 'string',
        enum: [
          'all',
          'plenary_sessions',
          'legislative_acts',
          'roll_call_votes',
          'committee_meetings',
          'parliamentary_questions',
          'resolutions',
          'speeches',
          'adopted_texts',
          'political_groups',
          'procedures',
          'events',
          'documents',
          'mep_turnover',
          'declarations',
        ],
        description: 'Activity category to focus on (default: all)',
        default: 'all',
      },
      includePredictions: {
        type: 'boolean',
        description: 'Include trend-based predictions for 2027-2031 (default: true)',
        default: true,
      },
      includeMonthlyBreakdown: {
        type: 'boolean',
        description: 'Include month-by-month activity data (default: false)',
        default: false,
      },
      includeRankings: {
        type: 'boolean',
        description: 'Include percentile rankings and statistics (default: true)',
        default: true,
      },
    },
  },
};

// Helper: fetches DOCEO activity when the requested category warrants near-realtime enrichment.
async function resolveRecentActivity(
  params: GetAllGeneratedStatsParams
): Promise<RecentVoteActivity | null> {
  return shouldIncludeRecentActivity(params) ? fetchRecentVoteStats() : null;
}

export async function handleGetAllGeneratedStats(args: unknown): Promise<ToolResult> {
  // Validate input — ZodErrors here are client mistakes (non-retryable)
  let params: GetAllGeneratedStatsParams;
  try {
    params = GetAllGeneratedStatsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_all_generated_stats',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  const recentVoteActivity = await resolveRecentActivity(params);
  return getAllGeneratedStats(params, recentVoteActivity);
}
