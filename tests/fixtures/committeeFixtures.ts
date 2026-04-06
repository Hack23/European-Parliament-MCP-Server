/**
 * Committee Test Fixtures
 *
 * Synthetic committee data for testing.
 * All IDs and membership data reference synthetic fixtures only.
 *
 * ISMS Policy: DP-001 (GDPR Compliance), SC-002 (Secure Testing)
 */

import type { Committee } from '../../src/types/europeanParliament.js';

/** Synthetic committee fixtures */
export const committeeFixtures: Committee[] = [
  {
    id: 'ENVI',
    name: 'Committee on the Environment, Public Health and Food Safety',
    abbreviation: 'ENVI',
    members: ['MEP-10001', 'MEP-10003'],
    chair: 'MEP-10001'
  },
  {
    id: 'ECON',
    name: 'Committee on Economic and Monetary Affairs',
    abbreviation: 'ECON',
    members: ['MEP-10002', 'MEP-10004'],
    chair: 'MEP-10002'
  },
  {
    id: 'ITRE',
    name: 'Committee on Industry, Research and Energy',
    abbreviation: 'ITRE',
    members: ['MEP-10001', 'MEP-10002'],
    chair: 'MEP-10002'
  },
  {
    id: 'LIBE',
    name: 'Committee on Civil Liberties, Justice and Home Affairs',
    abbreviation: 'LIBE',
    members: ['MEP-10003', 'MEP-10005'],
    chair: 'MEP-10003'
  },
  {
    id: 'AFET',
    name: 'Committee on Foreign Affairs',
    abbreviation: 'AFET',
    members: ['MEP-10003', 'MEP-10004'],
    chair: 'MEP-10004'
  },
  {
    id: 'BUDG',
    name: 'Committee on Budgets',
    abbreviation: 'BUDG',
    members: ['MEP-10002', 'MEP-10001'],
    chair: 'MEP-10001'
  },
  {
    id: 'AGRI',
    name: 'Committee on Agriculture and Rural Development',
    abbreviation: 'AGRI',
    members: ['MEP-10004', 'MEP-10005'],
    chair: 'MEP-10004'
  },
  {
    id: 'CULT',
    name: 'Committee on Culture and Education',
    abbreviation: 'CULT',
    members: ['MEP-10005', 'MEP-10003'],
    chair: 'MEP-10005'
  }
];

/** Paginated committees response fixture */
export const paginatedCommitteeFixture = {
  data: committeeFixtures,
  pagination: {
    total: committeeFixtures.length,
    offset: 0,
    limit: 20
  }
};

/** Get committee fixture by abbreviation */
export function getCommitteeFixtureByAbbreviation(
  abbreviation: string
): Committee | undefined {
  return committeeFixtures.find(c => c.abbreviation === abbreviation);
}

/** Get committees that a synthetic MEP belongs to */
export function getCommitteeFixturesByMep(mepId: string): Committee[] {
  return committeeFixtures.filter(c => c.members.includes(mepId));
}

/** Get committee fixture by ID */
export function getCommitteeFixtureById(id: string): Committee | undefined {
  return committeeFixtures.find(c => c.id === id);
}
