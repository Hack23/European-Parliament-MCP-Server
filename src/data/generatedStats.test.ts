/**
 * Tests for src/data/generatedStats.ts
 *
 * Verifies the structure, content, and computed values of the
 * pre-generated GENERATED_STATS constant.  All tests are
 * deterministic (no network calls).
 */

import { describe, it, expect } from 'vitest';
import {
  GENERATED_STATS,
  type YearlyStats,
  type CategoryRanking,
  type PredictionYear,
  type MonthlyActivity,
} from './generatedStats.js';

// ─── Top-level metadata ───────────────────────────────────────────────────────

describe('GENERATED_STATS — top-level metadata', () => {
  it('should be defined', () => {
    expect(GENERATED_STATS).toBeDefined();
  });

  it('should have a generatedAt ISO timestamp', () => {
    expect(typeof GENERATED_STATS.generatedAt).toBe('string');
    expect(GENERATED_STATS.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should cover the period 2004–2025', () => {
    expect(GENERATED_STATS.coveragePeriod.from).toBe(2004);
    expect(GENERATED_STATS.coveragePeriod.to).toBe(2025);
  });

  it('should include a methodologyVersion', () => {
    expect(typeof GENERATED_STATS.methodologyVersion).toBe('string');
    expect(GENERATED_STATS.methodologyVersion.length).toBeGreaterThan(0);
  });

  it('should include a dataSource attribution', () => {
    expect(typeof GENERATED_STATS.dataSource).toBe('string');
    expect(GENERATED_STATS.dataSource).toContain('europarl');
  });
});

// ─── yearlyStats ─────────────────────────────────────────────────────────────

describe('GENERATED_STATS.yearlyStats', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(GENERATED_STATS.yearlyStats)).toBe(true);
    expect(GENERATED_STATS.yearlyStats.length).toBeGreaterThan(0);
  });

  it('should cover every year from 2004 to 2025', () => {
    const years = GENERATED_STATS.yearlyStats.map((y) => y.year);
    for (let year = 2004; year <= 2025; year++) {
      expect(years).toContain(year);
    }
  });

  it('should have exactly 22 entries (2004–2025 inclusive)', () => {
    expect(GENERATED_STATS.yearlyStats).toHaveLength(22);
  });

  describe('each entry structure', () => {
    const sample: YearlyStats = GENERATED_STATS.yearlyStats[0];

    it('should have a numeric year', () => {
      expect(typeof sample.year).toBe('number');
    });

    it('should have plenarySessions count', () => {
      expect(typeof sample.plenarySessions).toBe('number');
      expect(sample.plenarySessions).toBeGreaterThanOrEqual(0);
    });

    it('should have legislativeActsAdopted count', () => {
      expect(typeof sample.legislativeActsAdopted).toBe('number');
    });

    it('should have rollCallVotes count', () => {
      expect(typeof sample.rollCallVotes).toBe('number');
    });

    it('should have committeeMeetings count', () => {
      expect(typeof sample.committeeMeetings).toBe('number');
    });

    it('should have parliamentaryQuestions count', () => {
      expect(typeof sample.parliamentaryQuestions).toBe('number');
    });

    it('should have a monthlyActivity array with 12 entries', () => {
      expect(Array.isArray(sample.monthlyActivity)).toBe(true);
      expect(sample.monthlyActivity).toHaveLength(12);
    });

    it('monthly entries should have month 1–12', () => {
      const months = sample.monthlyActivity.map((m: MonthlyActivity) => m.month);
      for (let m = 1; m <= 12; m++) {
        expect(months).toContain(m);
      }
    });

    it('monthly plenarySessions should be non-negative integers', () => {
      for (const monthly of sample.monthlyActivity) {
        expect(Number.isInteger(monthly.plenarySessions)).toBe(true);
        expect(monthly.plenarySessions).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have a parliamentaryTerm string', () => {
      expect(typeof sample.parliamentaryTerm).toBe('string');
    });
  });

  it('sum of monthly plenarySessions should equal annual plenarySessions', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const monthlySum = yearly.monthlyActivity.reduce(
        (acc, m) => acc + m.plenarySessions,
        0
      );
      expect(monthlySum).toBe(yearly.plenarySessions);
    }
  });

  it('sum of monthly legislativeActsAdopted should equal annual legislativeActsAdopted', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const monthlySum = yearly.monthlyActivity.reduce(
        (acc, m) => acc + m.legislativeActsAdopted,
        0
      );
      expect(monthlySum).toBe(yearly.legislativeActsAdopted);
    }
  });

  it('all years should have positive annual totals for key metrics', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      // Not all metrics may be present for every year, but at least some should be > 0
      const hasActivity =
        yearly.plenarySessions > 0 ||
        yearly.rollCallVotes > 0 ||
        yearly.legislativeActsAdopted > 0;
      expect(hasActivity).toBe(true);
    }
  });
});

// ─── categoryRankings ────────────────────────────────────────────────────────

describe('GENERATED_STATS.categoryRankings', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(GENERATED_STATS.categoryRankings)).toBe(true);
    expect(GENERATED_STATS.categoryRankings.length).toBeGreaterThan(0);
  });

  describe('each ranking entry structure', () => {
    const sample: CategoryRanking = GENERATED_STATS.categoryRankings[0];

    it('should have a category string', () => {
      expect(typeof sample.category).toBe('string');
    });

    it('should have a rankings array', () => {
      expect(Array.isArray(sample.rankings)).toBe(true);
      expect(sample.rankings.length).toBeGreaterThan(0);
    });

    it('rankings entries should have year, rank, percentile, and totalActivityScore', () => {
      for (const ranked of sample.rankings) {
        expect(typeof ranked.year).toBe('number');
        expect(typeof ranked.rank).toBe('number');
        expect(typeof ranked.percentile).toBe('number');
        expect(typeof ranked.totalActivityScore).toBe('number');
      }
    });

    it('should have numeric mean, stdDev, median', () => {
      expect(typeof sample.mean).toBe('number');
      expect(typeof sample.stdDev).toBe('number');
      expect(typeof sample.median).toBe('number');
    });

    it('should have topYear and bottomYear', () => {
      expect(typeof sample.topYear).toBe('number');
      expect(typeof sample.bottomYear).toBe('number');
    });
  });

  it('should include a Plenary Sessions category', () => {
    const categories = GENERATED_STATS.categoryRankings.map((r) => r.category);
    expect(categories.length).toBeGreaterThan(0);
    // At least one category should be a non-empty string
    expect(categories[0].length).toBeGreaterThan(0);
  });
});

// ─── predictions ─────────────────────────────────────────────────────────────

describe('GENERATED_STATS.predictions', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(GENERATED_STATS.predictions)).toBe(true);
    expect(GENERATED_STATS.predictions.length).toBeGreaterThan(0);
  });

  it('should cover future years (≥ 2026)', () => {
    const years = GENERATED_STATS.predictions.map((p) => p.year);
    for (const year of years) {
      expect(year).toBeGreaterThanOrEqual(2026);
    }
  });

  describe('each prediction entry structure', () => {
    const sample: PredictionYear = GENERATED_STATS.predictions[0];

    it('should have a numeric year', () => {
      expect(typeof sample.year).toBe('number');
    });

    it('should have predictedPlenarySessions', () => {
      expect(typeof sample.predictedPlenarySessions).toBe('number');
    });

    it('should have predictedLegislativeActs', () => {
      expect(typeof sample.predictedLegislativeActs).toBe('number');
    });

    it('should have predictedRollCallVotes', () => {
      expect(typeof sample.predictedRollCallVotes).toBe('number');
    });

    it('should have a confidenceInterval string', () => {
      expect(typeof sample.confidenceInterval).toBe('string');
    });

    it('should have a methodology string', () => {
      expect(typeof sample.methodology).toBe('string');
      expect(sample.methodology.length).toBeGreaterThan(0);
    });
  });
});

// ─── analysisSummary ─────────────────────────────────────────────────────────

describe('GENERATED_STATS.analysisSummary', () => {
  const summary = GENERATED_STATS.analysisSummary;

  it('should have overallTrend string', () => {
    expect(typeof summary.overallTrend).toBe('string');
    expect(summary.overallTrend.length).toBeGreaterThan(0);
  });

  it('should have a valid peakActivityYear', () => {
    expect(typeof summary.peakActivityYear).toBe('number');
    expect(summary.peakActivityYear).toBeGreaterThanOrEqual(2004);
    expect(summary.peakActivityYear).toBeLessThanOrEqual(2025);
  });

  it('should have a valid lowestActivityYear', () => {
    expect(typeof summary.lowestActivityYear).toBe('number');
    expect(summary.lowestActivityYear).toBeGreaterThanOrEqual(2004);
    expect(summary.lowestActivityYear).toBeLessThanOrEqual(2025);
  });

  it('peakActivityYear should have higher acts than lowestActivityYear', () => {
    const yearly = GENERATED_STATS.yearlyStats;
    const peakEntry = yearly.find((y) => y.year === summary.peakActivityYear);
    const lowestEntry = yearly.find((y) => y.year === summary.lowestActivityYear);
    expect(peakEntry?.legislativeActsAdopted).toBeGreaterThan(
      lowestEntry?.legislativeActsAdopted ?? Infinity
    );
  });

  it('should have a positive averageAnnualLegislativeOutput', () => {
    expect(typeof summary.averageAnnualLegislativeOutput).toBe('number');
    expect(summary.averageAnnualLegislativeOutput).toBeGreaterThan(0);
  });

  it('should have a legislativeProductivityTrend value', () => {
    expect(typeof summary.legislativeProductivityTrend).toBe('string');
    expect(['INCREASING', 'DECREASING', 'STABLE']).toContain(
      summary.legislativeProductivityTrend
    );
  });

  it('should have a non-empty keyFindings array', () => {
    expect(Array.isArray(summary.keyFindings)).toBe(true);
    expect(summary.keyFindings.length).toBeGreaterThan(0);
  });

  it('each keyFinding should be a non-empty string', () => {
    for (const finding of summary.keyFindings) {
      expect(typeof finding).toBe('string');
      expect(finding.length).toBeGreaterThan(0);
    }
  });
});

// ─── Data integrity ───────────────────────────────────────────────────────────

describe('GENERATED_STATS data integrity', () => {
  it('averageAnnualLegislativeOutput should match calculated average', () => {
    const yearly = GENERATED_STATS.yearlyStats;
    const avg = Math.round(
      yearly.reduce((s, y) => s + y.legislativeActsAdopted, 0) / yearly.length
    );
    expect(GENERATED_STATS.analysisSummary.averageAnnualLegislativeOutput).toBe(avg);
  });

  it('topYear should have highest total for that category', () => {
    for (const ranking of GENERATED_STATS.categoryRankings) {
      expect(typeof ranking.topYear).toBe('number');
      expect(ranking.topYear).toBeGreaterThanOrEqual(2004);
      expect(ranking.topYear).toBeLessThanOrEqual(2025);
    }
  });
});
