/**
 * @fileoverview Voting sub-client for European Parliament API
 *
 * Handles voting records (roll-call votes) and plenary speeches.
 *
 * @module clients/ep/votingClient
 */

import { auditLogger, toErrorMessage } from '../../utils/auditLogger.js';
import type {
  VotingRecord,
  Speech,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import { toSafeString as _toSafeString } from './jsonLdHelpers.js';
import {
  transformVoteResult as _transformVoteResult,
  transformSpeech as _transformSpeech,
} from './transformers.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';

// ─── Voting Client ────────────────────────────────────────────────────────────

/**
 * Sub-client for voting records and speeches EP API endpoints.
 *
 * @extends BaseEPClient
 * @public
 */
export class VotingClient extends BaseEPClient {
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    super(config, shared);
  }

  // ─── Transform helpers ────────────────────────────────────────────────────

  private transformVoteResult(
    apiData: Record<string, unknown>,
    sessionId: string
  ): VotingRecord {
    return _transformVoteResult(apiData, sessionId);
  }

  private transformSpeech(apiData: Record<string, unknown>): Speech {
    return _transformSpeech(apiData);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Fetches vote results for a specific sitting/session.
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
      const meetingId =
        _toSafeString(meeting['activity_id']) ||
        _toSafeString(meeting['id']) ||
        '';
      if (meetingId === '') continue;

      try {
        const voteResponse = await this.get<JSONLDResponse>(
          `meetings/${meetingId}/vote-results`,
          { limit: recordLimit }
        );
        const transformed = voteResponse.data.map((item) =>
          this.transformVoteResult(item, meetingId)
        );
        records.push(...transformed);
      } catch (error: unknown) {
        // Some meetings may not have vote results – continue with degraded result
        auditLogger.logError('get_voting_records', { meetingId }, toErrorMessage(error));
      }

      if (records.length >= recordLimit) break;
    }

    return records;
  }

  /**
   * Applies client-side filters to voting records.
   * @private
   */
  private filterVotingRecords(
    records: VotingRecord[],
    params: { topic?: string; dateFrom?: string; dateTo?: string }
  ): VotingRecord[] {
    let filtered = records;
    if (params.topic !== undefined && params.topic !== '') {
      const topicLower = params.topic.toLowerCase();
      filtered = filtered.filter((r) =>
        r.topic.toLowerCase().includes(topicLower)
      );
    }
    if (params.dateFrom !== undefined && params.dateFrom !== '') {
      const fromDate = params.dateFrom;
      filtered = filtered.filter((r) => r.date >= fromDate);
    }
    if (params.dateTo !== undefined && params.dateTo !== '') {
      const toDate = params.dateTo;
      filtered = filtered.filter((r) => r.date <= toDate);
    }
    return filtered;
  }

  // ─── Public methods ───────────────────────────────────────────────────────

  /**
   * Retrieves voting records with filtering by session, topic, and date.
   *
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/vote-results`
   *
   * @param params - sessionId, topic, dateFrom, dateTo, limit, offset
   * @returns Paginated voting records list
   * @security Audit logged per GDPR Article 30
   */
  async getVotingRecords(params: {
    sessionId?: string;
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
        hasMore: offset + paginatedRecords.length < records.length,
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
   * Returns plenary speeches.
   * **EP API Endpoint:** `GET /speeches`
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
      limit,
    };
    if (params.dateFrom !== undefined) apiParams['date-from'] = params.dateFrom;
    if (params.dateTo !== undefined) apiParams['date-to'] = params.dateTo;

    const response = await this.get<JSONLDResponse>('speeches', apiParams);
    const items = Array.isArray(response.data) ? response.data : [];
    const speeches = items.map((item) => this.transformSpeech(item));
    return { data: speeches, total: speeches.length + offset, limit, offset, hasMore: speeches.length === limit };
  }

  /**
   * Returns a single speech by ID.
   * **EP API Endpoint:** `GET /speeches/{speech-id}`
   */
  async getSpeechById(speechId: string): Promise<Speech> {
    if (speechId.trim() === '') {
      throw new APIError('Speech ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(
      `speeches/${speechId}`,
      { format: 'application/ld+json' }
    );
    return this.transformSpeech(response);
  }
}
