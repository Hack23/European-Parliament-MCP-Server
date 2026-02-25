/**
 * Plenary Session Test Fixtures
 *
 * Synthetic plenary session data for testing.
 * All data is clearly synthetic — no real session identifiers.
 *
 * ISMS Policy: DP-001 (GDPR Compliance), SC-002 (Secure Testing)
 */

import type { PlenarySession } from '../../src/types/europeanParliament.js';

/** Synthetic plenary session fixtures */
export const plenaryFixtures: PlenarySession[] = [
  {
    id: 'session-test-001',
    date: '2024-01-15',
    location: 'Strasbourg',
    agendaItems: [
      'Budget framework discussion (synthetic)',
      'Climate policy debate (synthetic)',
      'Digital Markets Act follow-up (synthetic)'
    ],
    attendanceCount: 680,
    documents: ['doc-test-001', 'doc-test-002', 'doc-test-003']
  },
  {
    id: 'session-test-002',
    date: '2024-02-06',
    location: 'Brussels',
    agendaItems: [
      'AI regulation committee report (synthetic)',
      'Trade agreement ratification (synthetic)'
    ],
    attendanceCount: 612,
    documents: ['doc-test-004', 'doc-test-005']
  },
  {
    id: 'session-test-003',
    date: '2024-03-11',
    location: 'Strasbourg',
    agendaItems: [
      'Green Deal progress review (synthetic)',
      'Social pillar implementation (synthetic)',
      'Foreign policy debate (synthetic)',
      'Energy security measures (synthetic)'
    ],
    attendanceCount: 710,
    documents: ['doc-test-006', 'doc-test-007', 'doc-test-008']
  },
  {
    id: 'session-test-004',
    date: '2024-04-22',
    location: 'Brussels',
    agendaItems: [
      'Single Market legislation (synthetic)',
      'Digital euro discussion (synthetic)'
    ],
    attendanceCount: 590,
    documents: ['doc-test-009', 'doc-test-010']
  },
  {
    id: 'session-test-005',
    date: '2024-06-10',
    location: 'Strasbourg',
    agendaItems: [
      'Annual budget review (synthetic)',
      'Border management (synthetic)',
      'Health union update (synthetic)'
    ],
    attendanceCount: 725,
    documents: ['doc-test-011', 'doc-test-012']
  }
];

/** Paginated plenary sessions response fixture */
export const paginatedPlenaryFixture = {
  data: plenaryFixtures,
  pagination: {
    total: plenaryFixtures.length,
    offset: 0,
    limit: 10
  }
};

/** Get plenary fixture by ID */
export function getPlenaryFixtureById(id: string): PlenarySession | undefined {
  return plenaryFixtures.find(s => s.id === id);
}

/** Get plenary fixtures by location */
export function getPlenaryFixturesByLocation(location: string): PlenarySession[] {
  return plenaryFixtures.filter(s => s.location === location);
}

/** Get plenary fixtures within date range */
export function getPlenaryFixturesByDateRange(
  dateFrom: string,
  dateTo: string
): PlenarySession[] {
  return plenaryFixtures.filter(
    s => s.date >= dateFrom && s.date <= dateTo
  );
}
