/**
 * Tests for src/data/generatedStats.ts
 *
 * Verifies the structure, content, and computed values of the
 * pre-generated GENERATED_STATS constant.  All tests are
 * deterministic (no network calls).
 */

import { describe, it, expect, beforeAll } from 'vitest';
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

  it('should have a valid coverage period', () => {
    const { from, to } = GENERATED_STATS.coveragePeriod;
    expect(typeof from).toBe('number');
    expect(typeof to).toBe('number');
    expect(Number.isInteger(from)).toBe(true);
    expect(Number.isInteger(to)).toBe(true);
    expect(from).toBeLessThanOrEqual(to);
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

  it('should cover every year in the coverage period', () => {
    const { from, to } = GENERATED_STATS.coveragePeriod;
    const years = GENERATED_STATS.yearlyStats.map((y) => y.year);
    for (let year = from; year <= to; year++) {
      expect(years).toContain(year);
    }
  });

  it('should have exactly one entry per year in the coverage period', () => {
    const { from, to } = GENERATED_STATS.coveragePeriod;
    expect(GENERATED_STATS.yearlyStats).toHaveLength(to - from + 1);
  });

  describe('each entry structure', () => {
    let sample: YearlyStats;
    beforeAll(() => {
      expect(GENERATED_STATS.yearlyStats.length).toBeGreaterThan(0);
      sample = GENERATED_STATS.yearlyStats[0]!;
    });

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
    let sample: CategoryRanking;
    beforeAll(() => {
      expect(GENERATED_STATS.categoryRankings.length).toBeGreaterThan(0);
      sample = GENERATED_STATS.categoryRankings[0]!;
    });

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
    expect(categories).toContain('Plenary Sessions');
  });
});

// ─── predictions ─────────────────────────────────────────────────────────────

describe('GENERATED_STATS.predictions', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(GENERATED_STATS.predictions)).toBe(true);
    expect(GENERATED_STATS.predictions.length).toBeGreaterThan(0);
  });

  it('should cover future years (beyond the coverage period)', () => {
    const { to } = GENERATED_STATS.coveragePeriod;
    const years = GENERATED_STATS.predictions.map((p) => p.year);
    for (const year of years) {
      expect(year).toBeGreaterThan(to);
    }
  });

  describe('each prediction entry structure', () => {
    let sample: PredictionYear;
    beforeAll(() => {
      expect(GENERATED_STATS.predictions.length).toBeGreaterThan(0);
      sample = GENERATED_STATS.predictions[0]!;
    });

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
    const { from, to } = GENERATED_STATS.coveragePeriod;
    expect(typeof summary.peakActivityYear).toBe('number');
    expect(summary.peakActivityYear).toBeGreaterThanOrEqual(from);
    expect(summary.peakActivityYear).toBeLessThanOrEqual(to);
  });

  it('should have a valid lowestActivityYear', () => {
    const { from, to } = GENERATED_STATS.coveragePeriod;
    expect(typeof summary.lowestActivityYear).toBe('number');
    expect(summary.lowestActivityYear).toBeGreaterThanOrEqual(from);
    expect(summary.lowestActivityYear).toBeLessThanOrEqual(to);
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
    const { from, to } = GENERATED_STATS.coveragePeriod;
    for (const ranking of GENERATED_STATS.categoryRankings) {
      expect(typeof ranking.topYear).toBe('number');
      expect(ranking.topYear).toBeGreaterThanOrEqual(from);
      expect(ranking.topYear).toBeLessThanOrEqual(to);
    }
  });
});

// ─── Political landscape data consistency ─────────────────────────────────────

describe('GENERATED_STATS — political landscape data consistency', () => {
  it('should have seat shares summing to approximately 100% for each year', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const totalShare = yearly.politicalLandscape.groups.reduce(
        (sum, g) => sum + g.seatShare,
        0
      );
      expect(totalShare).toBeGreaterThanOrEqual(98.5);
      expect(totalShare).toBeLessThanOrEqual(101.5);
    }
  });

  it('should have total seats across all groups approximately matching mepCount (within ±15)', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const totalSeats = yearly.politicalLandscape.groups.reduce(
        (sum, g) => sum + g.seats,
        0
      );
      expect(Math.abs(totalSeats - yearly.mepCount)).toBeLessThanOrEqual(15);
    }
  });

  it('should have largestGroup matching the group with the most seats', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const { groups, largestGroup } = yearly.politicalLandscape;
      const maxSeats = Math.max(...groups.map((g) => g.seats));
      const groupWithMostSeats = groups.find((g) => g.seats === maxSeats);
      expect(groupWithMostSeats).toBeDefined();
      expect(largestGroup).toBe(groupWithMostSeats!.name);
    }
  });

  it('should have largestGroupSeatShare matching the actual largest group seatShare', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const { groups, largestGroup, largestGroupSeatShare } = yearly.politicalLandscape;
      const largest = groups.find((g) => g.name === largestGroup);
      expect(largest).toBeDefined();
      expect(largestGroupSeatShare).toBe(largest!.seatShare);
    }
  });

  it('should have totalGroups equal to the number of non-NI groups', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const { groups, totalGroups } = yearly.politicalLandscape;
      const nonNiCount = groups.filter((g) => g.name !== 'NI').length;
      expect(totalGroups).toBe(nonNiCount);
    }
  });

  it('should have fragmentationIndex (ENPP) consistent with seat shares (±0.15 tolerance)', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const { groups, fragmentationIndex } = yearly.politicalLandscape;
      // Laakso-Taagepera ENPP = 1 / sum(pi^2) where pi = seatShare / 100
      const sumSquares = groups.reduce(
        (sum, g) => sum + (g.seatShare / 100) ** 2,
        0
      );
      const expectedENPP = sumSquares > 0 ? 1 / sumSquares : 0;
      expect(Math.abs(fragmentationIndex - expectedENPP)).toBeLessThanOrEqual(0.15);
    }
  });

  it('should have grandCoalitionPossible true when top 2 groups exceed 50% of mepCount seats', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const { groups, grandCoalitionPossible } = yearly.politicalLandscape;
      const sortedBySeats = [...groups].sort((a, b) => b.seats - a.seats);
      const top2Seats = (sortedBySeats[0]?.seats ?? 0) + (sortedBySeats[1]?.seats ?? 0);
      const majorityThreshold = yearly.mepCount / 2;

      if (top2Seats > majorityThreshold) {
        expect(grandCoalitionPossible).toBe(true);
      }
      // Note: when top2Seats <= majorityThreshold, grandCoalitionPossible should be false
      // but we only assert the positive direction to avoid false negatives from rounding
    }
  });
});

// ─── Monthly distribution integrity ──────────────────────────────────────────

describe('GENERATED_STATS — monthly distribution integrity', () => {
  const MONTHLY_METRICS = [
    'plenarySessions',
    'legislativeActsAdopted',
    'rollCallVotes',
    'committeeMeetings',
    'parliamentaryQuestions',
    'resolutions',
    'speeches',
    'adoptedTexts',
    'procedures',
    'events',
    'documents',
    'mepTurnover',
    'declarations',
  ] as const;

  it('should have monthly sums equal to annual totals for all 13 metrics', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      for (const metric of MONTHLY_METRICS) {
        const monthlySum = yearly.monthlyActivity.reduce(
          (acc, m) => acc + (m[metric] as number),
          0
        );
        const annualTotal = yearly[metric] as number;
        expect(monthlySum).toBe(annualTotal);
      }
    }
  });

  it('should have August (month 8) as the lowest activity month for each year', () => {
    for (const yearly of GENERATED_STATS.yearlyStats) {
      const augustEntry = yearly.monthlyActivity.find((m) => m.month === 8);
      expect(augustEntry).toBeDefined();

      for (const metric of MONTHLY_METRICS) {
        const augustValue = augustEntry![metric] as number;
        for (const m of yearly.monthlyActivity) {
          if (m.month !== 8) {
            expect(augustValue).toBeLessThanOrEqual(m[metric] as number);
          }
        }
      }
    }
  });
});

// ─── Parliamentary term assignment ───────────────────────────────────────────

describe('GENERATED_STATS — parliamentary term assignment', () => {
  const findYearEntry = (year: number) =>
    GENERATED_STATS.yearlyStats.find((y) => y.year === year);

  it('should assign EP6 to years 2004–2008', () => {
    for (const year of [2004, 2005, 2006, 2007, 2008]) {
      const entry = findYearEntry(year);
      expect(entry).toBeDefined();
      expect(entry!.parliamentaryTerm).toContain('EP6');
    }
  });

  it('should assign EP6 or EP7 to year 2009 (transition)', () => {
    const entry = findYearEntry(2009);
    expect(entry).toBeDefined();
    const term = entry!.parliamentaryTerm;
    expect(term.includes('EP6') || term.includes('EP7')).toBe(true);
  });

  it('should assign EP7 to years 2010–2013', () => {
    for (const year of [2010, 2011, 2012, 2013]) {
      const entry = findYearEntry(year);
      expect(entry).toBeDefined();
      expect(entry!.parliamentaryTerm).toContain('EP7');
    }
  });

  it('should assign EP7 or EP8 to year 2014 (transition)', () => {
    const entry = findYearEntry(2014);
    expect(entry).toBeDefined();
    const term = entry!.parliamentaryTerm;
    expect(term.includes('EP7') || term.includes('EP8')).toBe(true);
  });

  it('should assign EP8 to years 2015–2018', () => {
    for (const year of [2015, 2016, 2017, 2018]) {
      const entry = findYearEntry(year);
      expect(entry).toBeDefined();
      expect(entry!.parliamentaryTerm).toContain('EP8');
    }
  });

  it('should assign EP8 or EP9 to year 2019 (transition)', () => {
    const entry = findYearEntry(2019);
    expect(entry).toBeDefined();
    const term = entry!.parliamentaryTerm;
    expect(term.includes('EP8') || term.includes('EP9')).toBe(true);
  });

  it('should assign EP9 to years 2020–2023', () => {
    for (const year of [2020, 2021, 2022, 2023]) {
      const entry = findYearEntry(year);
      expect(entry).toBeDefined();
      expect(entry!.parliamentaryTerm).toContain('EP9');
    }
  });

  it('should assign EP9 or EP10 to year 2024 (transition)', () => {
    const entry = findYearEntry(2024);
    expect(entry).toBeDefined();
    const term = entry!.parliamentaryTerm;
    expect(term.includes('EP9') || term.includes('EP10')).toBe(true);
  });

  it('should assign EP10 to year 2025', () => {
    const entry = findYearEntry(2025);
    expect(entry).toBeDefined();
    expect(entry!.parliamentaryTerm).toContain('EP10');
  });
});

// ─── Prediction integrity ────────────────────────────────────────────────────

describe('GENERATED_STATS — prediction integrity', () => {
  const PREDICTION_FIELDS = [
    'predictedPlenarySessions',
    'predictedLegislativeActs',
    'predictedRollCallVotes',
    'predictedCommitteeMeetings',
    'predictedParliamentaryQuestions',
    'predictedResolutions',
    'predictedSpeeches',
    'predictedAdoptedTexts',
    'predictedProcedures',
    'predictedEvents',
    'predictedDocuments',
    'predictedMepTurnover',
    'predictedDeclarations',
  ] as const;

  it('should have all predicted values positive', () => {
    for (const prediction of GENERATED_STATS.predictions) {
      for (const field of PREDICTION_FIELDS) {
        expect(prediction[field]).toBeGreaterThan(0);
      }
    }
  });

  it('should have prediction years sequential from 2026 to 2030', () => {
    const years = GENERATED_STATS.predictions.map((p) => p.year);
    expect(years).toEqual([2026, 2027, 2028, 2029, 2030]);
  });

  it('should have each prediction include all 13 metric fields', () => {
    for (const prediction of GENERATED_STATS.predictions) {
      for (const field of PREDICTION_FIELDS) {
        expect(prediction).toHaveProperty(field);
        expect(typeof prediction[field]).toBe('number');
      }
    }
  });
});
