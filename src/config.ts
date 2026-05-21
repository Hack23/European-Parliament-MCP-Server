/**
 * Centralized configuration for the European Parliament MCP Server.
 *
 * All shared configuration constants and defaults are defined here to ensure
 * consistency across `src/index.ts`, `src/server/cli.ts`, and
 * `src/clients/ep/baseClient.ts`.
 *
 * @module config
 */

import { readFileSync, existsSync } from 'fs';

const pkgPath = new URL('../package.json', import.meta.url);
let pkg: { version: string } = { version: 'unknown' };
try {
  if (existsSync(pkgPath)) {
    const parsed: unknown = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      typeof (parsed).version === 'string'
    ) {
      pkg = parsed as { version: string };
    }
  }
} catch {
}

/** Canonical server name used in MCP handshake and CLI output */
export const SERVER_NAME = 'european-parliament-mcp-server';

/** Server version loaded from package.json at startup */
export const SERVER_VERSION: string = pkg.version;

/**
 * HTTP `User-Agent` header value sent with every request to the EP API.
 * Includes the actual package version instead of a hardcoded string.
 */
export const USER_AGENT = `European-Parliament-MCP-Server/${pkg.version}`;

/**
 * Default rate limit applied to EP API requests (requests per minute).
 * Consumed by `baseClient.ts` (`DEFAULT_RATE_LIMIT_TOKENS`) and by the CLI
 * health/help output so that the displayed default always matches the
 * enforced default.
 */
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 100;

/** Default base URL for the European Parliament Open Data Portal API v2 */
export const DEFAULT_API_URL = 'https://data.europarl.europa.eu/api/v2/';

/**
 * Default warmup interval (ms) for the lifecycle-statistics cache. Chosen to
 * be 5 minutes shy of the 30-minute corpus TTL so the cache is refreshed
 * before it expires. Configurable via `EP_LIFECYCLE_WARMUP_INTERVAL_MS`
 * (clamped to [{@link LIFECYCLE_WARMUP_MIN_INTERVAL_MS},
 * {@link LIFECYCLE_WARMUP_MAX_INTERVAL_MS}]).
 */
export const DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS = 25 * 60 * 1000;

/** Minimum permitted warmup interval (1 minute). */
export const LIFECYCLE_WARMUP_MIN_INTERVAL_MS = 60 * 1000;

/** Maximum permitted warmup interval (1 hour). */
export const LIFECYCLE_WARMUP_MAX_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Resolve the lifecycle warmup interval from the environment, falling back
 * to {@link DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS} when the variable is
 * unset, empty, or not a finite positive integer.
 *
 * Successfully parsed values are clamped to
 * `[LIFECYCLE_WARMUP_MIN_INTERVAL_MS, LIFECYCLE_WARMUP_MAX_INTERVAL_MS]`
 * to defend against pathological configuration (e.g. a 1 ms interval that
 * would melt the rate-limit budget).
 *
 * @param env - Environment map (defaults to `process.env`); injected for tests.
 * @returns Effective warmup interval in milliseconds.
 *
 * @security Input validation per ISMS SC-002 — environment values are
 *   parsed and clamped before they influence scheduler behaviour.
 * @since 0.9.0
 */
export function resolveLifecycleWarmupIntervalMs(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = env['EP_LIFECYCLE_WARMUP_INTERVAL_MS'];
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS;
  }
  const floored = Math.floor(parsed);
  if (floored < LIFECYCLE_WARMUP_MIN_INTERVAL_MS) return LIFECYCLE_WARMUP_MIN_INTERVAL_MS;
  if (floored > LIFECYCLE_WARMUP_MAX_INTERVAL_MS) return LIFECYCLE_WARMUP_MAX_INTERVAL_MS;
  return floored;
}
