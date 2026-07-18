import { describe, expect, it } from 'vitest';
import type { WeeklyMEPCache } from './weeklyDataCache.js';
import { deriveCurrentPoliticalComposition } from './politicalComposition.js';

function mep(id: string, politicalGroup: string, country: string): WeeklyMEPCache['meps'][number] {
  return { id: `person/${id}`, name: `MEP ${id}`, country, politicalGroup, committees: [], active: true, termStart: '2024-07-16' };
}

function details(
  id: string,
  organization: string,
  startDate = '2024-07-16',
): WeeklyMEPCache['mepDetails'][string] {
  return {
    ...mep(id, organization, 'BE'),
    hasMembership: [{
      organization,
      membershipClassification: 'def/ep-entities/EU_POLITICAL_GROUP',
      role: 'def/ep-roles/MEMBER',
      memberDuring: { id: `period/${id}`, type: 'PeriodOfTime', startDate },
      contactPoint: [],
    }],
  };
}

describe('deriveCurrentPoliticalComposition', () => {
  it('uses dated memberships for assignment and list fields only as label/fallback', () => {
    const cache = {
      metadata: { schemaVersion: 2, generatedAt: '2026-07-18T00:00:00Z', weekKey: '2026-W29', source: 'test', dataset: 'meps', scope: 'current' },
      meps: [
        mep('1', 'PPE', 'DE'),
        mep('2', 'EPP', 'FR'),
        mep('3', 'S&D', 'SE'),
        mep('4', 'Renew', 'NL'),
      ],
      mepDetails: {
        'person/1': details('1', 'org/7018'),
        'person/2': details('2', 'org/7018'),
        'person/3': details('3', 'org/7038'),
      },
    } satisfies WeeklyMEPCache;

    const composition = deriveCurrentPoliticalComposition(cache, '2026-07-18');

    expect(composition.totalMEPs).toBe(4);
    expect(composition.membershipDerivedMEPs).toBe(3);
    expect(composition.fallbackMEPs).toBe(1);
    expect(composition.groups.map(({ name, memberCount }) => ({ name, memberCount }))).toEqual([
      { name: 'EPP', memberCount: 2 },
      { name: 'Renew', memberCount: 1 },
      { name: 'S&D', memberCount: 1 },
    ]);
    expect(composition.majorityThreshold).toBe(3);
    expect(composition.grandCoalitionSize).toBe(3);
    expect(composition.grandCoalitionPossible).toBe(true);
    expect(composition.dataQualityWarnings).toContainEqual(expect.stringContaining('used the current-list group field'));
  });

  it('selects the newest current membership and reports conflicting assignments', () => {
    const cache = {
      metadata: { schemaVersion: 2, generatedAt: '2026-07-18T00:00:00Z', weekKey: '2026-W29', source: 'test', dataset: 'meps', scope: 'current' },
      meps: [mep('1', 'EPP', 'DE')],
      mepDetails: {
        'person/1': {
          ...details('1', 'org/old'),
          hasMembership: [
            details('1', 'org/old', '2024-07-16').hasMembership![0]!,
            details('1', 'org/new', '2025-01-01').hasMembership![0]!,
          ],
        },
      },
    } satisfies WeeklyMEPCache;

    const composition = deriveCurrentPoliticalComposition(cache, '2026-07-18');

    expect(composition.groups[0]?.name).toBe('EPP');
    expect(composition.dataQualityWarnings).toContainEqual(expect.stringContaining('2 current political-group memberships'));
  });
});