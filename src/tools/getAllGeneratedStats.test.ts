/**
 * Tests for src/tools/getAllGeneratedStats.ts
 *
 * Covers: input validation, response structure, filtering, rankings,
 *         predictions, monthly breakdown, and error handling.
 */

import { describe, it, expect } from 'vitest';
import {
  handleGetAllGeneratedStats,
  getAllGeneratedStats,
  GetAllGeneratedStatsSchema,
} from './getAllGeneratedStats.js';

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
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.type).toBe('text');

    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.generatedAt).toBeDefined();
    expect(data.coveragePeriod).toBeDefined();
    expect(data.yearlyStats).toBeDefined();
    expect(data.analysisSummary).toBeDefined();
    expect(data.methodology).toBeDefined();
    expect(data.sourceAttribution).toContain('europarl');
  });

  it('returns yearly stats covering 2004-2025 (22 years)', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.yearlyStats).toHaveLength(22);
    expect(data.yearlyStats[0].year).toBe(2004);
    expect(data.yearlyStats[21].year).toBe(2025);
  });

  it('each yearly stat has required fields', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    const year = data.yearlyStats[0];
    expect(year.year).toBeDefined();
    expect(year.parliamentaryTerm).toBeDefined();
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
    expect(year.commentary).toBeDefined();
  });

  it('each yearly stat includes political landscape data', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    const year = data.yearlyStats[0];
    expect(year.politicalLandscape).toBeDefined();
    expect(year.politicalLandscape.groups).toBeDefined();
    expect(year.politicalLandscape.groups.length).toBeGreaterThan(0);
    expect(year.politicalLandscape.totalGroups).toBeGreaterThan(0);
    expect(year.politicalLandscape.largestGroup).toBeDefined();
    expect(year.politicalLandscape.largestGroupSeatShare).toBeGreaterThan(0);
    expect(year.politicalLandscape.fragmentationIndex).toBeGreaterThan(0);
    expect(typeof year.politicalLandscape.grandCoalitionPossible).toBe('boolean');
    expect(year.politicalLandscape.politicalBalance).toBeDefined();

    // Verify political group snapshot structure
    const group = year.politicalLandscape.groups[0];
    expect(group.name).toBeDefined();
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    const year2004 = data.yearlyStats.find((y: Record<string, unknown>) => y.year === 2004)?.politicalLandscape;
    const year2025 = data.yearlyStats.find((y: Record<string, unknown>) => y.year === 2025)?.politicalLandscape;
    // Fragmentation has increased over time
    expect(year2025.fragmentationIndex).toBeGreaterThan(year2004.fragmentationIndex);
    // Grand coalition was possible in EP6 but not in EP10
    expect(year2004.grandCoalitionPossible).toBe(true);
    expect(year2025.grandCoalitionPossible).toBe(false);
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.yearlyStats).toHaveLength(1);
    expect(data.yearlyStats[0].politicalLandscape).toBeDefined();
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.predictions).toBeDefined();
    expect(data.predictions.length).toBe(5);
    expect(data.predictions[0].year).toBe(2026);
    expect(data.predictions[4].year).toBe(2030);
    expect(data.predictions[0].confidenceInterval).toBeDefined();
    expect(data.predictions[0].methodology).toBeDefined();
  });

  it('excludes predictions when not requested', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.predictions).toBeUndefined();
  });

  it('excludes predictions when yearTo is before prediction years even if includePredictions is true', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2019,
      yearTo: 2024,
      category: 'all',
      includePredictions: true,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.predictions).toBeUndefined();
  });

  it('includes only predictions within the requested year range', () => {
    const result = getAllGeneratedStats({
      yearFrom: 2020,
      yearTo: 2027,
      category: 'all',
      includePredictions: true,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.predictions).toBeDefined();
    expect(data.predictions.length).toBe(2);
    expect(data.predictions[0].year).toBe(2026);
    expect(data.predictions[1].year).toBe(2027);
  });

  it('includes category rankings with percentiles', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: true,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.categoryRankings).toBeDefined();
    expect(data.categoryRankings.length).toBe(13);

    const ranking = data.categoryRankings[0];
    expect(ranking.category).toBeDefined();
    expect(ranking.mean).toBeGreaterThan(0);
    expect(ranking.stdDev).toBeGreaterThan(0);
    expect(ranking.median).toBeGreaterThan(0);
    expect(ranking.topYear).toBeGreaterThanOrEqual(2004);
    expect(ranking.bottomYear).toBeGreaterThanOrEqual(2004);
    expect(ranking.rankings).toBeDefined();
    expect(ranking.rankings.length).toBe(22);

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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('Legislative Acts Adopted');
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.yearlyStats).toHaveLength(1);
    expect(data.yearlyStats[0].monthlyActivity).toBeDefined();
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.yearlyStats).toHaveLength(4);
    expect(data.yearlyStats[0].year).toBe(2015);
    expect(data.yearlyStats[3].year).toBe(2018);
    expect(data.totalYearsReturned).toBe(4);
  });

  it('analysis summary has required fields', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    const summary = data.analysisSummary;
    expect(summary.overallTrend).toBeDefined();
    expect(summary.peakActivityYear).toBeGreaterThanOrEqual(2004);
    expect(summary.lowestActivityYear).toBeGreaterThanOrEqual(2004);
    expect(summary.averageAnnualLegislativeOutput).toBeGreaterThan(0);
    expect(summary.legislativeProductivityTrend).toBeDefined();
    expect(summary.keyFindings).toBeDefined();
    expect(summary.keyFindings.length).toBeGreaterThan(0);
  });

  it('has HIGH confidence level', () => {
    const result = getAllGeneratedStats({
      category: 'all',
      includePredictions: false,
      includeMonthlyBreakdown: false,
      includeRankings: false,
    });
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.confidenceLevel).toBe('HIGH');
  });
});

// ── Handler Integration ──────────────────────────────────────────

describe('handleGetAllGeneratedStats', () => {
  it('handles empty args (all defaults)', async () => {
    const result = await handleGetAllGeneratedStats({});
    expect(result.content).toBeDefined();
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.yearlyStats.length).toBe(22);
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
    const data = JSON.parse(result.content[0]?.text ?? '{}');
    expect(data.categoryRankings).toHaveLength(1);
    expect(data.categoryRankings[0].category).toBe('Plenary Sessions');
  });
});
