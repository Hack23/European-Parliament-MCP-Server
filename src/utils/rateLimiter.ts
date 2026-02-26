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
 * Rate limiter configuration options
 */
interface RateLimiterOptions {
  /**
   * Maximum number of tokens in the bucket
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
    this.tokensPerInterval = options.tokensPerInterval;
    this.tokens = options.initialTokens ?? options.tokensPerInterval;
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
   * Attempts to consume `count` tokens from the bucket.
   *
   * Refills the bucket based on elapsed time before checking availability.
   * If sufficient tokens are available they are consumed immediately and the
   * returned promise resolves. If not, a {@link Error} is thrown describing
   * how long to wait before retrying.
   *
   * @param count - Number of tokens to consume (must be ≥ 1)
   * @returns Promise that resolves when the tokens have been consumed
   * @throws {Error} If there are not enough tokens in the bucket, with a
   *   message indicating the retry-after duration in seconds
   *
   * @example
   * ```typescript
   * try {
   *   await rateLimiter.removeTokens(1);
   *   const data = await fetchFromEPAPI('/meps');
   * } catch (err) {
   *   if (err instanceof Error) {
   *     console.warn('Rate limited:', err.message);
   *   }
   * }
   * ```
   *
   * @security Prevents abusive high-frequency requests to the EP API.
   *   Per ISMS Policy AC-003, rate limiting is a mandatory access control.
   * @since 0.8.0
   */
  async removeTokens(count: number): Promise<void> {
    this.refill();
    
    if (this.tokens >= count) {
      this.tokens -= count;
      return Promise.resolve();
    }
    
    // Calculate wait time
    const tokensNeeded = count - this.tokens;
    const waitMs = (tokensNeeded / this.tokensPerInterval) * this.intervalMs;
    
    // For now, throw error instead of waiting
    // In production, you might want to implement waiting or backoff
    throw new Error(
      `Rate limit exceeded. Available tokens: ${String(this.tokens)}, required: ${String(count)}. ` +
      `Retry after ${String(Math.ceil(waitMs / 1000))} seconds.`
    );
  }

  /**
   * Attempts to consume `count` tokens without throwing on failure.
   *
   * Non-throwing alternative to {@link removeTokens}. Useful in hot paths
   * where callers want to branch on availability rather than catch errors.
   *
   * @param count - Number of tokens to consume (must be ≥ 1)
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
 * await rateLimiter.removeTokens(1);
 * const data = await fetchFromEPAPI('/meps');
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
