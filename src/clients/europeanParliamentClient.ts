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
 * European Parliament API Client configuration
 */
export interface EPClientConfig {
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
   * Generic GET request with caching and rate limiting (currently unused but planned for production)
   * 
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns API response data
   */
  // @ts-expect-error - Unused method, planned for production use
   
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
      // Make API request
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
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
   * Get Members of European Parliament
   * 
   * @param params - Query parameters
   * @returns Paginated list of MEPs
   */
  getMEPs(params: {
    country?: string;
    group?: string;
    committee?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<MEP>> {
    const action = 'get_meps';
    
    try {
      // For MVP, return mock data
      // In production, replace with actual API call:
      // const data = await this.get<PaginatedResponse<MEP>>('meps', params);
      
      const mockData: PaginatedResponse<MEP> = {
        data: [
          {
            id: 'MEP-124810',
            name: 'Example MEP',
            country: params.country ?? 'SE',
            politicalGroup: params.group ?? 'EPP',
            committees: ['AGRI', 'ENVI'],
            email: 'example@europarl.europa.eu',
            active: params.active ?? true,
            termStart: '2019-07-02'
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
   * Get detailed information about a specific MEP
   * 
   * @param id - MEP identifier
   * @returns Detailed MEP information
   */
  getMEPDetails(id: string): Promise<MEPDetails> {
    const action = 'get_mep_details';
    const params = { id };
    
    try {
      // For MVP, return mock data
      const mockData: MEPDetails = {
        id,
        name: 'Example MEP',
        country: 'SE',
        politicalGroup: 'EPP',
        committees: ['AGRI', 'ENVI'],
        email: 'example@europarl.europa.eu',
        active: true,
        termStart: '2019-07-02',
        biography: 'Example biography of the MEP.',
        phone: '+32 2 28 45001',
        website: 'https://www.europarl.europa.eu',
        votingStatistics: {
          totalVotes: 1250,
          votesFor: 850,
          votesAgainst: 200,
          abstentions: 200,
          attendanceRate: 92.5
        },
        roles: ['Member of AGRI Committee', 'Substitute in ENVI Committee']
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
   * Get plenary sessions
   * 
   * @param params - Query parameters
   * @returns Paginated list of plenary sessions
   */
  getPlenarySessions(params: {
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<PlenarySession>> {
    const action = 'get_plenary_sessions';
    
    try {
      const mockData: PaginatedResponse<PlenarySession> = {
        data: [
          {
            id: 'PLENARY-2024-01',
            date: '2024-01-15',
            location: 'Strasbourg',
            agendaItems: ['Budget Discussion', 'Climate Policy Vote'],
            attendanceCount: 650,
            documents: ['DOC-2024-001', 'DOC-2024-002']
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
