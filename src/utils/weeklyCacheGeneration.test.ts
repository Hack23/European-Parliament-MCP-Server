import { describe, expect, it } from 'vitest';
import type { WeeklyMEPCache } from './weeklyDataCache.js';
import {
  findMissingCurrentCommitteeIds,
  getIsoWeekInfo,
} from './weeklyCacheGeneration.js';

describe('getIsoWeekInfo', () => {
  it('uses the ISO week-year at a calendar-year boundary', () => {
    expect(getIsoWeekInfo(new Date('2021-01-01T12:00:00Z'))).toEqual({
      year: 2020,
      week: 53,
      weekKey: '2020-W53',
    });
  });

  it('pads single-digit week numbers', () => {
    expect(getIsoWeekInfo(new Date('2026-01-01T00:00:00Z'))).toEqual({
      year: 2026,
      week: 1,
      weekKey: '2026-W01',
    });
  });
});

describe('findMissingCurrentCommitteeIds', () => {
  const cache = {
    metadata: {
      schemaVersion: 2,
      generatedAt: '2026-07-18T00:00:00Z',
      weekKey: '2026-W29',
      source: 'test',
      dataset: 'meps',
      scope: 'current',
    },
    meps: [
      { id: 'person/1', name: 'Active', country: 'SE', politicalGroup: 'EPP', committees: [], active: true, termStart: '' },
      { id: 'person/2', name: 'Inactive', country: 'DE', politicalGroup: 'S&D', committees: [], active: false, termStart: '' },
    ],
    mepDetails: {
      'person/1': {
        id: 'person/1', name: 'Active', country: 'SE', politicalGroup: 'EPP', committees: [], active: true, termStart: '',
        hasMembership: [
          { organization: 'org/7913', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', memberDuring: { startDate: '2024-07-16' } },
          { organization: 'org/7005', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_SUBCOMMITTEE', memberDuring: { startDate: '2024-07-16' } },
          { organization: 'org/OLD', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', memberDuring: { endDate: '2025-12-31' } },
          { organization: 'org/GROUP', membershipClassification: 'def/ep-entities/POLITICAL_GROUP', memberDuring: { startDate: '2024-07-16' } },
        ],
      },
      alias: {
        id: 'MEP-1', name: 'Duplicate alias', country: 'SE', politicalGroup: 'EPP', committees: [], active: true, termStart: '',
        hasMembership: [{ organization: 'org/DUPLICATE', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING' }],
      },
      'person/2': {
        id: 'person/2', name: 'Inactive', country: 'DE', politicalGroup: 'S&D', committees: [], active: false, termStart: '',
        hasMembership: [{ organization: 'org/INACTIVE', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING' }],
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