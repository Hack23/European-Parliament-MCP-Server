import { normalizePoliticalGroup } from './politicalGroupNormalization.js';
import type { WeeklyMEPCache } from './weeklyDataCache.js';

type CachedMEP = WeeklyMEPCache['meps'][number];
type CachedMEPDetails = WeeklyMEPCache['mepDetails'][string];
type CachedMembership = NonNullable<CachedMEPDetails['hasMembership']>[number];

export interface PoliticalCompositionGroup {
  name: string;
  memberCount: number;
  seatShare: number;
  countries: number;
}

export interface CurrentPoliticalComposition {
  asOf: string;
  totalMEPs: number;
  countriesRepresented: number;
  groups: PoliticalCompositionGroup[];
  membershipDerivedMEPs: number;
  fallbackMEPs: number;
  fragmentationIndex: number;
  majorityThreshold: number;
  grandCoalitionSize: number;
  grandCoalitionPossible: boolean;
  dataQualityWarnings: string[];
}

interface CompositionAccumulator {
  groupMap: Map<string, { count: number; countries: Set<string> }>;
  countries: Set<string>;
  warnings: string[];
  membershipDerivedMEPs: number;
  fallbackMEPs: number;
}

function canonicalMepId(id: string): string {
  return id.replace(/^MEP-/u, '').replace(/^person\//u, '');
}

function referenceCode(value: string | undefined): string {
  return value?.split('/').filter(Boolean).pop()?.toUpperCase() ?? '';
}

function isCurrentMembership(membership: CachedMembership, asOf: string): boolean {
  const startDate = membership.memberDuring?.startDate;
  const endDate = membership.memberDuring?.endDate;
  return (startDate === undefined || startDate <= asOf)
    && (endDate === undefined || endDate >= asOf);
}

function politicalGroupMemberships(
  detail: CachedMEPDetails,
  asOf: string,
): CachedMembership[] {
  return (detail.hasMembership ?? [])
    .filter((membership) => referenceCode(membership.membershipClassification) === 'EU_POLITICAL_GROUP')
    .filter((membership) => isCurrentMembership(membership, asOf))
    .sort((left, right) =>
      (right.memberDuring?.startDate ?? '').localeCompare(left.memberDuring?.startDate ?? ''),
    );
}

function findDetails(cache: WeeklyMEPCache, mep: CachedMEP): CachedMEPDetails | undefined {
  const id = canonicalMepId(mep.id);
  return cache.mepDetails[mep.id]
    ?? cache.mepDetails[id]
    ?? cache.mepDetails[`MEP-${id}`]
    ?? cache.mepDetails[`person/${id}`];
}

function isUsableGroupLabel(label: string): boolean {
  return label !== '' && label.toLowerCase() !== 'unknown';
}

function addOrganizationLabelCandidate(
  candidates: Map<string, Map<string, number>>,
  cache: WeeklyMEPCache,
  mep: CachedMEP,
  asOf: string,
): void {
  const detail = findDetails(cache, mep);
  const membership = detail === undefined ? undefined : politicalGroupMemberships(detail, asOf)[0];
  const organization = referenceCode(membership?.organization);
  const label = normalizePoliticalGroup(mep.politicalGroup);
  if (organization === '' || !isUsableGroupLabel(label)) return;
  const counts = candidates.get(organization) ?? new Map<string, number>();
  counts.set(label, (counts.get(label) ?? 0) + 1);
  candidates.set(organization, counts);
}

function selectOrganizationLabel(
  organization: string,
  counts: ReadonlyMap<string, number>,
): { label?: string; warning?: string } {
  const ranked = [...counts.entries()].sort((left, right) =>
    right[1] - left[1] || left[0].localeCompare(right[0]),
  );
  const label = ranked[0]?.[0];
  const warning = ranked.length > 1
    ? `Political-group organization ${organization} had conflicting list labels: ${ranked.map(([name, count]) => `${name}=${String(count)}`).join(', ')}.`
    : undefined;
  return {
    ...(label === undefined ? {} : { label }),
    ...(warning === undefined ? {} : { warning }),
  };
}

function buildOrganizationLabels(
  cache: WeeklyMEPCache,
  activeMEPs: readonly CachedMEP[],
  asOf: string,
): { labels: Map<string, string>; warnings: string[] } {
  const candidates = new Map<string, Map<string, number>>();
  for (const mep of activeMEPs) {
    addOrganizationLabelCandidate(candidates, cache, mep, asOf);
  }
  const labels = new Map<string, string>();
  const warnings: string[] = [];
  for (const [organization, counts] of candidates) {
    const selected = selectOrganizationLabel(organization, counts);
    if (selected.label !== undefined) labels.set(organization, selected.label);
    if (selected.warning !== undefined) warnings.push(selected.warning);
  }
  return { labels, warnings };
}

function currentActiveMEPs(cache: WeeklyMEPCache): CachedMEP[] {
  const activeById = new Map<string, CachedMEP>();
  for (const mep of cache.meps) {
    if (mep.active) activeById.set(canonicalMepId(mep.id), mep);
  }
  return [...activeById.values()];
}

function addMEPToComposition(
  accumulator: CompositionAccumulator,
  cache: WeeklyMEPCache,
  organizationLabels: ReadonlyMap<string, string>,
  mep: CachedMEP,
  asOf: string,
): void {
  accumulator.countries.add(mep.country);
  const detail = findDetails(cache, mep);
  const memberships = detail === undefined ? [] : politicalGroupMemberships(detail, asOf);
  if (memberships.length > 1) {
    accumulator.warnings.push(
      `MEP ${mep.id} has ${String(memberships.length)} current political-group memberships; newest membership selected.`,
    );
  }
  const membershipLabel = organizationLabels.get(referenceCode(memberships[0]?.organization));
  const groupName = membershipLabel ?? normalizePoliticalGroup(mep.politicalGroup);
  if (membershipLabel === undefined) accumulator.fallbackMEPs++;
  else accumulator.membershipDerivedMEPs++;
  const resolvedGroup = isUsableGroupLabel(groupName) ? groupName : 'NI';
  if (!isUsableGroupLabel(groupName)) {
    accumulator.warnings.push(`MEP ${mep.id} has no resolvable current political group; counted as NI.`);
  }
  const aggregate = accumulator.groupMap.get(resolvedGroup)
    ?? { count: 0, countries: new Set<string>() };
  aggregate.count++;
  aggregate.countries.add(mep.country);
  accumulator.groupMap.set(resolvedGroup, aggregate);
}

function summarizeGroups(
  groupMap: ReadonlyMap<string, { count: number; countries: Set<string> }>,
  totalMEPs: number,
): PoliticalCompositionGroup[] {
  return [...groupMap.entries()]
    .map(([name, aggregate]) => ({
      name,
      memberCount: aggregate.count,
      seatShare: Math.round((aggregate.count / Math.max(1, totalMEPs)) * 10_000) / 100,
      countries: aggregate.countries.size,
    }))
    .sort((left, right) => right.memberCount - left.memberCount || left.name.localeCompare(right.name));
}

function computeFragmentation(groups: readonly PoliticalCompositionGroup[]): number {
  const sumSquares = groups.reduce((sum, group) => sum + (group.seatShare / 100) ** 2, 0);
  return sumSquares === 0 ? 0 : Math.round((1 / sumSquares) * 100) / 100;
}

/** Derives the current Parliament composition from dated MEP membership records. */
export function deriveCurrentPoliticalComposition(
  cache: WeeklyMEPCache,
  asOf = cache.metadata.generatedAt.slice(0, 10),
): CurrentPoliticalComposition {
  const activeMEPs = currentActiveMEPs(cache);
  const organizationLabels = buildOrganizationLabels(cache, activeMEPs, asOf);
  const accumulator: CompositionAccumulator = {
    groupMap: new Map(),
    countries: new Set(),
    warnings: [...organizationLabels.warnings],
    membershipDerivedMEPs: 0,
    fallbackMEPs: 0,
  };
  for (const mep of activeMEPs) {
    addMEPToComposition(accumulator, cache, organizationLabels.labels, mep, asOf);
  }
  const totalMEPs = activeMEPs.length;
  const groups = summarizeGroups(accumulator.groupMap, totalMEPs);
  const majorityThreshold = Math.floor(totalMEPs / 2) + 1;
  const grandCoalitionSize = (groups[0]?.memberCount ?? 0) + (groups[1]?.memberCount ?? 0);
  if (accumulator.fallbackMEPs > 0) {
    accumulator.warnings.push(
      `${String(accumulator.fallbackMEPs)} current MEP(s) lacked a resolvable dated political-group membership and used the current-list group field.`,
    );
  }
  return {
    asOf,
    totalMEPs,
    countriesRepresented: accumulator.countries.size,
    groups,
    membershipDerivedMEPs: accumulator.membershipDerivedMEPs,
    fallbackMEPs: accumulator.fallbackMEPs,
    fragmentationIndex: computeFragmentation(groups),
    majorityThreshold,
    grandCoalitionSize,
    grandCoalitionPossible: grandCoalitionSize >= majorityThreshold,
    dataQualityWarnings: accumulator.warnings,
  };
}
