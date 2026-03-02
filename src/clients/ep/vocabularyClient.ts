/**
 * @fileoverview Vocabulary sub-client for European Parliament API
 *
 * Handles EP controlled-vocabularies endpoints (list and single-item lookup).
 *
 * @module clients/ep/vocabularyClient
 */

import type { PaginatedResponse } from '../../types/europeanParliament.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';

// ─── Vocabulary Client ────────────────────────────────────────────────────────

/**
 * Sub-client for EP controlled-vocabularies endpoints.
 *
 * @extends BaseEPClient
 * @public
 */
export class VocabularyClient extends BaseEPClient {
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    super(config, shared);
  }

  // ─── Public methods ───────────────────────────────────────────────────────

  /**
   * Returns EP controlled vocabularies.
   * **EP API Endpoint:** `GET /controlled-vocabularies`
   *
   * @param params - limit, offset
   * @returns Raw API response with vocabulary items
   */
  async getControlledVocabularies(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Record<string, unknown>>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('controlled-vocabularies', {
      format: 'application/ld+json',
      offset,
      limit,
    });

    const items = Array.isArray(response.data) ? response.data : [];
    return { data: items, total: items.length + offset, limit, offset, hasMore: items.length === limit };
  }

  /**
   * Retrieves recently updated controlled vocabularies via the feed endpoint.
   * **EP API Endpoint:** `GET /controlled-vocabularies/feed`
   */
  async getControlledVocabulariesFeed(params: {
    timeframe?: string;
    startDate?: string;
  } = {}): Promise<JSONLDResponse> {
    return this.get<JSONLDResponse>('controlled-vocabularies/feed', {
      format: 'application/ld+json',
      ...(params.timeframe !== undefined ? { timeframe: params.timeframe } : {}),
      ...(params.startDate !== undefined ? { 'start-date': params.startDate } : {}),
    });
  }

  /**
   * Returns a single EP Controlled Vocabulary by ID.
   * **EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`
   *
   * @param vocId - Vocabulary identifier
   * @returns Single vocabulary entry
   */
  async getControlledVocabularyById(
    vocId: string
  ): Promise<Record<string, unknown>> {
    if (vocId.trim() === '') {
      throw new APIError('Vocabulary ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(
      `controlled-vocabularies/${vocId}`,
      { format: 'application/ld+json' }
    );
    return response;
  }
}
