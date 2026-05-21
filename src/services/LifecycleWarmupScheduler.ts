/**
 * Lifecycle-Statistics Cache Warmup Scheduler.
 *
 * Out-of-band refresh job that keeps the corpus-wide lifecycle-statistics
 * cache populated so {@link import('../tools/monitorLegislativePipeline.js')
 * monitor_legislative_pipeline} — which reads from the cache only on the
 * request path — never has to degrade to `INSUFFICIENT_DATA` forecasts
 * because of a cold cache.
 *
 * **Why a separate scheduler instead of an on-request rebuild?**
 * `monitor_legislative_pipeline` cannot afford to race the corpus rebuild
 * (`/procedures` + up to 500 `/procedures/{id}/events`) against its own
 * rate-limited `/events` fan-out: the token-bucket budget would be exhausted
 * before the tool's own queries land. The scheduler runs the rebuild
 * independently of any request, giving the cache a steady-state warm window.
 *
 * **Concurrency.** The scheduler reuses {@link import('../utils/lifecycleStatistics.js')
 * getLifecycleStatistics}'s in-flight promise mutex, so a request-path caller
 * that arrives in the middle of a warmup share the rebuild rather than
 * triggering a second one.
 *
 * **Test hermeticity.** `start()` accepts a `{ disable: true }` flag so unit
 * tests can opt out of the interval timer entirely. Internally the timer is
 * `unref()`'d so production/CLI process exits are not blocked.
 *
 * ISMS Policy: AU-002 (Audit Logging), AC-003 (Least Privilege),
 *   SC-002 (Input Validation), A.8.16 (Monitoring activities)
 *
 * @module services/LifecycleWarmupScheduler
 */

import {
  getLifecycleStatistics,
  type LifecycleStatisticsModel,
} from '../utils/lifecycleStatistics.js';
import {
  DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS,
  resolveLifecycleWarmupIntervalMs,
} from '../config.js';

/** Options accepted by {@link LifecycleWarmupScheduler.start}. */
export interface LifecycleWarmupSchedulerStartOptions {
  /**
   * Disable the interval timer entirely. Intended for unit tests that need
   * deterministic, hermetic execution without background work. When `true`,
   * `start()` is a no-op and {@link LifecycleWarmupScheduler.getStatus}
   * continues to reflect the existing cache.
   */
  disable?: boolean;
}

/**
 * Outcome of a single warmup attempt. Exposed for tests and for the
 * scheduler's own status reporting.
 */
export type LifecycleWarmupOutcome =
  | { kind: 'success'; corpusSize: number; totalObservations: number; durationMs: number }
  | { kind: 'in-flight' }
  | { kind: 'error'; errorMessage: string; durationMs: number };

/** Observable status of the scheduler. */
export interface LifecycleWarmupSchedulerStatus {
  /** Whether the interval timer is currently scheduling refreshes. */
  running: boolean;
  /** Effective interval (ms) used by the timer; reflects clamped env value. */
  intervalMs: number;
  /** Total number of warmup attempts that have completed since `start()`. */
  totalAttempts: number;
  /** Successful warmups (no error thrown by `getLifecycleStatistics`). */
  successfulAttempts: number;
  /** Warmups that ended in a thrown error. */
  failedAttempts: number;
  /**
   * ISO-8601 timestamp of the most recent successful warmup, or `null` when
   * no warmup has ever succeeded.
   */
  lastSuccessAt: string | null;
  /**
   * ISO-8601 timestamp of the most recent failed warmup, or `null` when no
   * warmup has ever failed.
   */
  lastRefreshErrorAt: string | null;
  /**
   * Sanitised error message from the most recent failure, or `null` when no
   * warmup has failed.
   */
  lastRefreshErrorMessage: string | null;
}

/**
 * Out-of-band warmup scheduler for the lifecycle-statistics cache.
 *
 * Typical lifecycle:
 * ```typescript
 * const scheduler = new LifecycleWarmupScheduler();
 * scheduler.start();                 // production
 * scheduler.start({ disable: true }); // tests
 * await scheduler.refreshNow();       // explicit, returns once the
 *                                     // in-flight rebuild settles
 * scheduler.dispose();                // shutdown
 * ```
 *
 * `refreshNow()` returns a promise that callers can await for explicit
 * priming on startup; failures are logged but never thrown so a transient
 * EP-API outage does not crash the server.
 */
export class LifecycleWarmupScheduler {
  private timer: NodeJS.Timeout | null = null;
  private inFlight: Promise<LifecycleWarmupOutcome> | null = null;
  private readonly intervalMs: number;
  private totalAttempts = 0;
  private successfulAttempts = 0;
  private failedAttempts = 0;
  private lastSuccessAt: string | null = null;
  private lastRefreshErrorAt: string | null = null;
  private lastRefreshErrorMessage: string | null = null;

  /**
   * @param intervalMs - Optional override for the warmup interval. When
   *   omitted, the value is resolved from `EP_LIFECYCLE_WARMUP_INTERVAL_MS`
   *   via {@link resolveLifecycleWarmupIntervalMs} (clamped to
   *   `[60_000, 3_600_000]`). Tests may pass a small value directly.
   */
  constructor(intervalMs?: number) {
    this.intervalMs =
      intervalMs ??
      (process.env['EP_LIFECYCLE_WARMUP_INTERVAL_MS'] !== undefined
        ? resolveLifecycleWarmupIntervalMs()
        : DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS);
  }

  /**
   * Start the periodic refresh. The first refresh runs as soon as the timer
   * fires (callers wanting immediate priming should `await refreshNow()`
   * first). Calling `start()` more than once is a no-op once running.
   *
   * The interval is `unref()`'d so it does not keep the Node.js event loop
   * alive on its own — CLI scripts and tests can still exit cleanly without
   * an explicit `dispose()`.
   */
  start(options: LifecycleWarmupSchedulerStartOptions = {}): void {
    if (options.disable === true) return;
    if (this.timer !== null) return;
    const timer = setInterval(() => {
      // Errors inside refreshNow are already caught; this keeps the timer
      // resilient to unexpected throws.
      void this.refreshNow().catch(() => {
        /* already logged inside refreshNow */
      });
    }, this.intervalMs);
    // `unref` is guarded — some custom timer mocks may not implement it.
    if (typeof timer.unref === 'function') {
      timer.unref();
    }
    this.timer = timer;
  }

  /**
   * Stop the periodic refresh and clear the timer. Any in-flight refresh is
   * left to settle on its own (the underlying `getLifecycleStatistics`
   * promise is not cancellable). Safe to call multiple times.
   */
  dispose(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Run a single warmup attempt immediately.
   *
   * If a warmup is already in-flight the existing promise is returned so
   * concurrent callers share the rebuild (de-duplication mirrors the
   * `getLifecycleStatistics` in-flight mutex). Errors are logged via
   * `console.error` and returned as `{ kind: 'error' }`; they never throw
   * out of this method so the scheduler stays alive across transient
   * EP-API failures.
   *
   * @returns Outcome of the attempt (success counts, in-flight share, or
   *   sanitised error message).
   */
  refreshNow(): Promise<LifecycleWarmupOutcome> {
    if (this.inFlight !== null) {
      return this.inFlight.then(() => ({ kind: 'in-flight' }));
    }
    const start = Date.now();
    const promise = (async (): Promise<LifecycleWarmupOutcome> => {
      try {
        const model: LifecycleStatisticsModel = await getLifecycleStatistics({
          forceRefresh: true,
        });
        const durationMs = Date.now() - start;
        this.totalAttempts++;
        this.successfulAttempts++;
        this.lastSuccessAt = new Date().toISOString();
        console.error(
          `[lifecycle-warmup] success corpusSize=${String(model.corpusSize)}`
            + ` observations=${String(model.totalObservations)} durationMs=${String(durationMs)}`,
        );
        return {
          kind: 'success',
          corpusSize: model.corpusSize,
          totalObservations: model.totalObservations,
          durationMs,
        };
      } catch (error: unknown) {
        const durationMs = Date.now() - start;
        const sanitized = sanitizeErrorMessage(error);
        this.totalAttempts++;
        this.failedAttempts++;
        this.lastRefreshErrorAt = new Date().toISOString();
        this.lastRefreshErrorMessage = sanitized;
        console.error(
          `[lifecycle-warmup] failure durationMs=${String(durationMs)} error=${sanitized}`,
        );
        return { kind: 'error', errorMessage: sanitized, durationMs };
      } finally {
        this.inFlight = null;
      }
    })();
    this.inFlight = promise;
    return promise;
  }

  /** Diagnostic snapshot of the scheduler — consumed by `get_server_health`. */
  getStatus(): LifecycleWarmupSchedulerStatus {
    return {
      running: this.timer !== null,
      intervalMs: this.intervalMs,
      totalAttempts: this.totalAttempts,
      successfulAttempts: this.successfulAttempts,
      failedAttempts: this.failedAttempts,
      lastSuccessAt: this.lastSuccessAt,
      lastRefreshErrorAt: this.lastRefreshErrorAt,
      lastRefreshErrorMessage: this.lastRefreshErrorMessage,
    };
  }
}

/**
 * Sanitise a thrown value into a single-line error message suitable for
 * logs and the health-status payload. Defends against accidental leakage of
 * stack traces or non-string error bodies into observability surfaces.
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.replace(/\s+/g, ' ').slice(0, 200);
  }
  return String(error).replace(/\s+/g, ' ').slice(0, 200);
}

/**
 * Process-wide singleton used by the server bootstrap and the
 * `get_server_health` tool. Tests may construct their own instances.
 */
export const lifecycleWarmupScheduler = new LifecycleWarmupScheduler();
