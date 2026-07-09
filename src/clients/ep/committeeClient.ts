/**
 * @fileoverview Committee sub-client for European Parliament API
 *
 * Handles committee (corporate body) information lookups including
 * direct lookup, list search, and current corporate bodies.
 *
 * @module clients/ep/committeeClient
 */

import { auditLogger, toErrorMessage } from '../../utils/auditLogger.js';
import type {
  Committee,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import {
  transformCorporateBody as _transformCorporateBody,
} from './transformers.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';
import { DEFAULT_TIMEOUTS } from '../../utils/timeout.js';

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

  private transformCorporateBody(apiData: Record<string, unknown>): Committee {
    return _transformCorporateBody(apiData);
  }

  private normalizeMEPId(mepId: unknown): string {
    if (typeof mepId !== 'string') return '';
    const trimmed = mepId.trim();
    if (trimmed === '') return '';
    if (trimmed.startsWith('MEP-')) return `person/${trimmed.substring(4)}`;
    if (trimmed.startsWith('person/')) return trimmed;
    return trimmed.includes('/') ? trimmed : `person/${trimmed}`;
  }

  private normalizeOrganizationId(value: string): string {
    const trimmed = value.trim();
    if (trimmed === '') return '';
    return trimmed.startsWith('org/') ? trimmed.substring(4) : trimmed;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getCommitteeFilterValue(committee: Committee): string {
    const abbreviation = this.normalizeOrganizationId(committee.abbreviation);
    if (abbreviation !== '' && /[A-Za-z]/.test(abbreviation)) {
      return abbreviation;
    }
    const id = this.normalizeOrganizationId(committee.id);
    if (id !== '' && /[A-Za-z]/.test(id)) {
      return id;
    }
    return '';
  }

  private collectCommitteeOrganizationCandidates(
    apiData: Record<string, unknown>,
    committeeAbbreviation: string,
  ): string[] {
    const candidates = new Set<string>();
    const addCandidate = (value: unknown): void => {
      if (typeof value !== 'string') return;
      const trimmed = value.trim();
      if (trimmed === '') return;
      const normalized = this.normalizeOrganizationId(trimmed);
      if (normalized !== '') candidates.add(normalized);
    };

    addCandidate(apiData['body_id'] ?? apiData['identifier'] ?? apiData['id']);
    addCandidate(apiData['hasCurrentVersion']);
    if (Array.isArray(apiData['inverse_isVersionOf'])) {
      for (const item of apiData['inverse_isVersionOf']) {
        addCandidate(item);
      }
    }
    if (committeeAbbreviation !== '') addCandidate(committeeAbbreviation);

    return [...candidates];
  }

  private async enrichCommitteeMembership(
    committee: Committee,
    apiData: Record<string, unknown>,
    abortSignal?: AbortSignal,
  ): Promise<Committee> {
    const filterValue = this.getCommitteeFilterValue(committee);
    if (filterValue === '') return committee;

    const organizationCandidates = this.collectCommitteeOrganizationCandidates(apiData, committee.abbreviation);

    try {
      const membershipSummary = await this.loadCommitteeMemberships(
        filterValue,
        organizationCandidates,
        abortSignal,
      );
      return this.applyCommitteeMemberships(committee, membershipSummary);
    } catch {
      return committee;
    }
  }

  private async loadCommitteeMemberships(
    filterValue: string,
    organizationCandidates: string[],
    abortSignal?: AbortSignal,
  ): Promise<{ members: string[]; chair?: string; viceChairs: string[] }> {
    const memberIds = new Set<string>();
    const viceChairIds = new Set<string>();
    let chairId: string | undefined;

    const response = await this.get<JSONLDResponse>('meps', {
      format: 'application/ld+json',
      committee: filterValue,
      status: 'current',
      limit: 100,
    }, undefined, abortSignal);
    const meps = Array.isArray(response.data) ? response.data : [];

    for (const mep of meps) {
      if (!this.isRecord(mep)) continue;

      const membershipSummary = await this.getMEPMembershipSummary(
        mep,
        organizationCandidates,
        abortSignal,
      );
      if (membershipSummary.mepId === '') continue;
      if (membershipSummary.member) memberIds.add(membershipSummary.mepId);
      if (membershipSummary.chair) chairId = membershipSummary.mepId;
      if (membershipSummary.viceChair) viceChairIds.add(membershipSummary.mepId);
    }

    const membershipSummary: { members: string[]; chair?: string; viceChairs: string[] } = {
      members: [...memberIds],
      viceChairs: [...viceChairIds],
    };
    if (chairId !== undefined) {
      membershipSummary.chair = chairId;
    }

    return membershipSummary;
  }

  private async getMEPMembershipSummary(
    mep: Record<string, unknown>,
    organizationCandidates: string[],
    abortSignal?: AbortSignal,
  ): Promise<{ mepId: string; member: boolean; chair: boolean; viceChair: boolean }> {
    const mepId = this.normalizeMEPId(mep['id'] ?? mep['identifier'] ?? mep['@id']);
    if (mepId === '') {
      return { mepId: '', member: false, chair: false, viceChair: false };
    }

    const inlineMembershipSummary = this.extractMembershipSummary(mep, organizationCandidates);
    if (inlineMembershipSummary.member || inlineMembershipSummary.chair || inlineMembershipSummary.viceChair) {
      return { mepId, ...inlineMembershipSummary };
    }

    try {
      const mepDetailsResponse = await this.get<JSONLDResponse>(`meps/${mepId.substring(7)}`, {
        format: 'application/ld+json',
      }, undefined, abortSignal);
      const details = Array.isArray(mepDetailsResponse.data) ? mepDetailsResponse.data[0] : undefined;
      if (!this.isRecord(details)) {
        return { mepId, member: false, chair: false, viceChair: false };
      }

      return {
        mepId,
        ...this.extractMembershipSummary(details, organizationCandidates),
      };
    } catch {
      return { mepId, member: false, chair: false, viceChair: false };
    }
  }

  private extractMembershipSummary(
    details: Record<string, unknown>,
    organizationCandidates: string[],
  ): { member: boolean; chair: boolean; viceChair: boolean } {
    const memberships = Array.isArray(details['hasMembership']) ? details['hasMembership'] : [];
    let member = false;
    let chair = false;
    let viceChair = false;

    for (const membership of memberships) {
      if (!this.isRecord(membership)) continue;
      if (!this.matchesCommitteeOrganization(membership, organizationCandidates)) continue;

      const roleCode = this.getMembershipRoleCode(membership);
      if (roleCode === 'MEMBER') {
        member = true;
      } else if (roleCode === 'CHAIR') {
        member = true;
        chair = true;
      } else if (roleCode === 'CHAIR_VICE' || roleCode === 'VICE_CHAIR') {
        member = true;
        viceChair = true;
      }
    }

    return { member, chair, viceChair };
  }

  private matchesCommitteeOrganization(
    membership: Record<string, unknown>,
    organizationCandidates: string[],
  ): boolean {
    const organization = typeof membership['organization'] === 'string'
      ? membership['organization']
      : '';
    if (organization === '') return false;
    return organizationCandidates.includes(this.normalizeOrganizationId(organization));
  }

  private getMembershipRoleCode(membership: Record<string, unknown>): string {
    const role = typeof membership['role'] === 'string' ? membership['role'] : '';
    return role.split('/').pop()?.toUpperCase() ?? '';
  }

  private applyCommitteeMemberships(
    committee: Committee,
    membershipSummary: { members: string[]; chair?: string; viceChairs: string[] },
  ): Committee {
    const enrichedCommittee: Committee = {
      ...committee,
      members: membershipSummary.members.length > 0 ? membershipSummary.members : committee.members,
    };

    if (membershipSummary.chair !== undefined) {
      enrichedCommittee.chair = membershipSummary.chair;
    } else if (committee.chair !== undefined) {
      enrichedCommittee.chair = committee.chair;
    }

    if (membershipSummary.viceChairs.length > 0) {
      enrichedCommittee.viceChairs = membershipSummary.viceChairs;
    } else if (committee.viceChairs !== undefined) {
      enrichedCommittee.viceChairs = committee.viceChairs;
    }

    return enrichedCommittee;
  }

  /**
   * Resolves a committee by trying direct lookup then list search.
   * @throws {APIError} If committee not found
   * @private
   */
  private async resolveCommittee(searchTerm: string, abortSignal?: AbortSignal): Promise<Committee> {
    if (searchTerm !== '') {
      const directResult = await this.fetchCommitteeDirectly(searchTerm, abortSignal);
      if (directResult !== null) return directResult;
    }

    const found = await this.searchCommitteeInList(searchTerm, abortSignal);
    if (found !== null) return found;

    throw new APIError(`Committee not found: ${searchTerm || 'unknown'}`, 404);
  }

  /**
   * Attempts a direct corporate-body lookup by ID.
   * @private
   */
  private async fetchCommitteeDirectly(bodyId: string, abortSignal?: AbortSignal): Promise<Committee | null> {
    try {
      const response = await this.get<JSONLDResponse>(`corporate-bodies/${bodyId}`, {}, undefined, abortSignal);
      if (response.data.length > 0) {
        const committee = this.transformCorporateBody(response.data[0] ?? {});
        return await this.enrichCommitteeMembership(committee, response.data[0] ?? {}, abortSignal);
      }
    } catch (error: unknown) {
      if (!(error instanceof APIError && error.statusCode === 404)) {
        auditLogger.logError('get_committee_info.fetch_direct', { bodyId }, toErrorMessage(error));
      }
    }
    return null;
  }

  /**
   * Searches the corporate-bodies list for a matching committee.
   * @private
   */
  private async searchCommitteeInList(searchTerm: string, abortSignal?: AbortSignal): Promise<Committee | null> {
    const listParams: Record<string, unknown> = {
      'body-classification': 'COMMITTEE_PARLIAMENTARY_STANDING',
      limit: 100,
    };
    const response = await this.get<JSONLDResponse>('corporate-bodies', listParams, undefined, abortSignal);

    for (const item of response.data) {
      const committee = this.transformCorporateBody(item);
      if (committee.abbreviation === searchTerm || committee.id === searchTerm) {
        return await this.enrichCommitteeMembership(committee, item, abortSignal);
      }
    }
    return null;
  }

  /**
   * Retrieves committee (corporate body) information by ID or abbreviation.
   *
   * **EP API Endpoint:** `GET /corporate-bodies/{body-id}` or `GET /corporate-bodies`
   *
   * @param params - id or abbreviation of the committee, with optional `abortSignal`
   * @returns Committee information
   * @security Audit logged per GDPR Article 30
   */
  async getCommitteeInfo(params: {
    id?: string;
    abbreviation?: string;
    abortSignal?: AbortSignal;
  }): Promise<Committee> {
    const action = 'get_committee_info';
    // Audit params exclude `abortSignal` (not a property we want in audit logs).
    const auditParams = { id: params.id, abbreviation: params.abbreviation };
    try {
      const searchTerm = params.abbreviation ?? params.id ?? '';
      const committee = await this.resolveCommittee(searchTerm, params.abortSignal);
      auditLogger.logDataAccess(action, auditParams, 1);
      return committee;
    } catch (error: unknown) {
      auditLogger.logError(
        action,
        auditParams,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Retrieves recently updated corporate bodies via the feed endpoint.
   * **EP API Endpoint:** `GET /corporate-bodies/feed`
   *
   * Fixed-window feed — no `timeframe` parameter per OpenAPI spec.
   * Extended timeout applied (120 s minimum).
   */
  async getCorporateBodiesFeed(options: { abortSignal?: AbortSignal } = {}): Promise<JSONLDResponse> {
    return this.get<JSONLDResponse>('corporate-bodies/feed', {
      format: 'application/ld+json',
    }, DEFAULT_TIMEOUTS.EP_FEED_SLOW_REQUEST_MS, options.abortSignal);
  }

  /**
   * Returns the list of all current EP Corporate Bodies for today's date.
   * **EP API Endpoint:** `GET /corporate-bodies/show-current`
   */
  async getCurrentCorporateBodies(params: {
    limit?: number;
    offset?: number;
    abortSignal?: AbortSignal;
  } = {}): Promise<PaginatedResponse<Committee>> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const response = await this.get<JSONLDResponse>(
      'corporate-bodies/show-current',
      { format: 'application/ld+json', offset, limit },
      undefined,
      params.abortSignal,
    );

    const items = Array.isArray(response.data) ? response.data : [];
    const bodies = items.map((item) => this.transformCorporateBody(item));
    const hasMore = bodies.length === limit;
    return { data: bodies, total: bodies.length + offset + (hasMore ? 1 : 0), limit, offset, hasMore };
  }
}
