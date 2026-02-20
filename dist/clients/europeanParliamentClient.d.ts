/**
 * @fileoverview European Parliament API Client
 *
 * Provides type-safe access to European Parliament Open Data Portal with
 * comprehensive security and performance features.
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
import { RateLimiter } from '../utils/rateLimiter.js';
import type { MEP, MEPDetails, PlenarySession, VotingRecord, LegislativeDocument, Committee, ParliamentaryQuestion, PaginatedResponse } from '../types/europeanParliament.js';
/**
 * Default configuration values for European Parliament API client
 *
 * These constants serve as the single source of truth for default values,
 * preventing documentation drift and ensuring consistency.
 */
export declare const DEFAULT_EP_API_BASE_URL = "https://data.europarl.europa.eu/api/v2/";
export declare const DEFAULT_REQUEST_TIMEOUT_MS = 10000;
export declare const DEFAULT_RETRY_ENABLED = true;
export declare const DEFAULT_MAX_RETRIES = 2;
export declare const DEFAULT_CACHE_TTL_MS = 900000;
export declare const DEFAULT_MAX_CACHE_SIZE = 500;
export declare const DEFAULT_RATE_LIMIT_TOKENS = 100;
export declare const DEFAULT_RATE_LIMIT_INTERVAL: "minute";
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
export declare class APIError extends Error {
    statusCode?: number | undefined;
    details?: unknown | undefined;
    /**
     * Creates a new API error instance.
     *
     * @param message - Human-readable error message
     * @param statusCode - HTTP status code (optional, e.g., 404, 500)
     * @param details - Additional error context (optional)
     */
    constructor(message: string, statusCode?: number | undefined, details?: unknown | undefined);
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
export declare class EuropeanParliamentClient {
    /**
     * LRU cache for API responses.
     * Stores transformed responses with 15-minute TTL.
     * @private
     * @readonly
     */
    private readonly cache;
    /**
     * European Parliament API base URL.
     * @private
     * @readonly
     * @default 'https://data.europarl.europa.eu/api/v2/'
     */
    private readonly baseURL;
    /**
     * Token bucket rate limiter.
     * Enforces 100 requests per minute limit.
     * @private
     * @readonly
     */
    private readonly rateLimiter;
    /**
     * Request timeout in milliseconds.
     * @private
     * @readonly
     * @default 10000 (10 seconds)
     */
    private readonly timeoutMs;
    /**
     * Enable automatic retry on transient failures.
     * @private
     * @readonly
     * @default true
     */
    private readonly enableRetry;
    /**
     * Maximum number of retry attempts.
     * @private
     * @readonly
     * @default 2
     */
    private readonly maxRetries;
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
    constructor(config?: EPClientConfig);
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
    private get;
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
    private getCacheKey;
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
    private toSafeString;
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
    private transformMEP;
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
    private extractActivityDate;
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
    private extractLocation;
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
    private transformPlenarySession;
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
    private transformMEPDetails;
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
    getMEPs(params: {
        country?: string;
        group?: string;
        committee?: string;
        active?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<PaginatedResponse<MEP>>;
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
    getMEPDetails(id: string): Promise<MEPDetails>;
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
    private buildMeetingsAPIParams;
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
    getPlenarySessions(params: {
        dateFrom?: string;
        dateTo?: string;
        location?: string;
        limit?: number;
        offset?: number;
    }): Promise<PaginatedResponse<PlenarySession>>;
    /**
     * Retrieves voting records with filtering by session, MEP, topic, and date.
     *
     * **Note:** Currently returns mock data. Real EP API integration pending.
     *
     * Fetches voting records from plenary sessions including vote counts,
     * outcomes, and individual MEP votes. Supports filtering by session,
     * MEP, topic, and date range.
     *
     * @param params - Query parameters for filtering voting records
     * @param params.sessionId - Plenary session identifier (e.g., "PLENARY-2024-01")
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
     * // Get voting records for a session
     * const result = await client.getVotingRecords({
     *   sessionId: 'PLENARY-2024-01',
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
     * @see {@link VotingRecord} for voting record data structure
     * @see {@link PaginatedResponse} for response format
     */
    getVotingRecords(params: {
        sessionId?: string;
        mepId?: string;
        topic?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
    }): Promise<PaginatedResponse<VotingRecord>>;
    /**
     * Searches legislative documents by keyword, type, date, and committee.
     *
     * **Note:** Currently returns mock data. Real EP API integration pending.
     *
     * Performs full-text search across legislative documents including reports,
     * amendments, resolutions, and opinions. Supports filtering by document type,
     * date range, and responsible committee.
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
     *   console.log(`  PDF: ${doc.pdfUrl}`);
     * }
     * ```
     *
     * @example
     * ```typescript
     * // Filter by committee and date range
     * const documents = await client.searchDocuments({
     *   keyword: 'environment',
     *   committee: 'ENVI',
     *   dateFrom: '2024-01-01',
     *   dateTo: '2024-06-30'
     * });
     * ```
     *
     * @see {@link LegislativeDocument} for document data structure
     * @see {@link PaginatedResponse} for response format
     */
    searchDocuments(params: {
        keyword: string;
        documentType?: string;
        dateFrom?: string;
        dateTo?: string;
        committee?: string;
        limit?: number;
        offset?: number;
    }): Promise<PaginatedResponse<LegislativeDocument>>;
    /**
     * Retrieves committee information by ID or abbreviation.
     *
     * **Note:** Currently returns mock data. Real EP API integration pending.
     *
     * Fetches detailed committee information including name, members, leadership,
     * and areas of responsibility. Supports lookup by committee ID or abbreviation.
     *
     * @param params - Query parameters for committee lookup
     * @param params.id - Committee identifier (e.g., "COMM-ENVI")
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
     * console.log(`Chair: ${committee.chair}`);
     * console.log(`Members: ${committee.members.length}`);
     * console.log('Responsibilities:');
     * committee.responsibilities.forEach(r => console.log(`  - ${r}`));
     * ```
     *
     * @example
     * ```typescript
     * // Get committee by ID
     * const committee = await client.getCommitteeInfo({
     *   id: 'COMM-ENVI'
     * });
     * console.log(`Vice-chairs: ${committee.viceChairs.join(', ')}`);
     * ```
     *
     * @see {@link Committee} for committee data structure
     */
    getCommitteeInfo(params: {
        id?: string;
        abbreviation?: string;
    }): Promise<Committee>;
    /**
     * Retrieves parliamentary questions with filtering by type, author, and status.
     *
     * **Note:** Currently returns mock data. Real EP API integration pending.
     *
     * Fetches parliamentary questions submitted by MEPs including written and oral
     * questions. Supports filtering by question type, author, topic, status, and
     * date range.
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
     * // Get answered written questions
     * const result = await client.getParliamentaryQuestions({
     *   type: 'WRITTEN',
     *   status: 'ANSWERED',
     *   limit: 20
     * });
     *
     * for (const question of result.data) {
     *   console.log(`Q: ${question.questionText}`);
     *   if (question.answerText) {
     *     console.log(`A: ${question.answerText}`);
     *     console.log(`Answered: ${question.answerDate}`);
     *   }
     * }
     * ```
     *
     * @example
     * ```typescript
     * // Get pending questions by specific MEP
     * const questions = await client.getParliamentaryQuestions({
     *   author: 'person/124936',
     *   status: 'PENDING',
     *   dateFrom: '2024-01-01'
     * });
     * ```
     *
     * @example
     * ```typescript
     * // Filter oral questions by topic
     * const oralQuestions = await client.getParliamentaryQuestions({
     *   type: 'ORAL',
     *   topic: 'Climate Policy',
     *   limit: 10
     * });
     * ```
     *
     * @see {@link ParliamentaryQuestion} for question data structure
     * @see {@link PaginatedResponse} for response format
     */
    getParliamentaryQuestions(params: {
        type?: 'WRITTEN' | 'ORAL';
        author?: string;
        topic?: string;
        status?: 'PENDING' | 'ANSWERED';
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
    }): Promise<PaginatedResponse<ParliamentaryQuestion>>;
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
    clearCache(): void;
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
    getCacheStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
    };
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
export declare const epClient: EuropeanParliamentClient;
export {};
//# sourceMappingURL=europeanParliamentClient.d.ts.map