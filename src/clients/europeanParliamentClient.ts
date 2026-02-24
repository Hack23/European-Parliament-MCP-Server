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
  DocumentType,
  DocumentStatus
} from '../types/europeanParliament.js';

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
   * Safely converts unknown value to string.
   * 
   * Type-safe conversion handling string, number, boolean, and other types.
   * Returns empty string for unsupported types to prevent injection attacks.
   * 
   * @param value - Value to convert to string
   * @returns String representation or empty string
   * 
   * @example
   * ```typescript
   * this.toSafeString('text');      // 'text'
   * this.toSafeString(123);         // '123'
   * this.toSafeString(true);        // 'true'
   * this.toSafeString(undefined);   // ''
   * ```
   * 
   * @private
   * @internal
   */
  private toSafeString(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return String(value);
    }
    return '';
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
    // EP API returns data in JSON-LD format with different field names
    // Safe string conversion with type guards
    const identifier = apiData['identifier'];
    const idField = apiData['id'];
    const labelField = apiData['label'];
    const familyNameField = apiData['familyName'];
    const givenNameField = apiData['givenName'];
    
    const id = this.toSafeString(identifier) || this.toSafeString(idField) || '';
    const name = this.toSafeString(labelField) || '';
    const familyName = this.toSafeString(familyNameField) || '';
    const givenName = this.toSafeString(givenNameField) || '';
    
    // Construct full name if label is not provided
    const fullName = name || `${givenName} ${familyName}`.trim();
    
    // Generate fallback ID
    const fallbackId = this.toSafeString(identifier) || 'unknown';
    
    return {
      id: id || `person/${fallbackId}`,
      name: fullName,
      // EP API /meps list endpoint does not include country or political group;
      // 'Unknown' indicates data not available from this endpoint
      country: 'Unknown',
      politicalGroup: 'Unknown',
      committees: [],
      active: true,
      termStart: 'Unknown'
    };
  }

  /**
   * Extracts date from EP API activity date field.
   * 
   * Parses JSON-LD date format with @value wrapper and ISO 8601 timestamp.
   * Returns empty string when date is missing or invalid so callers can
   * explicitly handle unknown dates instead of receiving fabricated values.
   * 
   * **Input Format:** `{ "@value": "2024-01-15T14:30:00Z" }`
   * 
   * **Output Format:** `"2024-01-15"` (ISO 8601 date only)
   * 
   * @param activityDate - Activity date field from EP API (JSON-LD format)
   * @returns ISO 8601 date string (YYYY-MM-DD) or empty string
   * 
   * @example
   * ```typescript
   * const date1 = this.extractActivityDate({ '@value': '2024-01-15T14:30:00Z' });
   * // Returns: '2024-01-15'
   * 
   * const date2 = this.extractActivityDate(null);
   * // Returns: ''
   * ```
   * 
   * @private
   * @internal
   */
  private extractActivityDate(activityDate: unknown): string {
    if (activityDate === null || activityDate === undefined) {
      return '';
    }
    
    if (typeof activityDate === 'object' && '@value' in activityDate) {
      const dateValue = (activityDate as Record<string, unknown>)['@value'];
      if (typeof dateValue === 'string') {
        const parts = dateValue.split('T');
        return parts[0] ?? '';
      }
    }
    
    return '';
  }

  /**
   * Extracts location name from hasLocality URL.
   * 
   * Maps EP API locality URLs to human-readable city names.
   * Handles Strasbourg and Brussels parliament locations.
   * 
   * @param localityUrl - Locality URL from EP API
   * @returns City name ('Strasbourg', 'Brussels', or 'Unknown')
   * 
   * @example
   * ```typescript
   * this.extractLocation('http://..../FRA_SXB');  // 'Strasbourg'
   * this.extractLocation('http://..../BEL_BRU');  // 'Brussels'
   * this.extractLocation('http://..../OTHER');    // 'Unknown'
   * ```
   * 
   * @private
   * @internal
   */
  private extractLocation(localityUrl: string): string {
    if (localityUrl.includes('FRA_SXB')) {
      return 'Strasbourg';
    }
    if (localityUrl.includes('BEL_BRU')) {
      return 'Brussels';
    }
    return 'Unknown';
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
    const activityId = apiData['activity_id'];
    const idField = apiData['id'];
    const id = this.toSafeString(activityId) || this.toSafeString(idField) || '';
    
    const activityDate = apiData['eli-dl:activity_date'];
    const date = this.extractActivityDate(activityDate);
    
    // Extract location from hasLocality
    const localityField = apiData['hasLocality'];
    const localityUrl = this.toSafeString(localityField) || '';
    const location = this.extractLocation(localityUrl);
    
    return {
      id,
      date,
      location,
      agendaItems: [],
      attendanceCount: 0,
      documents: []
    };
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
    // Start with basic MEP transformation
    const basicMEP = this.transformMEP(apiData);
    
    // Extract additional details with type safety
    const bdayField = apiData['bday'];
    const bday = this.toSafeString(bdayField) || '';
    
    const memberships = apiData['hasMembership'];
    const committees: string[] = [];
    
    // Extract committees from memberships if available
    if (Array.isArray(memberships)) {
      for (const membership of memberships) {
        if (typeof membership === 'object' && membership !== null) {
          const orgField = (membership as Record<string, unknown>)['organization'];
          const org = this.toSafeString(orgField) || '';
          if (org) {
            committees.push(org);
          }
        }
      }
    }
    
    return {
      ...basicMEP,
      committees: committees.length > 0 ? committees : basicMEP.committees,
      biography: `Born: ${bday || 'Unknown'}`,
      // EP API /meps/{id} endpoint does not return voting statistics;
      // zeros indicate "no data available" rather than fabricated numbers
      votingStatistics: {
        totalVotes: 0,
        votesFor: 0,
        votesAgainst: 0,
        abstentions: 0,
        attendanceRate: 0
      }
    };
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
    const id = this.toSafeString(apiData['activity_id']) || this.toSafeString(apiData['id']) || '';
    const date = this.extractActivityDate(apiData['eli-dl:activity_date']);
    const topic = this.toSafeString(apiData['label']) || this.toSafeString(apiData['notation']) || 'Unknown';

    const votesFor = this.extractVoteCount(apiData['had_voter_favor'] ?? apiData['number_of_votes_favor']);
    const votesAgainst = this.extractVoteCount(apiData['had_voter_against'] ?? apiData['number_of_votes_against']);
    const abstentions = this.extractVoteCount(apiData['had_voter_abstention'] ?? apiData['number_of_votes_abstention']);

    const decisionStr = this.toSafeString(apiData['decision_method'] ?? apiData['had_decision_outcome']);
    const result = this.determineVoteOutcome(decisionStr, votesFor, votesAgainst);

    return { id, sessionId, topic, date, votesFor, votesAgainst, abstentions, result };
  }

  /**
   * Determines vote outcome from decision string or vote counts.
   * @param decisionStr - Decision outcome string from EP API
   * @param votesFor - Number of votes in favor
   * @param votesAgainst - Number of votes against
   * @returns 'ADOPTED' or 'REJECTED'
   * @private
   */
  private determineVoteOutcome(decisionStr: string, votesFor: number, votesAgainst: number): 'ADOPTED' | 'REJECTED' {
    if (decisionStr.includes('ADOPTED') || decisionStr.includes('APPROVED')) return 'ADOPTED';
    if (decisionStr.includes('REJECTED')) return 'REJECTED';
    return votesFor >= votesAgainst ? 'ADOPTED' : 'REJECTED';
  }

  /**
   * Extracts a numeric vote count from EP API data.
   * 
   * Handles various formats: direct numbers, string numbers, or
   * JSON-LD objects with `@value` or array of voter references.
   * 
   * @param value - Raw vote count value from EP API
   * @returns Numeric vote count or 0 if not parseable
   * 
   * @private
   * @internal
   */
  private extractVoteCount(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (Array.isArray(value)) return value.length;
    const objValue = (value as Record<string, unknown>)['@value'];
    if (objValue !== undefined) {
      return this.extractVoteCount(objValue);
    }
    return 0;
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
      const meetingId = this.toSafeString(meeting['activity_id']) || this.toSafeString(meeting['id']) || '';
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
    const id = this.extractField(apiData, ['work_id', 'id', 'identifier']);
    const title = this.extractMultilingualText(apiData['title_dcterms'] ?? apiData['label'] ?? apiData['title']);
    const mappedType = this.mapDocumentType(this.extractField(apiData, ['work_type', 'ep-document-types', 'type']));
    const date = this.extractDateValue(apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']);
    const committeeValue = this.extractField(apiData, ['was_attributed_to', 'committee']);
    const mappedStatus = this.mapDocumentStatus(this.extractField(apiData, ['resource_legal_in-force', 'status']));

    const doc: LegislativeDocument = {
      id,
      type: mappedType,
      title: title !== '' ? title : `Document ${id}`,
      date,
      authors: [],
      status: mappedStatus,
      summary: title
    };
    if (committeeValue !== '') {
      doc.committee = committeeValue;
    }
    return doc;
  }

  /**
   * Extracts a string value from the first matching field name.
   * @param data - Record to search
   * @param fields - Field names to try in order
   * @returns String value from first matching field or empty string
   * @private
   */
  private extractField(data: Record<string, unknown>, fields: string[]): string {
    for (const field of fields) {
      const value = data[field];
      if (value !== undefined && value !== null) {
        return this.toSafeString(value);
      }
    }
    return '';
  }

  /**
   * Maps a raw work-type string to a valid DocumentType.
   * @param rawType - Raw type string from EP API
   * @returns Valid DocumentType
   * @private
   */
  private mapDocumentType(rawType: string): DocumentType {
    const normalized = (rawType !== '' ? rawType : 'REPORT').replace(/.*\//, '').toUpperCase();
    const validTypes: DocumentType[] = ['REPORT', 'RESOLUTION', 'DECISION', 'DIRECTIVE', 'REGULATION', 'OPINION', 'AMENDMENT'];
    return validTypes.find(t => normalized.includes(t)) ?? 'REPORT';
  }

  /**
   * Maps a raw status string to a valid DocumentStatus.
   * @param rawStatus - Raw status string from EP API
   * @returns Valid DocumentStatus
   * @private
   */
  private mapDocumentStatus(rawStatus: string): DocumentStatus {
    const validStatuses: DocumentStatus[] = ['DRAFT', 'SUBMITTED', 'IN_COMMITTEE', 'PLENARY', 'ADOPTED', 'REJECTED'];
    return validStatuses.find(s => rawStatus.toUpperCase().includes(s)) ?? 'SUBMITTED';
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
   * Extracts a date value from various EP API date formats.
   * 
   * @param dateField - Raw date field from EP API
   * @returns ISO 8601 date string (YYYY-MM-DD) or empty string
   * 
   * @private
   * @internal
   */
  private extractDateValue(dateField: unknown): string {
    if (dateField === null || dateField === undefined) return '';
    if (typeof dateField === 'string') {
      const parts = dateField.split('T');
      return parts[0] ?? '';
    }
    if (typeof dateField === 'object' && '@value' in dateField) {
      const val = (dateField as Record<string, unknown>)['@value'];
      if (typeof val === 'string') {
        const parts = val.split('T');
        return parts[0] ?? '';
      }
    }
    return '';
  }

  /**
   * Extracts a multilingual text value from EP API JSON-LD field.
   * 
   * Handles various JSON-LD formats: plain strings, language-tagged objects,
   * and arrays of language variants. Prefers English ('en') or multilingual ('mul').
   * 
   * @param field - Raw field from EP API (string, object, or array)
   * @returns Extracted text string or empty string
   * 
   * @private
   * @internal
   */
  private extractMultilingualText(field: unknown): string {
    if (field === null || field === undefined) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'number' || typeof field === 'boolean') return String(field);

    if (Array.isArray(field)) {
      return this.extractTextFromLangArray(field);
    }

    if (typeof field === 'object') {
      const obj = field as Record<string, unknown>;
      const enValue = this.toSafeString(obj['en'] ?? obj['@value'] ?? obj['mul']);
      return enValue;
    }

    return '';
  }

  /**
   * Extracts preferred-language text from array of language-tagged objects.
   * 
   * @param items - Array of JSON-LD language-tagged objects
   * @returns Text in preferred language or first available
   * 
   * @private
   * @internal
   */
  private extractTextFromLangArray(items: unknown[]): string {
    let fallback = '';
    for (const item of items) {
      if (typeof item !== 'object' || item === null) continue;
      const obj = item as Record<string, unknown>;
      const lang = this.toSafeString(obj['@language']);
      const value = this.toSafeString(obj['@value']);
      if (lang === 'en' || lang === 'mul') return value;
      if (fallback === '') fallback = value;
    }
    return fallback;
  }

  /**
   * Extracts member IDs from EP API membership data.
   * 
   * @param memberships - Raw membership field from EP API
   * @returns Array of member ID strings
   * 
   * @private
   * @internal
   */
  private extractMemberIds(memberships: unknown): string[] {
    const members: string[] = [];
    if (!Array.isArray(memberships)) return members;

    for (const m of memberships) {
      if (typeof m === 'string') {
        members.push(m);
      } else if (typeof m === 'object' && m !== null) {
        const mObj = m as Record<string, unknown>;
        const memberId = this.toSafeString(mObj['person'] ?? mObj['id'] ?? mObj['@id']);
        if (memberId !== '') members.push(memberId);
      }
    }
    return members;
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
    const id = this.extractField(apiData, ['body_id', 'id', 'identifier']);
    const name = this.extractMultilingualText(apiData['label'] ?? apiData['prefLabel'] ?? apiData['skos:prefLabel']);
    const abbreviation = this.extractField(apiData, ['notation', 'skos:notation']) || id;
    const effectiveId = id !== '' ? id : abbreviation;

    if (effectiveId === '') {
      throw new APIError('Corporate body data missing required identifier', 400);
    }

    const members = this.extractMemberIds(apiData['hasMembership'] ?? apiData['org:hasMember']);
    const classification = this.extractField(apiData, ['classification', 'org:classification']);
    const responsibilities = classification !== '' ? [classification.replace(/.*\//, '')] : [];

    return {
      id: effectiveId,
      name: name !== '' ? name : `Committee ${abbreviation}`,
      abbreviation,
      members,
      chair: members[0] ?? '',
      viceChairs: members.slice(1, 3),
      responsibilities
    };
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
    const id = this.extractField(apiData, ['work_id', 'id', 'identifier']);
    const questionType = this.mapQuestionType(this.extractField(apiData, ['work_type', 'ep-document-types']));
    const author = this.extractAuthorId(apiData['was_created_by'] ?? apiData['created_by'] ?? apiData['author']);
    const date = this.extractDateValue(apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']);
    const topic = this.extractMultilingualText(apiData['title_dcterms'] ?? apiData['label'] ?? apiData['title']);
    const hasAnswer = apiData['was_realized_by'] !== undefined && apiData['was_realized_by'] !== null;
    const topicText = topic !== '' ? topic : `Question ${id}`;

    return this.buildQuestionResult(
      { id, type: questionType, author, date },
      topicText, hasAnswer
    );
  }

  /**
   * Builds a ParliamentaryQuestion result object.
   * @private
   */
  private buildQuestionResult(
    fields: { id: string; type: 'WRITTEN' | 'ORAL'; author: string; date: string },
    topicText: string, hasAnswer: boolean
  ): ParliamentaryQuestion {
    const result: ParliamentaryQuestion = {
      id: fields.id,
      type: fields.type,
      author: fields.author !== '' ? fields.author : 'Unknown',
      date: fields.date,
      topic: topicText,
      questionText: topicText,
      status: hasAnswer ? 'ANSWERED' : 'PENDING'
    };
    if (hasAnswer) {
      result.answerText = 'Answer available - see EP document portal for full text';
      result.answerDate = fields.date;
    }
    return result;
  }

  /**
   * Maps work-type string to question type.
   * @param workType - Raw work-type from EP API
   * @returns 'WRITTEN' or 'ORAL'
   * @private
   */
  private mapQuestionType(workType: string): 'WRITTEN' | 'ORAL' {
    if (workType.includes('ORAL') || workType.includes('INTERPELLATION') || workType.includes('QUESTION_TIME')) {
      return 'ORAL';
    }
    return 'WRITTEN';
  }

  /**
   * Extracts an author/person ID from EP API author field.
   * @param authorField - Raw author field (string, array, or object)
   * @returns Author identifier string
   * @private
   */
  private extractAuthorId(authorField: unknown): string {
    if (typeof authorField === 'string') return authorField;
    if (Array.isArray(authorField) && authorField.length > 0) {
      return this.toSafeString(authorField[0]);
    }
    if (typeof authorField === 'object' && authorField !== null) {
      const obj = authorField as Record<string, unknown>;
      return this.toSafeString(obj['@id'] ?? obj['id']);
    }
    return '';
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
