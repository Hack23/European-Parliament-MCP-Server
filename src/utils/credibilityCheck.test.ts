import { describe, it, expect } from 'vitest';
import {
  isCredibleApiValue,
  MIN_CREDIBLE_VALUE,
  MAX_ALLOWED_DROP_PERCENT,
  MIN_STORED_FOR_DROP_CHECK,
} from './credibilityCheck.js';

describe('isCredibleApiValue', () => {
  // ── Constants sanity checks ────────────────────────────────────

  it('should export expected threshold constants', () => {
    expect(MIN_CREDIBLE_VALUE).toBe(10);
    expect(MAX_ALLOWED_DROP_PERCENT).toBe(50);
    expect(MIN_STORED_FOR_DROP_CHECK).toBe(100);
  });

  // ── Guard 1: tiny API value ────────────────────────────────────

  describe('Guard 1 — tiny API value', () => {
    it('should reject API value < 10 when stored is much larger (> 5×)', () => {
      // 5 < 10 and 100 > 5*5=25 → reject
      expect(isCredibleApiValue(5, 100)).toBe(false);
    });

    it('should reject API value of 0 when stored has data', () => {
      expect(isCredibleApiValue(0, 50)).toBe(false);
    });

    it('should accept API value < 10 when stored is small (≤ 5×)', () => {
      // 9 < 10 but 40 ≤ 9*5=45 → accept
      expect(isCredibleApiValue(9, 40)).toBe(true);
    });

    it('should still reject at MIN_CREDIBLE_VALUE boundary when guard 2 triggers', () => {
      // 10 is NOT < 10, so guard 1 does not trigger
      // But guard 2: stored=1000 > 100, drop=99% > 50% → reject
      expect(isCredibleApiValue(10, 1000)).toBe(false);
    });

    it('should accept tiny API value when stored is also tiny', () => {
      // 3 < 10 but 10 ≤ 3*5=15 → accept
      expect(isCredibleApiValue(3, 10)).toBe(true);
    });

    it('should reject API value 1 when stored is moderate', () => {
      // 1 < 10 and 50 > 1*5=5 → reject
      expect(isCredibleApiValue(1, 50)).toBe(false);
    });
  });

  // ── Guard 2: significant drop ─────────────────────────────────

  describe('Guard 2 — significant drop from substantial stored value', () => {
    it('should reject >50% drop when stored is substantial (real case: speeches 10000→1998)', () => {
      // Drop = (10000-1998)/10000 * 100 = 80.02% > 50% → reject
      expect(isCredibleApiValue(1998, 10000)).toBe(false);
    });

    it('should reject >50% drop (real case: documents 3516→930)', () => {
      // Drop = (3516-930)/3516 * 100 = 73.55% > 50% → reject
      expect(isCredibleApiValue(930, 3516)).toBe(false);
    });

    it('should reject >50% drop (real case: questions 6147→1355)', () => {
      // Drop = (6147-1355)/6147 * 100 = 77.96% > 50% → reject
      expect(isCredibleApiValue(1355, 6147)).toBe(false);
    });

    it('should accept exactly 50% drop (boundary)', () => {
      // Drop = (200-100)/200 * 100 = 50% — NOT > 50% → accept
      expect(isCredibleApiValue(100, 200)).toBe(true);
    });

    it('should reject just over 50% drop', () => {
      // Drop = (200-99)/200 * 100 = 50.5% > 50% → reject
      expect(isCredibleApiValue(99, 200)).toBe(false);
    });

    it('should accept small drop (< 50%) from substantial stored value', () => {
      // Drop = (500-300)/500 * 100 = 40% < 50% → accept
      expect(isCredibleApiValue(300, 500)).toBe(true);
    });

    it('should not trigger for stored ≤ MIN_STORED_FOR_DROP_CHECK', () => {
      // Even though drop is 90%, stored (100) is exactly at threshold
      // 100 is NOT > 100, so guard 2 does not trigger → accept
      expect(isCredibleApiValue(10, 100)).toBe(true);
    });

    it('should trigger for stored just above MIN_STORED_FOR_DROP_CHECK', () => {
      // stored=101 > 100, drop = (101-10)/101 * 100 = 90.1% > 50% → reject
      expect(isCredibleApiValue(10, 101)).toBe(false);
    });
  });

  // ── Increases (always trusted) ─────────────────────────────────

  describe('increases — always trusted', () => {
    it('should accept increase from small stored value', () => {
      expect(isCredibleApiValue(500, 100)).toBe(true);
    });

    it('should accept increase from large stored value', () => {
      expect(isCredibleApiValue(15000, 10000)).toBe(true);
    });

    it('should accept when API equals stored', () => {
      expect(isCredibleApiValue(5000, 5000)).toBe(true);
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should accept when both are 0', () => {
      expect(isCredibleApiValue(0, 0)).toBe(true);
    });

    it('should accept when the drop is exactly at MAX_ALLOWED_DROP_PERCENT', () => {
      expect(isCredibleApiValue(10000, 20000)).toBe(true);
    });
  });
});
