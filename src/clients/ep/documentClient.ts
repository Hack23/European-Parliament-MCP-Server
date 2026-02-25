/**
 * @fileoverview Document sub-client for European Parliament API
 *
 * Handles all document-related API calls: plenary documents,
 * committee documents, plenary session documents, external documents,
 * and the generic documents search endpoint.
 *
 * @module clients/ep/documentClient
 */

import { auditLogger } from '../../utils/auditLogger.js';
import type {
  LegislativeDocument,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import {
  transformDocument as _transformDocument,
} from './index.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';

// ─── Document Client ──────────────────────────────────────────────────────────

/**
 * Sub-client for document EP API endpoints.
 *
 * @extends BaseEPClient
 * @public
 */
export class DocumentClient extends BaseEPClient {
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    super(config, shared);
  }

  // ─── Transform helpers ────────────────────────────────────────────────────

  private transformDocument(apiData: Record<string, unknown>): LegislativeDocument {
    return _transformDocument(apiData);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Builds EP API parameters for document search.
   * @private
   */
  private buildDocumentSearchParams(params: {
    documentType?: string;
    dateFrom?: string;
    limit?: number;
    offset?: number;
  }): Record<string, unknown> {
    const apiParams: Record<string, unknown> = {};
    if (params.limit !== undefined) apiParams['limit'] = params.limit;
    if (params.offset !== undefined) apiParams['offset'] = params.offset;
    if (params.documentType !== undefined && params.documentType !== '') {
      const typeMap: Record<string, string> = {
        REPORT: 'REPORT_PLENARY',
        AMENDMENT: 'AMENDMENT_LIST',
        RESOLUTION: 'RESOLUTION_MOTION',
        ADOPTED: 'TEXT_ADOPTED',
      };
      apiParams['work-type'] =
        typeMap[params.documentType.toUpperCase()] ?? params.documentType;
    }
    if (params.dateFrom !== undefined && params.dateFrom !== '') {
      apiParams['year'] = params.dateFrom.substring(0, 4);
    }
    return apiParams;
  }

  /**
   * Applies client-side keyword, committee, and date-range filters to documents.
   * @private
   */
  private filterDocuments(
    documents: LegislativeDocument[],
    params: { keyword?: string; committee?: string; dateTo?: string }
  ): LegislativeDocument[] {
    let filtered = documents;
    if (params.keyword !== undefined && params.keyword !== '') {
      const keywordLower = params.keyword.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(keywordLower) ||
          d.summary?.toLowerCase().includes(keywordLower) === true ||
          d.id.toLowerCase().includes(keywordLower)
      );
    }
    if (params.committee !== undefined && params.committee !== '') {
      const committeeLower = params.committee.toLowerCase();
      filtered = filtered.filter(
        (d) => d.committee?.toLowerCase().includes(committeeLower) === true
      );
    }
    if (params.dateTo !== undefined && params.dateTo !== '') {
      const dateTo = params.dateTo;
      filtered = filtered.filter((d) => d.date <= dateTo);
    }
    return filtered;
  }

  // ─── Public methods ───────────────────────────────────────────────────────

  /**
   * Searches legislative documents by keyword, type, date, and committee.
   *
   * **EP API Endpoint:** `GET /documents`
   *
   * @param params - keyword, documentType, dateFrom, dateTo, committee, limit, offset
   * @returns Paginated legislative documents list
   * @security Audit logged per GDPR Article 30
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
    const action = 'search_documents';
    try {
      if (params.keyword.trim() === '') {
        throw new APIError('keyword is required and must not be empty', 400);
      }
      const requestedLimit = params.limit ?? 20;
      const currentOffset = params.offset ?? 0;

      const apiParams = this.buildDocumentSearchParams(params);
      const response = await this.get<JSONLDResponse>('documents', apiParams);
      const pageSize = response.data.length;

      let documents = response.data.map((item) => this.transformDocument(item));
      documents = this.filterDocuments(documents, params);

      const result: PaginatedResponse<LegislativeDocument> = {
        data: documents,
        // total/hasMore based on unfiltered server page to account for client-side filters
        total: currentOffset + pageSize,
        limit: requestedLimit,
        offset: currentOffset,
        hasMore: pageSize === requestedLimit,
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
   * Returns plenary documents.
   * **EP API Endpoint:** `GET /plenary-documents`
   */
  async getPlenaryDocuments(params: {
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit,
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('plenary-documents', apiParams);
    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map((item) => this.transformDocument(item));
    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
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
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit,
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('committee-documents', apiParams);
    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map((item) => this.transformDocument(item));
    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
  }

  /**
   * Returns plenary session documents.
   * **EP API Endpoint:** `GET /plenary-session-documents`
   */
  async getPlenarySessionDocuments(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('plenary-session-documents', {
      format: 'application/ld+json',
      offset,
      limit,
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map((item) => this.transformDocument(item));
    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
  }

  /**
   * Returns all Plenary Session Document Items.
   * **EP API Endpoint:** `GET /plenary-session-documents-items`
   */
  async getPlenarySessionDocumentItems(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<LegislativeDocument>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      'plenary-session-documents-items',
      { format: 'application/ld+json', offset, limit }
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map((item) => this.transformDocument(item));
    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
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
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit,
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('external-documents', apiParams);
    const items = Array.isArray(response.data) ? response.data : [];
    const docs = items.map((item) => this.transformDocument(item));
    return { data: docs, total: docs.length + offset, limit, offset, hasMore: docs.length === limit };
  }

  /**
   * Returns a single document by ID.
   * **EP API Endpoint:** `GET /documents/{doc-id}`
   */
  async getDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') throw new APIError('Document ID is required', 400);
    const response = await this.get<Record<string, unknown>>(
      `documents/${docId}`,
      { format: 'application/ld+json' }
    );
    return this.transformDocument(response);
  }

  /**
   * Returns a single plenary document by ID.
   * **EP API Endpoint:** `GET /plenary-documents/{doc-id}`
   */
  async getPlenaryDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') throw new APIError('Document ID is required', 400);
    const response = await this.get<Record<string, unknown>>(
      `plenary-documents/${docId}`,
      { format: 'application/ld+json' }
    );
    return this.transformDocument(response);
  }

  /**
   * Returns a single plenary session document by ID.
   * **EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`
   */
  async getPlenarySessionDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') throw new APIError('Document ID is required', 400);
    const response = await this.get<Record<string, unknown>>(
      `plenary-session-documents/${docId}`,
      { format: 'application/ld+json' }
    );
    return this.transformDocument(response);
  }

  /**
   * Returns a single committee document by ID.
   * **EP API Endpoint:** `GET /committee-documents/{doc-id}`
   */
  async getCommitteeDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') throw new APIError('Document ID is required', 400);
    const response = await this.get<Record<string, unknown>>(
      `committee-documents/${docId}`,
      { format: 'application/ld+json' }
    );
    return this.transformDocument(response);
  }

  /**
   * Returns a single external document by ID.
   * **EP API Endpoint:** `GET /external-documents/{doc-id}`
   */
  async getExternalDocumentById(docId: string): Promise<LegislativeDocument> {
    if (docId.trim() === '') throw new APIError('Document ID is required', 400);
    const response = await this.get<Record<string, unknown>>(
      `external-documents/${docId}`,
      { format: 'application/ld+json' }
    );
    return this.transformDocument(response);
  }
}
