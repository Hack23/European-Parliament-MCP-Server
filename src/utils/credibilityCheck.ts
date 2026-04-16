/**
 * Data credibility checks for EP API values.
 *
 * Used by `scripts/generate-stats.ts --update` to prevent overwriting
 * curated statistics with incomplete EP API data.
 *
 * @module
 */

/** API values below this are suspicious when stored value is much larger. */
export const MIN_CREDIBLE_VALUE = 10;

/**
 * Maximum allowed percentage drop from stored value before the API value
 * is treated as incomplete/unreliable.
 *
 * EP API endpoints sometimes return partial datasets due to:
 * - Server-side pagination issues or timeouts
 * - Data reorganisation or migration
 * - Incomplete database loads
 *
 * Set to 50% to catch clearly incomplete data (e.g. 80% drops in speeches,
 * 73% drops in documents) while still allowing genuine corrections.
 */
export const MAX_ALLOWED_DROP_PERCENT = 50;

/**
 * Minimum stored value before the "significant drop" guard activates.
 *
 * Small stored values (≤ 100) are allowed to fluctuate freely since
 * even large percentage changes represent small absolute differences.
 */
export const MIN_STORED_FOR_DROP_CHECK = 100;

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
export function isCredibleApiValue(apiValue: number, storedValue: number): boolean {
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
