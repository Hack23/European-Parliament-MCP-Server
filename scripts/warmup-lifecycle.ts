#!/usr/bin/env tsx
/**
 * Lifecycle-statistics cache warmup CLI.
 *
 * Forces a single corpus rebuild via {@link getLifecycleStatistics} and
 * exits `0` on success or `1` on failure. Intended for:
 *  - Containerised deployments that prime the cache before the first
 *    `monitor_legislative_pipeline` request lands.
 *  - The `.github/workflows/lifecycle-warmup.yml` cron (`*/25 * * * *`)
 *    that keeps a long-running server warm.
 *  - Operators who want an ad-hoc rebuild without restarting the server.
 *
 * The script reuses the same singleton EP client used in production so
 * audit logging, rate limiting, and timeout behaviour are identical.
 *
 * **Security & compliance:**
 *  - ISMS AU-002: stdout/stderr capture the corpus size, observation count,
 *    and duration of every attempt for audit trail.
 *  - ISMS SC-002: the warmup interval is configured via
 *    `EP_LIFECYCLE_WARMUP_INTERVAL_MS` (clamped) and never injected here.
 *
 * @see https://github.com/Hack23/European-Parliament-MCP-Server/issues
 */

import { getLifecycleStatistics } from '../src/utils/lifecycleStatistics.js';

async function main(): Promise<void> {
  const start = Date.now();
  // eslint-disable-next-line no-console
  console.log('[warmup-lifecycle] starting forced corpus rebuild');
  try {
    const model = await getLifecycleStatistics({ forceRefresh: true });
    const durationMs = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(
      `[warmup-lifecycle] success corpusSize=${String(model.corpusSize)}`
        + ` observations=${String(model.totalObservations)}`
        + ` durationMs=${String(durationMs)}`,
    );
    process.exit(0);
  } catch (error: unknown) {
    const durationMs = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error(
      `[warmup-lifecycle] failure durationMs=${String(durationMs)} error=${message}`,
    );
    process.exit(1);
  }
}

void main();
