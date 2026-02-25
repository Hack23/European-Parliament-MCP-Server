/**
 * Document Test Fixtures
 *
 * Synthetic legislative document data for testing.
 * All titles and IDs are clearly synthetic — no real document identifiers.
 *
 * ISMS Policy: DP-001 (GDPR Compliance), SC-002 (Secure Testing)
 */

import type { LegislativeDocument } from '../../src/types/europeanParliament.js';

/** Synthetic legislative document fixtures */
export const documentFixtures: LegislativeDocument[] = [
  {
    id: 'doc-test-001',
    type: 'REGULATION',
    title: 'Regulation on Climate Neutrality Framework (synthetic)',
    date: '2024-01-10',
    authors: ['mep-test-001'],
    status: 'IN_COMMITTEE',
    summary: 'Synthetic regulation establishing framework for climate neutrality targets.'
  },
  {
    id: 'doc-test-002',
    type: 'DIRECTIVE',
    title: 'Directive on Digital Services Liability (synthetic)',
    date: '2024-01-12',
    authors: ['mep-test-002', 'mep-test-003'],
    status: 'IN_PLENARY',
    summary: 'Synthetic directive updating liability rules for digital service providers.'
  },
  {
    id: 'doc-test-003',
    type: 'REPORT',
    title: 'Annual Report on EU Trade Policy 2024 (synthetic)',
    date: '2024-01-14',
    authors: ['mep-test-003'],
    status: 'ADOPTED',
    summary: 'Synthetic annual report reviewing EU trade policy developments.'
  },
  {
    id: 'doc-test-004',
    type: 'RESOLUTION',
    title: 'Resolution on AI Ethics Framework (synthetic)',
    date: '2024-02-05',
    authors: ['mep-test-001', 'mep-test-004'],
    status: 'IN_COMMITTEE',
    summary: 'Synthetic resolution calling for binding AI ethics standards.'
  },
  {
    id: 'doc-test-005',
    type: 'OPINION',
    title: 'Opinion on Single Market Barriers (synthetic)',
    date: '2024-02-07',
    authors: ['mep-test-002'],
    status: 'ADOPTED',
    summary: 'Synthetic opinion identifying key barriers in the single market.'
  },
  {
    id: 'doc-test-006',
    type: 'REGULATION',
    title: 'Regulation on Green Finance Standards (synthetic)',
    date: '2024-03-10',
    authors: ['mep-test-001', 'mep-test-003'],
    status: 'FIRST_READING',
    summary: 'Synthetic regulation establishing green finance taxonomy updates.'
  },
  {
    id: 'doc-test-007',
    type: 'DIRECTIVE',
    title: 'Directive on Worker Platform Rights (synthetic)',
    date: '2024-03-11',
    authors: ['mep-test-005'],
    status: 'IN_PLENARY',
    summary: 'Synthetic directive on rights of platform economy workers.'
  }
];

/** Paginated documents response fixture */
export const paginatedDocumentFixture = {
  data: documentFixtures,
  pagination: {
    total: documentFixtures.length,
    offset: 0,
    limit: 10
  }
};

/** Get document fixture by ID */
export function getDocumentFixtureById(id: string): LegislativeDocument | undefined {
  return documentFixtures.find(d => d.id === id);
}

/** Get document fixtures by type */
export function getDocumentFixturesByType(type: string): LegislativeDocument[] {
  return documentFixtures.filter(d => d.type === type);
}

/** Get document fixtures by status */
export function getDocumentFixturesByStatus(status: string): LegislativeDocument[] {
  return documentFixtures.filter(d => d.status === status);
}

/** Search document fixtures by keyword in title */
export function searchDocumentFixtures(keyword: string): LegislativeDocument[] {
  const lowerKeyword = keyword.toLowerCase();
  return documentFixtures.filter(d =>
    d.title.toLowerCase().includes(lowerKeyword) ||
    (d.summary?.toLowerCase().includes(lowerKeyword) ?? false)
  );
}
