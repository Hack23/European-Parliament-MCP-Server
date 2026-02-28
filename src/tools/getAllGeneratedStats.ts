/**
 * MCP Tool: get_all_generated_stats
 *
 * Returns precomputed European Parliament activity statistics covering
 * parliamentary terms EP6–EP10 (2004–2025), including monthly activity
 * breakdowns, category rankings with percentiles, analytical commentary,
 * and trend-based predictions for 2026–2030.
 *
 * The underlying data is static and designed to be refreshed weekly by
 * an agentic workflow. No live EP API calls are made by this tool.
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
import { GENERATED_STATS } from '../data/generatedStats.js';
import { buildToolResponse, buildErrorResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

export const GetAllGeneratedStatsSchema = z
  .object({
    yearFrom: z
      .number()
      .int()
      .min(2004)
      .max(2030)
      .optional()
      .describe('Start year for filtering (default: earliest available, 2004)'),
    yearTo: z
      .number()
      .int()
      .min(2004)
      .max(2030)
      .optional()
      .describe('End year for filtering (default: latest available, 2025)'),
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
      .describe('Include trend-based predictions for 2026-2030 (default: true)'),
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
      data.yearFrom === undefined ||
      data.yearTo === undefined ||
      data.yearFrom <= data.yearTo,
    {
      message: 'yearFrom must be less than or equal to yearTo',
      path: ['yearFrom'],
    },
  );

export type GetAllGeneratedStatsParams = z.infer<typeof GetAllGeneratedStatsSchema>;

const CATEGORY_LABEL_MAP: Record<string, string> = {
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
};

function filterRankings(
  params: GetAllGeneratedStatsParams,
  yearFrom: number,
  yearTo: number
): typeof GENERATED_STATS.categoryRankings {
  if (!params.includeRankings) return [];

  const filterByYear = (r: typeof GENERATED_STATS.categoryRankings[number]): typeof GENERATED_STATS.categoryRankings[number] => ({
    ...r,
    rankings: r.rankings.filter((ry) => ry.year >= yearFrom && ry.year <= yearTo),
  });

  if (params.category === 'all') {
    return GENERATED_STATS.categoryRankings.map(filterByYear);
  }

  const label = CATEGORY_LABEL_MAP[params.category];
  return GENERATED_STATS.categoryRankings
    .filter((r) => r.category === label)
    .map(filterByYear);
}

export function getAllGeneratedStats(
  params: GetAllGeneratedStatsParams
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

    // Include predictions only if requested, filtered to the requested year range
    const filteredPredictions =
      params.includePredictions
        ? GENERATED_STATS.predictions.filter((p) => p.year >= yearFrom && p.year <= yearTo)
        : [];

    const result = {
      generatedAt: GENERATED_STATS.generatedAt,
      coveragePeriod: { from: yearFrom, to: yearTo },
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
        coverageNote:
          yearFrom > GENERATED_STATS.coveragePeriod.from ||
          yearTo < GENERATED_STATS.coveragePeriod.to
            ? `This summary reflects the full ${GENERATED_STATS.coveragePeriod.from}-${GENERATED_STATS.coveragePeriod.to} dataset; filtered results cover ${yearFrom}-${yearTo} only.`
            : `Covers the complete ${GENERATED_STATS.coveragePeriod.from}-${GENERATED_STATS.coveragePeriod.to} dataset.`,
      },
      confidenceLevel: 'HIGH' as const,
      methodology:
        'Precomputed statistics from European Parliament Open Data Portal. ' +
        'Rankings use ordinal ranking with percentile scores. ' +
        'Predictions use linear-trend extrapolation with parliamentary term cycle adjustments. ' +
        'Data refreshed weekly by agentic workflow.',
      sourceAttribution:
        'European Parliament Open Data Portal — data.europarl.europa.eu',
    };

    return buildToolResponse(result);
  } catch (error) {
    return buildErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      'get_all_generated_stats'
    );
  }
}

export const getAllGeneratedStatsToolMetadata = {
  name: 'get_all_generated_stats',
  description:
    'Retrieve precomputed European Parliament activity statistics (2004-2025) with monthly breakdowns, ' +
    'category rankings, percentile scores, statistical analysis, political landscape history (group composition, ' +
    'fragmentation index, coalition dynamics), analytical commentary, and trend-based predictions for 2026-2030. ' +
    'Data covers parliamentary terms EP6-EP10 including plenary sessions, legislative acts, roll-call votes, ' +
    'committee meetings, parliamentary questions, resolutions, speeches, adopted texts, procedures, events, ' +
    'documents, MEP turnover, and declarations. ' +
    'Static data refreshed weekly by agentic workflow — no live API calls.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      yearFrom: {
        type: 'number',
        description: 'Start year for filtering (default: 2004)',
        minimum: 2004,
        maximum: 2030,
      },
      yearTo: {
        type: 'number',
        description: 'End year for filtering (default: 2025)',
        minimum: 2004,
        maximum: 2030,
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
        description: 'Include trend-based predictions for 2026-2030 (default: true)',
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

export async function handleGetAllGeneratedStats(
  args: unknown
): Promise<ToolResult> {
  const params = GetAllGeneratedStatsSchema.parse(args);
  return Promise.resolve(getAllGeneratedStats(params));
}
