import type { z } from 'zod';
import { CommitteeSchema } from '../schemas/europeanParliament.js';
import type {
  WeeklyCorporateBodiesCache,
  WeeklyMEPCache,
} from './weeklyDataCache.js';

type Committee = z.infer<typeof CommitteeSchema>;
type CommitteeMembership = NonNullable<Committee['memberships']>[number];
type CachedMEPDetails = WeeklyMEPCache['mepDetails'][string];

interface CachedCommitteeRoster {
  memberships: Map<string, CommitteeMembership>;
  members: Set<string>;
  chairs: Set<string>;
  viceChairs: Set<string>;
}

const FULL_MEMBER_ROLES = new Set(['MEMBER', 'CHAIR', 'CHAIR_VICE', 'VICE_CHAIR']);
const VICE_CHAIR_ROLES = new Set(['CHAIR_VICE', 'VICE_CHAIR']);

function referenceCode(value: string | undefined): string {
  return value?.split('/').filter(Boolean).pop()?.toUpperCase() ?? '';
}

function isCommitteeClassification(value: string | undefined): boolean {
  return referenceCode(value).startsWith('COMMITTEE_PARLIAMENTARY_');
}

function isCurrentMembership(membership: CommitteeMembership): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const startDate = membership.memberDuring?.startDate;
  const endDate = membership.memberDuring?.endDate;
  return (startDate === undefined || startDate <= today)
    && (endDate === undefined || endDate >= today);
}

function currentCommitteeOrganizationIds(cache: WeeklyMEPCache): Set<string> {
  const currentMEPIds = new Set(cache.meps.filter((mep) => mep.active).map((mep) => mep.id));
  const organizations = new Set<string>();
  const visitedMEPs = new Set<string>();
  for (const detail of Object.values(cache.mepDetails)) {
    if (!currentMEPIds.has(detail.id) || visitedMEPs.has(detail.id)) continue;
    visitedMEPs.add(detail.id);
    for (const membership of detail.hasMembership ?? []) {
      if (!isCommitteeClassification(membership.membershipClassification)) continue;
      if (!isCurrentMembership({ ...membership, member: detail.id })) continue;
      const organizationId = referenceCode(membership.organization);
      if (organizationId !== '') organizations.add(organizationId);
    }
  }
  return organizations;
}

function matchingCommitteeMemberships(
  detail: CachedMEPDetails,
  organizationIds: ReadonlySet<string>,
): CommitteeMembership[] {
  return (detail.hasMembership ?? [])
    .filter((membership) => isCommitteeClassification(membership.membershipClassification))
    .filter((membership) => organizationIds.has(referenceCode(membership.organization)))
    .map((membership) => ({ ...membership, member: detail.id }))
    .filter(isCurrentMembership);
}

function addMembershipToRoster(
  roster: CachedCommitteeRoster,
  membership: CommitteeMembership,
): void {
  const role = referenceCode(membership.role);
  const membershipKey = membership.id ?? membership.identifier
    ?? `${membership.member}|${membership.organization ?? ''}|${membership.role ?? ''}`;
  roster.memberships.set(membershipKey, membership);
  if (FULL_MEMBER_ROLES.has(role)) roster.members.add(membership.member);
  if (role === 'CHAIR') roster.chairs.add(membership.member);
  if (VICE_CHAIR_ROLES.has(role)) roster.viceChairs.add(membership.member);
}

function buildCachedCommitteeRoster(
  committee: Committee,
  cache: WeeklyMEPCache,
  organizationAliases: readonly string[] = [],
): CachedCommitteeRoster {
  const organizationIds = new Set(
    [committee.id, committee.abbreviation, ...organizationAliases]
      .map((value) => referenceCode(value)),
  );
  const currentMEPIds = new Set(cache.meps.filter((mep) => mep.active).map((mep) => mep.id));
  const roster: CachedCommitteeRoster = {
    memberships: new Map(),
    members: new Set(),
    chairs: new Set(),
    viceChairs: new Set(),
  };
  const visitedMEPs = new Set<string>();
  for (const detail of Object.values(cache.mepDetails)) {
    if (!currentMEPIds.has(detail.id) || visitedMEPs.has(detail.id)) continue;
    visitedMEPs.add(detail.id);
    for (const membership of matchingCommitteeMemberships(detail, organizationIds)) {
      addMembershipToRoster(roster, membership);
    }
  }
  return roster;
}

export function enrichCommitteeFromMEPCache(
  committee: Committee,
  cache: WeeklyMEPCache,
  organizationAliases: readonly string[] = [],
): Committee {
  const roster = buildCachedCommitteeRoster(committee, cache, organizationAliases);
  const sortedMembers = [...roster.members].sort();
  const sortedMemberships = [...roster.memberships.values()].sort((left, right) =>
    `${left.member}|${left.id ?? left.identifier ?? ''}`
      .localeCompare(`${right.member}|${right.id ?? right.identifier ?? ''}`),
  );
  return {
    ...committee,
    members: sortedMembers.length > 0 ? sortedMembers : committee.members,
    memberships: sortedMemberships.length > 0 ? sortedMemberships : committee.memberships,
    chair: [...roster.chairs].sort()[0] ?? committee.chair,
    viceChairs: roster.viceChairs.size > 0
      ? [...roster.viceChairs].sort()
      : (committee.viceChairs ?? []),
  };
}

export function findCachedCommittee(
  lookup: string,
  cachedBodies: WeeklyCorporateBodiesCache,
  cachedMEPs: WeeklyMEPCache | null,
): Committee | undefined {
  const normalizedLookup = referenceCode(lookup);
  const activeCommitteeIds = cachedMEPs === null
    ? new Set<string>()
    : currentCommitteeOrganizationIds(cachedMEPs);
  const matchingBodies = cachedBodies.corporateBodies.filter((body) =>
    referenceCode(body.id) === normalizedLookup || referenceCode(body.abbreviation) === normalizedLookup,
  );
  const currentBody = matchingBodies.find((body) => activeCommitteeIds.has(referenceCode(body.id)));
  const selectedBody = currentBody ?? matchingBodies[0];
  if (selectedBody !== undefined) {
    const detail = cachedBodies.corporateBodyDetails?.[selectedBody.id];
    const committee = CommitteeSchema.parse(detail ?? selectedBody);
    return cachedMEPs === null
      ? committee
      : enrichCommitteeFromMEPCache(committee, cachedMEPs, [selectedBody.id]);
  }

  const aliasDetail = cachedBodies.corporateBodyDetails?.[lookup];
  if (aliasDetail === undefined) return undefined;
  const committee = CommitteeSchema.parse(aliasDetail);
  return cachedMEPs === null ? committee : enrichCommitteeFromMEPCache(committee, cachedMEPs, [lookup]);
}

export function listCachedCurrentCorporateBodies(
  cachedBodies: WeeklyCorporateBodiesCache,
  cachedMEPs: WeeklyMEPCache | null,
): Committee[] {
  return cachedBodies.corporateBodies
    .map((body) => {
      const committee = CommitteeSchema.parse(cachedBodies.corporateBodyDetails?.[body.id] ?? body);
      return cachedMEPs === null
        || committee.responsibilities?.some(isCommitteeClassification) !== true
        ? committee
        : enrichCommitteeFromMEPCache(committee, cachedMEPs, [body.id]);
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}
