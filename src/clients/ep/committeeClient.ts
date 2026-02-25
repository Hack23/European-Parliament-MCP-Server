/**
 * @fileoverview Committee sub-client for European Parliament API
 *
 * Handles committee (corporate body) information lookups including
 * direct lookup, list search, and current corporate bodies.
 *
 * @module clients/ep/committeeClient
 */

import { auditLogger } from '../../utils/auditLogger.js';
import type {
  Committee,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import {
  transformCorporateBody as _transformCorporateBody,
} from './index.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';

// ─── Committee Client ─────────────────────────────────────────────────────────

/**
 * Sub-client for committee/corporate-body EP API endpoints.
 *
 * @extends BaseEPClient
 * @public
 */
export class CommitteeClient extends BaseEPClient {
  constructor(config: EPClientConfig = {}, shared?: EPSharedResources) {
    super(config, shared);
  }

  // ─── Transform helpers ────────────────────────────────────────────────────

  private transformCorporateBody(apiData: Record<string, unknown>): Committee {
    return _transformCorporateBody(apiData);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Resolves a committee by trying direct lookup then list search.
   * @throws {APIError} If committee not found
   * @private
   */
  private async resolveCommittee(searchTerm: string): Promise<Committee> {
    if (searchTerm !== '') {
      const directResult = await this.fetchCommitteeDirectly(searchTerm);
      if (directResult !== null) return directResult;
    }

    const found = await this.searchCommitteeInList(searchTerm);
    if (found !== null) return found;

    throw new APIError(`Committee not found: ${searchTerm || 'unknown'}`, 404);
  }

  /**
   * Attempts a direct corporate-body lookup by ID.
   * @private
   */
  private async fetchCommitteeDirectly(bodyId: string): Promise<Committee | null> {
    try {
      const response = await this.get<JSONLDResponse>(`corporate-bodies/${bodyId}`, {});
      if (response.data.length > 0) {
        return this.transformCorporateBody(response.data[0] ?? {});
      }
    } catch {
      // Body not found by direct lookup
    }
    return null;
  }

  /**
   * Searches the corporate-bodies list for a matching committee.
   * @private
   */
  private async searchCommitteeInList(searchTerm: string): Promise<Committee | null> {
    const listParams: Record<string, unknown> = {
      'body-classification': 'COMMITTEE_PARLIAMENTARY_STANDING',
      limit: 50,
    };
    const response = await this.get<JSONLDResponse>('corporate-bodies', listParams);

    for (const item of response.data) {
      const committee = this.transformCorporateBody(item);
      if (committee.abbreviation === searchTerm || committee.id === searchTerm) {
        return committee;
      }
    }
    return null;
  }

  // ─── Public methods ───────────────────────────────────────────────────────

  /**
   * Retrieves committee (corporate body) information by ID or abbreviation.
   *
   * **EP API Endpoint:** `GET /corporate-bodies/{body-id}` or `GET /corporate-bodies`
   *
   * @param params - id or abbreviation of the committee
   * @returns Committee information
   * @security Audit logged per GDPR Article 30
   */
  async getCommitteeInfo(params: {
    id?: string;
    abbreviation?: string;
  }): Promise<Committee> {
    const action = 'get_committee_info';
    try {
      const searchTerm = params.abbreviation ?? params.id ?? '';
      const committee = await this.resolveCommittee(searchTerm);
      auditLogger.logDataAccess(action, params, 1);
      return committee;
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
   * Returns the list of all current EP Corporate Bodies for today's date.
   * **EP API Endpoint:** `GET /corporate-bodies/show-current`
   */
  async getCurrentCorporateBodies(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResponse<Committee>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      'corporate-bodies/show-current',
      { format: 'application/ld+json', offset, limit }
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const bodies = items.map((item) => this.transformCorporateBody(item));
    return { data: bodies, total: bodies.length + offset, limit, offset, hasMore: bodies.length === limit };
  }
}
