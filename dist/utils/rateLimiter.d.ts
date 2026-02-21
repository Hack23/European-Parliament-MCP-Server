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
export declare class RateLimiter {
    private tokens;
    private readonly tokensPerInterval;
    private readonly intervalMs;
    private lastRefill;
    constructor(options: RateLimiterOptions);
    /**
     * Refill tokens based on elapsed time
     */
    private refill;
    /**
     * Remove tokens from the bucket
     *
     * @param count - Number of tokens to remove
     * @returns Promise that resolves when tokens are available
     * @throws Error if rate limit exceeded
     */
    removeTokens(count: number): Promise<void>;
    /**
     * Try to remove tokens without throwing error
     *
     * @param count - Number of tokens to remove
     * @returns true if tokens were removed, false if not enough tokens
     */
    tryRemoveTokens(count: number): boolean;
    /**
     * Get current available tokens
     */
    getAvailableTokens(): number;
    /**
     * Reset the rate limiter to full capacity
     */
    reset(): void;
}
/**
 * Create a rate limiter with standard configuration for EP API
 */
export declare function createStandardRateLimiter(): RateLimiter;
export {};
//# sourceMappingURL=rateLimiter.d.ts.map