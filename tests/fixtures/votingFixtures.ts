/**
 * Voting Record Test Fixtures
 *
 * Synthetic voting record data for testing.
 * MEP IDs reference synthetic fixtures only — no real voting data.
 *
 * ISMS Policy: DP-001 (GDPR Compliance), SC-002 (Secure Testing)
 */

import type { VotingRecord } from '../../src/types/europeanParliament.js';

/** Synthetic voting record fixtures */
export const votingFixtures: VotingRecord[] = [
  {
    id: 'vote-test-001',
    sessionId: 'session-test-001',
    topic: 'Climate Action Amendment 2024 (synthetic)',
    date: '2024-01-15',
    votesFor: 450,
    votesAgainst: 200,
    abstentions: 55,
    result: 'ADOPTED',
    mepVotes: {
      'mep-test-001': 'FOR',
      'mep-test-002': 'AGAINST',
      'mep-test-003': 'FOR',
      'mep-test-004': 'ABSTAIN',
      'mep-test-005': 'FOR'
    }
  },
  {
    id: 'vote-test-002',
    sessionId: 'session-test-001',
    topic: 'Budget Amendment 2024-Q1 (synthetic)',
    date: '2024-01-15',
    votesFor: 380,
    votesAgainst: 290,
    abstentions: 35,
    result: 'ADOPTED',
    mepVotes: {
      'mep-test-001': 'FOR',
      'mep-test-002': 'FOR',
      'mep-test-003': 'AGAINST',
      'mep-test-004': 'FOR'
    }
  },
  {
    id: 'vote-test-003',
    sessionId: 'session-test-002',
    topic: 'Digital Markets Act Amendment (synthetic)',
    date: '2024-02-06',
    votesFor: 310,
    votesAgainst: 350,
    abstentions: 45,
    result: 'REJECTED',
    mepVotes: {
      'mep-test-001': 'AGAINST',
      'mep-test-002': 'FOR',
      'mep-test-003': 'AGAINST',
      'mep-test-004': 'AGAINST'
    }
  },
  {
    id: 'vote-test-004',
    sessionId: 'session-test-003',
    topic: 'Green Deal Financing Mechanism (synthetic)',
    date: '2024-03-11',
    votesFor: 520,
    votesAgainst: 140,
    abstentions: 55,
    result: 'ADOPTED',
    mepVotes: {
      'mep-test-001': 'FOR',
      'mep-test-002': 'AGAINST',
      'mep-test-003': 'FOR',
      'mep-test-004': 'ABSTAIN',
      'mep-test-005': 'FOR'
    }
  },
  {
    id: 'vote-test-005',
    sessionId: 'session-test-004',
    topic: 'Single Market Regulation Recast (synthetic)',
    date: '2024-04-22',
    votesFor: 420,
    votesAgainst: 155,
    abstentions: 30,
    result: 'ADOPTED',
    mepVotes: {
      'mep-test-001': 'FOR',
      'mep-test-002': 'FOR',
      'mep-test-003': 'FOR',
      'mep-test-004': 'AGAINST'
    }
  }
];

/** Paginated voting records response fixture */
export const paginatedVotingFixture = {
  data: votingFixtures,
  pagination: {
    total: votingFixtures.length,
    offset: 0,
    limit: 10
  }
};

/** Get voting fixture by ID */
export function getVotingFixtureById(id: string): VotingRecord | undefined {
  return votingFixtures.find(v => v.id === id);
}

/** Get voting fixtures by session */
export function getVotingFixturesBySession(sessionId: string): VotingRecord[] {
  return votingFixtures.filter(v => v.sessionId === sessionId);
}

/** Get adopted voting records */
export function getAdoptedVotingFixtures(): VotingRecord[] {
  return votingFixtures.filter(v => v.result === 'ADOPTED');
}

/** Get voting record for a specific MEP */
export function getMepVoteFromFixture(
  voteId: string,
  mepId: string
): string | undefined {
  const vote = votingFixtures.find(v => v.id === voteId);
  return vote?.mepVotes[mepId];
}
