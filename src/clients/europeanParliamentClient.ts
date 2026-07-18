/**
 * @fileoverview European Parliament API Client – Facade
 *
 * Thin facade that delegates every public method to a bounded-context
 * sub-client while keeping all public method signatures identical.
 * All sub-clients share the same LRU cache and rate-limiter bucket.
 *
 * **Architecture:** Facade pattern over 8 domain sub-clients:
 * MEPClient · PlenaryClient · VotingClient · CommitteeClient ·
 * DocumentClient · LegislativeClient · QuestionClient · VocabularyClient
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

import { LRUCache } from 'lru-cache';
import { RateLimiter } from '../utils/rateLimiter.js';
import {
  loadWeeklyCorporateBodiesCache,
  loadWeeklyMEPCache,
  type WeeklyMEPCache,
} from '../utils/weeklyDataCache.js';
import {
  findCachedCommittee,
  listCachedCurrentCorporateBodies,
} from '../utils/committeeCache.js';
import { CommitteeSchema, MEPDetailsSchema, MEPSchema } from '../schemas/europeanParliament.js';
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
  MEPDeclaration,
} from '../types/europeanParliament.js';

export {
  APIError,
  DEFAULT_EP_API_BASE_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_RETRY_ENABLED,
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_BASE_DELAY_MS,
  DEFAULT_RETRY_MAX_DELAY_MS,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_MAX_CACHE_SIZE,
  DEFAULT_RATE_LIMIT_TOKENS,
  DEFAULT_RATE_LIMIT_INTERVAL,
  DEFAULT_MAX_RESPONSE_BYTES,
} from './ep/baseClient.js';
export type { EPClientConfig } from './ep/baseClient.js';

import {
  DEFAULT_EP_API_BASE_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_RETRY_ENABLED,
  DEFAULT_MAX_RETRIES,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_MAX_CACHE_SIZE,
  DEFAULT_RATE_LIMIT_TOKENS,
  DEFAULT_RATE_LIMIT_INTERVAL,
  DEFAULT_MAX_RESPONSE_BYTES,
  validateApiUrl,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './ep/baseClient.js';
export { validateApiUrl };

import {
  MEPClient,
  PlenaryClient,
  VotingClient,
  CommitteeClient,
  DocumentClient,
  LegislativeClient,
  QuestionClient,
  VocabularyClient,
} from './ep/index.js';

/**
 * European Parliament API Client.
 *
 * Provides type-safe, high-performance access to the European Parliament Open
 * Data Portal with comprehensive caching, rate limiting, and GDPR-compliant
 * audit logging.
 *
 * **Architecture Note:** This class is a thin facade; all logic lives in the
 * bounded-context sub-clients under `src/clients/ep/`.  The facade owns the
 * shared LRU cache and rate-limiter and passes them to every sub-client so
 * they all operate within the same resource budget.
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
 * **ISMS Policy Compliance:**
 * - SC-002: Secure coding with input validation and error handling
 * - PE-001: Performance monitoring and optimization (<200ms P95)
 * - AU-002: Comprehensive audit logging for GDPR compliance
 * - DP-001: Data protection and privacy by design
 *
 * @example
 * ```typescript
 * const client = new EuropeanParliamentClient();
 * const meps = await client.getMEPs({ country: 'SE', limit: 20 });
 * console.log(`Found ${meps.total} Swedish MEPs`);
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
  private readonly mepClient: MEPClient;
  private readonly plenaryClient: PlenaryClient;
  private readonly votingClient: VotingClient;
  private readonly committeeClient: CommitteeClient;
  private readonly documentClient: DocumentClient;
  private readonly legislativeClient: LegislativeClient;
  private readonly questionClient: QuestionClient;
  private readonly vocabularyClient: VocabularyClient;
  private readonly useWeeklyCache: boolean;

  /**
   * Creates a new European Parliament API client.
   *
   * Builds shared LRU cache and rate-limiter, then wires all sub-clients
   * to use them so the whole facade operates within one resource budget.
   *
   * @param config - Optional client configuration
   */
  constructor(config: EPClientConfig = {}) {
    const shared = EuropeanParliamentClient.buildShared(config);
    this.useWeeklyCache = config.useWeeklyCache ?? false;
    this.mepClient = new MEPClient({}, shared);
    this.plenaryClient = new PlenaryClient({}, shared);
    this.votingClient = new VotingClient({}, shared);
    this.committeeClient = new CommitteeClient({}, shared);
    this.documentClient = new DocumentClient({}, shared);
    this.legislativeClient = new LegislativeClient({}, shared);
    this.questionClient = new QuestionClient({}, shared);
    this.vocabularyClient = new VocabularyClient({}, shared);
  }

  /**
   * Builds the shared resources object that is passed to all sub-clients.
   * Extracted to keep the constructor complexity within ESLint limits.
   *
   * @param config - Client configuration options
   * @returns Shared resources for all EP sub-clients
   * @private
   */
  private static buildShared(config: EPClientConfig): EPSharedResources {
    const sharedCache = new LRUCache<string, Record<string, unknown>>({
      max: config.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE,
      ttl: config.cacheTTL ?? DEFAULT_CACHE_TTL_MS,
      allowStale: false,
      updateAgeOnGet: true,
    });
    const sharedRateLimiter =
      config.rateLimiter ??
      new RateLimiter({
        tokensPerInterval: DEFAULT_RATE_LIMIT_TOKENS,
        interval: DEFAULT_RATE_LIMIT_INTERVAL,
      });
    const rawBaseURL = config.baseURL ?? DEFAULT_EP_API_BASE_URL;
    validateApiUrl(rawBaseURL, 'config.baseURL');
    const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;
    return {
      cache: sharedCache,
      rateLimiter: sharedRateLimiter,
      baseURL,
      timeoutMs: config.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
      enableRetry: config.enableRetry ?? DEFAULT_RETRY_ENABLED,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      maxResponseBytes: config.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES,
      cacheCounters: { hits: 0, misses: 0 },
    };
  }

  /**
   * Clears all entries from the LRU cache.
   *
   * @example
   * ```typescript
   * client.clearCache();
   * const freshData = await client.getMEPs({ country: 'SE' });
   * ```
   * @public
   */
  clearCache(): void {
    this.mepClient.clearCache();
  }

  /**
   * Returns cache statistics for monitoring and debugging.
   *
   * All sub-clients share the same LRU cache and hit/miss counters
   * (via {@link EPSharedResources}), so delegating to any single
   * sub-client returns aggregate statistics across the entire facade.
   *
   * @returns `{ size, maxSize, hitRate, hits, misses }`
   * @public
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number; hits: number; misses: number } {
    return this.mepClient.getCacheStats();
  }

  private normalizeMEPIdentifier(id: string): string {
    if (id.startsWith('MEP-')) return id.substring(4);
    if (id.startsWith('person/')) return id.substring(7);
    return id;
  }

  private findCachedMEPDetails(cache: WeeklyMEPCache, id: string): MEPDetails | undefined {
    const normalizedId = this.normalizeMEPIdentifier(id);
    const cached = cache.mepDetails[id]
      ?? cache.mepDetails[normalizedId]
      ?? cache.mepDetails[`MEP-${normalizedId}`]
      ?? cache.mepDetails[`person/${normalizedId}`];
    return cached === undefined ? undefined : MEPDetailsSchema.parse(cached) as MEPDetails;
  }

  private buildCachedCurrentMEPs(cache: WeeklyMEPCache): MEP[] {
    return cache.meps.filter((mep) => mep.active).map((mep) => {
      const details = this.findCachedMEPDetails(cache, mep.id);
      const enriched = details === undefined ? mep : { ...mep, committees: details.committees };
      return MEPSchema.parse(enriched) as MEP;
    });
  }

  private paginateCachedMEPs(
    meps: MEP[],
    params: { country?: string; group?: string; limit?: number; offset?: number },
  ): PaginatedResponse<MEP> {
    const country = params.country?.toUpperCase();
    const group = params.group?.trim().toLowerCase();
    const filtered = meps.filter((mep) =>
      (country === undefined || mep.country.toUpperCase() === country)
      && (group === undefined || mep.politicalGroup.trim().toLowerCase() === group),
    );
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const data = filtered.slice(offset, offset + limit);
    return {
      data,
      total: filtered.length,
      limit,
      offset,
      hasMore: offset + data.length < filtered.length,
    };
  }

  private matchesCommittee(committees: readonly string[], requested: string): boolean {
    const normalized = requested.toUpperCase();
    return committees.some((committee) =>
      committee.toUpperCase() === normalized
        || committee.split('/').pop()?.toUpperCase() === normalized,
    );
  }

  private async filterCachedMEPsByCommittee(
    meps: MEP[],
    requested: string | undefined,
    cache: WeeklyMEPCache,
  ): Promise<MEP[]> {
    if (requested === undefined) return meps;
    const bodies = await loadWeeklyCorporateBodiesCache();
    const resolved = bodies === null
      ? requested
      : findCachedCommittee(requested, bodies, cache)?.id ?? requested;
    return meps.filter((mep) => this.matchesCommittee(mep.committees, resolved));
  }

  private async getCachedMEPs(params: {
    country?: string;
    group?: string;
    committee?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
    live?: boolean;
  }): Promise<PaginatedResponse<MEP> | null> {
    if (!this.useWeeklyCache || params.live === true || params.active === false) return null;
    const cache = await loadWeeklyMEPCache();
    if (cache === null) return null;
    const current = await this.filterCachedMEPsByCommittee(
      this.buildCachedCurrentMEPs(cache),
      params.committee,
      cache,
    );
    return this.paginateCachedMEPs(current, params);
  }

  /**
   * Retrieves Members of the European Parliament with filtering and pagination.
   *
   * @param params - country, group, committee, active, limit, offset
   * @returns Paginated MEP list
   * @security Personal data access logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/meps
   */
  async getMEPs(params: {
    country?: string;
    group?: string;
    committee?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
    live?: boolean;
  }): Promise<PaginatedResponse<MEP>> {
    return await this.getCachedMEPs(params) ?? this.mepClient.getMEPs(params);
  }

  /**
   * Retrieves detailed information about a specific MEP.
   *
   * Supports numeric ID ("124936"), person URI ("person/124936"),
   * or MEP-prefixed ID ("MEP-124936").
   *
   * @param id - MEP identifier in any supported format
   * @returns Detailed MEP information
   * @security Personal data access logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/meps/{id}
   */
  async getMEPDetails(
    id: string,
    options: { abortSignal?: AbortSignal; live?: boolean } = {},
  ): Promise<MEPDetails> {
    if (this.useWeeklyCache && options.live !== true) {
      const cache = await loadWeeklyMEPCache();
      const cached = cache === null ? undefined : this.findCachedMEPDetails(cache, id);
      if (cached !== undefined) return cached;
    }
    return this.mepClient.getMEPDetails(id, options);
  }

  /**
   * Returns all currently active MEPs for today's date.
   *
   * Unlike `getMEPs()`, this uses `GET /meps/show-current` which returns
   * `api:country-of-representation` and `api:political-group` in responses.
   * Optional `country` and `group` filters are applied client-side after fetch.
   *
   * **EP API Endpoint:** `GET /meps/show-current`
   */
  async getCurrentMEPs(params: {
    country?: string;
    group?: string;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
    live?: boolean;
  } = {}): Promise<PaginatedResponse<MEP>> {
    if (this.useWeeklyCache && params.live !== true) {
      const cache = await loadWeeklyMEPCache();
      if (cache !== null) return this.paginateCachedMEPs(this.buildCachedCurrentMEPs(cache), params);
    }
    return this.mepClient.getCurrentMEPs(params);
  }

  /**
   * Returns all incoming MEPs for the current parliamentary term.
   * **EP API Endpoint:** `GET /meps/show-incoming`
   */
  async getIncomingMEPs(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<MEP>> {
    return this.mepClient.getIncomingMEPs(params);
  }

  /**
   * Returns all outgoing MEPs for the current parliamentary term.
   * **EP API Endpoint:** `GET /meps/show-outgoing`
   */
  async getOutgoingMEPs(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<MEP>> {
    return this.mepClient.getOutgoingMEPs(params);
  }

  /**
   * Returns homonym MEPs for the current parliamentary term.
   * **EP API Endpoint:** `GET /meps/show-homonyms`
   */
  async getHomonymMEPs(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<MEP>> {
    return this.mepClient.getHomonymMEPs(params);
  }

  /**
   * Returns MEP declarations of financial interests.
   * **EP API Endpoint:** `GET /meps-declarations`
   * @gdpr Declarations contain personal financial data – access is audit-logged
   */
  async getMEPDeclarations(params: {
    year?: number;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<MEPDeclaration>> {
    return this.mepClient.getMEPDeclarations(params);
  }

  /**
   * Returns a single MEP declaration by document ID.
   * **EP API Endpoint:** `GET /meps-declarations/{doc-id}`
   * @gdpr Declarations contain personal financial data – access is audit-logged
   */
  async getMEPDeclarationById(docId: string, options: { abortSignal?: AbortSignal } = {}): Promise<MEPDeclaration> {
    return this.mepClient.getMEPDeclarationById(docId, options);
  }

  /**
   * Retrieves recently updated MEPs via the feed endpoint.
   * **EP API Endpoint:** `GET /meps/feed`
   */
  async getMEPsFeed(params: {
    timeframe?: string;
    startDate?: string;
    abortSignal?: AbortSignal;
  } = {}): Promise<JSONLDResponse> {
    return this.mepClient.getMEPsFeed(params);
  }

  /**
   * Retrieves recently updated MEP declarations via the feed endpoint.
   * **EP API Endpoint:** `GET /meps-declarations/feed`
   */
  async getMEPDeclarationsFeed(params: {
    timeframe?: string;
    startDate?: string;
    workType?: string;
    abortSignal?: AbortSignal;
  } = {}): Promise<JSONLDResponse> {
    return this.mepClient.getMEPDeclarationsFeed(params);
  }

  /**
   * Retrieves plenary sessions with date and location filtering.
   *
   * @param params - year, dateFrom, dateTo, location, limit, offset
   * @returns Paginated plenary session list
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/meetings
   */
  async getPlenarySessions(params: {
    year?: number;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  }): Promise<PaginatedResponse<PlenarySession>> {
    return this.plenaryClient.getPlenarySessions(params);
  }

  /**
   * Returns activities linked to a specific meeting (plenary sitting).
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/activities`
   */
  async getMeetingActivities(
    sittingId: string,
    params: { limit?: number; offset?: number; abortSignal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<MeetingActivity>> {
    return this.plenaryClient.getMeetingActivities(sittingId, params);
  }

  /**
   * Returns decisions made in a specific meeting (plenary sitting).
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/decisions`
   */
  async getMeetingDecisions(
    sittingId: string,
    params: { limit?: number; offset?: number; abortSignal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.plenaryClient.getMeetingDecisions(sittingId, params);
  }

  /**
   * Returns foreseen activities linked to a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/foreseen-activities`
   */
  async getMeetingForeseenActivities(
    sittingId: string,
    params: { limit?: number; offset?: number; abortSignal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<MeetingActivity>> {
    return this.plenaryClient.getMeetingForeseenActivities(sittingId, params);
  }

  /**
   * Returns plenary session documents for a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-documents`
   */
  async getMeetingPlenarySessionDocuments(
    sittingId: string,
    params: { limit?: number; offset?: number; abortSignal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.plenaryClient.getMeetingPlenarySessionDocuments(sittingId, params);
  }

  /**
   * Returns plenary session document items for a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-document-items`
   */
  async getMeetingPlenarySessionDocumentItems(
    sittingId: string,
    params: { limit?: number; offset?: number; abortSignal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.plenaryClient.getMeetingPlenarySessionDocumentItems(sittingId, params);
  }

  /**
   * Returns a single EP meeting by ID.
   * **EP API Endpoint:** `GET /meetings/{event-id}`
   */
  async getMeetingById(eventId: string, options: { abortSignal?: AbortSignal } = {}): Promise<PlenarySession> {
    return this.plenaryClient.getMeetingById(eventId, options);
  }

  /**
   * Returns EP events (hearings, conferences, etc.).
   * **EP API Endpoint:** `GET /events`
   *
   * **Note:** The EP API `/events` endpoint has no date filtering.
   * Only pagination (limit/offset) is supported.
   */
  async getEvents(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<EPEvent>> {
    return this.plenaryClient.getEvents(params);
  }

  /**
   * Returns a single EP event by ID.
   * **EP API Endpoint:** `GET /events/{event-id}`
   */
  async getEventById(eventId: string, options: { abortSignal?: AbortSignal } = {}): Promise<EPEvent> {
    return this.plenaryClient.getEventById(eventId, options);
  }

  /**
   * Retrieves recently updated events via the feed endpoint.
   * **EP API Endpoint:** `GET /events/feed`
   */
  async getEventsFeed(params: {
    timeframe?: string;
    startDate?: string;
    activityType?: string;
    abortSignal?: AbortSignal;
  } = {}): Promise<JSONLDResponse> {
    return this.plenaryClient.getEventsFeed(params);
  }

  /**
   * Retrieves voting records with filtering by session, topic, and date.
   *
   * The EP API returns only aggregate vote counts; per-MEP vote positions are
   * not available from this endpoint.
   *
   * @param params - sessionId, topic, dateFrom, dateTo, limit, offset
   * @returns Paginated voting records list
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/meetings/{sitting-id}/vote-results
   */
  async getVotingRecords(params: {
    sessionId?: string;
    topic?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  }): Promise<PaginatedResponse<VotingRecord>> {
    return this.votingClient.getVotingRecords(params);
  }

  /**
   * Returns plenary speeches.
   * **EP API Endpoint:** `GET /speeches`
   *
   * **Note:** The EP API `/speeches` endpoint does not support `year`.
   * Use `dateFrom`/`dateTo` (mapped to `sitting-date`/`sitting-date-end`).
   */
  async getSpeeches(params: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<Speech>> {
    return this.votingClient.getSpeeches(params);
  }

  /**
   * Returns a single speech by ID.
   * **EP API Endpoint:** `GET /speeches/{speech-id}`
   */
  async getSpeechById(speechId: string, options: { abortSignal?: AbortSignal } = {}): Promise<Speech> {
    return this.votingClient.getSpeechById(speechId, options);
  }

  /**
   * Retrieves committee (corporate body) information by ID or abbreviation.
   *
   * @param params - id or abbreviation
   * @returns Committee information
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/corporate-bodies
   */
  async getCommitteeInfo(params: {
    id?: string;
    abbreviation?: string;
    abortSignal?: AbortSignal;
    live?: boolean;
  }): Promise<Committee> {
    if (this.useWeeklyCache && params.live !== true) {
      const [bodies, meps] = await Promise.all([
        loadWeeklyCorporateBodiesCache(),
        loadWeeklyMEPCache(),
      ]);
      const lookup = params.abbreviation ?? params.id;
      const cached = bodies === null || lookup === undefined
        ? undefined
        : findCachedCommittee(lookup, bodies, meps);
      if (cached !== undefined) return CommitteeSchema.parse(cached) as Committee;
    }
    return this.committeeClient.getCommitteeInfo({
      ...params,
      includeMemberships: params.live !== true,
    });
  }

  /**
   * Returns the list of all current EP Corporate Bodies for today's date.
   * **EP API Endpoint:** `GET /corporate-bodies/show-current`
   */
  async getCurrentCorporateBodies(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
    live?: boolean;
  } = {}): Promise<PaginatedResponse<Committee>> {
    if (this.useWeeklyCache && params.live !== true) {
      const [bodies, meps] = await Promise.all([
        loadWeeklyCorporateBodiesCache(),
        loadWeeklyMEPCache(),
      ]);
      if (bodies !== null && bodies.metadata.scope === 'current') {
        const allBodies = listCachedCurrentCorporateBodies(bodies, meps)
          .map((body) => CommitteeSchema.parse(body) as Committee);
        const limit = params.limit ?? 50;
        const offset = params.offset ?? 0;
        const data = allBodies.slice(offset, offset + limit);
        return {
          data,
          total: allBodies.length,
          limit,
          offset,
          hasMore: offset + data.length < allBodies.length,
        };
      }
    }
    return this.committeeClient.getCurrentCorporateBodies(params);
  }

  /**
   * Returns the list of all EP Corporate Bodies.
   * **EP API Endpoint:** `GET /corporate-bodies`
   */
  async getCorporateBodies(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<Committee>> {
    return this.committeeClient.getCorporateBodies(params);
  }

  /**
   * Returns a single EP Corporate Body by body ID.
   * **EP API Endpoint:** `GET /corporate-bodies/{body-id}`
   */
  async getCorporateBodyById(
    bodyId: string,
    options: { abortSignal?: AbortSignal; includeMemberships?: boolean } = {},
  ): Promise<Committee> {
    return this.committeeClient.getCorporateBodyById(bodyId, options);
  }

  /**
   * Retrieves recently updated corporate bodies via the feed endpoint.
   * **EP API Endpoint:** `GET /corporate-bodies/feed`
   * Fixed-window feed — no parameters per OpenAPI spec.
   */
  async getCorporateBodiesFeed(options: { abortSignal?: AbortSignal } = {}): Promise<JSONLDResponse> {
    return this.committeeClient.getCorporateBodiesFeed(options);
  }

  /**
   * Searches legislative documents by keyword, type, date, and committee.
   *
   * @param params - keyword, documentType, dateFrom, dateTo, committee, limit, offset
   * @returns Paginated legislative documents list
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/documents
   */
  async searchDocuments(params: {
    keyword: string;
    documentType?: string;
    dateFrom?: string;
    dateTo?: string;
    committee?: string;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  }): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.searchDocuments(params);
  }

  /**
   * Returns plenary documents.
   * **EP API Endpoint:** `GET /plenary-documents`
   */
  async getPlenaryDocuments(params: {
    year?: number;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.getPlenaryDocuments(params);
  }

  /**
   * Returns committee documents.
   * **EP API Endpoint:** `GET /committee-documents`
   *
   * **Note:** The EP API `/committee-documents` endpoint does not support `year`.
   * Only pagination (limit/offset) is supported.
   */
  async getCommitteeDocuments(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.getCommitteeDocuments(params);
  }

  /**
   * Returns plenary session documents.
   * **EP API Endpoint:** `GET /plenary-session-documents`
   */
  async getPlenarySessionDocuments(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.getPlenarySessionDocuments(params);
  }

  /**
   * Returns all Plenary Session Document Items.
   * **EP API Endpoint:** `GET /plenary-session-documents-items`
   */
  async getPlenarySessionDocumentItems(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.getPlenarySessionDocumentItems(params);
  }

  /**
   * Returns all External Documents.
   * **EP API Endpoint:** `GET /external-documents`
   *
   * **Note:** The EP API `/external-documents` endpoint does not support `year`.
   * Only pagination (limit/offset) is supported.
   */
  async getExternalDocuments(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.getExternalDocuments(params);
  }

  /**
   * Returns a single document by ID.
   * **EP API Endpoint:** `GET /documents/{doc-id}`
   */
  async getDocumentById(docId: string, options: { abortSignal?: AbortSignal } = {}): Promise<LegislativeDocument> {
    return this.documentClient.getDocumentById(docId, options);
  }

  /**
   * Returns a single plenary document by ID.
   * **EP API Endpoint:** `GET /plenary-documents/{doc-id}`
   */
  async getPlenaryDocumentById(docId: string, options: { abortSignal?: AbortSignal } = {}): Promise<LegislativeDocument> {
    return this.documentClient.getPlenaryDocumentById(docId, options);
  }

  /**
   * Returns a single plenary session document by ID.
   * **EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`
   */
  async getPlenarySessionDocumentById(docId: string, options: { abortSignal?: AbortSignal } = {}): Promise<LegislativeDocument> {
    return this.documentClient.getPlenarySessionDocumentById(docId, options);
  }

  /**
   * Returns a single committee document by ID.
   * **EP API Endpoint:** `GET /committee-documents/{doc-id}`
   */
  async getCommitteeDocumentById(docId: string, options: { abortSignal?: AbortSignal } = {}): Promise<LegislativeDocument> {
    return this.documentClient.getCommitteeDocumentById(docId, options);
  }

  /**
   * Returns a single external document by ID.
   * **EP API Endpoint:** `GET /external-documents/{doc-id}`
   */
  async getExternalDocumentById(docId: string, options: { abortSignal?: AbortSignal } = {}): Promise<LegislativeDocument> {
    return this.documentClient.getExternalDocumentById(docId, options);
  }

  /**
   * Retrieves recently updated documents via the feed endpoint.
   * **EP API Endpoint:** `GET /documents/feed`
   * Fixed-window feed — no parameters per OpenAPI spec.
   */
  async getDocumentsFeed(options: { abortSignal?: AbortSignal } = {}): Promise<JSONLDResponse> {
    return this.documentClient.getDocumentsFeed(options);
  }

  /**
   * Retrieves recently updated plenary documents via the feed endpoint.
   * **EP API Endpoint:** `GET /plenary-documents/feed`
   * Fixed-window feed — no parameters per OpenAPI spec.
   */
  async getPlenaryDocumentsFeed(options: { abortSignal?: AbortSignal } = {}): Promise<JSONLDResponse> {
    return this.documentClient.getPlenaryDocumentsFeed(options);
  }

  /**
   * Retrieves recently updated committee documents via the feed endpoint.
   * **EP API Endpoint:** `GET /committee-documents/feed`
   * Fixed-window feed — no parameters per OpenAPI spec.
   */
  async getCommitteeDocumentsFeed(options: { abortSignal?: AbortSignal } = {}): Promise<JSONLDResponse> {
    return this.documentClient.getCommitteeDocumentsFeed(options);
  }

  /**
   * Retrieves recently updated plenary session documents via the feed endpoint.
   * **EP API Endpoint:** `GET /plenary-session-documents/feed`
   * Fixed-window feed — no parameters per OpenAPI spec.
   */
  async getPlenarySessionDocumentsFeed(options: { abortSignal?: AbortSignal } = {}): Promise<JSONLDResponse> {
    return this.documentClient.getPlenarySessionDocumentsFeed(options);
  }

  /**
   * Retrieves recently updated external documents via the feed endpoint.
   * **EP API Endpoint:** `GET /external-documents/feed`
   */
  async getExternalDocumentsFeed(params: {
    timeframe?: string;
    startDate?: string;
    workType?: string;
    abortSignal?: AbortSignal;
  } = {}): Promise<JSONLDResponse> {
    return this.documentClient.getExternalDocumentsFeed(params);
  }

  /**
   * Returns legislative procedures.
   * **EP API Endpoint:** `GET /procedures`
   *
   * **Note:** The EP API `/procedures` endpoint does not support `year`.
   * Only pagination (limit/offset) is supported.
   */
  async getProcedures(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<Procedure>> {
    return this.legislativeClient.getProcedures(params);
  }

  /**
   * Returns a single procedure by ID.
   * **EP API Endpoint:** `GET /procedures/{process-id}`
   * @throws {APIError} When the procedure is not found (404)
   */
  async getProcedureById(processId: string, options: { abortSignal?: AbortSignal } = {}): Promise<Procedure> {
    return this.legislativeClient.getProcedureById(processId, options);
  }

  /**
   * Returns events linked to a procedure.
   * **EP API Endpoint:** `GET /procedures/{process-id}/events`
   */
  async getProcedureEvents(
    processId: string,
    params: { limit?: number; offset?: number; abortSignal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<EPEvent>> {
    return this.legislativeClient.getProcedureEvents(processId, params);
  }

  /**
   * Returns adopted texts.
   * **EP API Endpoint:** `GET /adopted-texts`
   */
  async getAdoptedTexts(params: {
    year?: number;
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<AdoptedText>> {
    return this.legislativeClient.getAdoptedTexts(params);
  }

  /**
   * Returns a single adopted text by document ID.
   * **EP API Endpoint:** `GET /adopted-texts/{doc-id}`
   */
  async getAdoptedTextById(docId: string, options: { abortSignal?: AbortSignal } = {}): Promise<AdoptedText> {
    return this.legislativeClient.getAdoptedTextById(docId, options);
  }

  /**
   * Retrieves recently updated procedures via the feed endpoint.
   * **EP API Endpoint:** `GET /procedures/feed`
   */
  async getProceduresFeed(params: {
    timeframe?: string;
    startDate?: string;
    processType?: string;
    abortSignal?: AbortSignal;
  } = {}): Promise<JSONLDResponse> {
    return this.legislativeClient.getProceduresFeed(params);
  }

  /**
   * Retrieves recently updated adopted texts via the feed endpoint.
   * **EP API Endpoint:** `GET /adopted-texts/feed`
   */
  async getAdoptedTextsFeed(params: {
    timeframe?: string;
    startDate?: string;
    workType?: string;
    abortSignal?: AbortSignal;
  } = {}): Promise<JSONLDResponse> {
    return this.legislativeClient.getAdoptedTextsFeed(params);
  }

  /**
   * Returns a single event within a procedure by event ID.
   * **EP API Endpoint:** `GET /procedures/{process-id}/events/{event-id}`
   *
   * @param processId - Procedure process ID
   * @param eventId - Event identifier within the procedure
   */
  async getProcedureEventById(processId: string, eventId: string, options: { abortSignal?: AbortSignal } = {}): Promise<EPEvent> {
    return this.legislativeClient.getProcedureEventById(processId, eventId, options);
  }

  /**
   * Retrieves parliamentary questions with filtering by type, author, and status.
   *
   * @param params - type, author, topic, status, dateFrom, dateTo, limit, offset
   * @returns Paginated parliamentary questions list
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/parliamentary-questions
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
    abortSignal?: AbortSignal;
  }): Promise<PaginatedResponse<ParliamentaryQuestion>> {
    return this.questionClient.getParliamentaryQuestions(params);
  }

  /**
   * Returns a single parliamentary question by document ID.
   * **EP API Endpoint:** `GET /parliamentary-questions/{doc-id}`
   */
  async getParliamentaryQuestionById(
    docId: string,
    options: { abortSignal?: AbortSignal } = {},
  ): Promise<ParliamentaryQuestion> {
    return this.questionClient.getParliamentaryQuestionById(docId, options);
  }

  /**
   * Retrieves recently updated parliamentary questions via the feed endpoint.
   * **EP API Endpoint:** `GET /parliamentary-questions/feed`
   * Fixed-window feed — no parameters per OpenAPI spec.
   */
  async getParliamentaryQuestionsFeed(options: { abortSignal?: AbortSignal } = {}): Promise<JSONLDResponse> {
    return this.questionClient.getParliamentaryQuestionsFeed(options);
  }

  /**
   * Returns EP controlled vocabularies.
   * **EP API Endpoint:** `GET /controlled-vocabularies`
   */
  async getControlledVocabularies(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.vocabularyClient.getControlledVocabularies(params);
  }

  /**
   * Returns a single EP Controlled Vocabulary by ID.
   * **EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`
   */
  async getControlledVocabularyById(
    vocId: string,
    options: { abortSignal?: AbortSignal } = {},
  ): Promise<Record<string, unknown>> {
    return this.vocabularyClient.getControlledVocabularyById(vocId, options);
  }

  /**
   * Retrieves recently updated controlled vocabularies via the feed endpoint.
   * **EP API Endpoint:** `GET /controlled-vocabularies/feed`
   * Fixed-window feed — no parameters per OpenAPI spec.
   */
  async getControlledVocabulariesFeed(options: { abortSignal?: AbortSignal } = {}): Promise<JSONLDResponse> {
    return this.vocabularyClient.getControlledVocabulariesFeed(options);
  }
}

/**
 * Singleton instance of European Parliament API client for global use.
 *
 * Pre-configured with defaults (15 min cache, 100 req/min rate limit).
 * Recommended for most use cases to share cache and rate limiter across
 * the application.
 *
 * **Environment Variables:**
 * - `EP_API_URL`: Override base API URL
 * - `EP_REQUEST_TIMEOUT_MS`: Override request timeout in milliseconds (default: `DEFAULT_REQUEST_TIMEOUT_MS`)
 *
 * @example
 * ```typescript
 * import { epClient } from './clients/europeanParliamentClient.js';
 * const meps = await epClient.getMEPs({ country: 'SE' });
 * ```
 *
 * @public
 * @see {@link EuropeanParliamentClient}
 */
export const epClient = new EuropeanParliamentClient({
  useWeeklyCache: true,
  baseURL: ((): string => {
    const raw = process.env['EP_API_URL'];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        const withSlash = trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
        return validateApiUrl(withSlash);
      }
    }
    return DEFAULT_EP_API_BASE_URL;
  })(),
  timeoutMs: ((): number => {
    const raw = process.env['EP_REQUEST_TIMEOUT_MS'];
    if (typeof raw === 'string' && raw.trim().length > 0) {
      const parsed = Number.parseInt(raw, 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return DEFAULT_REQUEST_TIMEOUT_MS;
  })(),
});
