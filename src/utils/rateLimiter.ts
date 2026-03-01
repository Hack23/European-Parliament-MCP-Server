/**
 * Rate Limiter utility using token bucket algorithm
 * 
 * **Intelligence Perspective:** Ensures sustainable OSINT collection rates from EP API,
 * preventing service disruption that would compromise intelligence product reliability.
 * 
 * **Business Perspective:** SLA compliance depends on rate limiting—ensures fair resource
 * allocation across API tiers and prevents abuse from high-volume customers.
 * 
 * **Marketing Perspective:** Responsible API usage demonstrates platform maturity
 * and reliability commitment to potential enterprise customers and partners.
 * 
 * ISMS Policy: SC-002 (Secure Coding), AC-003 (Access Control)
 * 
 * Implements token bucket algorithm for rate limiting to prevent abuse
 * and ensure fair resource allocation.
 */

/**
 * Rate-limiter status snapshot (used by health checks and monitoring).
 */
export interface RateLimiterStatus {
  /** Number of tokens currently available in the bucket */
  availableTokens: number;
  /** Maximum capacity of the token bucket */
  maxTokens: number;
  /** Percentage of the bucket currently consumed (0–100) */
  utilizationPercent: number;
}

/**
 * Result returned by {@link RateLimiter.removeTokens}.
 *
 * Discriminated union: when `allowed` is `true`, tokens were consumed.
 * When `allowed` is `false`, the wait would have exceeded the timeout and
 * `retryAfterMs` is always present with a value ≥ 1 (milliseconds until the
 * bucket is expected to have enough tokens; treat `1` as "retry immediately").
 *
 * **Note:** `remainingTokens` is always a non-negative integer
 * (`Math.floor` of the internal fractional bucket state). This differs from
 * {@link RateLimiter.getAvailableTokens}, which may return a fractional value.
 */
export type RateLimitResult =
  | { allowed: true; remainingTokens: number }
  | { allowed: false; retryAfterMs: number; remainingTokens: number };

/**
 * Rate limiter configuration options
 */
interface RateLimiterOptions {
  /**
   * Maximum number of tokens in the bucket (must be a finite integer >= 1)
   */
  tokensPerInterval: number;
  
  /**
   * Time interval for token refill
   */
  interval: 'second' | 'minute' | 'hour';
  
  /**
   * Initial number of tokens (defaults to tokensPerInterval)
   */
  initialTokens?: number;
}

/**
 * Public typed configuration for {@link RateLimiter}.
 *
 * Type alias of {@link RateLimiterOptions} so consumers can construct
 * or configure a {@link RateLimiter} using {@link RateLimiterConfig}
 * without any casting.
 */
export type RateLimiterConfig = RateLimiterOptions;

/**
 * Token bucket rate limiter implementation
 */
export class RateLimiter {
  private tokens: number;
  private readonly tokensPerInterval: number;
  private readonly intervalMs: number;
  private lastRefill: number;

  constructor(options: RateLimiterOptions) {
    if (!Number.isInteger(options.tokensPerInterval) || options.tokensPerInterval < 1) {
      throw new Error(
        `RateLimiter: tokensPerInterval must be a finite integer >= 1, got ${String(options.tokensPerInterval)}`
      );
    }
    this.tokensPerInterval = options.tokensPerInterval;
    const initialTokens = options.initialTokens ?? options.tokensPerInterval;
    if (!Number.isFinite(initialTokens) || initialTokens < 0) {
      throw new Error(
        `RateLimiter: initialTokens must be a finite non-negative number, got ${String(initialTokens)}`
      );
    }
    if (initialTokens > this.tokensPerInterval) {
      throw new Error(
        `RateLimiter: initialTokens (${String(initialTokens)}) must not exceed tokensPerInterval (${String(this.tokensPerInterval)})`
      );
    }
    this.tokens = initialTokens;
    this.lastRefill = Date.now();
    
    // Convert interval to milliseconds
    switch (options.interval) {
      case 'second':
        this.intervalMs = 1000;
        break;
      case 'minute':
        this.intervalMs = 60 * 1000;
        break;
      case 'hour':
        this.intervalMs = 60 * 60 * 1000;
        break;
      default:
        const exhaustive: never = options.interval;
        throw new Error(`Invalid interval: ${String(exhaustive)}`);
    }
  }

  /** Coerce an optional timeoutMs value to a safe finite number >= 0. */
  private static resolveTimeout(rawTimeoutMs: number | undefined): number {
    if (rawTimeoutMs === undefined) return 5000;
    if (Number.isFinite(rawTimeoutMs) && rawTimeoutMs >= 0) return rawTimeoutMs;
    return 0;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    const tokensToAdd = (elapsedMs / this.intervalMs) * this.tokensPerInterval;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(
        this.tokensPerInterval,
        this.tokens + tokensToAdd
      );
      this.lastRefill = now;
    }
  }

  /**
   * Attempts to consume `count` tokens from the bucket, waiting asynchronously
   * until tokens are available or the timeout expires.
   *
   * Refills the bucket based on elapsed time before each check. If sufficient
   * tokens are available they are consumed immediately. Otherwise the method
   * sleeps until the bucket has enough tokens and retries. If the required wait
   * would exceed `options.timeoutMs` (default **5000 ms**) the call returns
   * immediately with `allowed: false` and a `retryAfterMs` hint. The timeout
   * is enforced as a hard deadline: even if a sleep fires slightly late due to
   * event-loop delay, tokens are never consumed after the deadline has elapsed.
   *
   * @param count - Number of tokens to consume (must be a finite integer ≥ 1 and ≤ `tokensPerInterval`); throws for invalid values
   * @param options.timeoutMs - Maximum time to wait in milliseconds (default 5000); non-finite or negative values are coerced to `0`, meaning the call never blocks and returns `allowed: false` immediately if tokens are unavailable
   * @returns Promise resolving to a {@link RateLimitResult}. `allowed` is `true`
   *   when tokens were consumed, `false` when the timeout was reached.
   *   `remainingTokens` is always a non-negative integer (`Math.floor` of the
   *   internal fractional bucket state); it may differ from
   *   {@link RateLimiter.getAvailableTokens} which returns the raw fractional value.
   *
   * @example
   * ```typescript
   * const result = await rateLimiter.removeTokens(1);
   * if (!result.allowed) {
   *   console.warn(`Rate limited – retry after ${result.retryAfterMs}ms`);
   * } else {
   *   const data = await fetchFromEPAPI('/meps');
   * }
   * ```
   *
   * @security Prevents abusive high-frequency requests to the EP API.
   *   Per ISMS Policy AC-003, rate limiting is a mandatory access control.
   * @since 0.8.0
   */
  async removeTokens(
    count: number,
    options?: { timeoutMs?: number }
  ): Promise<RateLimitResult> {
    // Validate count: must be a finite integer >= 1
    if (!Number.isFinite(count) || count < 1 || !Number.isInteger(count)) {
      throw new Error(`removeTokens: count must be a finite integer >= 1, got ${String(count)}`);
    }
    // A count larger than the bucket capacity can never be satisfied
    if (count > this.tokensPerInterval) {
      throw new Error(
        `removeTokens: count (${String(count)}) exceeds bucket capacity (${String(this.tokensPerInterval)})`
      );
    }

    // Validate timeoutMs: coerce invalid (NaN/Infinity/negative) to 0 so the
    // call never blocks and either succeeds immediately if enough tokens are
    // available or returns allowed:false immediately if not
    const rawTimeoutMs = options?.timeoutMs;
    const timeoutMs = RateLimiter.resolveTimeout(rawTimeoutMs);

    const deadline = Date.now() + timeoutMs;

    for (;;) {
      this.refill();

      if (this.tokens >= count) {
        this.tokens -= count;
        return { allowed: true, remainingTokens: Math.floor(this.tokens) };
      }

      const tokensNeeded = count - this.tokens;
      const waitMs = Math.ceil((tokensNeeded / this.tokensPerInterval) * this.intervalMs);
      const remainingMs = deadline - Date.now();

      if (waitMs > remainingMs) {
        return {
          allowed: false,
          retryAfterMs: waitMs,
          remainingTokens: Math.floor(this.tokens),
        };
      }

      await new Promise<void>(resolve => setTimeout(resolve, waitMs));

      // Hard deadline guard: if the timer fired late (event-loop delay) and the
      // deadline has already elapsed, reject without consuming tokens.
      // retryAfterMs is always >= 1 so callers always receive a positive retry hint.
      if (Date.now() >= deadline) {
        this.refill();
        return {
          allowed: false,
          retryAfterMs: Math.max(1, Math.ceil(((count - this.tokens) / this.tokensPerInterval) * this.intervalMs)),
          remainingTokens: Math.floor(this.tokens),
        };
      }
    }
  }

  /**
   * Attempts to consume `count` tokens without throwing on failure.
   *
   * Synchronous alternative to {@link removeTokens} that returns `false`
   * instead of waiting when the bucket lacks tokens. Useful in hot paths
   * where callers want to branch on availability rather than await a refill.
   *
   * **Note:** This method still throws for invalid `count` arguments (non-integer,
   * `< 1`, or exceeding bucket capacity). It only avoids throwing when there are
   * insufficient tokens in the bucket at the time of the call.
   *
   * @param count - Number of tokens to consume (must be a finite integer ≥ 1 and ≤ `tokensPerInterval`); throws for invalid values
   * @returns `true` if tokens were successfully consumed, `false` if the
   *   bucket did not have enough tokens (bucket is left unchanged)
   *
   * @example
   * ```typescript
   * if (!rateLimiter.tryRemoveTokens(1)) {
   *   return { error: 'Rate limit exceeded. Please try again later.' };
   * }
   * const data = await fetchFromEPAPI('/meps');
   * ```
   *
   * @since 0.8.0
   */
  tryRemoveTokens(count: number): boolean {
    if (!Number.isFinite(count) || count < 1 || !Number.isInteger(count)) {
      throw new Error(`tryRemoveTokens: count must be a finite integer >= 1, got ${String(count)}`);
    }
    if (count > this.tokensPerInterval) {
      throw new Error(
        `tryRemoveTokens: count (${String(count)}) exceeds bucket capacity (${String(this.tokensPerInterval)})`
      );
    }
    this.refill();
    
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    
    return false;
  }

  /**
   * Returns the number of tokens currently available in the bucket.
   *
   * Triggers a refill calculation based on elapsed time before returning
   * the value, so the result reflects the current real-time availability.
   *
   * @returns Current token count (may be fractional; floor before display)
   *
   * @example
   * ```typescript
   * const tokens = rateLimiter.getAvailableTokens();
   * console.log(`${tokens} / ${rateLimiter.getMaxTokens()} tokens available`);
   * ```
   *
   * @since 0.8.0
   */
  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Returns the maximum token capacity of this bucket.
   *
   * Equal to the `tokensPerInterval` value passed at construction time.
   * Does **not** trigger a refill calculation.
   *
   * @returns Maximum number of tokens the bucket can hold
   *
   * @example
   * ```typescript
   * const max = rateLimiter.getMaxTokens(); // e.g. 100
   * ```
   *
   * @since 0.8.0
   */
  getMaxTokens(): number {
    return this.tokensPerInterval;
  }

  /**
   * Returns a typed status snapshot for health checks and monitoring.
   *
   * Triggers a refill calculation so the snapshot reflects real-time bucket
   * state. Useful for `/health` endpoints and Prometheus exporters.
   *
   * @returns Current {@link RateLimiterStatus} snapshot with `availableTokens`,
   *   `maxTokens`, and `utilizationPercent` (0–100)
   *
   * @example
   * ```typescript
   * const status = rateLimiter.getStatus();
   * console.log(`${status.utilizationPercent}% utilized`);
   * // e.g. "45% utilized"
   * ```
   *
   * @since 0.8.0
   */
  getStatus(): RateLimiterStatus {
    this.refill();
    const available = this.tokens;
    const max = this.tokensPerInterval;
    const utilization = max > 0 ? Math.round(((max - available) / max) * 100) : 0;

    return {
      availableTokens: Math.floor(available),
      maxTokens: max,
      utilizationPercent: utilization,
    };
  }

  /**
   * Resets the bucket to full capacity and clears the refill timer.
   *
   * Useful in tests or after a planned maintenance window where queued
   * demand should not be penalised by an already-depleted bucket.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   rateLimiter.reset();
   * });
   * ```
   *
   * @since 0.8.0
   */
  reset(): void {
    this.tokens = this.tokensPerInterval;
    this.lastRefill = Date.now();
  }
}

/**
 * Creates a {@link RateLimiter} pre-configured for EP API usage.
 *
 * Default configuration: **100 tokens per minute** — aligned with the
 * European Parliament Open Data Portal's recommended fair-use policy.
 *
 * @returns A new {@link RateLimiter} instance with standard EP API settings
 *
 * @example
 * ```typescript
 * const rateLimiter = createStandardRateLimiter();
 * const result = await rateLimiter.removeTokens(1);
 * if (result.allowed) {
 *   const data = await fetchFromEPAPI('/meps');
 * }
 * ```
 *
 * @security Ensures sustainable OSINT collection rates from the EP API and
 *   prevents service disruption. Per ISMS Policy AC-003, rate limiting is a
 *   mandatory access control for external API calls.
 * @since 0.8.0
 */
export function createStandardRateLimiter(): RateLimiter {
  return new RateLimiter({
    tokensPerInterval: 100,
    interval: 'minute'
  });
}
