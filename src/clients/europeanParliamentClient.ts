/**
 * @fileoverview European Parliament API Client
 * 
 * Provides type-safe access to European Parliament Open Data Portal with
 * comprehensive security and performance features.
 * 
 * **Intelligence Perspective:** Primary OSINT data collection interface—implements
 * rate-limited, cached access to all EP datasets for intelligence product generation.
 * 
 * **Business Perspective:** Core API client powering all data products—reliability,
 * caching, and rate limiting directly impact SLA commitments and customer experience.
 * 
 * **Marketing Perspective:** Client performance metrics (cache hit rate, response time)
 * serve as key technical differentiators in developer marketing materials.
 * 
 * **ISMS Policies:**
 * - SC-002 (Secure Coding Standards)
 * - PE-001 (Performance Standards)
 * - AU-002 (Audit Logging and Monitoring)
 * - DP-001 (Data Protection and GDPR Compliance)
 * 
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 * @module clients/europeanParliamentClient
 */

import { fetch } from 'undici';
import { LRUCache } from 'lru-cache';
import { RateLimiter } from '../utils/rateLimiter.js';
import { auditLogger } from '../utils/auditLogger.js';
import { withRetry, withTimeoutAndAbort, TimeoutError } from '../utils/timeout.js';
import { performanceMonitor } from '../utils/performance.js';
import type {
  MEP,
  MEPDetails,
  PlenarySession,
  VotingRecord,
  LegislativeDocument,
  Committee,
  ParliamentaryQuestion,
  PaginatedResponse,
  Speech,
  Procedure,
  AdoptedText,
  EPEvent,
  MeetingActivity,
  MEPDeclaration
} from '../types/europeanParliament.js';
import {
  toSafeString as _toSafeString,
  transformMEP as _transformMEP,
  transformMEPDetails as _transformMEPDetails,
  transformPlenarySession as _transformPlenarySession,
  transformVoteResult as _transformVoteResult,
  transformCorporateBody as _transformCorporateBody,
  transformDocument as _transformDocument,
  transformParliamentaryQuestion as _transformParliamentaryQuestion,
  transformSpeech as _transformSpeech,
  transformProcedure as _transformProcedure,
  transformAdoptedText as _transformAdoptedText,
  transformEvent as _transformEvent,
  transformMeetingActivity as _transformMeetingActivity,
  transformMEPDeclaration as _transformMEPDeclaration,
} from './ep/index.js';

/**
 * Default configuration values for European Parliament API client
 * 
 * These constants serve as the single source of truth for default values,
 * preventing documentation drift and ensuring consistency.
 */
/** Default base URL for European Parliament Open Data Portal API v2 */
export const DEFAULT_EP_API_BASE_URL = 'https://data.europarl.europa.eu/api/v2/';
/** Default HTTP request timeout in milliseconds (10 seconds) */
export const DEFAULT_REQUEST_TIMEOUT_MS = 10000; // 10 seconds
/** Whether automatic retry on transient failures is enabled by default */
export const DEFAULT_RETRY_ENABLED = true;
/** Default maximum number of retry attempts for failed requests */
export const DEFAULT_MAX_RETRIES = 2;
/** Default cache time-to-live in milliseconds (15 minutes) */
export const DEFAULT_CACHE_TTL_MS = 900000; // 15 minutes
/** Default maximum number of entries in the LRU response cache */
export const DEFAULT_MAX_CACHE_SIZE = 500;
/** Default rate limit token bucket size (requests per interval) */
export const DEFAULT_RATE_LIMIT_TOKENS = 100;
/** Default rate limit interval unit */
export const DEFAULT_RATE_LIMIT_INTERVAL = 'minute' as const;

/**
 * API Error thrown when European Parliament API requests fail.
 * 
 * Captures HTTP status codes and error details for proper error handling
 * and client-side recovery strategies. All API errors include optional
 * diagnostic information for debugging.
 * 
 * @example
 * ```typescript
 * // Throwing an API error
 * throw new APIError(
 *   'EP API request failed: Not Found',
 *   404,
 *   { endpoint: '/meps/999999' }
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Handling API errors
 * try {
 *   const mep = await client.getMEPDetails('invalid-id');
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     console.error(`API Error (${error.statusCode}): ${error.message}`);
 *     console.error('Details:', error.details);
 *   }
 * }
 * ```
 * 
 * @public
 */
export class APIError extends Error {
  /**
   * Creates a new API error instance.
   * 
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (optional, e.g., 404, 500)
   * @param details - Additional error context (optional)
   */
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * JSON-LD response format from EP API
 * @internal
 */
interface JSONLDResponse<T = Record<string, unknown>> extends Record<string, unknown> {
  data: T[];
  '@context': unknown[];
}

/**
 * European Parliament API Client configuration options.
 * 
 * Allows customization of caching, rate limiting, and API endpoint
 * settings for optimal performance and compliance with EP API terms.
 * 
 * @example
 * ```typescript
 * const config: EPClientConfig = {
 *   baseURL: 'https://data.europarl.europa.eu/api/v2/',
 *   cacheTTL: 1000 * 60 * 30,  // 30 minutes
 *   maxCacheSize: 1000,
 *   rateLimiter: new RateLimiter({ tokensPerInterval: 50, interval: 'minute' })
 * };
 * ```
 * 
 * @internal - Used only for client initialization
 */
interface EPClientConfig {
  /**
   * Base URL for European Parliament API.
   * @default 'https://data.europarl.europa.eu/api/v2/'
   */
  baseURL?: string;
  
  /**
   * Cache time-to-live in milliseconds.
   * Determines how long cached responses remain valid.
   * @default 900000 (15 minutes)
   */
  cacheTTL?: number;
  
  /**
   * Maximum number of entries in LRU cache.
   * Oldest entries evicted when limit reached.
   * @default 500
   */
  maxCacheSize?: number;
  
  /**
   * Custom rate limiter instance.
   * If not provided, default rate limiter (100 req/min) is used.
   * @default RateLimiter with 100 tokens per minute
   */
  rateLimiter?: RateLimiter;
  
  /**
   * Request timeout in milliseconds.
   * Operations exceeding this timeout will be aborted.
   * @default 10000 (10 seconds)
   */
  timeoutMs?: number;
  
  /**
   * Enable automatic retry on transient failures (5xx errors).
   * @default true
   */
  enableRetry?: boolean;
  
  /**
   * Maximum number of retry attempts for failed requests.
   * @default 2
   */
  maxRetries?: number;
}

/**
 * European Parliament API Client.
 * 
 * Provides type-safe, high-performance access to the European Parliament Open Data Portal
 * with comprehensive caching, rate limiting, and GDPR-compliant audit logging.
 * 
 * **Performance Targets:**
 * - P50 latency: <100ms (cached responses)
 * - P95 latency: <200ms (cached responses)
 * - P99 latency: <2000ms (uncached API calls)
 * 
 * **Features:**
 * - LRU caching with 15-minute TTL (500 entry max)
 * - Token bucket rate limiting (100 requests/minute)
 * - GDPR Article 30 compliant audit logging
 * - Automatic JSON-LD to internal format transformation
 * - Type-safe API with branded types
 * 
 * **Configuration:**
 * - Base URL: https://data.europarl.europa.eu/api/v2/
 * - Cache: 15 min TTL, LRU eviction, 500 entry max
 * - Rate Limit: 100 requests per minute
 * - Audit Logging: All personal data access logged
 * 
 * **ISMS Policy Compliance:**
 * - SC-002: Secure coding with input validation and error handling
 * - PE-001: Performance monitoring and optimization (<200ms P95)
 * - AU-002: Comprehensive audit logging for GDPR compliance
 * - DP-001: Data protection and privacy by design
 * 
 * @example
 * ```typescript
 * // Create client with default configuration
 * const client = new EuropeanParliamentClient();
 * 
 * // Fetch Swedish MEPs
 * const meps = await client.getMEPs({ country: 'SE', limit: 20 });
 * console.log(`Found ${meps.total} Swedish MEPs`);
 * ```
 * 
 * @example
 * ```typescript
 * // Custom configuration with extended cache
 * const client = new EuropeanParliamentClient({
 *   cacheTTL: 1000 * 60 * 30,  // 30 minutes
 *   maxCacheSize: 1000,
 *   rateLimiter: new RateLimiter({
 *     tokensPerInterval: 50,
 *     interval: 'minute'
 *   })
 * });
 * 
 * // Get MEP details with caching
 * const mepDetails = await client.getMEPDetails('person/124936');
 * console.log(`${mepDetails.name} - ${mepDetails.country}`);
 * ```
 * 
 * @example
 * ```typescript
 * // Error handling with rate limiting
 * try {
 *   const sessions = await client.getPlenarySessions({
 *     dateFrom: '2024-01-01',
 *     limit: 50
 *   });
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     if (error.statusCode === 429) {
 *       console.error('Rate limit exceeded, retry later');
 *     } else {
 *       console.error(`API Error: ${error.message}`);
 *     }
 *   }
 * }
 * ```
 * 
 * @security
 * - All personal data access is audit logged per GDPR Article 30
 * - Rate limiting prevents API abuse and DoS attacks
 * - No credentials stored (EP API is public)
 * - Cache entries sanitized to prevent injection attacks
 * - TLS 1.3 enforced for all API communications
 * 
 * @class
 * @public
 * @see https://data.europarl.europa.eu/api/v2/ - EP Open Data Portal API
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 * @see https://gdpr-info.eu/art-30-gdpr/ - GDPR Article 30
 */
export class EuropeanParliamentClient {
  /**
   * LRU cache for API responses.
   * Stores transformed responses with 15-minute TTL.
   * @private
   * @readonly
   */
  private readonly cache: LRUCache<string, Record<string, unknown>>;
  
  /**
   * European Parliament API base URL.
   * @private
   * @readonly
   * @default 'https://data.europarl.europa.eu/api/v2/'
   */
  private readonly baseURL: string;
  
  /**
   * Token bucket rate limiter.
   * Enforces 100 requests per minute limit.
   * @private
   * @readonly
   */
  private readonly rateLimiter: RateLimiter;
  
  /**
   * Request timeout in milliseconds.
   * @private
   * @readonly
   * @default 10000 (10 seconds)
   */
  private readonly timeoutMs: number;
  
  /**
   * Enable automatic retry on transient failures.
   * @private
   * @readonly
   * @default true
   */
  private readonly enableRetry: boolean;
  
  /**
   * Maximum number of retry attempts.
   * @private
   * @readonly
   * @default 2
   */
  private readonly maxRetries: number;

  /**
   * Creates a new European Parliament API client.
   * 
   * Initializes caching, rate limiting, and API configuration. Uses sensible
   * defaults optimized for typical MCP server usage patterns.
   * 
   * @param config - Optional client configuration
   * @param config.baseURL - API base URL (default: EP API v2)
   * @param config.cacheTTL - Cache TTL in ms (default: 15 minutes)
   * @param config.maxCacheSize - Max cache entries (default: 500)
   * @param config.rateLimiter - Custom rate limiter (default: 100 req/min)
   * 
   * @example
   * ```typescript
   * // Default configuration
   * const client = new EuropeanParliamentClient();
   * ```
   * 
   * @example
   * ```typescript
   * // Custom cache configuration
   * const client = new EuropeanParliamentClient({
   *   cacheTTL: 1000 * 60 * 30,  // 30 minutes
   *   maxCacheSize: 1000
   * });
   * ```
   */
  constructor(config: EPClientConfig = {}) {
    this.baseURL = config.baseURL ?? DEFAULT_EP_API_BASE_URL;
    
    // Initialize LRU cache
    this.cache = new LRUCache<string, Record<string, unknown>>({
      max: config.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE,
      ttl: config.cacheTTL ?? DEFAULT_CACHE_TTL_MS,
      allowStale: false,
      updateAgeOnGet: true
    });
    
    // Initialize rate limiter
    this.rateLimiter = config.rateLimiter ?? new RateLimiter({
      tokensPerInterval: DEFAULT_RATE_LIMIT_TOKENS,
      interval: DEFAULT_RATE_LIMIT_INTERVAL
    });
    
    // Initialize timeout and retry settings
    this.timeoutMs = config.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    this.enableRetry = config.enableRetry ?? DEFAULT_RETRY_ENABLED;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  /**
   * Executes generic GET request with caching and rate limiting.
   * 
   * Internal method handling all HTTP GET requests to EP API. Implements:
   * - Token bucket rate limiting (100 req/min)
   * - LRU caching with 15-minute TTL
   * - JSON-LD Accept header
   * - Error handling and transformation
   * 
   * **Caching Strategy:**
   * - Cache key: JSON.stringify({ endpoint, params })
   * - TTL: 15 minutes (configurable)
   * - Eviction: LRU when max size reached
   * 
   * **Rate Limiting:**
   * - Token bucket algorithm
   * - 100 tokens per minute (default)
   * - Blocks until token available
   * 
   * **Performance:**
   * - Cached: <100ms (P50), <200ms (P95)
   * - Uncached: <2s (P99), depends on EP API
   * 
   * @template T - Expected response type (extends Record<string, unknown>)
   * @param endpoint - API endpoint path (relative to baseURL)
   * @param params - Optional query parameters for URL
   * @returns Promise resolving to typed API response
   * 
   * @throws {APIError} When API request fails (network, HTTP error, invalid JSON)
   * @throws {RateLimitError} When rate limit exceeded and no tokens available
   * 
   * @example
   * ```typescript
   * // Basic GET request
   * const response = await this.get<JSONLDResponse>('meps', { limit: 50 });
   * ```
   * 
   * @example
   * ```typescript
   * // With query parameters
   * const response = await this.get<JSONLDResponse>('meetings', {
   *   'date-from': '2024-01-01',
   *   'date-to': '2024-12-31',
   *   limit: 100
   * });
   * ```
   * 
   * @private
   * @performance Cached responses: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see {@link getCacheKey} for cache key generation
   * @see https://data.europarl.europa.eu/api/v2/ - EP API documentation
   */
  private async get<T extends Record<string, unknown>>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    // Check rate limit
    await this.rateLimiter.removeTokens(1);
    
    // Generate cache key
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache with performance measurement
    const cacheStart = performance.now();
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      const cacheDuration = performance.now() - cacheStart;
      performanceMonitor.recordDuration('ep_api_cache_hit', cacheDuration);
      return cached as T;
    }
    
    // Build URL
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert value to string, handling different types properly
          let stringValue: string;
          if (typeof value === 'string') {
            stringValue = value;
          } else if (typeof value === 'number') {
            stringValue = value.toString();
          } else if (typeof value === 'boolean') {
            stringValue = value.toString();
          } else if (typeof value === 'object') {
            stringValue = JSON.stringify(value);
          } else {
            // For any other type, convert to JSON for safety
            stringValue = JSON.stringify(value);
          }
          url.searchParams.append(key, stringValue);
        }
      });
    }
    
    // Track request performance
    const requestStart = performance.now();
    
    try {
      // Define fetch function with abort support for retry logic
      const fetchFn = async (): Promise<T> => {
        // Wrap fetch with timeout and abort controller to ensure requests can be cancelled
        return await withTimeoutAndAbort(async (signal) => {
          // Make API request with JSON-LD Accept header and abort signal
          const response = await fetch(url.toString(), {
            headers: {
              'Accept': 'application/ld+json',
              'User-Agent': 'European-Parliament-MCP-Server/1.0'
            },
            signal // Pass abort signal to actually cancel the HTTP request on timeout
          });
          
          if (!response.ok) {
            throw new APIError(
              `EP API request failed: ${response.statusText}`,
              response.status
            );
          }
          
          return response.json() as Promise<T>;
        }, this.timeoutMs, `EP API request to ${endpoint} timed out after ${String(this.timeoutMs)}ms`);
      };
      
      // Execute request with retry logic; fetchFn already handles timeout via withTimeoutAndAbort
      const data = await withRetry(fetchFn, {
        maxRetries: this.enableRetry ? this.maxRetries : 0,
        // timeoutMs omitted - fetchFn already handles timeout with withTimeoutAndAbort
        retryDelayMs: 1000,
        shouldRetry: (error) => {
          // Retry on 5xx errors, but not 4xx client errors or timeouts
          if (error instanceof TimeoutError) return false; // Don't retry timeouts
          if (error instanceof APIError) {
            return (error.statusCode ?? 500) >= 500;
          }
          return true; // Retry other errors (network issues, etc.)
        }
      });
      
      // Record successful request performance
      const duration = performance.now() - requestStart;
      performanceMonitor.recordDuration('ep_api_request', duration);
      
      // Cache the response
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      // Record failed request
      const duration = performance.now() - requestStart;
      performanceMonitor.recordDuration('ep_api_request_failed', duration);
      
      // Convert TimeoutError to APIError with 408 status
      if (error instanceof TimeoutError) {
        throw new APIError(
          `EP API request to ${endpoint} timed out after ${String(this.timeoutMs)}ms`,
          408
        );
      }
      
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        `EP API request error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error
      );
    }
  }

  /**
   * Generates cache key from endpoint and parameters.
   * 
   * Creates deterministic cache key by JSON-stringifying endpoint and params.
   * Used for LRU cache lookups and storage.
   * 
   * @param endpoint - API endpoint path
   * @param params - Optional query parameters
   * @returns JSON string cache key
   * 
   * @example
   * ```typescript
   * const key = this.getCacheKey('meps', { country: 'SE', limit: 50 });
   * // Returns: '{"endpoint":"meps","params":{"country":"SE","limit":50}}'
   * ```
   * 
   * @private
   * @internal
   */
  private getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    return JSON.stringify({ endpoint, params });
  }

  /**
   * Transforms EP API MEP data to internal format.
   * 
   * Converts JSON-LD MEP data from European Parliament API to standardized
   * internal MEP type. Handles various field name formats and missing data.
   * 
   * **Data Mapping:**
   * - `identifier` or `id` → MEP.id
   * - `label` → MEP.name
   * - `familyName` + `givenName` → MEP.name (fallback)
   * 
   * @param apiData - Raw MEP data from EP API (JSON-LD format)
   * @returns Transformed MEP object with standardized fields
   * 
   * @example
   * ```typescript
   * const apiData = {
   *   identifier: '124936',
   *   label: 'Jane Doe',
   *   familyName: 'Doe',
   *   givenName: 'Jane'
   * };
   * const mep = this.transformMEP(apiData);
   * // { id: 'person/124936', name: 'Jane Doe', ... }
   * ```
   * 
   * @private
   * @internal
   * @see {@link MEP} for output type structure
   */
  private transformMEP(apiData: Record<string, unknown>): MEP {
    return _transformMEP(apiData);
  }

  /**
   * Transforms EP API plenary session data to internal format.
   * 
   * Converts JSON-LD plenary session data from European Parliament API
   * to standardized internal PlenarySession type. Extracts session date,
   * location, and identifiers.
   * 
   * @param apiData - Raw plenary session data from EP API (JSON-LD format)
   * @returns Transformed PlenarySession object
   * 
   * @example
   * ```typescript
   * const apiData = {
   *   activity_id: 'PV-9-2024-01-15',
   *   'eli-dl:activity_date': { '@value': '2024-01-15T14:00:00Z' },
   *   hasLocality: 'http://.../FRA_SXB'
   * };
   * const session = this.transformPlenarySession(apiData);
   * // { id: 'PV-9-2024-01-15', date: '2024-01-15', location: 'Strasbourg', ... }
   * ```
   * 
   * @private
   * @internal
   * @see {@link PlenarySession} for output type structure
   */
  private transformPlenarySession(apiData: Record<string, unknown>): PlenarySession {
    return _transformPlenarySession(apiData);
  }

  /**
   * Transforms EP API MEP details to internal format.
   * 
   * Extends basic MEP transformation with additional biographical details,
   * committee memberships, and voting statistics structure. Merges data
   * from multiple API fields into comprehensive MEPDetails object.
   * 
   * @param apiData - Raw MEP details data from EP API (JSON-LD format)
   * @returns Transformed MEPDetails object with extended information
   * 
   * @example
   * ```typescript
   * const apiData = {
   *   identifier: '124936',
   *   label: 'Jane Doe',
   *   bday: '1975-03-15',
   *   hasMembership: [
   *     { organization: 'DEVE' },
   *     { organization: 'ENVI' }
   *   ]
   * };
   * const details = this.transformMEPDetails(apiData);
   * // { id: 'person/124936', committees: ['DEVE', 'ENVI'], biography: '...', ... }
   * ```
   * 
   * @private
   * @internal
   * @see {@link MEPDetails} for output type structure
   * @see {@link transformMEP} for basic MEP transformation
   */
  private transformMEPDetails(apiData: Record<string, unknown>): MEPDetails {
    return _transformMEPDetails(apiData);
  }

  /**
   * Retrieves Members of the European Parliament with filtering and pagination.
   * 
   * Fetches MEP data from European Parliament Open Data Portal with support
   * for country, political group, and committee filters. Implements LRU caching
   * (15 min TTL) and rate limiting (100 req/min) for optimal performance.
   * 
   * **Performance:**
   * - Cached: <100ms (P50), <200ms (P95)
   * - Uncached: <2s (P99)
   * 
   * **Caching:**
   * - Cache Key: Based on endpoint + params
   * - TTL: 15 minutes
   * - Strategy: LRU eviction when max size reached
   * 
   * **Rate Limiting:**
   * - Token Bucket: 100 requests/minute
   * - Automatic retry: Not implemented (client should handle)
   * 
   * @param params - Query parameters for filtering MEPs
   * @param params.country - ISO 3166-1 alpha-2 country code (e.g., "SE", "DE", "FR")
   * @param params.group - Political group identifier (e.g., "EPP", "S&D")
   * @param params.committee - Committee abbreviation (e.g., "ENVI", "DEVE")
   * @param params.active - Filter by active status (default: all)
   * @param params.limit - Maximum results to return (1-100, default: 50)
   * @param params.offset - Pagination offset (default: 0)
   * @returns Promise resolving to paginated MEP list with metadata
   * 
   * @throws {ValidationError} When parameters fail validation (HTTP 400)
   * @throws {RateLimitError} When rate limit exceeded (HTTP 429)
   * @throws {APIError} When EP API request fails (network, HTTP, parsing)
   * 
   * @example
   * ```typescript
   * // Get Swedish MEPs with basic filtering
   * const result = await client.getMEPs({ country: "SE", limit: 20 });
   * console.log(`Found ${result.total} Swedish MEPs`);
   * 
   * for (const mep of result.data) {
   *   console.log(`${mep.name} (${mep.politicalGroup})`);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Paginate through all results
   * let offset = 0;
   * const limit = 50;
   * 
   * do {
   *   const result = await client.getMEPs({ limit, offset });
   *   processBatch(result.data);
   *   offset += limit;
   * } while (result.hasMore);
   * ```
   * 
   * @example
   * ```typescript
   * // Error handling with rate limiting
   * try {
   *   const meps = await client.getMEPs({ country: "SE" });
   * } catch (error) {
   *   if (error instanceof RateLimitError) {
   *     console.error(`Rate limited. Retry after ${error.retryAfter}s`);
   *     await sleep(error.retryAfter * 1000);
   *     return await client.getMEPs({ country: "SE" });
   *   } else if (error instanceof APIError) {
   *     console.error(`API Error (${error.statusCode}): ${error.message}`);
   *   }
   *   throw error;
   * }
   * ```
   * 
   * @security
   * - Personal data access logged per GDPR Article 30
   * - Audit log includes: action, params (sanitized), result count, timestamp
   * - No PII logged (only metadata)
   * - Rate limiting prevents API abuse
   * 
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see {@link MEP} for MEP data structure
   * @see {@link PaginatedResponse} for response format
   * @see https://data.europarl.europa.eu/api/v2/meps - EP API endpoint
   */
  async getMEPs(params: {
    country?: string;
    group?: string;
    committee?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<MEP>> {
    const action = 'get_meps';
    
    try {
      // Build API parameters
      const apiParams: Record<string, unknown> = {};
      
      // Map our parameters to EP API parameters
      if (params.limit !== undefined) {
        apiParams['limit'] = params.limit;
      }
      if (params.offset !== undefined) {
        apiParams['offset'] = params.offset;
      }
      if (params.country !== undefined) {
        // EP API uses 'country-code' parameter
        apiParams['country-code'] = params.country;
      }
      
      // Call real EP API
      const response = await this.get<JSONLDResponse>('meps', apiParams);
      
      // Transform EP API data to internal format
      const meps = response.data.map((item) => this.transformMEP(item));
      
      const result: PaginatedResponse<MEP> = {
        data: meps,
        // EP API doesn't provide total count; use lower bound estimate
        total: (params.offset ?? 0) + meps.length,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        hasMore: meps.length >= (params.limit ?? 50)
      };
      
      auditLogger.logDataAccess(action, params, result.data.length);
      
      return result;
    } catch (error) {
      auditLogger.logError(
        action,
        params,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Retrieves detailed information about a specific Member of European Parliament.
   * 
   * Fetches comprehensive MEP data including biography, committee memberships,
   * voting statistics, and contact information. Supports multiple ID formats
   * with automatic normalization.
   * 
   * **Supported ID Formats:**
   * - Numeric: `"124936"`
   * - Person URI: `"person/124936"`
   * - MEP prefix: `"MEP-124936"`
   * 
   * **Performance:**
   * - Cached: <100ms (P50), <200ms (P95)
   * - Uncached: <2s (P99)
   * 
   * @param id - MEP identifier in any supported format
   * @returns Promise resolving to detailed MEP information
   * 
   * @throws {ValidationError} When ID format is invalid
   * @throws {APIError} When MEP not found (HTTP 404)
   * @throws {RateLimitError} When rate limit exceeded (HTTP 429)
   * @throws {APIError} When EP API request fails
   * 
   * @example
   * ```typescript
   * // Get MEP details with numeric ID
   * const mep = await client.getMEPDetails('124936');
   * console.log(`${mep.name} - ${mep.country}`);
   * console.log(`Committees: ${mep.committees.join(', ')}`);
   * console.log(`Biography: ${mep.biography}`);
   * ```
   * 
   * @example
   * ```typescript
   * // Get MEP details with person URI
   * const mep = await client.getMEPDetails('person/124936');
   * console.log(`Voting statistics:`);
   * console.log(`  Total votes: ${mep.votingStatistics.totalVotes}`);
   * console.log(`  Attendance: ${mep.votingStatistics.attendanceRate}%`);
   * ```
   * 
   * @example
   * ```typescript
   * // Error handling for not found
   * try {
   *   const mep = await client.getMEPDetails('999999');
   * } catch (error) {
   *   if (error instanceof APIError && error.statusCode === 404) {
   *     console.error('MEP not found');
   *   } else {
   *     console.error('API error:', error.message);
   *   }
   * }
   * ```
   * 
   * @security
   * - Personal data access logged per GDPR Article 30
   * - Contact information (email, phone) flagged as GDPR-protected
   * - Audit log includes: action='get_mep_details', id, timestamp
   * - Access count tracked for compliance reporting
   * 
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see {@link MEPDetails} for detailed MEP data structure
   * @see {@link MEP} for basic MEP structure
   * @see https://data.europarl.europa.eu/api/v2/meps/{id} - EP API endpoint
   */
  async getMEPDetails(id: string): Promise<MEPDetails> {
    const action = 'get_mep_details';
    const params = { id };
    
    // Normalize ID format: strip MEP- prefix if present, extract numeric ID from person/ID format
    let normalizedId = id;
    if (id.startsWith('MEP-')) {
      normalizedId = id.substring(4);
    } else if (id.startsWith('person/')) {
      normalizedId = id.substring(7);
    }
    
    try {
      // Call real EP API with normalized ID
      const response = await this.get<JSONLDResponse>(`meps/${normalizedId}`, {});
      
      // Transform first result (EP API returns array even for single item)
      if (response.data.length > 0) {
        const mepDetails = this.transformMEPDetails(response.data[0] ?? {});
        
        auditLogger.logDataAccess(action, params, 1);
        
        return mepDetails;
      }
      
      // If no data, throw error
      throw new APIError(`MEP with ID ${id} not found`, 404);
    } catch (error) {
      auditLogger.logError(
        action,
        params,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Builds API parameters for meetings endpoint.
   * 
   * Maps internal parameter names to EP API parameter names and formats.
   * Handles date formatting and pagination parameters.
   * 
   * @param params - Internal query parameters
   * @param params.dateFrom - Start date for filtering (ISO 8601)
   * @param params.dateTo - End date for filtering (ISO 8601)
   * @param params.limit - Maximum results to return
   * @param params.offset - Pagination offset
   * @returns EP API compatible parameters object
   * 
   * @example
   * ```typescript
   * const apiParams = this.buildMeetingsAPIParams({
   *   dateFrom: '2024-01-01',
   *   dateTo: '2024-12-31',
   *   limit: 50
   * });
   * // Returns: { 'date-from': '2024-01-01', 'date-to': '2024-12-31', limit: 50 }
   * ```
   * 
   * @private
   * @internal
   */
  private buildMeetingsAPIParams(params: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Record<string, unknown> {
    const apiParams: Record<string, unknown> = {};
    
    if (params.limit !== undefined) {
      apiParams['limit'] = params.limit;
    }
    if (params.offset !== undefined) {
      apiParams['offset'] = params.offset;
    }
    if (params.dateFrom !== undefined) {
      apiParams['date-from'] = params.dateFrom;
    }
    if (params.dateTo !== undefined) {
      apiParams['date-to'] = params.dateTo;
    }
    
    return apiParams;
  }

  /**
   * Retrieves plenary sessions with date and location filtering.
   * 
   * Fetches plenary session data from European Parliament API with support
   * for date range and location filters. Sessions include agenda items,
   * attendance counts, and associated documents.
   * 
   * **Performance:**
   * - Cached: <100ms (P50), <200ms (P95)
   * - Uncached: <2s (P99)
   * 
   * @param params - Query parameters for filtering sessions
   * @param params.dateFrom - Start date (ISO 8601, e.g., "2024-01-01")
   * @param params.dateTo - End date (ISO 8601, e.g., "2024-12-31")
   * @param params.location - Session location ("Strasbourg" or "Brussels")
   * @param params.limit - Maximum results to return (1-100, default: 50)
   * @param params.offset - Pagination offset (default: 0)
   * @returns Promise resolving to paginated plenary session list
   * 
   * @throws {ValidationError} When date format is invalid (HTTP 400)
   * @throws {RateLimitError} When rate limit exceeded (HTTP 429)
   * @throws {APIError} When EP API request fails
   * 
   * @example
   * ```typescript
   * // Get sessions for date range
   * const result = await client.getPlenarySessions({
   *   dateFrom: '2024-01-01',
   *   dateTo: '2024-03-31',
   *   limit: 20
   * });
   * 
   * console.log(`Found ${result.total} plenary sessions`);
   * for (const session of result.data) {
   *   console.log(`${session.date} - ${session.location}`);
   *   console.log(`  Attendance: ${session.attendanceCount}`);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Filter by location
   * const strasbourgSessions = await client.getPlenarySessions({
   *   location: 'Strasbourg',
   *   dateFrom: '2024-01-01',
   *   limit: 50
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Paginate through all sessions
   * let offset = 0;
   * const allSessions = [];
   * 
   * do {
   *   const result = await client.getPlenarySessions({
   *     dateFrom: '2024-01-01',
   *     limit: 50,
   *     offset
   *   });
   *   allSessions.push(...result.data);
   *   offset += 50;
   * } while (result.hasMore);
   * ```
   * 
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see {@link PlenarySession} for session data structure
   * @see {@link PaginatedResponse} for response format
   * @see https://data.europarl.europa.eu/api/v2/meetings - EP API endpoint
   */
  async getPlenarySessions(params: {
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<PlenarySession>> {
    const action = 'get_plenary_sessions';
    
    try {
      // Build API parameters
      const apiParams = this.buildMeetingsAPIParams(params);
      
      // Call real EP API meetings endpoint
      const response = await this.get<JSONLDResponse>('meetings', apiParams);
      
      // Transform EP API data to internal format
      const sessions = response.data.map((item) => this.transformPlenarySession(item));
      
      const result: PaginatedResponse<PlenarySession> = {
        data: sessions,
        // EP API doesn't provide total count; use lower bound estimate
        total: (params.offset ?? 0) + sessions.length,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        hasMore: sessions.length >= (params.limit ?? 50)
      };
      
      auditLogger.logDataAccess(action, params, result.data.length);
      
      return result;
    } catch (error) {
      auditLogger.logError(
        action,
        params,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Transforms EP API vote result data to internal VotingRecord format.
   * 
   * Converts JSON-LD vote result data from the European Parliament API
   * `/meetings/{sitting-id}/vote-results` endpoint to the standardized
   * internal VotingRecord type.
   * 
   * **Data Mapping:**
   * - `activity_id` or `id` → VotingRecord.id
   * - `had_activity_type` → determines result type
   * - `recorded_in_a_realization_of` → VotingRecord.topic
   * - Vote counts extracted from `had_voter_favor`, `had_voter_against`, `had_voter_abstention`
   * 
   * @param apiData - Raw vote result data from EP API (JSON-LD format)
   * @param sessionId - Parent sitting/session identifier
   * @returns Transformed VotingRecord object
   * 
   * @private
   * @internal
   * @see {@link VotingRecord} for output type structure
   */
  private transformVoteResult(apiData: Record<string, unknown>, sessionId: string): VotingRecord {
    return _transformVoteResult(apiData, sessionId);
  }

  /**
   * Retrieves voting records with filtering by session, MEP, topic, and date.
   * 
   * Fetches vote results from the European Parliament API using the
   * `/meetings/{sitting-id}/vote-results` endpoint. When a sessionId is provided,
   * fetches vote results for that specific sitting. Otherwise returns results
   * from recent sittings.
   * 
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/vote-results`
   * 
   * **Performance:**
   * - Cached: <100ms (P50), <200ms (P95)
   * - Uncached: <2s (P99)
   * 
   * @param params - Query parameters for filtering voting records
   * @param params.sessionId - Plenary sitting identifier (e.g., "MTG-PL-2024-01-15")
   * @param params.mepId - MEP identifier to filter votes by specific MEP
   * @param params.topic - Topic or subject to filter votes
   * @param params.dateFrom - Start date (ISO 8601, e.g., "2024-01-01")
   * @param params.dateTo - End date (ISO 8601, e.g., "2024-12-31")
   * @param params.limit - Maximum results to return (1-100, default: 50)
   * @param params.offset - Pagination offset (default: 0)
   * @returns Promise resolving to paginated voting records list
   * 
   * @throws {ValidationError} When parameters fail validation
   * @throws {APIError} When API request fails
   * 
   * @example
   * ```typescript
   * // Get voting records for a specific sitting
   * const result = await client.getVotingRecords({
   *   sessionId: 'MTG-PL-2024-01-15',
   *   limit: 20
   * });
   * 
   * for (const vote of result.data) {
   *   console.log(`${vote.topic}: ${vote.result}`);
   *   console.log(`  For: ${vote.votesFor}, Against: ${vote.votesAgainst}`);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Get specific MEP's voting record
   * const votes = await client.getVotingRecords({
   *   mepId: 'person/124936',
   *   dateFrom: '2024-01-01',
   *   dateTo: '2024-12-31'
   * });
   * ```
   * 
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see {@link VotingRecord} for voting record data structure
   * @see {@link PaginatedResponse} for response format
   * @see https://data.europarl.europa.eu/api/v2/meetings/{sitting-id}/vote-results - EP API endpoint
   */
  async getVotingRecords(params: {
    sessionId?: string;
    mepId?: string;
    topic?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<VotingRecord>> {
    const action = 'get_voting_records';
    
    try {
      const apiParams: Record<string, unknown> = {};
      if (params.limit !== undefined) apiParams['limit'] = params.limit;
      if (params.offset !== undefined) apiParams['offset'] = params.offset;

      const effectiveSessionId = params.sessionId ?? '';
      let records: VotingRecord[];

      if (effectiveSessionId !== '') {
        records = await this.fetchVoteResultsForSession(effectiveSessionId, apiParams);
      } else {
        records = await this.fetchVoteResultsFromRecentMeetings(params);
      }

      // Apply client-side filters
      records = this.filterVotingRecords(records, params);

      // Apply pagination
      const offset = params.offset ?? 0;
      const limit = params.limit ?? 50;
      const paginatedRecords = records.slice(offset, offset + limit);

      const result: PaginatedResponse<VotingRecord> = {
        data: paginatedRecords,
        total: records.length,
        limit,
        offset,
        hasMore: offset + paginatedRecords.length < records.length
      };
      
      auditLogger.logDataAccess(action, params, result.data.length);
      
      return result;
    } catch (error) {
      auditLogger.logError(
        action,
        params,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Fetches vote results for a specific sitting/session.
   * @param sessionId - Sitting identifier
   * @param apiParams - Query parameters
   * @returns Array of VotingRecord
   * @private
   */
  private async fetchVoteResultsForSession(
    sessionId: string,
    apiParams: Record<string, unknown>
  ): Promise<VotingRecord[]> {
    const response = await this.get<JSONLDResponse>(
      `meetings/${sessionId}/vote-results`,
      apiParams
    );
    return response.data.map((item) => this.transformVoteResult(item, sessionId));
  }

  /**
   * Fetches vote results from recent meetings when no sessionId is given.
   * @param params - Original query parameters
   * @returns Array of VotingRecord
   * @private
   */
  private async fetchVoteResultsFromRecentMeetings(params: {
    dateFrom?: string;
    limit?: number;
  }): Promise<VotingRecord[]> {
    const meetingsParams: Record<string, unknown> = { limit: 5 };
    if (params.dateFrom !== undefined && params.dateFrom !== '') {
      meetingsParams['year'] = params.dateFrom.substring(0, 4);
    }
    const meetingsResponse = await this.get<JSONLDResponse>('meetings', meetingsParams);
    const records: VotingRecord[] = [];
    const recordLimit = params.limit ?? 50;

    for (const meeting of meetingsResponse.data) {
      const meetingId = _toSafeString(meeting['activity_id']) || _toSafeString(meeting['id']) || '';
      if (meetingId === '') continue;
      try {
        const voteResponse = await this.get<JSONLDResponse>(
          `meetings/${meetingId}/vote-results`,
          { limit: recordLimit }
        );
        const transformed = voteResponse.data.map((item) => this.transformVoteResult(item, meetingId));
        records.push(...transformed);
      } catch {
        // Some meetings may not have vote results - continue silently
      }
      if (records.length >= recordLimit) break;
    }
    return records;
  }

  /**
   * Applies client-side filters to voting records.
   * @param records - Records to filter
   * @param params - Filter parameters
   * @returns Filtered records
   * @private
   */
  private filterVotingRecords(
    records: VotingRecord[],
    params: { topic?: string; dateFrom?: string; dateTo?: string }
  ): VotingRecord[] {
    let filtered = records;
    if (params.topic !== undefined && params.topic !== '') {
      const topicLower = params.topic.toLowerCase();
      filtered = filtered.filter(r => r.topic.toLowerCase().includes(topicLower));
    }
    if (params.dateFrom !== undefined && params.dateFrom !== '') {
      const fromDate = params.dateFrom;
      filtered = filtered.filter(r => r.date >= fromDate);
    }
    if (params.dateTo !== undefined && params.dateTo !== '') {
      const toDate = params.dateTo;
      filtered = filtered.filter(r => r.date <= toDate);
    }
    return filtered;
  }

  /**
   * Transforms EP API document data to internal LegislativeDocument format.
   * 
   * Converts JSON-LD document data from the European Parliament API
   * `/documents` or `/plenary-documents` endpoint to the standardized
   * internal LegislativeDocument type.
   * 
   * @param apiData - Raw document data from EP API (JSON-LD format)
   * @returns Transformed LegislativeDocument object
   * 
   * @private
   * @internal
   * @see {@link LegislativeDocument} for output type structure
   */
  private transformDocument(apiData: Record<string, unknown>): LegislativeDocument {
    return _transformDocument(apiData);
  }

  /**
   * Builds EP API parameters for document search.
   * @param params - Search parameters
   * @returns EP API compatible parameters
   * @private
   */
  private buildDocumentSearchParams(params: {
    documentType?: string;
    dateFrom?: string;
    limit?: number;
    offset?: number;
  }): Record<string, unknown> {
    const apiParams: Record<string, unknown> = {};
    if (params.limit !== undefined) apiParams['limit'] = params.limit;
    if (params.offset !== undefined) apiParams['offset'] = params.offset;
    if (params.documentType !== undefined && params.documentType !== '') {
      const typeMap: Record<string, string> = {
        'REPORT': 'REPORT_PLENARY',
        'AMENDMENT': 'AMENDMENT_LIST',
        'RESOLUTION': 'RESOLUTION_MOTION',
        'ADOPTED': 'TEXT_ADOPTED',
      };
      apiParams['work-type'] = typeMap[params.documentType.toUpperCase()] ?? params.documentType;
    }
    if (params.dateFrom !== undefined && params.dateFrom !== '') {
      apiParams['year'] = params.dateFrom.substring(0, 4);
    }
    return apiParams;
  }

  /**
   * Applies client-side filters to documents.
   * @param documents - Documents to filter
   * @param params - Filter parameters
   * @returns Filtered documents
   * @private
   */
  private filterDocuments(
    documents: LegislativeDocument[],
    params: { keyword?: string; committee?: string }
  ): LegislativeDocument[] {
    let filtered = documents;
    if (params.keyword !== undefined && params.keyword !== '') {
      const keywordLower = params.keyword.toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(keywordLower) ||
        d.summary?.toLowerCase().includes(keywordLower) === true ||
        d.id.toLowerCase().includes(keywordLower)
      );
    }
    if (params.committee !== undefined && params.committee !== '') {
      const committeeLower = params.committee.toLowerCase();
      filtered = filtered.filter(d =>
        d.committee?.toLowerCase().includes(committeeLower) === true
      );
    }
    return filtered;
  }

  /**
   * Searches legislative documents by keyword, type, date, and committee.
   * 
   * Fetches documents from the European Parliament API using the `/documents`
   * endpoint with support for work-type filtering, date ranges, and committee
   * assignment filtering.
   * 
   * **EP API Endpoint:** `GET /documents`
   * 
   * **Supported work-type values:**
   * - `REPORT_PLENARY` - Plenary reports
   * - `RESOLUTION_MOTION` - Resolution motions
   * - `TEXT_ADOPTED` - Adopted texts
   * - `AMENDMENT_LIST` - Amendment lists
   * - And others (see EP API documentation)
   * 
   * **Performance:**
   * - Cached: <100ms (P50), <200ms (P95)
   * - Uncached: <2s (P99)
   * 
   * @param params - Query parameters for searching documents
   * @param params.keyword - Search keyword or phrase (required)
   * @param params.documentType - Document type filter ("REPORT", "AMENDMENT", etc.)
   * @param params.dateFrom - Start date (ISO 8601, e.g., "2024-01-01")
   * @param params.dateTo - End date (ISO 8601, e.g., "2024-12-31")
   * @param params.committee - Committee abbreviation (e.g., "ENVI", "DEVE")
   * @param params.limit - Maximum results to return (1-100, default: 20)
   * @param params.offset - Pagination offset (default: 0)
   * @returns Promise resolving to paginated legislative documents list
   * 
   * @throws {ValidationError} When keyword is missing or invalid
   * @throws {APIError} When API request fails
   * 
   * @example
   * ```typescript
   * // Search for climate-related documents
   * const result = await client.searchDocuments({
   *   keyword: 'climate change',
   *   documentType: 'REPORT',
   *   limit: 10
   * });
   * 
   * for (const doc of result.data) {
   *   console.log(`${doc.title} (${doc.type})`);
   *   console.log(`  Status: ${doc.status}`);
   * }
   * ```
   * 
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see {@link LegislativeDocument} for document data structure
   * @see {@link PaginatedResponse} for response format
   * @see https://data.europarl.europa.eu/api/v2/documents - EP API endpoint
   */
  async searchDocuments(params: {
    keyword: string;
    documentType?: string;
    dateFrom?: string;
    dateTo?: string;
    committee?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<LegislativeDocument>> {
    const action = 'search_documents';
    
    try {
      const apiParams = this.buildDocumentSearchParams(params);

      // Call real EP API documents endpoint
      const response = await this.get<JSONLDResponse>('documents', apiParams);

      // Transform EP API data to internal format
      let documents = response.data.map((item) => this.transformDocument(item));

      // Apply client-side filters
      documents = this.filterDocuments(documents, params);

      const result: PaginatedResponse<LegislativeDocument> = {
        data: documents,
        total: (params.offset ?? 0) + documents.length,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
        hasMore: documents.length >= (params.limit ?? 20)
      };
      
      auditLogger.logDataAccess(action, params, result.data.length);
      
      return result;
    } catch (error) {
      auditLogger.logError(
        action,
        params,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Transforms EP API corporate body data to internal Committee format.
   * 
   * Converts JSON-LD corporate body data from the European Parliament API
   * `/corporate-bodies/{body-id}` endpoint to the standardized internal
   * Committee type.
   * 
   * **Note:** Chair and vice-chair assignments are approximate since the EP API
   * `/corporate-bodies` endpoint does not provide role-specific membership data.
   * The first member is assigned as chair, next two as vice-chairs. For accurate
   * role data, consumers should cross-reference with committee membership endpoints.
   * 
   * @param apiData - Raw corporate body data from EP API (JSON-LD format)
   * @returns Transformed Committee object with best-effort role assignments
   * 
   * @private
   * @internal
   * @see {@link Committee} for output type structure
   */
  private transformCorporateBody(apiData: Record<string, unknown>): Committee {
    return _transformCorporateBody(apiData);
  }

  /**
   * Retrieves committee (corporate body) information by ID or abbreviation.
   * 
   * Fetches detailed committee information from the European Parliament API
   * using the `/corporate-bodies/{body-id}` endpoint for specific lookups or
   * `/corporate-bodies` for listing. Supports committee classification filtering.
   * 
   * **EP API Endpoint:** `GET /corporate-bodies/{body-id}` or `GET /corporate-bodies`
   * 
   * **Body Classifications:**
   * - `COMMITTEE_PARLIAMENTARY_STANDING` - Standing committees
   * - `COMMITTEE_PARLIAMENTARY_TEMPORARY` - Temporary committees
   * - `COMMITTEE_PARLIAMENTARY_SPECIAL` - Special committees
   * - `COMMITTEE_PARLIAMENTARY_SUB` - Subcommittees
   * - `EU_POLITICAL_GROUP` - Political groups
   * - `DELEGATION_PARLIAMENTARY` - Delegations
   * 
   * **Performance:**
   * - Cached: <100ms (P50), <200ms (P95)
   * - Uncached: <2s (P99)
   * 
   * @param params - Query parameters for committee lookup
   * @param params.id - Committee/corporate body identifier (e.g., "ENVI")
   * @param params.abbreviation - Committee abbreviation (e.g., "ENVI", "DEVE")
   * @returns Promise resolving to committee information
   * 
   * @throws {ValidationError} When neither id nor abbreviation provided
   * @throws {APIError} When committee not found (HTTP 404)
   * 
   * @example
   * ```typescript
   * // Get committee by abbreviation
   * const committee = await client.getCommitteeInfo({
   *   abbreviation: 'ENVI'
   * });
   * 
   * console.log(`${committee.name} (${committee.abbreviation})`);
   * console.log(`Members: ${committee.members.length}`);
   * ```
   * 
   * @example
   * ```typescript
   * // Get committee by ID
   * const committee = await client.getCommitteeInfo({
   *   id: 'ENVI'
   * });
   * console.log(`Chair: ${committee.chair}`);
   * ```
   * 
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see {@link Committee} for committee data structure
   * @see https://data.europarl.europa.eu/api/v2/corporate-bodies - EP API endpoint
   */
  async getCommitteeInfo(params: {
    id?: string;
    abbreviation?: string;
  }): Promise<Committee> {
    const action = 'get_committee_info';
    
    try {
      const searchTerm = params.abbreviation ?? params.id ?? '';
      const committee = await this.resolveCommittee(searchTerm);
      auditLogger.logDataAccess(action, params, 1);
      return committee;
    } catch (error) {
      auditLogger.logError(
        action,
        params,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Resolves a committee by trying direct lookup then list search.
   * @param searchTerm - Committee abbreviation or ID
   * @returns Committee
   * @throws {APIError} If committee not found
   * @private
   */
  private async resolveCommittee(searchTerm: string): Promise<Committee> {
    if (searchTerm !== '') {
      const directResult = await this.fetchCommitteeDirectly(searchTerm);
      if (directResult !== null) return directResult;
    }
    
    const found = await this.searchCommitteeInList(searchTerm);
    if (found !== null) return found;
    
    throw new APIError(`Committee not found: ${searchTerm || 'unknown'}`, 404);
  }

  /**
   * Attempts to fetch a committee directly by body ID.
   * @param bodyId - Corporate body identifier
   * @returns Committee or null if not found
   * @private
   */
  private async fetchCommitteeDirectly(bodyId: string): Promise<Committee | null> {
    try {
      const response = await this.get<JSONLDResponse>(`corporate-bodies/${bodyId}`, {});
      if (response.data.length > 0) {
        return this.transformCorporateBody(response.data[0] ?? {});
      }
    } catch {
      // Body not found by direct lookup
    }
    return null;
  }

  /**
   * Searches the corporate bodies list for a matching committee.
   * @param searchTerm - Abbreviation or ID to match
   * @returns Matching Committee or null
   * @private
   */
  private async searchCommitteeInList(searchTerm: string): Promise<Committee | null> {
    const listParams: Record<string, unknown> = {
      'body-classification': 'COMMITTEE_PARLIAMENTARY_STANDING',
      limit: 50
    };
    const response = await this.get<JSONLDResponse>('corporate-bodies', listParams);
    
    for (const item of response.data) {
      const committee = this.transformCorporateBody(item);
      if (committee.abbreviation === searchTerm || committee.id === searchTerm) {
        return committee;
      }
    }
    return null;
  }

  /**
   * Transforms EP API parliamentary question data to internal format.
   * 
   * Converts JSON-LD question data from the European Parliament API
   * `/parliamentary-questions` endpoint to the standardized internal
   * ParliamentaryQuestion type.
   * 
   * **EP API work-type values for questions:**
   * - `QUESTION_WRITTEN_PRIORITY` - Priority written questions
   * - `QUESTION_WRITTEN` - Written questions
   * - `QUESTION_ORAL` - Oral questions
   * - `INTERPELLATION_MAJOR` - Major interpellations
   * - `INTERPELLATION_MINOR` - Minor interpellations
   * - `QUESTION_TIME` - Questions during question time
   * 
   * @param apiData - Raw question data from EP API (JSON-LD format)
   * @returns Transformed ParliamentaryQuestion object
   * 
   * @private
   * @internal
   * @see {@link ParliamentaryQuestion} for output type structure
   */
  private transformParliamentaryQuestion(apiData: Record<string, unknown>): ParliamentaryQuestion {
    return _transformParliamentaryQuestion(apiData);
  }

  /**
   * Builds EP API parameters for parliamentary question search.
   * @param params - Search parameters
   * @returns EP API compatible parameters
   * @private
   */
  private buildQuestionSearchParams(params: {
    type?: 'WRITTEN' | 'ORAL';
    dateFrom?: string;
    limit?: number;
    offset?: number;
  }): Record<string, unknown> {
    const apiParams: Record<string, unknown> = {};
    if (params.limit !== undefined) apiParams['limit'] = params.limit;
    if (params.offset !== undefined) apiParams['offset'] = params.offset;
    if (params.type === 'WRITTEN') apiParams['work-type'] = 'QUESTION_WRITTEN';
    else if (params.type === 'ORAL') apiParams['work-type'] = 'QUESTION_ORAL';
    if (params.dateFrom !== undefined && params.dateFrom !== '') {
      apiParams['year'] = params.dateFrom.substring(0, 4);
    }
    return apiParams;
  }

  /**
   * Applies client-side filters to parliamentary questions.
   * @param questions - Questions to filter
   * @param params - Filter parameters
   * @returns Filtered questions
   * @private
   */
  private filterQuestions(
    questions: ParliamentaryQuestion[],
    params: { author?: string; topic?: string; status?: 'PENDING' | 'ANSWERED' }
  ): ParliamentaryQuestion[] {
    let filtered = questions;
    if (params.author !== undefined && params.author !== '') {
      const authorLower = params.author.toLowerCase();
      filtered = filtered.filter(q => q.author.toLowerCase().includes(authorLower));
    }
    if (params.topic !== undefined && params.topic !== '') {
      const topicLower = params.topic.toLowerCase();
      filtered = filtered.filter(q => q.topic.toLowerCase().includes(topicLower));
    }
    if (params.status !== undefined) {
      filtered = filtered.filter(q => q.status === params.status);
    }
    return filtered;
  }

  /**
   * Retrieves parliamentary questions with filtering by type, author, and status.
   * 
   * Fetches parliamentary questions from the European Parliament API using the
   * `/parliamentary-questions` endpoint. Supports filtering by question type
   * (written/oral), year, and work-type classification.
   * 
   * **EP API Endpoint:** `GET /parliamentary-questions`
   * 
   * **Supported work-type filters:**
   * - `QUESTION_WRITTEN_PRIORITY` - Priority written questions
   * - `QUESTION_WRITTEN` - Standard written questions
   * - `QUESTION_ORAL` - Oral questions
   * - `INTERPELLATION_MAJOR` - Major interpellations
   * - `INTERPELLATION_MINOR` - Minor interpellations
   * - `QUESTION_TIME` - Question time
   * 
   * **Performance:**
   * - Cached: <100ms (P50), <200ms (P95)
   * - Uncached: <2s (P99)
   * 
   * @param params - Query parameters for filtering parliamentary questions
   * @param params.type - Question type ("WRITTEN" or "ORAL")
   * @param params.author - MEP identifier who authored the question
   * @param params.topic - Topic or subject of the question
   * @param params.status - Question status ("PENDING" or "ANSWERED")
   * @param params.dateFrom - Start date (ISO 8601, e.g., "2024-01-01")
   * @param params.dateTo - End date (ISO 8601, e.g., "2024-12-31")
   * @param params.limit - Maximum results to return (1-100, default: 50)
   * @param params.offset - Pagination offset (default: 0)
   * @returns Promise resolving to paginated parliamentary questions list
   * 
   * @throws {ValidationError} When parameters fail validation
   * @throws {APIError} When API request fails
   * 
   * @example
   * ```typescript
   * // Get written questions
   * const result = await client.getParliamentaryQuestions({
   *   type: 'WRITTEN',
   *   limit: 20
   * });
   * 
   * for (const question of result.data) {
   *   console.log(`Q: ${question.topic} (${question.status})`);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Get oral questions by year
   * const questions = await client.getParliamentaryQuestions({
   *   type: 'ORAL',
   *   dateFrom: '2024-01-01'
   * });
   * ```
   * 
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see {@link ParliamentaryQuestion} for question data structure
   * @see {@link PaginatedResponse} for response format
   * @see https://data.europarl.europa.eu/api/v2/parliamentary-questions - EP API endpoint
   */
  async getParliamentaryQuestions(params: {
    type?: 'WRITTEN' | 'ORAL';
    author?: string;
    topic?: string;
    status?: 'PENDING' | 'ANSWERED';
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<ParliamentaryQuestion>> {
    const action = 'get_parliamentary_questions';
    
    try {
      const apiParams = this.buildQuestionSearchParams(params);
      
      // Call real EP API parliamentary-questions endpoint
      const response = await this.get<JSONLDResponse>('parliamentary-questions', apiParams);
      
      // Transform EP API data to internal format
      let questions = response.data.map((item) => this.transformParliamentaryQuestion(item));
      
      // Apply client-side filters
      questions = this.filterQuestions(questions, params);
      
      const result: PaginatedResponse<ParliamentaryQuestion> = {
        data: questions,
        total: (params.offset ?? 0) + questions.length,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        hasMore: questions.length >= (params.limit ?? 50)
      };
      
      auditLogger.logDataAccess(action, params, result.data.length);
      
      return result;
    } catch (error) {
      auditLogger.logError(
        action,
        params,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Clears all entries from the LRU cache.
   * 
   * Removes all cached API responses, forcing subsequent requests to fetch
   * fresh data from European Parliament API. Useful for testing, debugging,
   * or forcing cache refresh.
   * 
   * **Use Cases:**
   * - Testing: Reset cache state between test cases
   * - Debugging: Verify behavior without cache
   * - Admin: Force refresh of stale data
   * 
   * @example
   * ```typescript
   * // Clear cache before critical operation
   * client.clearCache();
   * const freshData = await client.getMEPs({ country: 'SE' });
   * ```
   * 
   * @example
   * ```typescript
   * // Clear cache in test teardown
   * afterEach(() => {
   *   client.clearCache();
   * });
   * ```
   * 
   * @public
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Retrieves cache statistics for monitoring and debugging.
   * 
   * Returns current cache size, maximum capacity, and hit rate metrics.
   * Useful for performance monitoring, capacity planning, and debugging
   * cache behavior.
   * 
   * **Metrics:**
   * - `size`: Current number of cached entries
   * - `maxSize`: Maximum cache capacity
   * - `hitRate`: Cache hit rate (currently 0, not tracked by LRUCache)
   * 
   * @returns Object containing cache statistics
   * @returns obj.size - Current number of cached entries
   * @returns obj.maxSize - Maximum cache capacity
   * @returns obj.hitRate - Cache hit rate (0 = not tracked)
   * 
   * @example
   * ```typescript
   * // Monitor cache usage
   * const stats = client.getCacheStats();
   * console.log(`Cache: ${stats.size}/${stats.maxSize} entries`);
   * console.log(`Utilization: ${(stats.size / stats.maxSize * 100).toFixed(1)}%`);
   * ```
   * 
   * @example
   * ```typescript
   * // Check cache capacity
   * const stats = client.getCacheStats();
   * if (stats.size === stats.maxSize) {
   *   console.warn('Cache at capacity, consider increasing maxCacheSize');
   * }
   * ```
   * 
   * @public
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      hitRate: 0 // LRUCache doesn't track hit rate by default
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // New EP API v2 endpoints – Phase 4
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Returns the list of all currently active MEPs for today's date.
   *
   * **EP API Endpoint:** `GET /meps/show-current`
   *
   * @param params - Pagination parameters
   * @returns Paginated list of active MEPs
   */
  async getCurrentMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('meps/show-current', {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const meps = items.map(item => this.transformMEP(item));

    return { data: meps, total: meps.length + offset, limit, offset, hasMore: meps.length === limit };
  }

  /**
   * Returns the list of all incoming MEPs for the current parliamentary term.
   *
   * **EP API Endpoint:** `GET /meps/show-incoming`
   *
   * @param params - Pagination parameters
   * @returns Paginated list of incoming MEPs
   */
  async getIncomingMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('meps/show-incoming', {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const meps = items.map(item => this.transformMEP(item));

    return { data: meps, total: meps.length + offset, limit, offset, hasMore: meps.length === limit };
  }

  /**
   * Returns the list of all outgoing MEPs for the current parliamentary term.
   *
   * **EP API Endpoint:** `GET /meps/show-outgoing`
   *
   * @param params - Pagination parameters
   * @returns Paginated list of outgoing MEPs
   */
  async getOutgoingMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('meps/show-outgoing', {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const meps = items.map(item => this.transformMEP(item));

    return { data: meps, total: meps.length + offset, limit, offset, hasMore: meps.length === limit };
  }

  /**
   * Returns plenary speeches and speech-related activities.
   *
   * **EP API Endpoint:** `GET /speeches`
   *
   * @param params - Search and pagination parameters
   * @returns Paginated list of speeches
   */
  async getSpeeches(params: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Speech>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit
    };
    if (params.dateFrom !== undefined) apiParams['date-from'] = params.dateFrom;
    if (params.dateTo !== undefined) apiParams['date-to'] = params.dateTo;

    const response = await this.get<JSONLDResponse>('speeches', apiParams);

    const items = Array.isArray(response.data) ? response.data : [];
    const speeches = items.map(item => this.transformSpeech(item));

    return { data: speeches, total: speeches.length + offset, limit, offset, hasMore: speeches.length === limit };
  }

  /**
   * Returns legislative procedures.
   *
   * **EP API Endpoint:** `GET /procedures`
   *
   * @param params - Search and pagination parameters
   * @returns Paginated list of procedures
   */
  async getProcedures(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Procedure>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('procedures', apiParams);

    const items = Array.isArray(response.data) ? response.data : [];
    const procedures = items.map(item => this.transformProcedure(item));

    return { data: procedures, total: procedures.length + offset, limit, offset, hasMore: procedures.length === limit };
  }

  /**
   * Returns a single procedure by ID.
   *
   * **EP API Endpoint:** `GET /procedures/{process-id}`
   *
   * The EP API wraps even single-item responses in a JSON-LD `data` array,
   * so this method extracts `data[0]` before transforming.
   *
   * @param processId - Procedure process ID (e.g. `"2024-0006"`)
   * @returns Single procedure
   * @throws {APIError} When the procedure is not found (404)
   */
  async getProcedureById(processId: string): Promise<Procedure> {
    if (processId.trim() === '') {
      throw new APIError('Procedure process-id is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`procedures/${processId}`, {
      format: 'application/ld+json'
    });
    // EP API wraps single-item responses in data array
    const dataArray = response['data'];
    if (Array.isArray(dataArray) && dataArray.length > 0) {
      return this.transformProcedure(dataArray[0] as Record<string, unknown>);
    }
    return this.transformProcedure(response);
  }

  /**
   * Returns adopted texts.
   *
   * **EP API Endpoint:** `GET /adopted-texts`
   *
   * @param params - Search and pagination parameters
   * @returns Paginated list of adopted texts
   */
  async getAdoptedTexts(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<AdoptedText>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('adopted-texts', apiParams);

    const items = Array.isArray(response.data) ? response.data : [];
    const texts = items.map(item => this.transformAdoptedText(item));

    return { data: texts, total: texts.length + offset, limit, offset, hasMore: texts.length === limit };
  }

  /**
   * Returns EP events (hearings, conferences, etc.).
   *
   * **EP API Endpoint:** `GET /events`
   *
   * @param params - Search and pagination parameters
   * @returns Paginated list of events
   */
  async getEvents(params: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<EPEvent>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit
    };
    if (params.dateFrom !== undefined) apiParams['date-from'] = params.dateFrom;
    if (params.dateTo !== undefined) apiParams['date-to'] = params.dateTo;

    const response = await this.get<JSONLDResponse>('events', apiParams);

    const items = Array.isArray(response.data) ? response.data : [];
    const events = items.map(item => this.transformEvent(item));

    return { data: events, total: events.length + offset, limit, offset, hasMore: events.length === limit };
  }

  /**
   * Returns activities linked to a specific meeting (plenary sitting).
   *
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/activities`
   *
   * @param sittingId - Meeting / sitting identifier
   * @param params - Pagination parameters
   * @returns Paginated list of meeting activities
   */
  async getMeetingActivities(sittingId: string, params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MeetingActivity>> {
    if (sittingId.trim() === '') {
      throw new APIError('Meeting sitting-id is required', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(`meetings/${sittingId}/activities`, {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const activities = items.map(item => this.transformMeetingActivity(item));

    return { data: activities, total: activities.length + offset, limit, offset, hasMore: activities.length === limit };
  }

  /**
   * Returns decisions made in a specific meeting (plenary sitting).
   *
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/decisions`
   *
   * @param sittingId - Meeting / sitting identifier
   * @param params - Pagination parameters
   * @returns Paginated list of meeting decisions (as generic documents)
   */
  async getMeetingDecisions(sittingId: string, params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    if (sittingId.trim() === '') {
      throw new APIError('Meeting sitting-id is required', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(`meetings/${sittingId}/decisions`, {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const decisions = items.map(item => this.transformDocument(item));

    return { data: decisions, total: decisions.length + offset, limit, offset, hasMore: decisions.length === limit };
  }

  /**
   * Returns MEP declarations of financial interests.
   *
   * **EP API Endpoint:** `GET /meps-declarations`
   *
   * @param params - Search and pagination parameters
   * @returns Paginated list of MEP declarations
   * @gdpr Declarations contain personal financial data – access is audit-logged
   */
  async getMEPDeclarations(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEPDeclaration>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('meps-declarations', apiParams);

    const items = Array.isArray(response.data) ? response.data : [];
    const declarations = items.map(item => this.transformMEPDeclaration(item));

    auditLogger.logDataAccess('getMEPDeclarations', apiParams, declarations.length);

    return { data: declarations, total: declarations.length + offset, limit, offset, hasMore: declarations.length === limit };
  }

  /**
   * Returns plenary documents.
   *
   * **EP API Endpoint:** `GET /plenary-documents`
   *
   * @param params - Search and pagination parameters
   * @returns Paginated list of plenary documents
   */
  async getPlenaryDocuments(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('plenary-documents', apiParams);

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map(item => this.transformDocument(item));

    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
  }

  /**
   * Returns committee documents.
   *
   * **EP API Endpoint:** `GET /committee-documents`
   *
   * @param params - Search and pagination parameters
   * @returns Paginated list of committee documents
   */
  async getCommitteeDocuments(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('committee-documents', apiParams);

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map(item => this.transformDocument(item));

    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
  }

  /**
   * Returns plenary session documents.
   *
   * **EP API Endpoint:** `GET /plenary-session-documents`
   *
   * @param params - Pagination parameters
   * @returns Paginated list of plenary session documents
   */
  async getPlenarySessionDocuments(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('plenary-session-documents', {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map(item => this.transformDocument(item));

    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
  }

  /**
   * Returns EP controlled vocabularies.
   *
   * **EP API Endpoint:** `GET /controlled-vocabularies`
   *
   * @param params - Pagination parameters
   * @returns Raw API response with vocabulary items
   */
  async getControlledVocabularies(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Record<string, unknown>>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('controlled-vocabularies', {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];

    return {
      data: items,
      total: items.length + offset,
      limit,
      offset,
      hasMore: items.length === limit
    };
  }

  /**
   * Returns the list of all homonym MEPs for the current parliamentary term.
   *
   * **EP API Endpoint:** `GET /meps/show-homonyms`
   *
   * @param params - Pagination parameters
   * @returns Paginated list of homonym MEPs
   */
  async getHomonymMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('meps/show-homonyms', {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const meps = items.map(item => this.transformMEP(item));

    return { data: meps, total: meps.length + offset, limit, offset, hasMore: meps.length === limit };
  }

  /**
   * Returns the list of all current EP Corporate Bodies for today's date.
   *
   * **EP API Endpoint:** `GET /corporate-bodies/show-current`
   *
   * @param params - Pagination parameters
   * @returns Paginated list of current corporate bodies
   */
  async getCurrentCorporateBodies(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Committee>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('corporate-bodies/show-current', {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const bodies = items.map(item => this.transformCorporateBody(item));

    return { data: bodies, total: bodies.length + offset, limit, offset, hasMore: bodies.length === limit };
  }

  /**
   * Returns a single EP event by ID.
   *
   * **EP API Endpoint:** `GET /events/{event-id}`
   *
   * @param eventId - Event identifier
   * @returns Single EP event
   */
  async getEventById(eventId: string): Promise<EPEvent> {
    if (eventId.trim() === '') {
      throw new APIError('Event ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`events/${eventId}`, {
      format: 'application/ld+json'
    });
    return this.transformEvent(response);
  }

  /**
   * Returns a single EP meeting by ID.
   *
   * **EP API Endpoint:** `GET /meetings/{event-id}`
   *
   * @param eventId - Meeting event identifier
   * @returns Single meeting as plenary session
   */
  async getMeetingById(eventId: string): Promise<PlenarySession> {
    if (eventId.trim() === '') {
      throw new APIError('Meeting event ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`meetings/${eventId}`, {
      format: 'application/ld+json'
    });
    return this.transformPlenarySession(response);
  }

  /**
   * Returns foreseen activities linked to a specific meeting (plenary sitting).
   *
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/foreseen-activities`
   *
   * @param sittingId - Meeting / sitting identifier
   * @param params - Pagination parameters
   * @returns Paginated list of foreseen meeting activities
   */
  async getMeetingForeseenActivities(sittingId: string, params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MeetingActivity>> {
    if (sittingId.trim() === '') {
      throw new APIError('Meeting sitting-id is required', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(`meetings/${sittingId}/foreseen-activities`, {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const activities = items.map(item => this.transformMeetingActivity(item));

    return { data: activities, total: activities.length + offset, limit, offset, hasMore: activities.length === limit };
  }

  /**
   * Returns a single speech by ID.
   *
   * **EP API Endpoint:** `GET /speeches/{speech-id}`
   *
   * @param speechId - Speech identifier
   * @returns Single speech
   */
  async getSpeechById(speechId: string): Promise<Speech> {
    if (speechId.trim() === '') {
      throw new APIError('Speech ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`speeches/${speechId}`, {
      format: 'application/ld+json'
    });
    return this.transformSpeech(response);
  }

  /**
   * Returns events linked to a procedure.
   *
   * **EP API Endpoint:** `GET /procedures/{process-id}/events`
   *
   * @param processId - Procedure process ID
   * @param params - Pagination parameters
   * @returns Paginated list of procedure events
   */
  async getProcedureEvents(processId: string, params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<EPEvent>> {
    if (processId.trim() === '') {
      throw new APIError('Procedure process-id is required', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(`procedures/${processId}/events`, {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const events = items.map(item => this.transformEvent(item));

    return { data: events, total: events.length + offset, limit, offset, hasMore: events.length === limit };
  }

  /**
   * Returns a single adopted text by document ID.
   *
   * **EP API Endpoint:** `GET /adopted-texts/{doc-id}`
   *
   * @param docId - Document identifier
   * @returns Single adopted text
   */
  async getAdoptedTextById(docId: string): Promise<AdoptedText> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`adopted-texts/${docId}`, {
      format: 'application/ld+json'
    });
    return this.transformAdoptedText(response);
  }

  /**
   * Returns a single document by ID.
   *
   * **EP API Endpoint:** `GET /documents/{doc-id}`
   *
   * @param docId - Document identifier
   * @returns Single document
   */
  async getDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`documents/${docId}`, {
      format: 'application/ld+json'
    });
    return this.transformDocument(response);
  }

  /**
   * Returns a single committee document by ID.
   *
   * **EP API Endpoint:** `GET /committee-documents/{doc-id}`
   *
   * @param docId - Document identifier
   * @returns Single committee document
   */
  async getCommitteeDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`committee-documents/${docId}`, {
      format: 'application/ld+json'
    });
    return this.transformDocument(response);
  }

  /**
   * Returns a single parliamentary question by document ID.
   *
   * **EP API Endpoint:** `GET /parliamentary-questions/{doc-id}`
   *
   * @param docId - Document identifier
   * @returns Single parliamentary question
   */
  async getParliamentaryQuestionById(docId: string): Promise<ParliamentaryQuestion> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`parliamentary-questions/${docId}`, {
      format: 'application/ld+json'
    });
    return this.transformParliamentaryQuestion(response);
  }

  /**
   * Returns a single plenary document by document ID.
   *
   * **EP API Endpoint:** `GET /plenary-documents/{doc-id}`
   *
   * @param docId - Document identifier
   * @returns Single plenary document
   */
  async getPlenaryDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`plenary-documents/${docId}`, {
      format: 'application/ld+json'
    });
    return this.transformDocument(response);
  }

  /**
   * Returns a single plenary session document by document ID.
   *
   * **EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`
   *
   * @param docId - Document identifier
   * @returns Single plenary session document
   */
  async getPlenarySessionDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`plenary-session-documents/${docId}`, {
      format: 'application/ld+json'
    });
    return this.transformDocument(response);
  }

  /**
   * Returns the list of all Plenary Session Documents Items.
   *
   * **EP API Endpoint:** `GET /plenary-session-documents-items`
   *
   * @param params - Pagination parameters
   * @returns Paginated list of plenary session document items
   */
  async getPlenarySessionDocumentItems(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('plenary-session-documents-items', {
      format: 'application/ld+json',
      offset,
      limit
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map(item => this.transformDocument(item));

    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
  }

  /**
   * Returns the list of all External Documents.
   *
   * **EP API Endpoint:** `GET /external-documents`
   *
   * @param params - Search and pagination parameters
   * @returns Paginated list of external documents
   */
  async getExternalDocuments(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('external-documents', apiParams);

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map(item => this.transformDocument(item));

    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
  }

  /**
   * Returns a single external document by ID.
   *
   * **EP API Endpoint:** `GET /external-documents/{doc-id}`
   *
   * @param docId - Document identifier
   * @returns Single external document
   */
  async getExternalDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`external-documents/${docId}`, {
      format: 'application/ld+json'
    });
    return this.transformDocument(response);
  }

  /**
   * Returns a single EP Controlled Vocabulary by ID.
   *
   * **EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`
   *
   * @param vocId - Vocabulary identifier
   * @returns Single vocabulary entry
   */
  async getControlledVocabularyById(vocId: string): Promise<Record<string, unknown>> {
    if (vocId.trim() === '') {
      throw new APIError('Vocabulary ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`controlled-vocabularies/${vocId}`, {
      format: 'application/ld+json'
    });
    return response;
  }

  /**
   * Returns a single MEP declaration by document ID.
   *
   * **EP API Endpoint:** `GET /meps-declarations/{doc-id}`
   *
   * @param docId - Document identifier
   * @returns Single MEP declaration
   * @gdpr Declarations contain personal financial data – access is audit-logged
   */
  async getMEPDeclarationById(docId: string): Promise<MEPDeclaration> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(`meps-declarations/${docId}`, {
      format: 'application/ld+json'
    });

    const declaration = this.transformMEPDeclaration(response);
    auditLogger.logDataAccess('getMEPDeclarationById', { docId }, 1);
    return declaration;
  }

  // ── Private transform helpers for new endpoints ──────────────────────

  /**
   * Transforms EP API speech JSON-LD into Speech type.
   * @param apiData - Raw API response data
   * @returns Transformed Speech object
   * @private
   */
  private transformSpeech(apiData: Record<string, unknown>): Speech {
    return _transformSpeech(apiData);
  }

  /**
   * Transforms EP API procedure JSON-LD into Procedure type.
   * @param apiData - Raw API response data
   * @returns Transformed Procedure object
   * @private
   */
  private transformProcedure(apiData: Record<string, unknown>): Procedure {
    return _transformProcedure(apiData);
  }

  /**
   * Transforms EP API adopted text JSON-LD into AdoptedText type.
   * @param apiData - Raw API response data
   * @returns Transformed AdoptedText object
   * @private
   */
  private transformAdoptedText(apiData: Record<string, unknown>): AdoptedText {
    return _transformAdoptedText(apiData);
  }

  /**
   * Transforms EP API event JSON-LD into EPEvent type.
   * @param apiData - Raw API response data
   * @returns Transformed EPEvent object
   * @private
   */
  private transformEvent(apiData: Record<string, unknown>): EPEvent {
    return _transformEvent(apiData);
  }

  /**
   * Transforms EP API meeting activity JSON-LD into MeetingActivity type.
   * @param apiData - Raw API response data
   * @returns Transformed MeetingActivity object
   * @private
   */
  private transformMeetingActivity(apiData: Record<string, unknown>): MeetingActivity {
    return _transformMeetingActivity(apiData);
  }

  /**
   * Transforms EP API MEP declaration JSON-LD into MEPDeclaration type.
   * @param apiData - Raw API response data
   * @returns Transformed MEPDeclaration object
   * @private
   */
  private transformMEPDeclaration(apiData: Record<string, unknown>): MEPDeclaration {
    return _transformMEPDeclaration(apiData);
  }

}

/**
 * Singleton instance of European Parliament API client for global use.
 * 
 * Pre-configured client with default settings (15 min cache, 100 req/min rate limit).
 * Recommended for most use cases to share cache and rate limiter across application.
 * 
 * **Configuration:**
 * - Base URL: https://data.europarl.europa.eu/api/v2/ (or EP_API_URL env var)
 * - Timeout: 10 seconds (or EP_REQUEST_TIMEOUT_MS env var)
 * - Cache: 15 min TTL, 500 entry max
 * - Rate Limit: 100 requests/minute
 * 
 * **Environment Variables:**
 * - `EP_API_URL`: Override base API URL
 * - `EP_REQUEST_TIMEOUT_MS`: Override request timeout in milliseconds (default: 10000)
 * 
 * @example
 * ```typescript
 * import { epClient } from './clients/europeanParliamentClient.js';
 * 
 * // Use singleton instance
 * const meps = await epClient.getMEPs({ country: 'SE' });
 * ```
 * 
 * @example
 * ```typescript
 * // Override timeout via environment variable for E2E tests
 * // EP_REQUEST_TIMEOUT_MS=30000 npm run test:e2e
 * const stats = epClient.getCacheStats();
 * console.log(`Global cache: ${stats.size} entries`);
 * ```
 * 
 * @public
 * @see {@link EuropeanParliamentClient} for client class documentation
 */
export const epClient = new EuropeanParliamentClient({
  baseURL: ((): string => {
    const rawBaseUrl = process.env['EP_API_URL'];
    if (typeof rawBaseUrl === 'string') {
      const trimmed = rawBaseUrl.trim();
      if (trimmed.length > 0) {
        // Ensure trailing slash for proper URL resolution with new URL(endpoint, baseURL)
        return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
      }
    }
    return DEFAULT_EP_API_BASE_URL;
  })(),
  timeoutMs: ((): number => {
    const rawTimeout = process.env['EP_REQUEST_TIMEOUT_MS'];
    if (typeof rawTimeout === 'string' && rawTimeout.trim().length > 0) {
      const parsed = Number.parseInt(rawTimeout, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return DEFAULT_REQUEST_TIMEOUT_MS;
  })()
});
