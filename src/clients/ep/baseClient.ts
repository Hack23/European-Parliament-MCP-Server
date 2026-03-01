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
import { DEFAULT_RATE_LIMIT_PER_MINUTE, DEFAULT_API_URL, USER_AGENT } from '../../config.js';

// ─── URL Validation (SSRF prevention) ────────────────────────────────────────

/** Exact hostnames that must never be used as API endpoints. */
const BLOCKED_HOSTS_EXACT = new Set(['localhost', '0.0.0.0', '::1']);

/**
 * Patterns matching private / link-local / loopback / IPv6-mapped-IPv4 address
 * prefixes. All patterns are tested against the bracket-stripped hostname.
 *
 * IPv6-mapped IPv4 patterns use the normalised hex form that the WHATWG URL
 * parser emits (e.g. `::ffff:127.0.0.1` → `::ffff:7f00:1`).
 */
const BLOCKED_HOST_PATTERNS = [
  /^fe[89ab][0-9a-f]:/i,         // IPv6 link-local           fe80::/10
  /^f[cd][0-9a-f]{2}:/i,         // IPv6 unique-local         fc00::/7
  /^::ffff:7f/i,                  // IPv6-mapped 127.x.x.x     loopback
  /^::ffff:a[0-9a-f]{2}:/i,       // IPv6-mapped 10.x.x.x      RFC-1918
  /^::ffff:ac1[0-9a-f]:/i,        // IPv6-mapped 172.16-31.x.x RFC-1918
  /^::ffff:c0a8:/i,               // IPv6-mapped 192.168.x.x   RFC-1918
  /^::ffff:a9fe:/i,               // IPv6-mapped 169.254.x.x   link-local
  /^127\./,                       // IPv4 loopback             127.0.0.0/8
  /^169\.254\./,                  // IPv4 link-local           169.254.0.0/16
  /^10\./,                        // RFC-1918                  10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./,  // RFC-1918                  172.16.0.0/12
  /^192\.168\./,                  // RFC-1918                  192.168.0.0/16
];

/**
 * Returns true when `host` is a loopback, link-local, or RFC-1918 address that
 * MUST NOT be used as an API endpoint (SSRF prevention).
 * @private
 */
function isBlockedHost(host: string): boolean {
  return BLOCKED_HOSTS_EXACT.has(host) || BLOCKED_HOST_PATTERNS.some(p => p.test(host));
}

/**
 * Validates an EP API base URL to prevent SSRF via environment variable or
 * constructor argument poisoning.
 *
 * Enforces HTTPS-only and blocks requests to localhost, loopback addresses
 * (127.0.0.0/8), and known internal IP ranges (link-local 169.254.x.x,
 * RFC-1918 10.x.x.x / 172.16-31.x.x / 192.168.x.x, and their IPv6-mapped
 * IPv4 equivalents), as well as IPv6 loopback/link-local/unique-local ranges.
 *
 * @param url   - The URL string to validate
 * @param label - Label used in error messages (defaults to `'EP_API_URL'`)
 * @returns The validated URL string (unchanged)
 * @throws {Error} If the URL uses a non-HTTPS scheme or targets an internal host
 *
 * @security SSRF Prevention – ISMS Policy: SC-002, NE-001
 */
export function validateApiUrl(url: string, label = 'EP_API_URL'): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} is not a valid URL`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`${label} must use HTTPS protocol`);
  }
  // In the Node.js WHATWG URL API, .hostname includes the surrounding brackets
  // for IPv6 addresses (e.g. new URL('https://[::1]/').hostname === '[::1]').
  // Strip them before pattern matching so both IPv4 and IPv6 patterns are
  // applied to the bare address string without brackets.
  // Also strip a single trailing dot so the FQDN form "localhost." is treated
  // identically to "localhost" (both resolve to loopback).
  const rawHost = parsed.hostname.replace(/\.$/, '');
  const host = rawHost.startsWith('[') && rawHost.endsWith(']')
    ? rawHost.slice(1, -1)
    : rawHost;
  if (isBlockedHost(host)) {
    throw new Error(`${label} must not point to internal or loopback addresses`);
  }
  return url;
}

// ─── Default configuration constants ─────────────────────────────────────────

/** Default base URL for European Parliament Open Data Portal API v2 — derived from centralized config */
export const DEFAULT_EP_API_BASE_URL = DEFAULT_API_URL;
/** Default HTTP request timeout in milliseconds (10 seconds) */
export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
/** Whether automatic retry on transient failures is enabled by default */
export const DEFAULT_RETRY_ENABLED = true;
/** Default maximum number of retry attempts for failed requests */
export const DEFAULT_MAX_RETRIES = 2;
/** Default base retry delay in milliseconds (exponential backoff starting point) */
export const DEFAULT_RETRY_BASE_DELAY_MS = 1_000;
/** Default maximum retry delay in milliseconds (caps exponential backoff growth) */
export const DEFAULT_RETRY_MAX_DELAY_MS = 30_000;
/** Default cache time-to-live in milliseconds (15 minutes) */
export const DEFAULT_CACHE_TTL_MS = 900_000;
/** Default maximum number of entries in the LRU response cache */
export const DEFAULT_MAX_CACHE_SIZE = 500;
/** Default rate limit token bucket size (requests per interval) — derived from centralized config */
export const DEFAULT_RATE_LIMIT_TOKENS = DEFAULT_RATE_LIMIT_PER_MINUTE;
/** Default rate limit interval unit */
export const DEFAULT_RATE_LIMIT_INTERVAL = 'minute' as const;
/** Maximum allowed response body size in bytes (10 MiB, 10×1024×1024) to prevent memory exhaustion */
export const DEFAULT_MAX_RESPONSE_BYTES = 10_485_760;

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
  /** Maximum allowed response body size in bytes. @default 10485760 (10 MiB) */
  maxResponseBytes?: number;
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
  maxResponseBytes: number;
  /** Shared cache hit/miss counters so all sub-clients contribute to aggregate stats. */
  cacheCounters: { hits: number; misses: number };
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
  /** Maximum allowed response body size in bytes. */
  protected readonly maxResponseBytes: number;
  /** Shared cache hit/miss counters (shared via EPSharedResources when used as sub-client). */
  private readonly cacheCounters: { hits: number; misses: number };

  /**
   * Resolves all EPClientConfig options to their final values with defaults applied.
   * Extracted to keep constructor complexity within limits.
   * @private
   */
  private static resolveConfig(config: EPClientConfig): {
    baseURL: string;
    cacheTTL: number;
    maxCacheSize: number;
    rateLimiter: RateLimiter;
    timeoutMs: number;
    enableRetry: boolean;
    maxRetries: number;
    maxResponseBytes: number;
  } {
    const rawBaseURL = config.baseURL ?? DEFAULT_EP_API_BASE_URL;
    // Validate baseURL to prevent SSRF when sub-clients are instantiated directly
    validateApiUrl(rawBaseURL, 'config.baseURL');
    // Ensure baseURL always ends with '/' so that relative endpoints resolve correctly
    // e.g. new URL('meps', 'https://host/api/v2') would drop 'v2' without the trailing slash
    const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;
    return {
      baseURL,
      cacheTTL: config.cacheTTL ?? DEFAULT_CACHE_TTL_MS,
      maxCacheSize: config.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE,
      rateLimiter:
        config.rateLimiter ??
        new RateLimiter({
          tokensPerInterval: DEFAULT_RATE_LIMIT_TOKENS,
          interval: DEFAULT_RATE_LIMIT_INTERVAL,
        }),
      timeoutMs: config.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
      enableRetry: config.enableRetry ?? DEFAULT_RETRY_ENABLED,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      maxResponseBytes: config.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES,
    };
  }

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
      this.maxResponseBytes = shared.maxResponseBytes;
      this.cacheCounters = shared.cacheCounters;
    } else {
      const cfg = BaseEPClient.resolveConfig(config);
      this.baseURL = cfg.baseURL;
      this.cache = new LRUCache<string, Record<string, unknown>>({
        max: cfg.maxCacheSize,
        ttl: cfg.cacheTTL,
        allowStale: false,
        updateAgeOnGet: true,
      });
      this.rateLimiter = cfg.rateLimiter;
      this.timeoutMs = cfg.timeoutMs;
      this.enableRetry = cfg.enableRetry;
      this.maxRetries = cfg.maxRetries;
      this.maxResponseBytes = cfg.maxResponseBytes;
      this.cacheCounters = { hits: 0, misses: 0 };
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
   *
   * Retries on:
   * - 429 Too Many Requests (rate-limited by EP API; exponential backoff applied)
   * - 5xx Server Errors (transient server failures)
   * - Network / unknown errors
   *
   * Does NOT retry on 4xx client errors (except 429).
   * @private
   */
  private shouldRetryRequest(error: unknown): boolean {
    if (error instanceof TimeoutError) return false;
    if (error instanceof APIError) {
      const code = error.statusCode ?? 500;
      return code === 429 || code >= 500;
    }
    // JSON parse errors (SyntaxError) indicate an invalid response body;
    // retrying the same request will yield the same unparseable response.
    if (error instanceof SyntaxError) return false;
    return true;
  }

  /**
   * Parses a byte buffer as JSON-LD.  Returns an empty JSON-LD shape for
   * zero-byte bodies (the EP API sends these for out-of-range offsets).
   * Non-empty bodies must contain valid JSON; any `SyntaxError` is allowed
   * to propagate so callers (including single-entity endpoints) fail fast
   * instead of receiving a misleading empty-list shape.
   * @private
   */
  private static parseJsonLdBytes(bytes: Uint8Array): JSONLDResponse {
    if (bytes.byteLength === 0) {
      return { data: [], '@context': [] };
    }
    return JSON.parse(new TextDecoder().decode(bytes)) as JSONLDResponse;
  }

  /**
   * Reads the response body as a stream, enforcing the response size cap.
   * Used as a fallback when the `content-length` header is absent (e.g. chunked
   * transfer encoding). Accumulates all chunks and parses the result as JSON.
   * @private
   */
  private async readStreamedBody<T>(response: Response): Promise<T> {
    const reader = (response.body as ReadableStream<Uint8Array> | null)?.getReader();
    if (!reader) {
      return response.json() as Promise<T>;
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    let readerReleased = false;
    try {
      for (;;) {
        const result = await reader.read();
        if (result.done) break;
        const { value } = result;
        totalBytes += value.byteLength;
        if (totalBytes > this.maxResponseBytes) {
          reader.releaseLock();
          readerReleased = true;
          await (response.body as ReadableStream<Uint8Array> | null)?.cancel();
          throw new APIError(
            `EP API response too large: exceeds limit of ${String(this.maxResponseBytes)} bytes`,
            413
          );
        }
        chunks.push(value);
      }
    } finally {
      if (!readerReleased) {
        reader.releaseLock();
      }
    }

    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return BaseEPClient.parseJsonLdBytes(combined) as T;
  }

  /**
   * Treats a truly empty body as an empty JSON-LD shape; invalid JSON for
   * non-empty bodies is surfaced as an error.
   * @private
   */
  private static async parseResponseJson<T>(response: Response): Promise<T> {
    // Use text + JSON.parse instead of response.json() so we can distinguish
    // between an actually empty body and malformed JSON content.
    const raw = await response.text();

    // Empty or whitespace-only body — mirror the behaviour used for
    // `content-length: 0` responses and return a minimal JSON-LD shape so
    // callers see an empty `data` array instead of a parse error.
    if (raw.trim().length === 0) {
      return { data: [], '@context': [] } as unknown as T;
    }

    // Non-empty body must be valid JSON; let any SyntaxError propagate so
    // callers are aware of malformed API responses.
    return JSON.parse(raw) as T;
  }

  /**
   * Executes the HTTP fetch with timeout/abort support and response size guard.
   * @private
   */
  private async fetchWithTimeout<T>(url: URL, endpoint: string): Promise<T> {
    return withTimeoutAndAbort(
      async (signal) => {
        const response = await fetch(url.toString(), {
          headers: {
            Accept: 'application/ld+json',
            'User-Agent': USER_AGENT,
          },
          signal,
        });

        if (!response.ok) {
          throw new APIError(
            `EP API request failed: ${response.statusText}`,
            response.status
          );
        }

        // Guard against oversized responses to prevent memory exhaustion.
        const contentLength = response.headers.get('content-length');
        if (contentLength !== null) {
          const bytes = Number.parseInt(contentLength, 10);
          // Empty body (content-length: 0) — the EP API returns this for
          // out-of-range offsets or when no data exists.  Return a minimal
          // JSON-LD shape so callers get an empty `data` array instead of a
          // JSON parse error.
          if (Number.isFinite(bytes) && bytes === 0) {
            await response.body?.cancel();
            return { data: [], '@context': [] } as unknown as T;
          }
          if (Number.isFinite(bytes) && bytes > this.maxResponseBytes) {
            // Cancel/drain the body before throwing so the underlying TCP
            // connection can be returned to the pool and reused.
            await response.body?.cancel();
            throw new APIError(
              `EP API response too large: ${String(bytes)} bytes exceeds limit of ${String(this.maxResponseBytes)} bytes`,
              413
            );
          }
          return BaseEPClient.parseResponseJson<T>(response);
        }

        // No content-length header (chunked encoding) — stream the body and
        // enforce the cap incrementally so oversized responses are aborted
        // before they are fully buffered in memory.
        return this.readStreamedBody<T>(response);
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
        retryDelayMs: DEFAULT_RETRY_BASE_DELAY_MS,
        maxDelayMs: DEFAULT_RETRY_MAX_DELAY_MS,
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
    // Consume one rate-limit token; waits asynchronously up to 5 s before giving up
    const rlResult = await this.rateLimiter.removeTokens(1);
    if (!rlResult.allowed) {
      throw new APIError(
        `Rate limit exceeded. Retry after ${String(rlResult.retryAfterMs)}ms`,
        429,
        { retryAfterMs: rlResult.retryAfterMs, remainingTokens: rlResult.remainingTokens }
      );
    }

    const cacheKey = this.getCacheKey(endpoint, params);

    // Cache hit path
    const cacheStart = performance.now();
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      this.cacheCounters.hits++;
      performanceMonitor.recordDuration('ep_api_cache_hit', performance.now() - cacheStart);
      return cached as T;
    }
    this.cacheCounters.misses++;

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
   * @returns `{ size, maxSize, hitRate, hits, misses }`
   * @public
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number; hits: number; misses: number } {
    const { hits, misses } = this.cacheCounters;
    const total = hits + misses;
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      hitRate: total > 0 ? hits / total : 0,
      hits,
      misses,
    };
  }
}
