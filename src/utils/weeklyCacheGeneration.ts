import type { WeeklyMEPCache } from './weeklyDataCache.js';

type CachedMembership = NonNullable<
  WeeklyMEPCache['mepDetails'][string]['hasMembership']
>[number];

/** ISO-8601 week coordinates used by weekly snapshot directories. */
export interface IsoWeekInfo {
  year: number;
  week: number;
  weekKey: string;
}

/** Returns the ISO week-year and week number for a UTC date. */
export function getIsoWeekInfo(date: Date): IsoWeekInfo {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  const year = utc.getUTCFullYear();
  return {
    year,
    week,
    weekKey: `${String(year)}-W${String(week).padStart(2, '0')}`,
  };
}

function referenceCode(value: string | undefined): string {
  return value?.split('/').filter(Boolean).pop()?.toUpperCase() ?? '';
}

function normalizeMepIdentifier(id: string): string {
  return id.replace(/^MEP-/u, '').replace(/^person\//u, '');
}

function isCurrentPeriod(
  period: { startDate?: string | undefined; endDate?: string | undefined } | undefined,
  today: string,
): boolean {
  const startDate = period?.startDate;
  const endDate = period?.endDate;
  return (startDate === undefined || startDate <= today)
    && (endDate === undefined || endDate >= today);
}

function missingCommitteeId(
  membership: CachedMembership,
  existingIds: ReadonlySet<string>,
  today: string,
): string | null {
  const classification = referenceCode(membership.membershipClassification);
  if (!classification.startsWith('COMMITTEE_PARLIAMENTARY_')) return null;
  if (!isCurrentPeriod(membership.memberDuring, today)) return null;
  const organizationId = referenceCode(membership.organization);
  return organizationId === '' || existingIds.has(organizationId) ? null : organizationId;
}

/**
 * Finds current committee organization IDs referenced by active MEPs but absent
 * from the corporate-body listing. The result is normalized and sorted so the
 * generator performs deterministic direct-detail supplementation.
 */
export function findMissingCurrentCommitteeIds(
  cache: WeeklyMEPCache,
  existingBodyIds: ReadonlySet<string>,
  today = new Date().toISOString().slice(0, 10),
): string[] {
  const currentMEPIds = new Set(
    cache.meps.filter((mep) => mep.active).map((mep) => normalizeMepIdentifier(mep.id)),
  );
  const existingIds = new Set([...existingBodyIds].map((id) => referenceCode(id)));
  const visitedMEPs = new Set<string>();
  const missingIds = new Set<string>();

  for (const detail of Object.values(cache.mepDetails)) {
    const mepId = normalizeMepIdentifier(detail.id);
    if (!currentMEPIds.has(mepId) || visitedMEPs.has(mepId)) continue;
    visitedMEPs.add(mepId);

    for (const membership of detail.hasMembership ?? []) {
      const organizationId = missingCommitteeId(membership, existingIds, today);
      if (organizationId !== null) missingIds.add(organizationId);
    }
  }

  return [...missingIds].sort();
}