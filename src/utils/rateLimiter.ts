/**
 * Rate Limiter utility using token bucket algorithm
 * 
 * ISMS Policy: SC-002 (Secure Coding), AC-003 (Access Control)
 * 
 * Implements token bucket algorithm for rate limiting to prevent abuse
 * and ensure fair resource allocation.
 */

/**
 * Rate limiter configuration options
 * @internal - Used only for RateLimiter initialization
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
   * Remove tokens from the bucket
   * 
   * @param count - Number of tokens to remove
   * @returns Promise that resolves when tokens are available
   * @throws Error if rate limit exceeded
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
   * Try to remove tokens without throwing error
   * 
   * @param count - Number of tokens to remove
   * @returns true if tokens were removed, false if not enough tokens
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
   * Get current available tokens
   */
  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Reset the rate limiter to full capacity
   */
  reset(): void {
    this.tokens = this.tokensPerInterval;
    this.lastRefill = Date.now();
  }
}

/**
 * Create a rate limiter with standard configuration for EP API
 */
export function createStandardRateLimiter(): RateLimiter {
  return new RateLimiter({
    tokensPerInterval: 100,
    interval: 'minute'
  });
}
