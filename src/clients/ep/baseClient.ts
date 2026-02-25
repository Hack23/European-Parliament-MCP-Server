/**
 * @fileoverview Base European Parliament API Client
 *
 * Shared HTTP infrastructure for all EP API sub-clients:
 * LRU caching, token-bucket rate limiting, timeout/retry logic,
 * and structured audit/performance instrumentation.
 *
 * **ISMS Policies:**
 * - SC-002 (Secure Coding Standards)
 * - PE-001 (Performance Standards)
 * - AU-002 (Audit Logging and Monitoring)
 * - DP-001 (Data Protection and GDPR Compliance)
 *
 * @module clients/ep/baseClient
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 */

import { fetch } from 'undici';
import { LRUCache } from 'lru-cache';
import { RateLimiter } from '../../utils/rateLimiter.js';
import { withRetry, withTimeoutAndAbort, TimeoutError } from '../../utils/timeout.js';
import { performanceMonitor } from '../../utils/performance.js';

// ─── Default configuration constants ─────────────────────────────────────────

/** Default base URL for European Parliament Open Data Portal API v2 */
export const DEFAULT_EP_API_BASE_URL = 'https://data.europarl.europa.eu/api/v2/';
/** Default HTTP request timeout in milliseconds (10 seconds) */
export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
/** Whether automatic retry on transient failures is enabled by default */
export const DEFAULT_RETRY_ENABLED = true;
/** Default maximum number of retry attempts for failed requests */
export const DEFAULT_MAX_RETRIES = 2;
/** Default cache time-to-live in milliseconds (15 minutes) */
export const DEFAULT_CACHE_TTL_MS = 900_000;
/** Default maximum number of entries in the LRU response cache */
export const DEFAULT_MAX_CACHE_SIZE = 500;
/** Default rate limit token bucket size (requests per interval) */
export const DEFAULT_RATE_LIMIT_TOKENS = 100;
/** Default rate limit interval unit */
export const DEFAULT_RATE_LIMIT_INTERVAL = 'minute' as const;

// ─── Exported error class ─────────────────────────────────────────────────────

/**
 * API Error thrown when European Parliament API requests fail.
 *
 * @example
 * ```typescript
 * throw new APIError('EP API request failed: Not Found', 404, { endpoint: '/meps/999999' });
 * ```
 * @public
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

/**
 * JSON-LD response format from EP API.
 * @internal
 */
export interface JSONLDResponse<T = Record<string, unknown>>
  extends Record<string, unknown> {
  data: T[];
  '@context': unknown[];
}

/**
 * Configuration options for EP API clients.
 * @internal
 */
export interface EPClientConfig {
  /** Base URL for European Parliament API. @default DEFAULT_EP_API_BASE_URL */
  baseURL?: string;
  /** Cache time-to-live in milliseconds. @default 900000 */
  cacheTTL?: number;
  /** Maximum number of entries in LRU cache. @default 500 */
  maxCacheSize?: number;
  /** Custom rate limiter instance. */
  rateLimiter?: RateLimiter;
  /** Request timeout in milliseconds. @default 10000 */
  timeoutMs?: number;
  /** Enable automatic retry on transient failures. @default true */
  enableRetry?: boolean;
  /** Maximum number of retry attempts. @default 2 */
  maxRetries?: number;
}

/**
 * Pre-built shared resources passed from a facade to its sub-clients
 * so they all operate on the same cache and rate-limiter bucket.
 * @internal
 */
export interface EPSharedResources {
  cache: LRUCache<string, Record<string, unknown>>;
  rateLimiter: RateLimiter;
  baseURL: string;
  timeoutMs: number;
  enableRetry: boolean;
  maxRetries: number;
}

// ─── Base client ──────────────────────────────────────────────────────────────

/**
 * Base class for European Parliament API sub-clients.
 *
 * Holds the shared HTTP machinery: LRU cache, token-bucket rate limiter,
 * timeout/abort controller, and retry logic.  Sub-clients extend this class
 * and call the protected `get()` helper for all HTTP requests.
 *
 * @class BaseEPClient
 */
export class BaseEPClient {
  /** LRU cache for API responses. */
  protected readonly cache: LRUCache<string, Record<string, unknown>>;
  /** European Parliament API base URL. */
  protected readonly baseURL: string;
  /** Token bucket rate limiter. */
  protected readonly rateLimiter: RateLimiter;
  /** Request timeout in milliseconds. */
  protected readonly timeoutMs: number;
  /** Enable automatic retry on transient failures. */
  protected readonly enableRetry: boolean;
  /** Maximum number of retry attempts. */
  protected readonly maxRetries: number;

  /**
   * Creates a BaseEPClient.
   *
   * When `shared` is provided the constructor reuses those pre-built resources
   * instead of allocating new ones; this is the mechanism used by the facade to
   * ensure all sub-clients share one cache and one rate-limiter.
   *
   * @param config - Client configuration (used when `shared` is absent)
   * @param shared - Pre-built shared resources (passed by facade to sub-clients)
   */
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    if (shared !== undefined) {
      this.cache = shared.cache;
      this.rateLimiter = shared.rateLimiter;
      this.baseURL = shared.baseURL;
      this.timeoutMs = shared.timeoutMs;
      this.enableRetry = shared.enableRetry;
      this.maxRetries = shared.maxRetries;
    } else {
      this.baseURL = config.baseURL ?? DEFAULT_EP_API_BASE_URL;

      this.cache = new LRUCache<string, Record<string, unknown>>({
        max: config.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE,
        ttl: config.cacheTTL ?? DEFAULT_CACHE_TTL_MS,
        allowStale: false,
        updateAgeOnGet: true,
      });

      this.rateLimiter =
        config.rateLimiter ??
        new RateLimiter({
          tokensPerInterval: DEFAULT_RATE_LIMIT_TOKENS,
          interval: DEFAULT_RATE_LIMIT_INTERVAL,
        });

      this.timeoutMs = config.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
      this.enableRetry = config.enableRetry ?? DEFAULT_RETRY_ENABLED;
      this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    }
  }

  // ─── HTTP infrastructure ────────────────────────────────────────────────────

  /**
   * Builds the full request URL from endpoint + optional params.
   * @private
   */
  private buildRequestUrl(
    endpoint: string,
    params?: Record<string, unknown>
  ): URL {
    const url = new URL(endpoint, this.baseURL);
    if (params === undefined) return url;

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      let str: string;
      if (typeof value === 'string') {
        str = value;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        str = String(value);
      } else {
        str = JSON.stringify(value);
      }
      url.searchParams.append(key, str);
    }

    return url;
  }

  /**
   * Returns true when an error should trigger a retry.
   * @private
   */
  private shouldRetryRequest(error: unknown): boolean {
    if (error instanceof TimeoutError) return false;
    if (error instanceof APIError) return (error.statusCode ?? 500) >= 500;
    return true;
  }

  /**
   * Executes the HTTP fetch with timeout/abort support.
   * @private
   */
  private async fetchWithTimeout<T>(url: URL, endpoint: string): Promise<T> {
    return withTimeoutAndAbort(
      async (signal) => {
        const response = await fetch(url.toString(), {
          headers: {
            Accept: 'application/ld+json',
            'User-Agent': 'European-Parliament-MCP-Server/1.0',
          },
          signal,
        });

        if (!response.ok) {
          throw new APIError(
            `EP API request failed: ${response.statusText}`,
            response.status
          );
        }

        return response.json() as Promise<T>;
      },
      this.timeoutMs,
      `EP API request to ${endpoint} timed out after ${String(this.timeoutMs)}ms`
    );
  }

  /**
   * Wraps a fetch call with the configured retry policy.
   * @private
   */
  private async fetchWithRetry<T>(url: URL, endpoint: string): Promise<T> {
    return withRetry(
      () => this.fetchWithTimeout<T>(url, endpoint),
      {
        maxRetries: this.enableRetry ? this.maxRetries : 0,
        retryDelayMs: 1000,
        shouldRetry: (error) => this.shouldRetryRequest(error),
      }
    );
  }

  /**
   * Converts a caught error to a typed {@link APIError}.
   * @private
   */
  private toAPIError(error: unknown, endpoint: string): APIError {
    if (error instanceof TimeoutError) {
      return new APIError(
        `EP API request to ${endpoint} timed out after ${String(this.timeoutMs)}ms`,
        408
      );
    }
    if (error instanceof APIError) return error;
    return new APIError(
      `EP API request error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }

  /**
   * Executes a cached, rate-limited GET request to the EP API.
   *
   * @template T - Expected response type (extends `Record<string, unknown>`)
   * @param endpoint - API endpoint path (relative to `baseURL`)
   * @param params - Optional query parameters
   * @returns Promise resolving to the typed API response
   * @throws {APIError} On HTTP errors, network failures, or parse failures
   * @protected
   */
  protected async get<T extends Record<string, unknown>>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    // Consume one rate-limit token (blocks until available)
    await this.rateLimiter.removeTokens(1);

    const cacheKey = this.getCacheKey(endpoint, params);

    // Cache hit path
    const cacheStart = performance.now();
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      performanceMonitor.recordDuration('ep_api_cache_hit', performance.now() - cacheStart);
      return cached as T;
    }

    const url = this.buildRequestUrl(endpoint, params);
    const requestStart = performance.now();

    try {
      const data = await this.fetchWithRetry<T>(url, endpoint);
      performanceMonitor.recordDuration('ep_api_request', performance.now() - requestStart);
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      performanceMonitor.recordDuration('ep_api_request_failed', performance.now() - requestStart);
      throw this.toAPIError(error, endpoint);
    }
  }

  /**
   * Generates a deterministic cache key.
   * @param endpoint - API endpoint path
   * @param params - Optional query parameters
   * @returns JSON string used as cache key
   * @private
   */
  private getCacheKey(
    endpoint: string,
    params?: Record<string, unknown>
  ): string {
    return JSON.stringify({ endpoint, params });
  }

  // ─── Public cache helpers ───────────────────────────────────────────────────

  /**
   * Clears all entries from the LRU cache.
   * @public
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Returns cache statistics for monitoring and debugging.
   * @returns `{ size, maxSize, hitRate }`
   * @public
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      hitRate: 0,
    };
  }
}
