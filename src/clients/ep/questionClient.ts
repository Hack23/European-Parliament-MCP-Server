/**
 * @fileoverview Parliamentary Questions sub-client for European Parliament API
 *
 * Handles retrieval and filtering of parliamentary questions
 * (written, oral, interpellations, question time).
 *
 * @module clients/ep/questionClient
 */

import { auditLogger } from '../../utils/auditLogger.js';
import type {
  ParliamentaryQuestion,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import {
  transformParliamentaryQuestion as _transformParliamentaryQuestion,
} from './index.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';

// ─── Question Client ──────────────────────────────────────────────────────────

/**
 * Sub-client for parliamentary-questions EP API endpoints.
 *
 * @extends BaseEPClient
 * @public
 */
export class QuestionClient extends BaseEPClient {
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    super(config, shared);
  }

  // ─── Transform helpers ────────────────────────────────────────────────────

  private transformParliamentaryQuestion(
    apiData: Record<string, unknown>
  ): ParliamentaryQuestion {
    return _transformParliamentaryQuestion(apiData);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Builds EP API parameters for parliamentary question search.
   * @private
   */
  private buildQuestionSearchParams(params: {
    type?: 'WRITTEN' | 'ORAL';
    dateFrom?: string;
    limit?: number;
    offset?: number;
  }): Record<string, unknown> {
    const apiParams: Record<string, unknown> = {};
    if (params.limit !== undefined) apiParams['limit'] = params.limit;
    if (params.offset !== undefined) apiParams['offset'] = params.offset;
    if (params.type === 'WRITTEN') apiParams['work-type'] = 'QUESTION_WRITTEN';
    else if (params.type === 'ORAL') apiParams['work-type'] = 'QUESTION_ORAL';
    if (params.dateFrom !== undefined && params.dateFrom !== '') {
      apiParams['year'] = params.dateFrom.substring(0, 4);
    }
    return apiParams;
  }

  /**
   * Applies client-side filters to parliamentary questions.
   * @private
   */
  private filterQuestions(
    questions: ParliamentaryQuestion[],
    params: { author?: string; topic?: string; status?: 'PENDING' | 'ANSWERED'; dateTo?: string }
  ): ParliamentaryQuestion[] {
    let filtered = questions;
    if (params.author !== undefined && params.author !== '') {
      const authorLower = params.author.toLowerCase();
      filtered = filtered.filter((q) =>
        q.author.toLowerCase().includes(authorLower)
      );
    }
    if (params.topic !== undefined && params.topic !== '') {
      const topicLower = params.topic.toLowerCase();
      filtered = filtered.filter((q) =>
        q.topic.toLowerCase().includes(topicLower)
      );
    }
    if (params.status !== undefined) {
      filtered = filtered.filter((q) => q.status === params.status);
    }
    if (params.dateTo !== undefined && params.dateTo !== '') {
      const dateTo = params.dateTo;
      filtered = filtered.filter((q) => q.date <= dateTo);
    }
    return filtered;
  }

  // ─── Public methods ───────────────────────────────────────────────────────

  /**
   * Retrieves parliamentary questions with filtering by type, author, and status.
   *
   * **EP API Endpoint:** `GET /parliamentary-questions`
   *
   * @param params - type, author, topic, status, dateFrom, dateTo, limit, offset
   * @returns Paginated parliamentary questions list
   * @security Audit logged per GDPR Article 30
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
    const action = 'get_parliamentary_questions';
    try {
      const apiParams = this.buildQuestionSearchParams(params);
      const response = await this.get<JSONLDResponse>(
        'parliamentary-questions',
        apiParams
      );

      let questions = response.data.map((item) =>
        this.transformParliamentaryQuestion(item)
      );
      questions = this.filterQuestions(questions, params);

      const result: PaginatedResponse<ParliamentaryQuestion> = {
        data: questions,
        total: (params.offset ?? 0) + questions.length,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        hasMore: questions.length >= (params.limit ?? 50),
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
   * Returns a single parliamentary question by document ID.
   * **EP API Endpoint:** `GET /parliamentary-questions/{doc-id}`
   */
  async getParliamentaryQuestionById(docId: string): Promise<ParliamentaryQuestion> {
    if (docId.trim() === '') throw new APIError('Document ID is required', 400);
    const response = await this.get<Record<string, unknown>>(
      `parliamentary-questions/${docId}`,
      { format: 'application/ld+json' }
    );
    return this.transformParliamentaryQuestion(response);
  }
}
