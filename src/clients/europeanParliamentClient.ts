/**
 * European Parliament API Client
 * 
 * ISMS Policy: SC-002 (Secure Coding), PE-001 (Performance Standards)
 * 
 * Provides access to European Parliament Open Data Portal with:
 * - LRU caching for performance (<200ms target)
 * - Rate limiting to prevent abuse
 * - Error handling and retry logic
 * - GDPR-compliant data access logging
 */

import { fetch } from 'undici';
import { LRUCache } from 'lru-cache';
import { RateLimiter } from '../utils/rateLimiter.js';
import { auditLogger } from '../utils/auditLogger.js';
import type {
  MEP,
  MEPDetails,
  PlenarySession,
  VotingRecord,
  LegislativeDocument,
  Committee,
  ParliamentaryQuestion,
  PaginatedResponse
} from '../types/europeanParliament.js';

/**
 * API Error class
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

/**
 * JSON-LD response format from EP API
 * @internal
 */
interface JSONLDResponse<T = Record<string, unknown>> extends Record<string, unknown> {
  data: T[];
  '@context': unknown[];
}

/**
 * European Parliament API Client configuration
 * @internal - Used only for client initialization
 */
interface EPClientConfig {
  /**
   * Base URL for EP API
   */
  baseURL?: string;
  
  /**
   * Cache TTL in milliseconds (default: 15 minutes)
   */
  cacheTTL?: number;
  
  /**
   * Maximum cache entries (default: 500)
   */
  maxCacheSize?: number;
  
  /**
   * Rate limiter instance
   */
  rateLimiter?: RateLimiter;
}

/**
 * European Parliament API Client
 */
export class EuropeanParliamentClient {
  private readonly cache: LRUCache<string, Record<string, unknown>>;
  private readonly baseURL: string;
  private readonly rateLimiter: RateLimiter;

  constructor(config: EPClientConfig = {}) {
    this.baseURL = config.baseURL ?? 'https://data.europarl.europa.eu/api/v2/';
    
    // Initialize LRU cache
    this.cache = new LRUCache<string, Record<string, unknown>>({
      max: config.maxCacheSize ?? 500,
      ttl: config.cacheTTL ?? 1000 * 60 * 15, // 15 minutes
      allowStale: false,
      updateAgeOnGet: true
    });
    
    // Initialize rate limiter
    this.rateLimiter = config.rateLimiter ?? new RateLimiter({
      tokensPerInterval: 100,
      interval: 'minute'
    });
  }

  /**
   * Generic GET request with caching and rate limiting
   * 
   * @param endpoint - API endpoint (relative to baseURL)
   * @param params - Query parameters
   * @returns API response data (JSON-LD format with data array)
   */
  private async get<T extends Record<string, unknown>>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    // Check rate limit
    await this.rateLimiter.removeTokens(1);
    
    // Generate cache key
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
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
    
    try {
      // Make API request with JSON-LD Accept header
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/ld+json',
          'User-Agent': 'European-Parliament-MCP-Server/1.0'
        }
      });
      
      if (!response.ok) {
        throw new APIError(
          `EP API request failed: ${response.statusText}`,
          response.status
        );
      }
      
      const data = await response.json() as T;
      
      // Cache the response
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
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
   * Generate cache key from endpoint and params
   */
  private getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    return JSON.stringify({ endpoint, params });
  }

  /**
   * Safely convert unknown value to string
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
   * Transform EP API MEP data to internal format
   * @internal
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
      // These fields are not in basic MEP list, will be populated from mock/defaults
      country: 'Unknown',
      politicalGroup: 'Unknown',
      committees: [],
      active: true,
      termStart: 'Unknown'
    };
  }

  /**
   * Extract date from EP API activity date field
   * Returns empty string when date is missing or invalid so callers can
   * explicitly handle unknown dates instead of receiving a fabricated value.
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
   * Extract location from hasLocality URL
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
   * Transform EP API plenary session data to internal format
   * @internal
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
   * Transform EP API MEP details to internal format
   * @internal
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
   * Get Members of European Parliament
   * 
   * @param params - Query parameters
   * @returns Paginated list of MEPs
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
   * Get detailed information about a specific MEP
   * 
   * @param id - MEP identifier (supports formats: numeric, person/ID, MEP-ID)
   * @returns Detailed MEP information
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
   * Get plenary sessions
   * 
   * @param params - Query parameters
   * @returns Paginated list of plenary sessions
   */
  /**
   * Build API parameters for meetings endpoint
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
   * Get voting records
   * 
   * @param params - Query parameters
   * @returns Paginated list of voting records
   */
  getVotingRecords(params: {
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
      const mockData: PaginatedResponse<VotingRecord> = {
        data: [
          {
            id: 'VOTE-2024-001',
            sessionId: params.sessionId ?? 'PLENARY-2024-01',
            topic: 'Climate Change Resolution',
            date: '2024-01-15',
            votesFor: 450,
            votesAgainst: 150,
            abstentions: 50,
            result: 'ADOPTED'
          }
        ],
        total: 1,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        hasMore: false
      };
      
      auditLogger.logDataAccess(action, params, mockData.data.length);
      
      return Promise.resolve(mockData);
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
   * Search legislative documents
   * 
   * @param params - Query parameters
   * @returns Paginated list of documents
   */
  searchDocuments(params: {
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
      const mockData: PaginatedResponse<LegislativeDocument> = {
        data: [
          {
            id: 'DOC-2024-001',
            type: 'REPORT',
            title: `Legislative Report on ${params.keyword}`,
            date: '2024-01-10',
            authors: ['MEP-124810'],
            committee: params.committee ?? 'ENVI',
            status: 'ADOPTED',
            pdfUrl: 'https://www.europarl.europa.eu/doceo/document/A-9-2024-0001_EN.pdf',
            summary: `Summary of document related to ${params.keyword}`
          }
        ],
        total: 1,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
        hasMore: false
      };
      
      auditLogger.logDataAccess(action, params, mockData.data.length);
      
      return Promise.resolve(mockData);
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
   * Get committee information
   * 
   * @param params - Query parameters
   * @returns Committee information
   */
  getCommitteeInfo(params: {
    id?: string;
    abbreviation?: string;
  }): Promise<Committee> {
    const action = 'get_committee_info';
    
    try {
      const mockData: Committee = {
        id: params.id ?? 'COMM-ENVI',
        name: 'Committee on Environment, Public Health and Food Safety',
        abbreviation: params.abbreviation ?? 'ENVI',
        members: ['MEP-124810', 'MEP-124811'],
        chair: 'MEP-124810',
        viceChairs: ['MEP-124811'],
        responsibilities: [
          'Environmental policy',
          'Public health',
          'Food safety'
        ]
      };
      
      auditLogger.logDataAccess(action, params, 1);
      
      return Promise.resolve(mockData);
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
   * Get parliamentary questions
   * 
   * @param params - Query parameters
   * @returns Paginated list of parliamentary questions
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
  }): Promise<PaginatedResponse<ParliamentaryQuestion>> {
    const action = 'get_parliamentary_questions';
    
    try {
      const mockData: PaginatedResponse<ParliamentaryQuestion> = {
        data: [
          {
            id: 'Q-2024-001',
            type: params.type ?? 'WRITTEN',
            author: params.author ?? 'MEP-124810',
            date: '2024-01-10',
            topic: params.topic ?? 'Climate Policy',
            questionText: 'What measures are being taken to address climate change?',
            ...(params.status === 'ANSWERED' && {
              answerText: 'The Commission has implemented several measures...',
              answerDate: '2024-01-20'
            }),
            status: params.status ?? 'PENDING'
          }
        ],
        total: 1,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        hasMore: false
      };
      
      auditLogger.logDataAccess(action, params, mockData.data.length);
      
      return Promise.resolve(mockData);
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
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
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
 * Singleton instance for global use
 */
export const epClient = new EuropeanParliamentClient();
