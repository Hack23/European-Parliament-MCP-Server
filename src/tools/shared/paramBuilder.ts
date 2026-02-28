/**
 * Shared utility for building API parameter objects.
 *
 * Eliminates the repetitive `if (params['key'] !== undefined)` pattern that
 * appears across multiple tool files, providing a single, testable implementation.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/**
 * Builds an API parameter object by mapping tool-parameter keys to API parameter keys,
 * including only entries whose source value is a primitive `string`, `number`, or `boolean`.
 *
 * Falsy-but-valid primitive values (`''`, `0`, `false`) **are** preserved so that callers can
 * explicitly send them to the downstream API. All other value types (including `undefined`,
 * `null`, objects, arrays, functions, symbols, etc.) are skipped and **not** forwarded.
 *
 * @param params  - The validated tool-parameter object (e.g. the output of a Zod parse).
 * @param mapping - A read-only array of `{ from, to }` pairs describing how each
 *   tool-parameter key maps to the corresponding API query-parameter key.
 * @returns A new `Record<string, string | number | boolean>` containing only the
 *   entries that were present in `params`.
 *
 * @example
 * ```typescript
 * const apiParams = buildApiParams(params, [
 *   { from: 'country', to: 'country-of-representation' },
 *   { from: 'group',   to: 'political-group' },
 * ]);
 * // If params.country === 'SE' and params.group === undefined:
 * // => { 'country-of-representation': 'SE' }
 * ```
 */
export function buildApiParams<T extends Record<string, unknown>>(
  params: T,
  mapping: readonly { from: keyof T; to: string }[]
): Record<string, string | number | boolean> {
  const apiParams: Record<string, string | number | boolean> = {};
  for (const { from, to } of mapping) {
    const value = params[from];
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      apiParams[to] = value;
    }
  }
  return apiParams;
}
