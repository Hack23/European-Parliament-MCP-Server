/**
 * @fileoverview Plenary/Meetings sub-client for European Parliament API
 *
 * Handles plenary sessions, meeting activities, meeting decisions,
 * foreseen activities, EP events, and individual meeting/event lookups.
 *
 * @module clients/ep/plenaryClient
 */

import { auditLogger } from '../../utils/auditLogger.js';
import type {
  PlenarySession,
  EPEvent,
  MeetingActivity,
  LegislativeDocument,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import {
  transformPlenarySession as _transformPlenarySession,
  transformEvent as _transformEvent,
  transformMeetingActivity as _transformMeetingActivity,
  transformDocument as _transformDocument,
} from './transformers.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';
import { DEFAULT_TIMEOUTS } from '../../utils/timeout.js';

// ─── Plenary Client ───────────────────────────────────────────────────────────

/**
 * Sub-client for plenary sessions and meeting-related EP API endpoints.
 *
 * @extends BaseEPClient
 * @public
 */
export class PlenaryClient extends BaseEPClient {
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    super(config, shared);
  }

  // ─── Transform helpers ────────────────────────────────────────────────────

  private transformPlenarySession(apiData: Record<string, unknown>): PlenarySession {
    return _transformPlenarySession(apiData);
  }

  private transformEvent(apiData: Record<string, unknown>): EPEvent {
    return _transformEvent(apiData);
  }

  private transformMeetingActivity(apiData: Record<string, unknown>): MeetingActivity {
    return _transformMeetingActivity(apiData);
  }

  private transformDocument(apiData: Record<string, unknown>): LegislativeDocument {
    return _transformDocument(apiData);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Maps internal params to EP API query parameters for meetings.
   *
   * The EP API `/meetings` endpoint supports `year` for filtering by
   * calendar year.  The `date-from` / `date-to` parameters are also
   * forwarded when present (useful for sub-year ranges).
   * @private
   */
  private buildMeetingsAPIParams(params: {
    year?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Record<string, unknown> {
    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
    };
    if (params.limit !== undefined) apiParams['limit'] = params.limit;
    if (params.offset !== undefined) apiParams['offset'] = params.offset;
    if (params.year !== undefined) apiParams['year'] = params.year;
    if (params.dateFrom !== undefined) apiParams['date-from'] = params.dateFrom;
    if (params.dateTo !== undefined) apiParams['date-to'] = params.dateTo;
    return apiParams;
  }

  // ─── Public methods ───────────────────────────────────────────────────────

  /**
   * Retrieves plenary sessions with year/date and location filtering.
   *
   * **EP API Endpoint:** `GET /meetings`
   *
   * The EP API supports filtering by `year` (recommended for annual counts).
   * `dateFrom` / `dateTo` are also forwarded but may be ignored by the API
   * for certain endpoints.
   *
   * @param params - year, dateFrom, dateTo, location, limit, offset
   * @returns Paginated plenary session list
   */
  async getPlenarySessions(params: {
    year?: number;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<PlenarySession>> {
    const action = 'get_plenary_sessions';
    try {
      const limit = params.limit ?? 50;
      const offset = params.offset ?? 0;

      const apiParams = this.buildMeetingsAPIParams(params);
      // Always apply the resolved limit/offset so the server page size matches
      // the pagination metadata we return.
      apiParams['limit'] = limit;
      apiParams['offset'] = offset;

      const response = await this.get<JSONLDResponse>('meetings', apiParams);
      const pageSize = response.data.length;
      let sessions = response.data.map((item) => this.transformPlenarySession(item));

      if (params.location !== undefined && params.location !== '') {
        const locationLower = params.location.toLowerCase();
        sessions = sessions.filter((s) => s.location.toLowerCase().includes(locationLower));
      }
      const hasMore = pageSize === limit;
      const result: PaginatedResponse<PlenarySession> = {
        data: sessions,
        total: offset + pageSize + (hasMore ? 1 : 0),
        limit,
        offset,
        hasMore,
      };

      auditLogger.logDataAccess(action, params, result.data.length);
      return result;
    } catch (error: unknown) {
      auditLogger.logError(
        action,
        params,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Returns activities linked to a specific meeting (plenary sitting).
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/activities`
   */
  async getMeetingActivities(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<MeetingActivity>> {
    if (sittingId.trim() === '') {
      throw new APIError('Meeting sitting-id is required', 400);
    }
    if (/[.\\?#]/.test(sittingId)) {
      throw new APIError('Meeting sitting-id contains invalid characters', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      `meetings/${sittingId}/activities`,
      { format: 'application/ld+json', offset, limit }
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const activities = items.map((item) => this.transformMeetingActivity(item));
    const hasMore = activities.length === limit;
    return { data: activities, total: activities.length + offset + (hasMore ? 1 : 0), limit, offset, hasMore };
  }

  /**
   * Returns decisions made in a specific meeting (plenary sitting).
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/decisions`
   */
  async getMeetingDecisions(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    if (sittingId.trim() === '') {
      throw new APIError('Meeting sitting-id is required', 400);
    }
    if (/[.\\?#]/.test(sittingId)) {
      throw new APIError('Meeting sitting-id contains invalid characters', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      `meetings/${sittingId}/decisions`,
      { format: 'application/ld+json', offset, limit }
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const decisions = items.map((item) => this.transformDocument(item));
    const hasMore = decisions.length === limit;
    return { data: decisions, total: decisions.length + offset + (hasMore ? 1 : 0), limit, offset, hasMore };
  }

  /**
   * Returns foreseen activities linked to a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/foreseen-activities`
   */
  async getMeetingForeseenActivities(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<MeetingActivity>> {
    if (sittingId.trim() === '') {
      throw new APIError('Meeting sitting-id is required', 400);
    }
    if (/[.\\?#]/.test(sittingId)) {
      throw new APIError('Meeting sitting-id contains invalid characters', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      `meetings/${sittingId}/foreseen-activities`,
      { format: 'application/ld+json', offset, limit }
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const activities = items.map((item) => this.transformMeetingActivity(item));
    const hasMore = activities.length === limit;
    return { data: activities, total: activities.length + offset + (hasMore ? 1 : 0), limit, offset, hasMore };
  }

  /**
   * Returns plenary session documents for a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-documents`
   */
  async getMeetingPlenarySessionDocuments(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    if (sittingId.trim() === '') {
      throw new APIError('Meeting sitting-id is required', 400);
    }
    if (/[.\\?#]/.test(sittingId)) {
      throw new APIError('Meeting sitting-id contains invalid characters', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      `meetings/${sittingId}/plenary-session-documents`,
      { format: 'application/ld+json', offset, limit }
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map((item) => this.transformDocument(item));
    const hasMore = docs.length === limit;
    return { data: docs, total: docs.length + offset + (hasMore ? 1 : 0), limit, offset, hasMore };
  }

  /**
   * Returns plenary session document items for a specific meeting.
   * **EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-document-items`
   */
  async getMeetingPlenarySessionDocumentItems(
    sittingId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<LegislativeDocument>> {
    if (sittingId.trim() === '') {
      throw new APIError('Meeting sitting-id is required', 400);
    }
    if (/[.\\?#]/.test(sittingId)) {
      throw new APIError('Meeting sitting-id contains invalid characters', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      `meetings/${sittingId}/plenary-session-document-items`,
      { format: 'application/ld+json', offset, limit }
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map((item) => this.transformDocument(item));
    const hasMore = docs.length === limit;
    return { data: docs, total: docs.length + offset + (hasMore ? 1 : 0), limit, offset, hasMore };
  }

  /**
   * Returns a single EP meeting by ID.
   * **EP API Endpoint:** `GET /meetings/{event-id}`
   */
  async getMeetingById(eventId: string): Promise<PlenarySession> {
    if (eventId.trim() === '') {
      throw new APIError('Meeting event ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(
      `meetings/${eventId}`,
      { format: 'application/ld+json' }
    );
    return this.transformPlenarySession(response);
  }

  /**
   * Returns EP events (hearings, conferences, etc.).
   * **EP API Endpoint:** `GET /events`
   *
   * The EP API supports filtering by `year` (recommended for annual counts).
   */
  async getEvents(params: {
    year?: number;
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
      limit,
    };
    if (params.year !== undefined) apiParams['year'] = params.year;
    if (params.dateFrom !== undefined) apiParams['date-from'] = params.dateFrom;
    if (params.dateTo !== undefined) apiParams['date-to'] = params.dateTo;

    const response = await this.get<JSONLDResponse>('events', apiParams);
    const items = Array.isArray(response.data) ? response.data : [];
    const events = items.map((item) => this.transformEvent(item));
    const hasMore = events.length === limit;
    return { data: events, total: events.length + offset + (hasMore ? 1 : 0), limit, offset, hasMore };
  }

  /**
   * Retrieves recently updated events via the feed endpoint.
   * **EP API Endpoint:** `GET /events/feed`
   *
   * **Note:** The EP API `events/feed` endpoint is significantly slower
   * than other feed endpoints — it typically takes 30–50 s even for `one-week`
   * and 120+ seconds for `one-month`.  An extended minimum timeout of 120 s
   * is always applied.
   */
  async getEventsFeed(params: {
    timeframe?: string;
    startDate?: string;
    activityType?: string;
  } = {}): Promise<JSONLDResponse> {
    return this.get<JSONLDResponse>('events/feed', {
      format: 'application/ld+json',
      ...(params.timeframe !== undefined ? { timeframe: params.timeframe } : {}),
      ...(params.startDate !== undefined ? { 'start-date': params.startDate } : {}),
      ...(params.activityType !== undefined ? { 'activity-type': params.activityType } : {}),
    }, DEFAULT_TIMEOUTS.EP_FEED_SLOW_REQUEST_MS);
  }

  /**
   * Returns a single EP event by ID.
   * **EP API Endpoint:** `GET /events/{event-id}`
   */
  async getEventById(eventId: string): Promise<EPEvent> {
    if (eventId.trim() === '') {
      throw new APIError('Event ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(
      `events/${eventId}`,
      { format: 'application/ld+json' }
    );
    return this.transformEvent(response);
  }
}
