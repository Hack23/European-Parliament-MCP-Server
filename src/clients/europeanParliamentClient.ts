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

// Re-export infrastructure types/constants so existing consumers keep working.
export {
  APIError,
  DEFAULT_EP_API_BASE_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_RETRY_ENABLED,
  DEFAULT_MAX_RETRIES,
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
  type EPClientConfig,
  type EPSharedResources,
} from './ep/baseClient.js';

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

// ─── Facade ───────────────────────────────────────────────────────────────────

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
  // ─── Sub-clients (package-private for testability) ──────────────────────
  private readonly mepClient: MEPClient;
  private readonly plenaryClient: PlenaryClient;
  private readonly votingClient: VotingClient;
  private readonly committeeClient: CommitteeClient;
  private readonly documentClient: DocumentClient;
  private readonly legislativeClient: LegislativeClient;
  private readonly questionClient: QuestionClient;
  private readonly vocabularyClient: VocabularyClient;

  /**
   * Creates a new European Parliament API client.
   *
   * Builds shared LRU cache and rate-limiter, then wires all sub-clients
   * to use them so the whole facade operates within one resource budget.
   *
   * @param config - Optional client configuration
   */
  constructor(config: EPClientConfig = {}) {
    // Build the shared cache
    const sharedCache = new LRUCache<string, Record<string, unknown>>({
      max: config.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE,
      ttl: config.cacheTTL ?? DEFAULT_CACHE_TTL_MS,
      allowStale: false,
      updateAgeOnGet: true,
    });

    // Build the shared rate-limiter
    const sharedRateLimiter =
      config.rateLimiter ??
      new RateLimiter({
        tokensPerInterval: DEFAULT_RATE_LIMIT_TOKENS,
        interval: DEFAULT_RATE_LIMIT_INTERVAL,
      });

    const baseURL = config.baseURL ?? DEFAULT_EP_API_BASE_URL;
    const timeoutMs = config.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    const enableRetry = config.enableRetry ?? DEFAULT_RETRY_ENABLED;
    const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;

    // Shared resources passed to every sub-client
    const shared: EPSharedResources = {
      cache: sharedCache,
      rateLimiter: sharedRateLimiter,
      baseURL,
      timeoutMs,
      enableRetry,
      maxRetries,
    };

    this.mepClient = new MEPClient({}, shared);
    this.plenaryClient = new PlenaryClient({}, shared);
    this.votingClient = new VotingClient({}, shared);
    this.committeeClient = new CommitteeClient({}, shared);
    this.documentClient = new DocumentClient({}, shared);
    this.legislativeClient = new LegislativeClient({}, shared);
    this.questionClient = new QuestionClient({}, shared);
    this.vocabularyClient = new VocabularyClient({}, shared);
  }

  // ─── Cache management ────────────────────────────────────────────────────

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
    // Delegating to any sub-client clears the shared cache
    this.mepClient.clearCache();
  }

  /**
   * Returns cache statistics for monitoring and debugging.
   *
   * @returns `{ size, maxSize, hitRate }`
   * @public
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return this.mepClient.getCacheStats();
  }

  // ─── MEP endpoints ────────────────────────────────────────────────────────

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
  }): Promise<PaginatedResponse<MEP>> {
    return this.mepClient.getMEPs(params);
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
  async getMEPDetails(id: string): Promise<MEPDetails> {
    return this.mepClient.getMEPDetails(id);
  }

  /**
   * Returns all currently active MEPs for today's date.
   * **EP API Endpoint:** `GET /meps/show-current`
   */
  async getCurrentMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    return this.mepClient.getCurrentMEPs(params);
  }

  /**
   * Returns all incoming MEPs for the current parliamentary term.
   * **EP API Endpoint:** `GET /meps/show-incoming`
   */
  async getIncomingMEPs(params: {
    limit?: number;
    offset?: number;
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
  } = {}): Promise<PaginatedResponse<MEPDeclaration>> {
    return this.mepClient.getMEPDeclarations(params);
  }

  /**
   * Returns a single MEP declaration by document ID.
   * **EP API Endpoint:** `GET /meps-declarations/{doc-id}`
   * @gdpr Declarations contain personal financial data – access is audit-logged
   */
  async getMEPDeclarationById(docId: string): Promise<MEPDeclaration> {
    return this.mepClient.getMEPDeclarationById(docId);
  }

  // ─── Plenary / meeting endpoints ─────────────────────────────────────────

  /**
   * Retrieves plenary sessions with date and location filtering.
   *
   * @param params - dateFrom, dateTo, location, limit, offset
   * @returns Paginated plenary session list
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/meetings
   */
  async getPlenarySessions(params: {
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<PlenarySession>> {
    return this.plenaryClient.getPlenarySessions(params);
  }

  /**
   * Returns activities linked to a specific meeting (plenary sitting).
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/activities`
   */
  async getMeetingActivities(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<MeetingActivity>> {
    return this.plenaryClient.getMeetingActivities(sittingId, params);
  }

  /**
   * Returns decisions made in a specific meeting (plenary sitting).
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/decisions`
   */
  async getMeetingDecisions(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.plenaryClient.getMeetingDecisions(sittingId, params);
  }

  /**
   * Returns foreseen activities linked to a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/foreseen-activities`
   */
  async getMeetingForeseenActivities(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<MeetingActivity>> {
    return this.plenaryClient.getMeetingForeseenActivities(sittingId, params);
  }

  /**
   * Returns plenary session documents for a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-documents`
   */
  async getMeetingPlenarySessionDocuments(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.plenaryClient.getMeetingPlenarySessionDocuments(sittingId, params);
  }

  /**
   * Returns plenary session document items for a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-document-items`
   */
  async getMeetingPlenarySessionDocumentItems(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.plenaryClient.getMeetingPlenarySessionDocumentItems(sittingId, params);
  }

  /**
   * Returns a single EP meeting by ID.
   * **EP API Endpoint:** `GET /meetings/{event-id}`
   */
  async getMeetingById(eventId: string): Promise<PlenarySession> {
    return this.plenaryClient.getMeetingById(eventId);
  }

  /**
   * Returns EP events (hearings, conferences, etc.).
   * **EP API Endpoint:** `GET /events`
   */
  async getEvents(params: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<EPEvent>> {
    return this.plenaryClient.getEvents(params);
  }

  /**
   * Returns a single EP event by ID.
   * **EP API Endpoint:** `GET /events/{event-id}`
   */
  async getEventById(eventId: string): Promise<EPEvent> {
    return this.plenaryClient.getEventById(eventId);
  }

  // ─── Voting / speech endpoints ────────────────────────────────────────────

  /**
   * Retrieves voting records with filtering by session, topic, and date.
   *
   * @param params - sessionId, topic, dateFrom, dateTo, limit, offset
   * @param params.mepId - **Deprecated / ignored.** The EP API returns only aggregate
   *   vote counts; per-MEP vote positions are not available from this endpoint.
   * @returns Paginated voting records list
   * @security Audit logged per GDPR Article 30
   * @performance Cached: <100ms P50, <200ms P95. Uncached: <2s P99
   * @see https://data.europarl.europa.eu/api/v2/meetings/{sitting-id}/vote-results
   */
  async getVotingRecords(params: {
    sessionId?: string;
    /** @deprecated Ignored; this endpoint only returns aggregate vote counts, not per-MEP positions. */
    mepId?: string;
    topic?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<VotingRecord>> {
    return this.votingClient.getVotingRecords(params);
  }

  /**
   * Returns plenary speeches.
   * **EP API Endpoint:** `GET /speeches`
   */
  async getSpeeches(params: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Speech>> {
    return this.votingClient.getSpeeches(params);
  }

  /**
   * Returns a single speech by ID.
   * **EP API Endpoint:** `GET /speeches/{speech-id}`
   */
  async getSpeechById(speechId: string): Promise<Speech> {
    return this.votingClient.getSpeechById(speechId);
  }

  // ─── Committee endpoints ──────────────────────────────────────────────────

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
  }): Promise<Committee> {
    return this.committeeClient.getCommitteeInfo(params);
  }

  /**
   * Returns the list of all current EP Corporate Bodies for today's date.
   * **EP API Endpoint:** `GET /corporate-bodies/show-current`
   */
  async getCurrentCorporateBodies(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Committee>> {
    return this.committeeClient.getCurrentCorporateBodies(params);
  }

  // ─── Document endpoints ───────────────────────────────────────────────────

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
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.getPlenaryDocuments(params);
  }

  /**
   * Returns committee documents.
   * **EP API Endpoint:** `GET /committee-documents`
   */
  async getCommitteeDocuments(params: {
    year?: number;
    limit?: number;
    offset?: number;
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
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.getPlenarySessionDocumentItems(params);
  }

  /**
   * Returns all External Documents.
   * **EP API Endpoint:** `GET /external-documents`
   */
  async getExternalDocuments(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    return this.documentClient.getExternalDocuments(params);
  }

  /**
   * Returns a single document by ID.
   * **EP API Endpoint:** `GET /documents/{doc-id}`
   */
  async getDocumentById(docId: string): Promise<LegislativeDocument> {
    return this.documentClient.getDocumentById(docId);
  }

  /**
   * Returns a single plenary document by ID.
   * **EP API Endpoint:** `GET /plenary-documents/{doc-id}`
   */
  async getPlenaryDocumentById(docId: string): Promise<LegislativeDocument> {
    return this.documentClient.getPlenaryDocumentById(docId);
  }

  /**
   * Returns a single plenary session document by ID.
   * **EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`
   */
  async getPlenarySessionDocumentById(docId: string): Promise<LegislativeDocument> {
    return this.documentClient.getPlenarySessionDocumentById(docId);
  }

  /**
   * Returns a single committee document by ID.
   * **EP API Endpoint:** `GET /committee-documents/{doc-id}`
   */
  async getCommitteeDocumentById(docId: string): Promise<LegislativeDocument> {
    return this.documentClient.getCommitteeDocumentById(docId);
  }

  /**
   * Returns a single external document by ID.
   * **EP API Endpoint:** `GET /external-documents/{doc-id}`
   */
  async getExternalDocumentById(docId: string): Promise<LegislativeDocument> {
    return this.documentClient.getExternalDocumentById(docId);
  }

  // ─── Legislative endpoints ────────────────────────────────────────────────

  /**
   * Returns legislative procedures.
   * **EP API Endpoint:** `GET /procedures`
   */
  async getProcedures(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Procedure>> {
    return this.legislativeClient.getProcedures(params);
  }

  /**
   * Returns a single procedure by ID.
   * **EP API Endpoint:** `GET /procedures/{process-id}`
   * @throws {APIError} When the procedure is not found (404)
   */
  async getProcedureById(processId: string): Promise<Procedure> {
    return this.legislativeClient.getProcedureById(processId);
  }

  /**
   * Returns events linked to a procedure.
   * **EP API Endpoint:** `GET /procedures/{process-id}/events`
   */
  async getProcedureEvents(
    processId: string,
    params: { limit?: number; offset?: number } = {}
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
  } = {}): Promise<PaginatedResponse<AdoptedText>> {
    return this.legislativeClient.getAdoptedTexts(params);
  }

  /**
   * Returns a single adopted text by document ID.
   * **EP API Endpoint:** `GET /adopted-texts/{doc-id}`
   */
  async getAdoptedTextById(docId: string): Promise<AdoptedText> {
    return this.legislativeClient.getAdoptedTextById(docId);
  }

  // ─── Parliamentary question endpoints ────────────────────────────────────

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
  }): Promise<PaginatedResponse<ParliamentaryQuestion>> {
    return this.questionClient.getParliamentaryQuestions(params);
  }

  /**
   * Returns a single parliamentary question by document ID.
   * **EP API Endpoint:** `GET /parliamentary-questions/{doc-id}`
   */
  async getParliamentaryQuestionById(
    docId: string
  ): Promise<ParliamentaryQuestion> {
    return this.questionClient.getParliamentaryQuestionById(docId);
  }

  // ─── Vocabulary endpoints ─────────────────────────────────────────────────

  /**
   * Returns EP controlled vocabularies.
   * **EP API Endpoint:** `GET /controlled-vocabularies`
   */
  async getControlledVocabularies(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.vocabularyClient.getControlledVocabularies(params);
  }

  /**
   * Returns a single EP Controlled Vocabulary by ID.
   * **EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`
   */
  async getControlledVocabularyById(
    vocId: string
  ): Promise<Record<string, unknown>> {
    return this.vocabularyClient.getControlledVocabularyById(vocId);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

/**
 * Singleton instance of European Parliament API client for global use.
 *
 * Pre-configured with defaults (15 min cache, 100 req/min rate limit).
 * Recommended for most use cases to share cache and rate limiter across
 * the application.
 *
 * **Environment Variables:**
 * - `EP_API_URL`: Override base API URL
 * - `EP_REQUEST_TIMEOUT_MS`: Override request timeout in milliseconds (default: 10000)
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
  baseURL: ((): string => {
    const raw = process.env['EP_API_URL'];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
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
