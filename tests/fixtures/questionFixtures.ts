/**
 * Parliamentary Question Test Fixtures
 *
 * Synthetic parliamentary question data for testing.
 * All question IDs, author references, and text are clearly synthetic.
 *
 * ISMS Policy: DP-001 (GDPR Compliance), SC-002 (Secure Testing)
 */

import type { ParliamentaryQuestion } from '../../src/types/europeanParliament.js';

/** Synthetic parliamentary question fixtures */
export const questionFixtures: ParliamentaryQuestion[] = [
  {
    id: 'q-test-001',
    type: 'WRITTEN',
    author: 'mep-test-001',
    date: '2024-01-10',
    topic: 'EU Climate Policy Implementation (synthetic)',
    questionText: 'What synthetic measures is the Commission taking to ensure member states meet 2030 climate targets?',
    answerText: 'The Commission is implementing various synthetic measures including monitoring frameworks and financial incentives.',
    answerDate: '2024-01-25',
    status: 'ANSWERED'
  },
  {
    id: 'q-test-002',
    type: 'ORAL',
    author: 'mep-test-002',
    date: '2024-01-15',
    topic: 'Digital Single Market Progress (synthetic)',
    questionText: 'What synthetic steps has the Commission taken to reduce barriers in the Digital Single Market?',
    answerText: 'The Commission has taken several synthetic steps including the Digital Services Act implementation.',
    answerDate: '2024-02-01',
    status: 'ANSWERED'
  },
  {
    id: 'q-test-003',
    type: 'WRITTEN',
    author: 'mep-test-003',
    date: '2024-02-05',
    topic: 'AI Governance Framework (synthetic)',
    questionText: 'How will the Commission enforce compliance with the synthetic AI Act provisions?',
    answerText: undefined,
    answerDate: undefined,
    status: 'PENDING'
  },
  {
    id: 'q-test-004',
    type: 'WRITTEN',
    author: 'mep-test-001',
    date: '2024-02-20',
    topic: 'Agricultural Subsidies Allocation 2024 (synthetic)',
    questionText: 'What criteria govern allocation of synthetic agricultural subsidies under the new CAP?',
    answerText: 'Allocation follows synthetic criteria based on sustainability metrics and farm size.',
    answerDate: '2024-03-10',
    status: 'ANSWERED'
  },
  {
    id: 'q-test-005',
    type: 'ORAL',
    author: 'mep-test-004',
    date: '2024-03-01',
    topic: 'Trade Agreement Negotiations (synthetic)',
    questionText: 'What is the status of synthetic trade agreement negotiations with partner countries?',
    answerText: undefined,
    answerDate: undefined,
    status: 'PENDING'
  }
];

/** Paginated questions response fixture */
export const paginatedQuestionFixture = {
  data: questionFixtures,
  pagination: {
    total: questionFixtures.length,
    offset: 0,
    limit: 10
  }
};

/** Get question fixture by ID */
export function getQuestionFixtureById(id: string): ParliamentaryQuestion | undefined {
  return questionFixtures.find(q => q.id === id);
}

/** Get question fixtures by author MEP ID */
export function getQuestionFixturesByAuthor(mepId: string): ParliamentaryQuestion[] {
  return questionFixtures.filter(q => q.author === mepId);
}

/** Get question fixtures by type */
export function getQuestionFixturesByType(type: string): ParliamentaryQuestion[] {
  return questionFixtures.filter(q => q.type === type);
}

/** Get question fixtures by status */
export function getQuestionFixturesByStatus(status: string): ParliamentaryQuestion[] {
  return questionFixtures.filter(q => q.status === status);
}
