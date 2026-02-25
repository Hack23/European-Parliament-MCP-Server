/**
 * Legislative Procedure Test Fixtures
 *
 * Synthetic procedure data for testing.
 * All reference numbers and rapporteur names are clearly synthetic.
 *
 * ISMS Policy: DP-001 (GDPR Compliance), SC-002 (Secure Testing)
 */

import type { Procedure } from '../../src/types/europeanParliament.js';

/** Synthetic procedure fixtures */
export const procedureFixtures: Procedure[] = [
  {
    id: 'proc-test-001',
    title: 'Regulation on Climate Neutrality Targets (synthetic)',
    reference: '2024/0001(COD)',
    type: 'COD',
    subjectMatter: 'Environment',
    stage: 'Awaiting Parliament position in 1st reading',
    status: 'Ongoing',
    dateInitiated: '2024-01-15',
    dateLastActivity: '2024-06-10',
    responsibleCommittee: 'ENVI',
    rapporteur: 'Anna Andersson (synthetic)',
    documents: ['doc-test-001', 'doc-test-006']
  },
  {
    id: 'proc-test-002',
    title: 'Directive on Digital Services Liability 2024 (synthetic)',
    reference: '2024/0002(COD)',
    type: 'COD',
    subjectMatter: 'Internal Market',
    stage: 'Inter-institutional negotiations',
    status: 'Ongoing',
    dateInitiated: '2024-01-20',
    dateLastActivity: '2024-07-01',
    responsibleCommittee: 'ITRE',
    rapporteur: 'Klaus Mueller (synthetic)',
    documents: ['doc-test-002']
  },
  {
    id: 'proc-test-003',
    title: 'Regulation on AI Ethics Framework (synthetic)',
    reference: '2024/0003(COD)',
    type: 'COD',
    subjectMatter: 'Technology',
    stage: 'Committee vote',
    status: 'Ongoing',
    dateInitiated: '2024-02-01',
    dateLastActivity: '2024-05-20',
    responsibleCommittee: 'ITRE',
    rapporteur: 'Marie Dupont (synthetic)',
    documents: ['doc-test-004']
  },
  {
    id: 'proc-test-004',
    title: 'Regulation on Single Market Barriers (synthetic)',
    reference: '2024/0004(COD)',
    type: 'COD',
    subjectMatter: 'Internal Market',
    stage: 'Adopted',
    status: 'Closed',
    dateInitiated: '2023-11-10',
    dateLastActivity: '2024-04-22',
    responsibleCommittee: 'IMCO',
    rapporteur: 'Luigi Rossi (synthetic)',
    documents: ['doc-test-005']
  },
  {
    id: 'proc-test-005',
    title: 'Directive on Worker Platform Rights (synthetic)',
    reference: '2024/0005(COD)',
    type: 'COD',
    subjectMatter: 'Employment',
    stage: 'Plenary vote',
    status: 'Ongoing',
    dateInitiated: '2024-03-01',
    dateLastActivity: '2024-06-15',
    responsibleCommittee: 'EMPL',
    rapporteur: 'Sofia Papadopoulou (synthetic)',
    documents: ['doc-test-007']
  }
];

/** Paginated procedures response fixture */
export const paginatedProcedureFixture = {
  data: procedureFixtures,
  pagination: {
    total: procedureFixtures.length,
    offset: 0,
    limit: 10
  }
};

/** Get procedure fixture by ID */
export function getProcedureFixtureById(id: string): Procedure | undefined {
  return procedureFixtures.find(p => p.id === id);
}

/** Get procedure fixture by reference */
export function getProcedureFixtureByReference(reference: string): Procedure | undefined {
  return procedureFixtures.find(p => p.reference === reference);
}

/** Get procedure fixtures by status */
export function getProcedureFixturesByStatus(status: string): Procedure[] {
  return procedureFixtures.filter(p => p.status === status);
}

/** Get procedure fixtures by committee */
export function getProcedureFixturesByCommittee(committee: string): Procedure[] {
  return procedureFixtures.filter(p => p.responsibleCommittee === committee);
}
