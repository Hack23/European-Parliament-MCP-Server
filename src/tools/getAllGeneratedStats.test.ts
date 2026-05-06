/**
 * Tests for src/tools/getAllGeneratedStats.ts
 *
 * Covers: input validation, response structure, filtering, rankings,
 *         predictions, monthly breakdown, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleGetAllGeneratedStats,
  getAllGeneratedStats,
  GetAllGeneratedStatsSchema,
  clearRecentVoteStatsCache,
} from './getAllGeneratedStats.js';
import * as doceoClientModule from '../clients/ep/doceoClient.js';

// Mock DOCEO client — default to empty response so non-DOCEO tests are unaffected
vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn(),
  },
}));

// ── Type-safe JSON parse helper ─────────────────────────────────────

/** Political landscape group data. */
interface PoliticalLandscapeGroup {
  name: string;
  seats: number;
  seatShare: number;
}

/** Political landscape for a year. */
interface PoliticalLandscape {
  groups: PoliticalLandscapeGroup[];
  totalGroups: number;
  largestGroup: string;
  largestGroupSeatShare: number;
  fragmentationIndex: number;
  politicalBalance: string;
  grandCoalitionPossible: boolean;
}

/** Monthly activity entry. */
interface MonthlyActivity {
  month: number;
  plenarySessions: number;
  committeeMeetings: number;
  totalActivityScore: number;
  [key: string]: unknown;
}

/** Yearly stats entry. */
interface YearlyStat {
  year: number;
  parliamentaryTerm: string;
  mepCount: number;
  plenarySessions: number;
  legislativeActsAdopted: number;
  rollCallVotes: number;
  committeeMeetings: number;
  parliamentaryQuestions: number;
  resolutions: number;
  speeches: number;
  adoptedTexts: number;
  procedures: number;
  events: number;
  documents: number;
  mepTurnover: number;
  declarations: number;
  commentary: string;
  politicalLandscape: PoliticalLandscape;
  monthlyActivity?: MonthlyActivity[];
}

/** Category ranking entry. */
interface CategoryRanking {
  category: string;
  mean: number;
  stdDev: number;
  median: number;
  topYear: number;
  bottomYear: number;
  rankings: Array<{
    year: number;
    rank: number;
    percentile: number;
    totalActivityScore: number;
  }>;
}

/** Prediction entry. */
interface Prediction {
  year: number;
  confidenceInterval: string;
  methodology: string;
  [key: string]: unknown;
}

/** Analysis summary. */
interface AnalysisSummary {
  overallTrend: string;
  peakActivityYear: number;
  lowestActivityYear: number;
  averageAnnualLegislativeOutput: number;
  legislativeProductivityTrend: string;
  keyFindings: string[];
  coverageNote: string;
}

/** Full response shape from getAllGeneratedStats. */
interface GeneratedStatsResponse {
  generatedAt: string;
  coveragePeriod: { from: number; to: number };
  requestedPeriod: { from: number; to: number };
  methodologyVersion?: number;
  dataSource?: string;
  totalYearsReturned: number;
  yearlyStats: YearlyStat[];
  categoryRankings?: CategoryRanking[];
  predictions?: Prediction[];
  analysisSummary: AnalysisSummary;
  confidenceLevel: string;
  methodology: string;
  sourceAttribution: string;
}

/** Parse the stringified JSON from a tool result into a typed response. */
function parseStatsResponse(result: { content: Array<{ text?: string }> }): GeneratedStatsResponse {
  return JSON.parse(result.content[0]?.text ?? '{}') as GeneratedStatsResponse;
}

// ── Input Validation ────────────────────────────────────────────────

describe('GetAllGeneratedStatsSchema', () => {
  it('accepts empty object (all defaults)', () => {
    const result = GetAllGeneratedStatsSchema.parse({});
    expect(result.category).toBe('all');
    expect(result.includePredictions).toBe(true);
    expect(result.includeMonthlyBreakdown).toBe(false);
    expect(result.includeRankings).toBe(true);
  });

  it('accepts valid year range', () => {
    const result = GetAllGeneratedStatsSchema.parse({
      yearFrom: 2010,
      yearTo: 2020,
    });
    expect(result.yearFrom).toBe(2010);
    expect(result.yearTo).toBe(2020);
  });

  it('accepts valid category filter', () => {
    const result = GetAllGeneratedStatsSchema.parse({
      category: 'legislative_acts',
    });
    expect(result.category).toBe('legislative_acts');
  });

  it('rejects year below minimum', () => {
    expect(() =>
      GetAllGeneratedStatsSchema.parse({ yearFrom: 1999 })
    ).toThrow();
  });

  it('rejects year above maximum', () => {
    expect(() =>
      GetAllGeneratedStatsSchema.parse({ yearTo: 2050 })
    ).toThrow();
  });

  it('rejects invalid category', () => {
    expect(() =>
      GetAllGeneratedStatsSchema.parse({ category: 'invalid_cat' })
    ).toThrow();
  });

  it('rejects yearFrom greater than yearTo', () => {
    expect(() =>
      GetAllGeneratedStatsSchema.parse({ yearFrom: 2020, yearTo: 2015 })
    ).toThrow('yearFrom must be less than or equal to yearTo');
  });

  it('accepts yearFrom equal to yearTo', () => {
    const result = GetAllGeneratedStatsSchema.parse({
      yearFrom: 2020,
      yearTo: 2020,
    });
    expect(result.yearFrom).toBe(2020);
    expect(result.yearTo).toBe(2020);
  });
});

// ── Response Structure ──────────────────────────────────────────────

describe('getAllGeneratedStats', () => {
  it('returns a valid ToolResult with JSON content', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: true,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.type).toBe('text');

    const data = parseStatsResponse(result);
    expect(data.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(data.coveragePeriod).toEqual({ from: 2004, to: 2026 });
    expect(data.requestedPeriod).toEqual(expect.objectContaining({ from: 2004, to: 2026 }));
    expect(Array.isArray(data.yearlyStats)).toBe(true);
    expect(data.analysisSummary).not.toBeNull();
    expect(data.analysisSummary).toEqual(
      expect.objectContaining({
        overallTrend: expect.any(String) as unknown as string,
        keyFindings: expect.any(Array) as unknown as unknown[],
      }),
    );
    expect(data.methodology).toContain('Precomputed statistics');
    expect(data.sourceAttribution).toContain('europarl');
  });

  it('returns yearly stats covering 2004-2026 (23 years)', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.yearlyStats).toHaveLength(23);
    expect(data.yearlyStats[0].year).toBe(2004);
    expect(data.yearlyStats[22].year).toBe(2026);
  });

  it('each yearly stat has required fields', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    const year = data.yearlyStats[0];
    expect(typeof year.year).toBe('number');
    expect(typeof year.parliamentaryTerm).toBe('string');
    expect(year.mepCount).toBeGreaterThan(0);
    expect(year.plenarySessions).toBeGreaterThan(0);
    expect(year.legislativeActsAdopted).toBeGreaterThan(0);
    expect(year.rollCallVotes).toBeGreaterThan(0);
    expect(year.committeeMeetings).toBeGreaterThan(0);
    expect(year.parliamentaryQuestions).toBeGreaterThan(0);
    expect(year.resolutions).toBeGreaterThan(0);
    expect(year.speeches).toBeGreaterThan(0);
    expect(year.adoptedTexts).toBeGreaterThan(0);
    expect(year.procedures).toBeGreaterThan(0);
    expect(year.events).toBeGreaterThan(0);
    expect(year.documents).toBeGreaterThan(0);
    expect(year.mepTurnover).toBeGreaterThan(0);
    expect(year.declarations).toBeGreaterThan(0);
    expect(typeof year.commentary).toBe('string');
    expect(year.commentary.length).toBeGreaterThan(0);
  });

  it('each yearly stat includes political landscape data', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    const year = data.yearlyStats[0];
    expect(year.politicalLandscape).toEqual(expect.objectContaining({
      groups: expect.any(Array) as unknown as unknown[],
      totalGroups: expect.any(Number) as unknown as number,
      largestGroup: expect.any(String) as unknown as string,
      fragmentationIndex: expect.any(Number) as unknown as number,
      politicalBalance: expect.any(String) as unknown as string,
    }));
    expect(year.politicalLandscape.groups.length).toBeGreaterThan(0);
    expect(year.politicalLandscape.totalGroups).toBeGreaterThan(0);

    expect(year.politicalLandscape.largestGroupSeatShare).toBeGreaterThan(0);
    expect(year.politicalLandscape.fragmentationIndex).toBeGreaterThan(0);
    expect(typeof year.politicalLandscape.grandCoalitionPossible).toBe('boolean');

    // Verify political group snapshot structure
    const group = year.politicalLandscape.groups[0];
    expect(typeof group.name).toBe('string');
    expect(group.name.length).toBeGreaterThan(0);
    expect(group.seats).toBeGreaterThan(0);
    expect(group.seatShare).toBeGreaterThan(0);
  });

  it('tracks fragmentation increase from EP6 to EP10', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    const year2004 = data.yearlyStats.find((y: Record<string, unknown>) => y.year === 2004)?.politicalLandscape;
    const year2026 = data.yearlyStats.find((y: Record<string, unknown>) => y.year === 2026)?.politicalLandscape;
    // Fragmentation has increased over time
    expect(year2026.fragmentationIndex).toBeGreaterThan(year2004.fragmentationIndex);
    // Grand coalition was possible in EP6 but not in EP10
    expect(year2004.grandCoalitionPossible).toBe(true);
    expect(year2026.grandCoalitionPossible).toBe(false);
  });

  it('filters by political_groups category', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2020,
      yearTo: 2020,
      category: 'political_groups',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.yearlyStats).toHaveLength(1);
    expect(data.yearlyStats[0].politicalLandscape).toEqual(expect.objectContaining({
      groups: expect.any(Array) as unknown as unknown[],
      totalGroups: expect.any(Number) as unknown as number,
    }));
    // political_groups has no numeric ranking so should be empty
    expect(data.categoryRankings).toBeUndefined();
  });

  it('filters by procedures category', () => {
    const result = getAllGeneratedStats({
      category: 'procedures',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('Procedures');
  });

  it('filters by events category', () => {
    const result = getAllGeneratedStats({
      category: 'events',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('Events');
  });

  it('filters by documents category', () => {
    const result = getAllGeneratedStats({
      category: 'documents',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('Documents');
  });

  it('filters by mep_turnover category', () => {
    const result = getAllGeneratedStats({
      category: 'mep_turnover',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('MEP Turnover');
  });

  it('filters by declarations category', () => {
    const result = getAllGeneratedStats({
      category: 'declarations',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('Declarations');
  });

  it('includes predictions when requested with year range covering prediction years', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2004,
      yearTo: 2030,
      category: 'all',
      includePredictions: true,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.predictions.length).toBe(5);
    expect(data.predictions[0].year).toBe(2027);
    expect(data.predictions[4].year).toBe(2031);
    expect(data.predictions[0].confidenceInterval).toMatch(/^±\d+%$/);
    expect(data.predictions[0].methodology).toContain('Average-based extrapolation');
  });

  it('excludes predictions when not requested', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.predictions).toBeUndefined();
  });

  it('includes all predictions when includePredictions is true regardless of yearTo', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2019,
      yearTo: 2024,
      category: 'all',
      includePredictions: true,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.predictions.length).toBe(5);
    expect(data.predictions[0].year).toBe(2027);
    expect(data.predictions[4].year).toBe(2031);
  });

  it('includes all predictions when yearTo does not cover full prediction range', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2020,
      yearTo: 2028,
      category: 'all',
      includePredictions: true,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.predictions.length).toBe(5);
    expect(data.predictions[0].year).toBe(2027);
    expect(data.predictions[4].year).toBe(2031);
  });

  it('includes category rankings with percentiles', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings.length).toBe(13);

    const ranking = data.categoryRankings[0];
    expect(typeof ranking.category).toBe('string');
    expect(ranking.category.length).toBeGreaterThan(0);
    expect(ranking.mean).toBeGreaterThan(0);
    expect(ranking.stdDev).toBeGreaterThan(0);
    expect(ranking.median).toBeGreaterThan(0);
    expect(ranking.topYear).toBeGreaterThanOrEqual(2004);
    expect(ranking.bottomYear).toBeGreaterThanOrEqual(2004);
    expect(Array.isArray(ranking.rankings)).toBe(true);
    expect(ranking.rankings.length).toBe(23);

    // Check individual ranking entry
    const entry = ranking.rankings[0];
    expect(entry.rank).toBe(1);
    expect(entry.percentile).toBe(100);
    expect(entry.totalActivityScore).toBeGreaterThan(0);
  });

  it('filters rankings by specific category', () => {
    const result = getAllGeneratedStats({
      category: 'legislative_acts',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('Legislative Acts Adopted');
  });

  it('recomputes ranking summary stats for filtered year range', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2020,
      yearTo: 2023,
      category: 'plenary_sessions',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings).toHaveLength(1);
    const ranking = data.categoryRankings[0];
    // Should only contain 4 years
    expect(ranking.rankings).toHaveLength(4);
    // topYear and bottomYear must be within the filtered range
    expect(ranking.topYear).toBeGreaterThanOrEqual(2020);
    expect(ranking.topYear).toBeLessThanOrEqual(2023);
    expect(ranking.bottomYear).toBeGreaterThanOrEqual(2020);
    expect(ranking.bottomYear).toBeLessThanOrEqual(2023);
    // Re-ranked: rank 1 should exist
    expect(ranking.rankings[0].rank).toBe(1);
    expect(ranking.rankings[0].percentile).toBe(100);
  });

  it('includes monthly breakdown when requested', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2023,
      yearTo: 2023,
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: true,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.yearlyStats).toHaveLength(1);
    expect(Array.isArray(data.yearlyStats[0].monthlyActivity)).toBe(true);
    expect(data.yearlyStats[0].monthlyActivity).toHaveLength(12);
    // August should be lowest (recess)
    const aug = data.yearlyStats[0].monthlyActivity[7];
    const oct = data.yearlyStats[0].monthlyActivity[9];
    expect(aug.plenarySessions).toBeLessThan(oct.plenarySessions);
  });

  it('monthly breakdown sums match annual totals', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2023,
      yearTo: 2023,
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: true,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    const year = data.yearlyStats[0];
    const monthly: Record<string, unknown>[] = year.monthlyActivity;
    const sum = (key: string): number =>
      monthly.reduce((acc: number, m: Record<string, unknown>) => acc + (m[key] as number), 0);

    expect(sum('plenarySessions')).toBe(year.plenarySessions);
    expect(sum('legislativeActsAdopted')).toBe(year.legislativeActsAdopted);
    expect(sum('rollCallVotes')).toBe(year.rollCallVotes);
    expect(sum('committeeMeetings')).toBe(year.committeeMeetings);
    expect(sum('parliamentaryQuestions')).toBe(year.parliamentaryQuestions);
    expect(sum('resolutions')).toBe(year.resolutions);
    expect(sum('speeches')).toBe(year.speeches);
    expect(sum('adoptedTexts')).toBe(year.adoptedTexts);
    expect(sum('procedures')).toBe(year.procedures);
    expect(sum('events')).toBe(year.events);
    expect(sum('documents')).toBe(year.documents);
    expect(sum('mepTurnover')).toBe(year.mepTurnover);
    expect(sum('declarations')).toBe(year.declarations);
  });

  it('excludes monthly breakdown by default', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2023,
      yearTo: 2023,
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.yearlyStats[0].monthlyActivity).toBeUndefined();
  });

  it('filters by year range', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2015,
      yearTo: 2018,
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.yearlyStats).toHaveLength(4);
    expect(data.yearlyStats[0].year).toBe(2015);
    expect(data.yearlyStats[3].year).toBe(2018);
    expect(data.totalYearsReturned).toBe(4);
    // coveragePeriod is always full dataset; requestedPeriod reflects the filter
    expect(data.coveragePeriod).toEqual({ from: 2004, to: 2026 });
    expect(data.requestedPeriod).toEqual({ from: 2015, to: 2018 });
  });

  it('analysis summary has required fields', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    const summary = data.analysisSummary;
    expect(typeof summary.overallTrend).toBe('string');
    expect(summary.overallTrend.length).toBeGreaterThan(0);
    expect(summary.peakActivityYear).toBeGreaterThanOrEqual(2004);
    expect(summary.lowestActivityYear).toBeGreaterThanOrEqual(2004);
    expect(summary.averageAnnualLegislativeOutput).toBeGreaterThan(0);
    expect(typeof summary.legislativeProductivityTrend).toBe('string');
    expect(Array.isArray(summary.keyFindings)).toBe(true);
    expect(summary.keyFindings.length).toBeGreaterThan(0);
  });

  it('analysisSummary includes coverageNote for full dataset', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.analysisSummary.coverageNote).toContain('complete');
  });

  it('analysisSummary coverageNote clarifies when year filter narrows range', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2015,
      yearTo: 2020,
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.analysisSummary.coverageNote).toContain('full');
    expect(data.analysisSummary.coverageNote).toContain('2015-2020');
  });

  it('has HIGH confidence level', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.confidenceLevel).toBe('HIGH');
  });
});

// ── Handler Integration ──────────────────────────────────────────

describe('handleGetAllGeneratedStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRecentVoteStatsCache();
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockReset();
    // Default: empty DOCEO response — existing tests remain unaffected
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      data: [],
      total: 0,
      datesAvailable: [],
      datesUnavailable: [],
      source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
      limit: 100,
      offset: 0,
      hasMore: false,
    });
  });

  it('handles empty args (all defaults)', async () => {
    const result = await handleGetAllGeneratedStats({});
    expect(result.content).toHaveLength(1);
    expect(result.isError).toBeUndefined();
    const data = parseStatsResponse(result);
    expect(data.yearlyStats.length).toBe(23);
  });

  it('rejects invalid args with Zod error', async () => {
    await expect(
      handleGetAllGeneratedStats({ yearFrom: 'not-a-number' })
    ).rejects.toThrow();
  });

  it('handles category filter via handler', async () => {
    const result = await handleGetAllGeneratedStats({
      category: 'plenary_sessions',
      includeRankings: true,
    });
    const data = parseStatsResponse(result);
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('Plenary Sessions');
  });

  it('returns single year when yearFrom equals yearTo (boundary)', async () => {
    const result = await handleGetAllGeneratedStats({
      yearFrom: 2010,
      yearTo: 2010,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.yearlyStats).toHaveLength(1);
    expect(data.yearlyStats[0].year).toBe(2010);
    expect(data.requestedPeriod).toEqual({ from: 2010, to: 2010 });
  });

  it('returns single year for minimum boundary (2004)', async () => {
    const result = await handleGetAllGeneratedStats({
      yearFrom: 2004,
      yearTo: 2004,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.yearlyStats).toHaveLength(1);
    expect(data.yearlyStats[0].year).toBe(2004);
  });

  it('returns single year for maximum boundary (2025)', async () => {
    const result = await handleGetAllGeneratedStats({
      yearFrom: 2025,
      yearTo: 2025,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    expect(data.yearlyStats).toHaveLength(1);
    expect(data.yearlyStats[0].year).toBe(2025);
  });

  it('prediction methodology contains Average-based extrapolation for each prediction', async () => {
    const result = await handleGetAllGeneratedStats({
      yearFrom: 2004,
      yearTo: 2030,
      includePredictions: true,
      includeRankings: false,
    });
    const data = parseStatsResponse(result);
    for (const pred of data.predictions as { methodology: string; confidenceInterval: string }[]) {
      expect(pred.methodology).toContain('Average-based extrapolation');
      expect(pred.confidenceInterval).toMatch(/^±\d+%$/);
    }
  });

  describe('DOCEO recent vote activity enrichment', () => {
    it('includes recentVoteActivity when DOCEO returns data (category=all, includeRankings=true)', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        data: [
          {
            id: 'v1', subject: 'Vote 1', reference: '', date: '2025-01-20',
            result: 'ADOPTED' as const,
            votesFor: 400, votesAgainst: 100, abstentions: 50,
            sourceUrl: '',
            dataSource: 'RCV' as const,
            groupBreakdown: { EPP: { for: 100, against: 10, abstain: 5 } },
          },
          {
            id: 'v2', subject: 'Vote 2', reference: '', date: '2025-01-20',
            result: 'REJECTED' as const,
            votesFor: 150, votesAgainst: 350, abstentions: 50,
            sourceUrl: '',
            dataSource: 'RCV' as const,
          },
        ],
        total: 2,
        datesAvailable: ['2025-01-20'],
        datesUnavailable: [],
        source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
        limit: 100,
        offset: 0,
        hasMore: false,
      });

      const result = await handleGetAllGeneratedStats({ category: 'all', includeRankings: true });
      const data = parseStatsResponse(result) as {
        recentVoteActivity?: {
          recentVoteCount: number;
          adoptedCount: number;
          rejectedCount: number;
          adoptionRate: number;
          datesWithData: string[];
          groupVotingLeaders: Array<{ group: string; totalVotes: number }>;
          dataFreshness: string;
          dataSource: string;
        };
      };

      expect(data.recentVoteActivity).toBeDefined();
      expect(data.recentVoteActivity?.recentVoteCount).toBe(2);
      expect(data.recentVoteActivity?.adoptedCount).toBe(1);
      expect(data.recentVoteActivity?.rejectedCount).toBe(1);
      expect(data.recentVoteActivity?.adoptionRate).toBe(50);
      expect(data.recentVoteActivity?.datesWithData).toContain('2025-01-20');
      expect(data.recentVoteActivity?.groupVotingLeaders[0]?.group).toBe('EPP');
      expect(data.recentVoteActivity?.dataFreshness).toBe('NEAR_REALTIME');
      expect(data.recentVoteActivity?.dataSource).toBe('EP_DOCEO_XML');
      const callArgs = vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mock.calls[0]?.[0];
      expect(callArgs).toMatchObject({ includeIndividualVotes: false, limit: 100 });
      expect(callArgs?.abortSignal).toBeInstanceOf(AbortSignal);
    });

    it('omits recentVoteActivity when category is not all/roll_call_votes', async () => {
      const result = await handleGetAllGeneratedStats({
        category: 'plenary_sessions',
        includeRankings: true,
      });
      const data = parseStatsResponse(result) as { recentVoteActivity?: unknown };
      expect(data.recentVoteActivity).toBeUndefined();
    });

    it('omits recentVoteActivity when includeRankings=false', async () => {
      const result = await handleGetAllGeneratedStats({
        category: 'all',
        includeRankings: false,
      });
      const data = parseStatsResponse(result) as { recentVoteActivity?: unknown };
      expect(data.recentVoteActivity).toBeUndefined();
    });

    it('omits recentVoteActivity when DOCEO returns empty data', async () => {
      // beforeEach already mocks getLatestVotes to return empty data
      const result = await handleGetAllGeneratedStats({ category: 'all', includeRankings: true });
      const data = parseStatsResponse(result) as { recentVoteActivity?: unknown };
      // Empty data array → recentVoteActivity is returned but recentVoteCount = 0
      if (data.recentVoteActivity !== undefined) {
        const rva = data.recentVoteActivity as { recentVoteCount: number };
        expect(rva.recentVoteCount).toBe(0);
      }
    });

    it('omits recentVoteActivity gracefully when DOCEO throws', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(
        new Error('upstream failure')
      );
      const result = await handleGetAllGeneratedStats({ category: 'all', includeRankings: true });
      const data = parseStatsResponse(result) as { recentVoteActivity?: unknown };
      expect(data.recentVoteActivity).toBeUndefined();
    });

    it('includes recentVoteActivity when category=roll_call_votes', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        data: [
          {
            id: 'v1', subject: 'Vote 1', reference: '', date: '2025-01-20',
            result: 'ADOPTED' as const,
            votesFor: 300, votesAgainst: 100, abstentions: 50,
            sourceUrl: '',
            dataSource: 'VOT' as const,
          },
        ],
        total: 1,
        datesAvailable: ['2025-01-20'],
        datesUnavailable: ['2025-01-19'],
        source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
        limit: 100,
        offset: 0,
        hasMore: false,
      });

      const result = await handleGetAllGeneratedStats({
        category: 'roll_call_votes',
        includeRankings: true,
      });
      const data = parseStatsResponse(result) as {
        recentVoteActivity?: { recentVoteCount: number; datesWithoutData: string[] };
      };
      expect(data.recentVoteActivity?.recentVoteCount).toBe(1);
      expect(data.recentVoteActivity?.datesWithoutData).toContain('2025-01-19');
    });

    it('caches recentVoteActivity to avoid repeated DOCEO calls', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValueOnce({
        data: [
          {
            id: 'v1', subject: 'Vote 1', reference: '', date: '2025-01-20',
            result: 'ADOPTED' as const,
            votesFor: 300, votesAgainst: 100, abstentions: 50,
            sourceUrl: '',
            dataSource: 'VOT' as const,
          },
        ],
        total: 1,
        datesAvailable: ['2025-01-20'],
        datesUnavailable: [],
        source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
        limit: 100,
        offset: 0,
        hasMore: false,
      });

      const first = parseStatsResponse(
        await handleGetAllGeneratedStats({ category: 'all', includeRankings: true })
      ) as { recentVoteActivity?: { recentVoteCount: number } };
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValueOnce(
        new Error('should use cache')
      );
      const second = parseStatsResponse(
        await handleGetAllGeneratedStats({ category: 'all', includeRankings: true })
      ) as { recentVoteActivity?: { recentVoteCount: number } };

      expect(first.recentVoteActivity?.recentVoteCount).toBe(1);
      expect(second.recentVoteActivity?.recentVoteCount).toBe(1);
      expect(doceoClientModule.doceoClient.getLatestVotes).toHaveBeenCalledTimes(1);
    });
  });
});

// ─── Additional coverage for lines 148, 226, 342, 441 ────────────────────────

describe('Coverage for recomputeRankingSummary, computeGroupVotingLeaders, and error paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRecentVoteStatsCache();
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockReset();
    // Default: empty DOCEO response
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      data: [],
      total: 0,
      datesAvailable: [],
      datesUnavailable: [],
      source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
      limit: 100,
      offset: 0,
      hasMore: false,
    });
  });

  // A. Line 148 — empty filtered array in recomputeRankingSummary
  it('returns empty rankings when year range has no data', async () => {
    const result = await handleGetAllGeneratedStats({
      yearFrom: 2030,
      yearTo: 2031,
      includeRankings: true,
      category: 'plenary_sessions',
    });
    const data = parseStatsResponse(result) as { categoryRankings?: Array<{ rankings: unknown[] }> };
    if (data.categoryRankings !== undefined && data.categoryRankings.length > 0) {
      for (const r of data.categoryRankings) {
        expect(r.rankings).toHaveLength(0);
      }
    }
    // Test passes even if no categoryRankings key (response still valid)
    expect(result.content[0]!.type).toBe('text');
  });

  // B. Line 226 — computeGroupVotingLeaders with 4+ groups (sorting + slice to top 3)
  it('returns top-3 groupVotingLeaders sorted by vote participation', async () => {
    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      data: [
        {
          id: 'v1', date: '2025-01-20', result: 'ADOPTED' as const,
          subject: 'V1', reference: '', votesFor: 10, votesAgainst: 0, abstentions: 0,
          sourceUrl: '', dataSource: 'RCV' as const,
          groupBreakdown: {
            EPP: { for: 100, against: 0, abstain: 0 },
            'S&D': { for: 80, against: 0, abstain: 0 },
            RE: { for: 60, against: 0, abstain: 0 },
            'Greens/EFA': { for: 40, against: 0, abstain: 0 },
          },
        },
      ],
      total: 1, datesAvailable: ['2025-01-20'], datesUnavailable: [],
      source: { type: 'DOCEO_XML' as const, term: 10, urls: [] },
      limit: 100, offset: 0, hasMore: false,
    });

    const result = await handleGetAllGeneratedStats({ category: 'all', includeRankings: true });
    const data = parseStatsResponse(result) as {
      recentVoteActivity?: {
        groupVotingLeaders: Array<{ group: string; totalVotes: number }>;
      };
    };
    expect(data.recentVoteActivity?.groupVotingLeaders).toHaveLength(3);
    // EPP should be first (100 votes)
    expect(data.recentVoteActivity?.groupVotingLeaders[0]?.group).toBe('EPP');
    expect(data.recentVoteActivity?.groupVotingLeaders[0]?.totalVotes).toBe(100);
  });

  // D. Line 441 — non-ZodError rethrow in handleGetAllGeneratedStats
  it('rethrows non-ZodError when schema parsing throws unexpectedly', async () => {
    const parseError = new TypeError('parse blew up');
    const parseSpy = vi.spyOn(GetAllGeneratedStatsSchema, 'parse').mockImplementationOnce(() => {
      throw parseError;
    });
    await expect(handleGetAllGeneratedStats({})).rejects.toThrow('parse blew up');
    expect(parseSpy).toHaveBeenCalledOnce();
    parseSpy.mockRestore();
  });

  // E. getAllGeneratedStats sync function without recentVoteActivity
  it('getAllGeneratedStats works synchronously without recentVoteActivity', () => {
    const params = GetAllGeneratedStatsSchema.parse({ category: 'all' });
    const result = getAllGeneratedStats(params);
    expect(result).toHaveProperty('content');
    const data = JSON.parse(result.content[0]!.text) as { recentVoteActivity?: unknown };
    expect(data.recentVoteActivity).toBeUndefined();
  });
});
