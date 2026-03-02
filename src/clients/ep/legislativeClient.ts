/**
 * @fileoverview Legislative sub-client for European Parliament API
 *
 * Handles legislative procedures, procedure events, and adopted texts.
 *
 * @module clients/ep/legislativeClient
 */

import type {
  Procedure,
  AdoptedText,
  EPEvent,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import {
  transformProcedure as _transformProcedure,
  transformAdoptedText as _transformAdoptedText,
  transformEvent as _transformEvent,
} from './transformers.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';

// ─── Legislative Client ───────────────────────────────────────────────────────

/**
 * Sub-client for legislative procedures and adopted-texts EP API endpoints.
 *
 * @extends BaseEPClient
 * @public
 */
export class LegislativeClient extends BaseEPClient {
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    super(config, shared);
  }

  // ─── Transform helpers ────────────────────────────────────────────────────

  private transformProcedure(apiData: Record<string, unknown>): Procedure {
    return _transformProcedure(apiData);
  }

  private transformAdoptedText(apiData: Record<string, unknown>): AdoptedText {
    return _transformAdoptedText(apiData);
  }

  private transformEvent(apiData: Record<string, unknown>): EPEvent {
    return _transformEvent(apiData);
  }

  // ─── Public methods ───────────────────────────────────────────────────────

  /**
   * Returns legislative procedures.
   * **EP API Endpoint:** `GET /procedures`
   *
   * @param params - year, limit, offset
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
      limit,
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('procedures', apiParams);
    const items = Array.isArray(response.data) ? response.data : [];
    const procedures = items.map((item) => this.transformProcedure(item));
    return { data: procedures, total: procedures.length + offset, limit, offset, hasMore: procedures.length === limit };
  }

  /**
   * Returns a single procedure by ID.
   *
   * The EP API wraps single-item responses in a JSON-LD `data` array,
   * so this method extracts `data[0]` before transforming.
   *
   * **EP API Endpoint:** `GET /procedures/{process-id}`
   *
   * @param processId - Procedure **process-id** in `"YYYY-NNNN"` format (e.g. `"2024-0006"`).
   *   This is different from the human-readable `Procedure.id` (`"COD/YYYY/NNNN"`) or
   *   `Procedure.reference` (`"YYYY/NNNN(COD)"`) fields.
   * @throws {APIError} When the procedure is not found (404)
   */
  async getProcedureById(processId: string): Promise<Procedure> {
    if (processId.trim() === '') {
      throw new APIError('Procedure process-id is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(
      `procedures/${processId}`,
      { format: 'application/ld+json' }
    );
    const dataArray = response['data'];
    if (Array.isArray(dataArray) && dataArray.length > 0) {
      return this.transformProcedure(dataArray[0] as Record<string, unknown>);
    }
    return this.transformProcedure(response);
  }

  /**
   * Returns events linked to a procedure.
   * **EP API Endpoint:** `GET /procedures/{process-id}/events`
   *
   * @param processId - Procedure process ID
   * @param params - limit, offset
   */
  async getProcedureEvents(
    processId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<PaginatedResponse<EPEvent>> {
    if (processId.trim() === '') {
      throw new APIError('Procedure process-id is required', 400);
    }
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      `procedures/${processId}/events`,
      { format: 'application/ld+json', offset, limit }
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const events = items.map((item) => this.transformEvent(item));
    return { data: events, total: events.length + offset, limit, offset, hasMore: events.length === limit };
  }

  /**
   * Returns adopted texts.
   * **EP API Endpoint:** `GET /adopted-texts`
   *
   * @param params - year, limit, offset
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
      limit,
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('adopted-texts', apiParams);
    const items = Array.isArray(response.data) ? response.data : [];
    const texts = items.map((item) => this.transformAdoptedText(item));
    return { data: texts, total: texts.length + offset, limit, offset, hasMore: texts.length === limit };
  }

  /**
   * Retrieves recently updated procedures via the feed endpoint.
   * **EP API Endpoint:** `GET /procedures/feed`
   */
  async getProceduresFeed(params: {
    timeframe?: string;
    startDate?: string;
  } = {}): Promise<JSONLDResponse> {
    return this.get<JSONLDResponse>('procedures/feed', {
      format: 'application/ld+json',
      ...(params.timeframe !== undefined ? { timeframe: params.timeframe } : {}),
      ...(params.startDate !== undefined ? { 'start-date': params.startDate } : {}),
    });
  }

  /**
   * Retrieves recently updated adopted texts via the feed endpoint.
   * **EP API Endpoint:** `GET /adopted-texts/feed`
   */
  async getAdoptedTextsFeed(params: {
    timeframe?: string;
    startDate?: string;
  } = {}): Promise<JSONLDResponse> {
    return this.get<JSONLDResponse>('adopted-texts/feed', {
      format: 'application/ld+json',
      ...(params.timeframe !== undefined ? { timeframe: params.timeframe } : {}),
      ...(params.startDate !== undefined ? { 'start-date': params.startDate } : {}),
    });
  }

  /**
   * Returns a single event within a procedure by event ID.
   * **EP API Endpoint:** `GET /procedures/{process-id}/events/{event-id}`
   *
   * @param processId - Procedure process ID
   * @param eventId - Event identifier within the procedure
   */
  async getProcedureEventById(processId: string, eventId: string): Promise<Record<string, unknown>> {
    if (processId.trim() === '') {
      throw new APIError('Procedure process-id is required', 400);
    }
    if (eventId.trim() === '') {
      throw new APIError('Event ID is required', 400);
    }
    return this.get<Record<string, unknown>>(`procedures/${processId}/events/${eventId}`);
  }

  /**
   * Returns a single adopted text by document ID.
   * **EP API Endpoint:** `GET /adopted-texts/{doc-id}`
   */
  async getAdoptedTextById(docId: string): Promise<AdoptedText> {
    if (docId.trim() === '') throw new APIError('Document ID is required', 400);
    const response = await this.get<Record<string, unknown>>(
      `adopted-texts/${docId}`,
      { format: 'application/ld+json' }
    );
    return this.transformAdoptedText(response);
  }
}
