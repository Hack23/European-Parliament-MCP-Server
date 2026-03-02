/**
 * @fileoverview MEP sub-client for European Parliament API
 *
 * Handles all Member of European Parliament API calls:
 * current/incoming/outgoing/homonym MEP lists, MEP details,
 * and MEP financial declarations.
 *
 * **GDPR:** Personal data access (declarations) is audit-logged per Article 30.
 *
 * @module clients/ep/mepClient
 */

import { auditLogger } from '../../utils/auditLogger.js';
import type {
  MEP,
  MEPDetails,
  MEPDeclaration,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import {
  transformMEP as _transformMEP,
  transformMEPDetails as _transformMEPDetails,
  transformMEPDeclaration as _transformMEPDeclaration,
} from './transformers.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';

// ─── MEP Client ───────────────────────────────────────────────────────────────

/**
 * Sub-client for MEP-related European Parliament API endpoints.
 *
 * Handles all MEP data fetching: active lists, individual profiles,
 * incoming/outgoing/homonym lists, and financial declarations.
 *
 * @extends BaseEPClient
 * @public
 */
export class MEPClient extends BaseEPClient {
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    super(config, shared);
  }

  // ─── Transform helpers ────────────────────────────────────────────────────

  private transformMEP(apiData: Record<string, unknown>): MEP {
    return _transformMEP(apiData);
  }

  private transformMEPDetails(apiData: Record<string, unknown>): MEPDetails {
    return _transformMEPDetails(apiData);
  }

  private transformMEPDeclaration(apiData: Record<string, unknown>): MEPDeclaration {
    return _transformMEPDeclaration(apiData);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /**
   * Maps getMEPs params to EP API query parameters.
   * @private
   */
  private buildMEPParams(params: {
    country?: string;
    group?: string;
    committee?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Record<string, unknown> {
    const apiParams: Record<string, unknown> = {};
    if (params.limit !== undefined) apiParams['limit'] = params.limit;
    if (params.offset !== undefined) apiParams['offset'] = params.offset;
    if (params.country !== undefined) apiParams['country-code'] = params.country;
    if (params.group !== undefined) apiParams['political-group'] = params.group;
    if (params.committee !== undefined) apiParams['committee'] = params.committee;
    if (params.active !== undefined) apiParams['status'] = params.active ? 'current' : 'all';
    return apiParams;
  }

  // ─── Public methods ───────────────────────────────────────────────────────

  /**
   * Retrieves Members of the European Parliament with filtering and pagination.
   *
   * @param params - Country, group, committee, active status, limit, offset
   * @returns Paginated MEP list
   * @security Personal data access logged per GDPR Article 30
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
      const apiParams = this.buildMEPParams(params);

      const response = await this.get<JSONLDResponse>('meps', apiParams);
      const meps = response.data.map((item) => this.transformMEP(item));

      const result: PaginatedResponse<MEP> = {
        data: meps,
        total: (params.offset ?? 0) + meps.length,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        hasMore: meps.length >= (params.limit ?? 50),
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
   * Retrieves detailed information about a specific MEP.
   *
   * Supports numeric ID ("124936"), person URI ("person/124936"),
   * or MEP-prefixed ID ("MEP-124936").
   *
   * @param id - MEP identifier in any supported format
   * @returns Detailed MEP information
   * @security Personal data access logged per GDPR Article 30
   */
  async getMEPDetails(id: string): Promise<MEPDetails> {
    const action = 'get_mep_details';
    const params = { id };

    let normalizedId = id;
    if (id.startsWith('MEP-')) {
      normalizedId = id.substring(4);
    } else if (id.startsWith('person/')) {
      normalizedId = id.substring(7);
    }

    try {
      const response = await this.get<JSONLDResponse>(`meps/${normalizedId}`, {});
      if (response.data.length > 0) {
        const mepDetails = this.transformMEPDetails(response.data[0] ?? {});
        auditLogger.logDataAccess(action, params, 1);
        return mepDetails;
      }
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
   * Returns all currently active MEPs for today's date.
   * **EP API Endpoint:** `GET /meps/show-current`
   */
  async getCurrentMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('meps/show-current', {
      format: 'application/ld+json',
      offset,
      limit,
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const meps = items.map((item) => this.transformMEP(item));
    return { data: meps, total: meps.length + offset, limit, offset, hasMore: meps.length === limit };
  }

  /**
   * Returns all incoming MEPs for the current parliamentary term.
   * **EP API Endpoint:** `GET /meps/show-incoming`
   */
  async getIncomingMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('meps/show-incoming', {
      format: 'application/ld+json',
      offset,
      limit,
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const meps = items.map((item) => this.transformMEP(item));
    return { data: meps, total: meps.length + offset, limit, offset, hasMore: meps.length === limit };
  }

  /**
   * Returns all outgoing MEPs for the current parliamentary term.
   * **EP API Endpoint:** `GET /meps/show-outgoing`
   */
  async getOutgoingMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('meps/show-outgoing', {
      format: 'application/ld+json',
      offset,
      limit,
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const meps = items.map((item) => this.transformMEP(item));
    return { data: meps, total: meps.length + offset, limit, offset, hasMore: meps.length === limit };
  }

  /**
   * Returns homonym MEPs for the current parliamentary term.
   * **EP API Endpoint:** `GET /meps/show-homonyms`
   */
  async getHomonymMEPs(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<MEP>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>('meps/show-homonyms', {
      format: 'application/ld+json',
      offset,
      limit,
    });

    const items = Array.isArray(response.data) ? response.data : [];
    const meps = items.map((item) => this.transformMEP(item));
    return { data: meps, total: meps.length + offset, limit, offset, hasMore: meps.length === limit };
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
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const apiParams: Record<string, unknown> = {
      format: 'application/ld+json',
      offset,
      limit,
    };
    if (params.year !== undefined) apiParams['year'] = params.year;

    const response = await this.get<JSONLDResponse>('meps-declarations', apiParams);
    const items = Array.isArray(response.data) ? response.data : [];
    const declarations = items.map((item) => this.transformMEPDeclaration(item));

    auditLogger.logDataAccess('getMEPDeclarations', apiParams, declarations.length);
    return { data: declarations, total: declarations.length + offset, limit, offset, hasMore: declarations.length === limit };
  }

  /**
   * Retrieves recently updated MEPs via the feed endpoint.
   * **EP API Endpoint:** `GET /meps/feed`
   */
  async getMEPsFeed(params: {
    timeframe?: string;
    startDate?: string;
  } = {}): Promise<JSONLDResponse> {
    return this.get<JSONLDResponse>('meps/feed', {
      format: 'application/ld+json',
      ...(params.timeframe !== undefined ? { timeframe: params.timeframe } : {}),
      ...(params.startDate !== undefined ? { 'start-date': params.startDate } : {}),
    });
  }

  /**
   * Retrieves recently updated MEP declarations via the feed endpoint.
   * **EP API Endpoint:** `GET /meps-declarations/feed`
   */
  async getMEPDeclarationsFeed(params: {
    timeframe?: string;
    startDate?: string;
    workType?: string;
  } = {}): Promise<JSONLDResponse> {
    return this.get<JSONLDResponse>('meps-declarations/feed', {
      format: 'application/ld+json',
      ...(params.timeframe !== undefined ? { timeframe: params.timeframe } : {}),
      ...(params.startDate !== undefined ? { 'start-date': params.startDate } : {}),
      ...(params.workType !== undefined ? { 'work-type': params.workType } : {}),
    });
  }

  /**
   * Returns a single MEP declaration by document ID.
   * **EP API Endpoint:** `GET /meps-declarations/{doc-id}`
   * @gdpr Declarations contain personal financial data – access is audit-logged
   */
  async getMEPDeclarationById(docId: string): Promise<MEPDeclaration> {
    if (docId.trim() === '') {
      throw new APIError('Document ID is required', 400);
    }
    const response = await this.get<Record<string, unknown>>(
      `meps-declarations/${docId}`,
      { format: 'application/ld+json' }
    );
    const declaration = this.transformMEPDeclaration(response);
    auditLogger.logDataAccess('getMEPDeclarationById', { docId }, 1);
    return declaration;
  }
}
