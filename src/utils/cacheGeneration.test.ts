import { describe, expect, it } from 'vitest';
import type { WeeklyMEPCache } from './weeklyDataCache.js';
import { findMissingCurrentCommitteeIds } from './cacheGeneration.js';

describe('findMissingCurrentCommitteeIds', () => {
  const cache = {
    metadata: {
      schemaVersion: 3,
      generatedAt: '2026-07-18T00:00:00Z',
      source: 'test',
      dataset: 'meps',
      scope: 'current',
      complete: true,
      recordCount: 2,
      detailCount: 2,
    },
    meps: [
      { id: 'person/1', name: 'Active', country: 'SE', politicalGroup: 'EPP', committees: [], active: true, termStart: '' },
      { id: 'person/2', name: 'Inactive', country: 'DE', politicalGroup: 'S&D', committees: [], active: false, termStart: '' },
    ],
    mepDetails: {
      'person/1': {
        id: 'person/1', name: 'Active', country: 'SE', politicalGroup: 'EPP', committees: [], active: true, termStart: '',
        hasMembership: [
          { organization: 'org/7913', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', memberDuring: { id: 'period/1', type: 'PeriodOfTime', startDate: '2024-07-16' }, contactPoint: [] },
          { organization: 'org/7005', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_SUBCOMMITTEE', memberDuring: { id: 'period/2', type: 'PeriodOfTime', startDate: '2024-07-16' }, contactPoint: [] },
          { organization: 'org/OLD', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', memberDuring: { id: 'period/3', type: 'PeriodOfTime', endDate: '2025-12-31' }, contactPoint: [] },
          { organization: 'org/GROUP', membershipClassification: 'def/ep-entities/POLITICAL_GROUP', memberDuring: { id: 'period/4', type: 'PeriodOfTime', startDate: '2024-07-16' }, contactPoint: [] },
        ],
      },
      'person/2': {
        id: 'person/2', name: 'Inactive', country: 'DE', politicalGroup: 'S&D', committees: [], active: false, termStart: '',
        hasMembership: [{ organization: 'org/INACTIVE', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', contactPoint: [] }],
      },
    },
  } satisfies WeeklyMEPCache;

  it('returns only current committee IDs missing from the normalized body list', () => {
    expect(findMissingCurrentCommitteeIds(
      cache,
      new Set(['org/7913']),
      '2026-07-18',
    )).toEqual(['7005']);
  });
});