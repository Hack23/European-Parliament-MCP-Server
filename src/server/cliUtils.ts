/**
 * Lightweight CLI utility functions.
 *
 * This module intentionally has **no** imports from the EP client or
 * heavyweight server modules, so it can be loaded by `src/main.ts`
 * **before** the EP API client singleton is constructed.
 *
 * `timeout.ts` is a lightweight utility with zero heavyweight deps,
 * so importing {@link DEFAULT_TIMEOUTS} is safe here.
 *
 * @module server/cliUtils
 */

import { DEFAULT_TIMEOUTS } from '../utils/timeout.js';

/**
 * Default EP API request timeout in milliseconds — derived from the centralized
 * {@link DEFAULT_TIMEOUTS.EP_API_REQUEST_MS} constant in `timeout.ts` so there
 * is a single source of truth for the EP API request timeout value.
 */
export const DEFAULT_REQUEST_TIMEOUT_MS = DEFAULT_TIMEOUTS.EP_API_REQUEST_MS;

/**
 * Parse and validate a timeout string value.
 *
 * Accepts only strings consisting entirely of digits (`/^\d+$/`), then
 * verifies the resulting integer is positive and finite.
 *
 * @param value - Raw string value (e.g. from `--timeout` argument or env var)
 * @returns Parsed positive integer, or `undefined` if invalid
 *
 * @example
 * ```typescript
 * parseTimeoutValue('90000'); // 90000
 * parseTimeoutValue('10s');   // undefined (non-digit characters)
 * parseTimeoutValue('0');     // undefined (not positive)
 * parseTimeoutValue('');      // undefined
 * ```
 */
export function parseTimeoutValue(value: string | undefined): number | undefined {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }
  const trimmed = value.trim();
  // Strict digits-only check — reject partially-numeric values like "10s"
  if (!/^\d+$/.test(trimmed)) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}

/**
 * Resolve the effective timeout value in milliseconds from the environment.
 *
 * This function only resolves the **environment-level** precedence:
 *   `EP_REQUEST_TIMEOUT_MS` env var → {@link DEFAULT_REQUEST_TIMEOUT_MS}
 *
 * The full precedence chain (including the `--timeout` CLI argument) is
 * handled by `applyTimeoutArg()` in `src/main.ts`, which sets the env var
 * **before** modules are loaded.
 *
 * Invalid / empty env values are silently ignored (fall through to default).
 *
 * @returns Effective timeout in milliseconds
 */
export function resolveEffectiveTimeout(): number {
  return parseTimeoutValue(process.env['EP_REQUEST_TIMEOUT_MS']) ?? DEFAULT_REQUEST_TIMEOUT_MS;
}
