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
  CommitteeMembership,
  MEPMembership,
  PaginatedResponse,
} from '../../types/europeanParliament.js';
import {
  transformCorporateBody as _transformCorporateBody,
  transformMEPMembership,
} from './transformers.js';
import {
  BaseEPClient,
  APIError,
  type EPClientConfig,
  type EPSharedResources,
  type JSONLDResponse,
} from './baseClient.js';
import { DEFAULT_TIMEOUTS, withTimeoutAndAbort } from '../../utils/timeout.js';

/** Prevent roster enrichment from exhausting the shared EP API rate-limit budget. */
const COMMITTEE_MEMBERSHIP_ENRICHMENT_TIMEOUT_MS = 10_000;

interface MembershipRoleSummary {
  member: boolean;
  chair: boolean;
  viceChair: boolean;
  memberships: MEPMembership[];
}

interface MEPMembershipSummary extends MembershipRoleSummary {
  mepId: string;
}

interface CommitteeMembershipSummary {
  members: string[];
  chair?: string;
  viceChairs: string[];
  memberships: CommitteeMembership[];
}

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
    if (trimmed.includes('/')) {
      const identifier = trimmed.split('/').filter((segment) => segment !== '').pop() ?? '';
      return identifier === '' ? '' : `person/${identifier}`;
    }
    return `person/${trimmed}`;
  }

  private normalizeOrganizationId(value: string): string {
    const trimmed = value.trim();
    if (trimmed === '') return '';
    const orgMarker = '/org/';
    const markerIndex = trimmed.lastIndexOf(orgMarker);
    if (markerIndex >= 0) return trimmed.substring(markerIndex + orgMarker.length);
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
      const membershipSummary = await withTimeoutAndAbort(
        (timeoutSignal) => this.loadCommitteeMemberships(
          organizationCandidates,
          abortSignal === undefined
            ? timeoutSignal
            : AbortSignal.any([abortSignal, timeoutSignal]),
        ),
        COMMITTEE_MEMBERSHIP_ENRICHMENT_TIMEOUT_MS,
        'Committee membership enrichment timed out',
      );
      return this.applyCommitteeMemberships(committee, membershipSummary);
    } catch (error: unknown) {
      auditLogger.logError(
        'get_committee_info.enrich_memberships',
        {
          committeeId: committee.id,
          committeeAbbreviation: committee.abbreviation,
          filterValue,
        },
        toErrorMessage(error),
      );
      return committee;
    }
  }

  private async loadCommitteeMemberships(
    organizationCandidates: string[],
    abortSignal?: AbortSignal,
  ): Promise<CommitteeMembershipSummary> {
    const memberIds = new Set<string>();
    const viceChairIds = new Set<string>();
    const memberships = new Map<string, CommitteeMembership>();
    let chairId: string | undefined;

    const batchSize = 100;
    let fetchOffset = 0;

    for (;;) {
      const response = await this.get<JSONLDResponse>('meps/show-current', {
        format: 'application/ld+json',
        limit: batchSize,
        offset: fetchOffset,
      }, undefined, abortSignal);
      const meps = Array.isArray(response.data) ? response.data : [];

      if (meps.length === 0) {
        break;
      }

      const batchMemberships = await this.collectMembershipsFromBatch(
        meps,
        organizationCandidates,
        abortSignal,
      );
      batchMemberships.memberIds.forEach((mepId) => memberIds.add(mepId));
      batchMemberships.viceChairIds.forEach((mepId) => viceChairIds.add(mepId));
      for (const membership of batchMemberships.memberships) {
        memberships.set(this.getMembershipKey(membership), membership);
      }
      if (batchMemberships.chairId !== undefined) {
        chairId = batchMemberships.chairId;
      }

      if (meps.length < batchSize) {
        break;
      }

      fetchOffset += batchSize;
    }

    const membershipSummary: CommitteeMembershipSummary = {
      members: [...memberIds],
      viceChairs: [...viceChairIds],
      memberships: [...memberships.values()],
    };
    if (chairId !== undefined) {
      membershipSummary.chair = chairId;
    }

    return membershipSummary;
  }

  private async collectMembershipsFromBatch(
    meps: unknown[],
    organizationCandidates: string[],
    abortSignal?: AbortSignal,
  ): Promise<{
    memberIds: Set<string>;
    viceChairIds: Set<string>;
    chairId?: string;
    memberships: CommitteeMembership[];
  }> {
    const memberIds = new Set<string>();
    const viceChairIds = new Set<string>();
    const memberships: CommitteeMembership[] = [];
    let chairId: string | undefined;

    const concurrency = 10;
    for (let index = 0; index < meps.length; index += concurrency) {
      const batch = meps.slice(index, index + concurrency);
      const membershipSummaries = await Promise.all(
        batch.map(async (mep) => {
          if (!this.isRecord(mep)) return null;
          return this.getMEPMembershipSummary(
            mep,
            organizationCandidates,
            abortSignal,
            true,
          );
        }),
      );

      for (const membershipSummary of membershipSummaries) {
        if (membershipSummary === null || membershipSummary.mepId === '') continue;
        if (membershipSummary.member) {
          memberIds.add(membershipSummary.mepId);
        }
        if (membershipSummary.chair) chairId = membershipSummary.mepId;
        if (membershipSummary.viceChair) viceChairIds.add(membershipSummary.mepId);
        memberships.push(...membershipSummary.memberships.map((membership) => ({
          ...membership,
          member: membershipSummary.mepId,
        })));
      }
    }

    return chairId === undefined
      ? { memberIds, viceChairIds, memberships }
      : { memberIds, viceChairIds, chairId, memberships };
  }

  private async getMEPMembershipSummary(
    mep: Record<string, unknown>,
    organizationCandidates: string[],
    abortSignal?: AbortSignal,
    inferMemberFromRoster = false,
  ): Promise<MEPMembershipSummary> {
    const mepId = this.normalizeMEPId(mep['id'] ?? mep['identifier'] ?? mep['@id']);
    if (mepId === '') {
      return { mepId: '', member: false, chair: false, viceChair: false, memberships: [] };
    }

    const inlineMembershipSummary = this.extractMembershipSummary(mep, organizationCandidates);
    if (this.hasMembershipSummary(inlineMembershipSummary)) {
      return { mepId, ...inlineMembershipSummary };
    }

    if (inferMemberFromRoster && !this.hasMembershipDetails(mep)) {
      return this.resolveRosterMembershipSummary(mepId, organizationCandidates, abortSignal);
    }

    return this.resolveDetailMembershipSummary(mepId, organizationCandidates, abortSignal);
  }

  private async resolveRosterMembershipSummary(
    mepId: string,
    organizationCandidates: string[],
    abortSignal?: AbortSignal,
  ): Promise<MEPMembershipSummary> {
    const detailsMembershipSummary = await this.loadMEPMembershipSummaryFromDetails(
      mepId,
      organizationCandidates,
      abortSignal,
    );
    if (this.hasMembershipSummary(detailsMembershipSummary)) {
      return { mepId, ...detailsMembershipSummary };
    }
    return { mepId, member: false, chair: false, viceChair: false, memberships: [] };
  }

  private async resolveDetailMembershipSummary(
    mepId: string,
    organizationCandidates: string[],
    abortSignal?: AbortSignal,
  ): Promise<MEPMembershipSummary> {
    const detailsMembershipSummary = await this.loadMEPMembershipSummaryFromDetails(
      mepId,
      organizationCandidates,
      abortSignal,
    );
    return { mepId, ...detailsMembershipSummary };
  }

  private async loadMEPMembershipSummaryFromDetails(
    mepId: string,
    organizationCandidates: string[],
    abortSignal?: AbortSignal,
  ): Promise<MembershipRoleSummary> {
    try {
      const mepIdentifier = mepId.split('/').filter((segment) => segment !== '').pop() ?? mepId;
      const mepDetailsResponse = await this.get<JSONLDResponse>(`meps/${mepIdentifier}`, {
        format: 'application/ld+json',
      }, undefined, abortSignal);
      const details = Array.isArray(mepDetailsResponse.data) ? mepDetailsResponse.data[0] : undefined;
      if (!this.isRecord(details)) {
        return { member: false, chair: false, viceChair: false, memberships: [] };
      }

      return this.extractMembershipSummary(details, organizationCandidates);
    } catch {
      return { member: false, chair: false, viceChair: false, memberships: [] };
    }
  }

  private hasMembershipDetails(details: Record<string, unknown>): boolean {
    const memberships = Array.isArray(details['hasMembership']) ? details['hasMembership'] : [];
    return memberships.length > 0;
  }

  private hasMembershipSummary(summary: MembershipRoleSummary): boolean {
    return summary.member || summary.chair || summary.viceChair;
  }

  private extractMembershipSummary(
    details: Record<string, unknown>,
    organizationCandidates: string[],
  ): MembershipRoleSummary {
    const memberships = Array.isArray(details['hasMembership']) ? details['hasMembership'] : [];
    const summary: MembershipRoleSummary = {
      member: false,
      chair: false,
      viceChair: false,
      memberships: [],
    };

    for (const membership of memberships) {
      if (!this.isRecord(membership)) continue;
      if (!this.matchesCommitteeOrganization(membership, organizationCandidates)) continue;
      if (!this.isCurrentMembership(membership)) continue;
      const transformedMembership = transformMEPMembership(membership);
      if (transformedMembership !== undefined) summary.memberships.push(transformedMembership);
      this.applyMembershipRole(summary, this.getMembershipRoleCode(membership));
    }

    return summary;
  }

  private applyMembershipRole(summary: MembershipRoleSummary, roleCode: string): void {
    if (roleCode === 'MEMBER') {
      summary.member = true;
    } else if (roleCode === 'CHAIR') {
      summary.member = true;
      summary.chair = true;
    } else if (roleCode === 'CHAIR_VICE' || roleCode === 'VICE_CHAIR') {
      summary.member = true;
      summary.viceChair = true;
    }
  }

  private getMembershipKey(membership: CommitteeMembership): string {
    return [
      membership.member,
      membership.id ?? membership.identifier ?? '',
      membership.organization ?? '',
      membership.role ?? '',
    ].join('|');
  }

  private isCurrentMembership(membership: Record<string, unknown>): boolean {
    const period = this.isRecord(membership['memberDuring'])
      ? membership['memberDuring']
      : undefined;
    if (period === undefined) return true;
    const today = new Date().toISOString().slice(0, 10);
    const startDate = typeof period['startDate'] === 'string' ? period['startDate'] : undefined;
    const endDate = typeof period['endDate'] === 'string' ? period['endDate'] : undefined;
    return (startDate === undefined || startDate <= today)
      && (endDate === undefined || endDate >= today);
  }

  private matchesCommitteeOrganization(
    membership: Record<string, unknown>,
    organizationCandidates: string[],
  ): boolean {
    const organization = typeof membership['organization'] === 'string'
      ? membership['organization']
      : '';
    if (organization === '') return false;

    let membershipClassification = '';
    if (typeof membership['membershipClassification'] === 'string') {
      membershipClassification = membership['membershipClassification'];
    } else if (typeof membership['classification'] === 'string') {
      membershipClassification = membership['classification'];
    }
    const normalizedClassification = this.normalizeMembershipClassificationCode(membershipClassification);
    if (normalizedClassification !== '' && normalizedClassification !== 'COMMITTEE_PARLIAMENTARY_STANDING') {
      return false;
    }

    return organizationCandidates.includes(this.normalizeOrganizationId(organization));
  }

  private normalizeMembershipClassificationCode(value: string): string {
    const trimmed = value.trim();
    if (trimmed === '') return '';
    return trimmed.split('/').pop()?.toUpperCase() ?? '';
  }

  private getMembershipRoleCode(membership: Record<string, unknown>): string {
    const role = typeof membership['role'] === 'string' ? membership['role'] : '';
    return role.split('/').pop()?.toUpperCase() ?? '';
  }

  private applyCommitteeMemberships(
    committee: Committee,
    membershipSummary: CommitteeMembershipSummary,
  ): Committee {
    const enrichedCommittee: Committee = {
      ...committee,
      members: membershipSummary.members.length > 0 ? membershipSummary.members : committee.members,
      memberships: membershipSummary.memberships,
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
    } else {
      enrichedCommittee.viceChairs = [];
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
      const normalizedBodyId = this.normalizeOrganizationId(bodyId);
      const response = await this.get<JSONLDResponse>(
        `corporate-bodies/${normalizedBodyId}`,
        {},
        undefined,
        abortSignal,
      );
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
