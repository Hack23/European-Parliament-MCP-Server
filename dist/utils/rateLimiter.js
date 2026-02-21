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
 * Token bucket rate limiter implementation
 */
export class RateLimiter {
    tokens;
    tokensPerInterval;
    intervalMs;
    lastRefill;
    constructor(options) {
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
                const exhaustive = options.interval;
                throw new Error(`Invalid interval: ${String(exhaustive)}`);
        }
    }
    /**
     * Refill tokens based on elapsed time
     */
    refill() {
        const now = Date.now();
        const elapsedMs = now - this.lastRefill;
        const tokensToAdd = (elapsedMs / this.intervalMs) * this.tokensPerInterval;
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.tokensPerInterval, this.tokens + tokensToAdd);
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
    async removeTokens(count) {
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
        throw new Error(`Rate limit exceeded. Available tokens: ${String(this.tokens)}, required: ${String(count)}. ` +
            `Retry after ${String(Math.ceil(waitMs / 1000))} seconds.`);
    }
    /**
     * Try to remove tokens without throwing error
     *
     * @param count - Number of tokens to remove
     * @returns true if tokens were removed, false if not enough tokens
     */
    tryRemoveTokens(count) {
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
    getAvailableTokens() {
        this.refill();
        return this.tokens;
    }
    /**
     * Reset the rate limiter to full capacity
     */
    reset() {
        this.tokens = this.tokensPerInterval;
        this.lastRefill = Date.now();
    }
}
/**
 * Create a rate limiter with standard configuration for EP API
 */
export function createStandardRateLimiter() {
    return new RateLimiter({
        tokensPerInterval: 100,
        interval: 'minute'
    });
}
//# sourceMappingURL=rateLimiter.js.map