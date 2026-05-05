/**
 * @fileoverview DOCEO client for fetching EP plenary vote XML documents
 *
 * Fetches and parses XML documents from the European Parliament's DOCEO system
 * which provides roll-call votes (RCV) and vote results (VOT) for plenary sessions.
 *
 * Source: https://www.europarl.europa.eu/plenary/en/votes.html
 *
 * @module clients/ep/doceoClient
 * @security SSRF prevention via URL validation, input sanitization
 */

import { fetch } from 'undici';
import { auditLogger, toErrorMessage } from '../../utils/auditLogger.js';
import { USER_AGENT } from '../../config.js';
import {
  parseRcvXml,
  parseVotXml,
  rcvToLatestVotes,
  votToLatestVotes,
  buildDoceoUrl,
  getPlenaryWeekDates,
  CURRENT_PARLIAMENTARY_TERM,
  type LatestVoteRecord,
  type RcvVoteResult,
  type VotVoteResult,
} from './doceoXmlParser.js';

/** Timeout for DOCEO XML fetches (30 seconds) */
const DOCEO_TIMEOUT_MS = 30_000;

/** Maximum response size for XML documents (5 MiB) */
const MAX_XML_RESPONSE_BYTES = 5_242_880;

/**
 * Parameters for fetching latest votes from DOCEO.
 */
export interface GetLatestVotesParams {
  /** Specific date (YYYY-MM-DD) to fetch votes for */
  date?: string | undefined;
  /** Start of plenary week (Monday, YYYY-MM-DD). If omitted, uses most recent Monday. */
  weekStart?: string | undefined;
  /** Parliamentary term number (defaults to 10) */
  term?: number | undefined;
  /** Whether to include individual MEP vote positions from RCV data */
  includeIndividualVotes?: boolean | undefined;
  /** Maximum number of vote records to return */
  limit?: number | undefined;
  /** Pagination offset */
  offset?: number | undefined;
}

/**
 * Response structure for latest votes.
 */
export interface LatestVotesResponse {
  /** Vote records */
  data: LatestVoteRecord[];
  /** Total count of available records */
  total: number;
  /** Dates that were successfully fetched */
  datesAvailable: string[];
  /** Dates that returned errors (document not yet published) */
  datesUnavailable: string[];
  /** Data source metadata */
  source: {
    type: 'DOCEO_XML';
    term: number;
    urls: string[];
  };
  /** Pagination */
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Client for fetching plenary vote data from the EP DOCEO XML endpoint.
 *
 * This provides more recent vote data than the EP Open Data API, which has
 * a delay of several weeks for publishing roll-call vote results.
 *
 * @security
 * - URL construction is validated (HTTPS only, known host)
 * - XML parsing uses regex-based extraction (no eval/dynamic code execution)
 * - Response size limited to prevent memory exhaustion
 * - All access is audit-logged
 */
export class DoceoClient {
  private readonly term: number;

  constructor(term: number = CURRENT_PARLIAMENTARY_TERM) {
    this.term = term;
  }

  /**
   * Fetch a single XML document from DOCEO.
   *
   * @param url - Full URL to the XML document
   * @returns Raw XML string, or null if document not available
   */
  private async fetchXml(url: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => { controller.abort(); }, DOCEO_TIMEOUT_MS);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/xml, text/xml',
          'User-Agent': USER_AGENT,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        // 404 is expected for dates without plenary sessions
        if (response.status === 404) {
          await response.body?.cancel();
          return null;
        }
        await response.body?.cancel();
        auditLogger.logError('doceo_fetch', { url }, `HTTP ${String(response.status)}`);
        return null;
      }

      // Check content length
      const contentLength = response.headers.get('content-length');
      if (contentLength !== null && parseInt(contentLength, 10) > MAX_XML_RESPONSE_BYTES) {
        await response.body?.cancel();
        auditLogger.logError('doceo_fetch', { url }, 'Response too large');
        return null;
      }

      const text = await response.text();
      if (text.length > MAX_XML_RESPONSE_BYTES) {
        auditLogger.logError('doceo_fetch', { url }, 'Response body too large');
        return null;
      }

      return text;
    } catch (error: unknown) {
      auditLogger.logError('doceo_fetch', { url }, toErrorMessage(error));
      return null;
    }
  }

  /**
   * Fetch roll-call vote data for a specific date.
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns Parsed RCV results, or empty array if unavailable
   */
  async fetchRcvForDate(date: string): Promise<RcvVoteResult[]> {
    const url = buildDoceoUrl(date, 'RCV', this.term);
    const xml = await this.fetchXml(url);
    if (xml === null) return [];
    return parseRcvXml(xml);
  }

  /**
   * Fetch aggregate vote results for a specific date.
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns Parsed VOT results, or empty array if unavailable
   */
  async fetchVotForDate(date: string): Promise<VotVoteResult[]> {
    const url = buildDoceoUrl(date, 'VOT', this.term);
    const xml = await this.fetchXml(url);
    if (xml === null) return [];
    return parseVotXml(xml);
  }

  /**
   * Fetch votes for a single date, trying RCV first then VOT.
   * @private
   */
  private async fetchVotesForDate(
    date: string,
    term: number,
    includeIndividual: boolean
  ): Promise<{ votes: LatestVoteRecord[]; url: string } | null> {
    const rcvUrl = buildDoceoUrl(date, 'RCV', term);

    // Try RCV first (richer data with individual MEP votes)
    const rcvResults = await this.fetchRcvForDate(date);
    if (rcvResults.length > 0) {
      let records = rcvToLatestVotes(rcvResults, date, term, rcvUrl);
      if (!includeIndividual) {
        records = records.map(({ mepVotes: _, ...rest }) => rest);
      }
      return { votes: records, url: rcvUrl };
    }

    // Fall back to VOT (aggregate only)
    const votUrl = buildDoceoUrl(date, 'VOT', term);
    const votResults = await this.fetchVotForDate(date);
    if (votResults.length > 0) {
      const records = votToLatestVotes(votResults, date, term, votUrl);
      return { votes: records, url: votUrl };
    }

    return null;
  }

  /**
   * Get the latest votes from DOCEO XML sources.
   *
   * Attempts to fetch both RCV (individual MEP votes) and VOT (aggregate results)
   * for each day in the plenary week. RCV data is preferred as it includes
   * individual MEP positions and political group breakdowns.
   *
   * @param params - Query parameters
   * @returns Latest votes response with available data
   *
   * @security Audit-logged per GDPR Article 30
   */
  /**
   * Determine which dates to query based on params.
   * @private
   */
  private resolveDates(params: GetLatestVotesParams): string[] {
    if (params.date !== undefined && params.date !== '') {
      return [params.date];
    }
    return getPlenaryWeekDates(params.weekStart);
  }

  /**
   * Get the latest votes from DOCEO XML sources.
   *
   * Attempts to fetch both RCV (individual MEP votes) and VOT (aggregate results)
   * for each day in the plenary week. RCV data is preferred as it includes
   * individual MEP positions and political group breakdowns.
   *
   * @param params - Query parameters
   * @returns Latest votes response with available data
   *
   * @security Audit-logged per GDPR Article 30
   */
  async getLatestVotes(params: GetLatestVotesParams = {}): Promise<LatestVotesResponse> {
    const action = 'get_latest_votes';
    const term = params.term ?? this.term;
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const includeIndividual = params.includeIndividualVotes ?? true;
    const dates = this.resolveDates(params);

    try {
      const allVotes: LatestVoteRecord[] = [];
      const datesAvailable: string[] = [];
      const datesUnavailable: string[] = [];
      const urls: string[] = [];

      for (const date of dates) {
        const result = await this.fetchVotesForDate(date, term, includeIndividual);
        if (result !== null) {
          allVotes.push(...result.votes);
          datesAvailable.push(date);
          urls.push(result.url);
        } else {
          datesUnavailable.push(date);
        }
      }

      const total = allVotes.length;
      const paginatedVotes = allVotes.slice(offset, offset + limit);

      const response: LatestVotesResponse = {
        data: paginatedVotes,
        total,
        datesAvailable,
        datesUnavailable,
        source: { type: 'DOCEO_XML', term, urls },
        limit,
        offset,
        hasMore: offset + paginatedVotes.length < total,
      };

      auditLogger.logDataAccess(action, params as Record<string, unknown>, response.data.length);
      return response;
    } catch (error: unknown) {
      auditLogger.logError(action, params as Record<string, unknown>, toErrorMessage(error));
      throw error;
    }
  }
}

/** Singleton DOCEO client instance */
export const doceoClient = new DoceoClient();
