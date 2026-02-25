/**
 * MEP Test Fixtures
 *
 * Synthetic MEP data for testing without real personal data.
 * All names, IDs and details are clearly synthetic/anonymized.
 *
 * ISMS Policy: DP-001 (GDPR Compliance), SC-002 (Secure Testing)
 */

import type { MEP, MEPDetails, VotingStatistics } from '../../src/types/europeanParliament.js';

/** Synthetic MEP list fixture */
export const mepFixtures: MEP[] = [
  {
    id: 'mep-test-001',
    name: 'Anna Andersson',
    country: 'SE',
    politicalGroup: 'S&D',
    committees: ['ENVI', 'ITRE'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: 'mep-test-002',
    name: 'Klaus Mueller',
    country: 'DE',
    politicalGroup: 'EPP',
    committees: ['ECON', 'BUDG'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: 'mep-test-003',
    name: 'Marie Dupont',
    country: 'FR',
    politicalGroup: 'Renew',
    committees: ['AFET', 'DEVE'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: 'mep-test-004',
    name: 'Luigi Rossi',
    country: 'IT',
    politicalGroup: 'ECR',
    committees: ['AGRI', 'PECH'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: 'mep-test-005',
    name: 'Sofia Papadopoulou',
    country: 'GR',
    politicalGroup: 'The Left',
    committees: ['CULT', 'LIBE'],
    active: false,
    termStart: '2019-07-02',
    termEnd: '2024-07-15'
  }
];

/** Synthetic MEP details fixture */
export const mepDetailsFixtures: MEPDetails[] = [
  {
    id: 'mep-test-001',
    name: 'Anna Andersson',
    country: 'SE',
    politicalGroup: 'S&D',
    committees: ['ENVI', 'ITRE'],
    active: true,
    termStart: '2024-07-16',
    dateOfBirth: '1975-03-12',
    nationality: 'Swedish',
    education: 'MSc Environmental Science, Uppsala University (synthetic)',
    professionalBackground: 'Environmental Consultant (synthetic)',
    contactEmail: 'anna.andersson.test@example.test',
    websiteUrl: 'https://example.test/mep-test-001',
    photoUrl: 'https://example.test/photos/mep-test-001.jpg',
    socialMedia: {},
    assistants: [],
    officeAddresses: [],
    votingStats: {
      totalVotes: 250,
      votesFor: 175,
      votesAgainst: 55,
      abstentions: 20,
      attendanceRate: 0.88
    }
  },
  {
    id: 'mep-test-002',
    name: 'Klaus Mueller',
    country: 'DE',
    politicalGroup: 'EPP',
    committees: ['ECON', 'BUDG'],
    active: true,
    termStart: '2024-07-16',
    dateOfBirth: '1968-09-22',
    nationality: 'German',
    education: 'PhD Economics, LMU Munich (synthetic)',
    professionalBackground: 'Banker (synthetic)',
    contactEmail: 'klaus.mueller.test@example.test',
    websiteUrl: 'https://example.test/mep-test-002',
    photoUrl: 'https://example.test/photos/mep-test-002.jpg',
    socialMedia: {},
    assistants: [],
    officeAddresses: [],
    votingStats: {
      totalVotes: 240,
      votesFor: 160,
      votesAgainst: 65,
      abstentions: 15,
      attendanceRate: 0.91
    }
  }
];

/** Voting statistics fixture */
export const votingStatsFixture: VotingStatistics = {
  totalVotes: 250,
  votesFor: 175,
  votesAgainst: 55,
  abstentions: 20,
  attendanceRate: 0.88
};

/** Get synthetic MEP by ID */
export function getMepFixtureById(id: string): MEP | undefined {
  return mepFixtures.find(m => m.id === id);
}

/** Get synthetic MEPs by country */
export function getMepFixturesByCountry(country: string): MEP[] {
  return mepFixtures.filter(m => m.country === country);
}

/** Get synthetic MEPs by political group */
export function getMepFixturesByGroup(group: string): MEP[] {
  return mepFixtures.filter(m => m.politicalGroup === group);
}

/** Paginated MEP response fixture */
export const paginatedMepFixture = {
  data: mepFixtures,
  pagination: {
    total: mepFixtures.length,
    offset: 0,
    limit: 10
  }
};
