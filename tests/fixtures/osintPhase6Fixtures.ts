/**
 * Phase 6 Advanced OSINT Tool Test Fixtures
 *
 * Synthetic MEP and voting data for testing Phase 6 tools:
 * - network_analysis
 * - sentiment_tracker
 * - early_warning_system
 * - comparative_intelligence
 *
 * MEPs are arranged with overlapping committee memberships (AGRI, ENVI, ITRE,
 * BUDG, LIBE, AFET) to exercise network-analysis edge detection.
 * IDs are numeric strings ('101'...'106') so comparativeIntelligence can call
 * getMEPDetails(String(numericId)) and receive a matching fixture.
 *
 * All names, IDs and details are clearly synthetic/anonymised.
 *
 * ISMS Policy: DP-001 (GDPR Compliance), SC-002 (Secure Testing)
 */

import type { MEP, MEPDetails } from '../../src/types/europeanParliament.js';

// ── MEP list fixture ──────────────────────────────────────────────────────────

/** Synthetic MEP list fixture for Phase 6 OSINT tests */
export const osintPhase6MEPs: MEP[] = [
  {
    id: '101',
    name: 'Thomas Weber (synthetic)',
    country: 'DE',
    politicalGroup: 'EPP',
    committees: ['AGRI', 'ENVI', 'BUDG'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: '102',
    name: 'Marie Leclerc (synthetic)',
    country: 'FR',
    politicalGroup: 'S&D',
    committees: ['ITRE', 'BUDG', 'ENVI'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: '103',
    name: 'Piotr Kowalski (synthetic)',
    country: 'PL',
    politicalGroup: 'ECR',
    committees: ['AGRI', 'LIBE', 'BUDG'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: '104',
    name: 'Elena Papadaki (synthetic)',
    country: 'GR',
    politicalGroup: 'Renew',
    committees: ['AFET', 'ITRE', 'LIBE'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: '105',
    name: 'Lars Svensson (synthetic)',
    country: 'SE',
    politicalGroup: 'Greens/EFA',
    committees: ['ENVI', 'AGRI', 'AFET'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: '106',
    name: 'Ana Costa (synthetic)',
    country: 'PT',
    politicalGroup: 'S&D',
    committees: ['LIBE', 'ENVI', 'ITRE'],
    active: true,
    termStart: '2024-07-16'
  },
  {
    id: '107',
    name: 'Henrik Nielsen (synthetic)',
    country: 'DK',
    politicalGroup: 'EPP',
    committees: ['BUDG', 'AGRI', 'AFET'],
    active: true,
    termStart: '2024-07-16'
  }
];

// ── MEP details fixture ───────────────────────────────────────────────────────

/** Synthetic MEP details fixture for Phase 6 OSINT tests */
export const osintPhase6MEPDetails: MEPDetails[] = [
  {
    id: '101',
    name: 'Thomas Weber (synthetic)',
    country: 'DE',
    politicalGroup: 'EPP',
    committees: ['AGRI', 'ENVI', 'BUDG'],
    active: true,
    termStart: '2024-07-16',
    biography: 'Synthetic biography for Thomas Weber — EPP, Germany.',
    website: 'https://example.test/mep-101',
    votingStatistics: {
      totalVotes: 320,
      votesFor: 220,
      votesAgainst: 75,
      abstentions: 25,
      attendanceRate: 92
    },
    roles: ['Vice-Chair of AGRI Committee', 'Member of ENVI Committee']
  },
  {
    id: '102',
    name: 'Marie Leclerc (synthetic)',
    country: 'FR',
    politicalGroup: 'S&D',
    committees: ['ITRE', 'BUDG', 'ENVI'],
    active: true,
    termStart: '2024-07-16',
    biography: 'Synthetic biography for Marie Leclerc — S&D, France.',
    website: 'https://example.test/mep-102',
    votingStatistics: {
      totalVotes: 290,
      votesFor: 190,
      votesAgainst: 70,
      abstentions: 30,
      attendanceRate: 88
    },
    roles: ['Member of ITRE Committee', 'Member of BUDG Committee']
  },
  {
    id: '103',
    name: 'Piotr Kowalski (synthetic)',
    country: 'PL',
    politicalGroup: 'ECR',
    committees: ['AGRI', 'LIBE', 'BUDG'],
    active: true,
    termStart: '2024-07-16',
    biography: 'Synthetic biography for Piotr Kowalski — ECR, Poland.',
    website: 'https://example.test/mep-103',
    votingStatistics: {
      totalVotes: 280,
      votesFor: 150,
      votesAgainst: 100,
      abstentions: 30,
      attendanceRate: 85
    },
    roles: ['Member of AGRI Committee']
  },
  {
    id: '104',
    name: 'Elena Papadaki (synthetic)',
    country: 'GR',
    politicalGroup: 'Renew',
    committees: ['AFET', 'ITRE', 'LIBE'],
    active: true,
    termStart: '2024-07-16',
    biography: 'Synthetic biography for Elena Papadaki — Renew, Greece.',
    website: 'https://example.test/mep-104',
    votingStatistics: {
      totalVotes: 310,
      votesFor: 210,
      votesAgainst: 65,
      abstentions: 35,
      attendanceRate: 91
    },
    roles: ['Vice-Chair of AFET Committee', 'Member of ITRE Committee']
  },
  {
    id: '105',
    name: 'Lars Svensson (synthetic)',
    country: 'SE',
    politicalGroup: 'Greens/EFA',
    committees: ['ENVI', 'AGRI', 'AFET'],
    active: true,
    termStart: '2024-07-16',
    biography: 'Synthetic biography for Lars Svensson — Greens/EFA, Sweden.',
    website: 'https://example.test/mep-105',
    votingStatistics: {
      totalVotes: 260,
      votesFor: 200,
      votesAgainst: 40,
      abstentions: 20,
      attendanceRate: 94
    },
    roles: ['Chair of ENVI Committee subcommittee', 'Member of AGRI Committee']
  },
  {
    id: '106',
    name: 'Ana Costa (synthetic)',
    country: 'PT',
    politicalGroup: 'S&D',
    committees: ['LIBE', 'ENVI', 'ITRE'],
    active: true,
    termStart: '2024-07-16',
    biography: 'Synthetic biography for Ana Costa — S&D, Portugal.',
    website: 'https://example.test/mep-106',
    votingStatistics: {
      totalVotes: 275,
      votesFor: 185,
      votesAgainst: 60,
      abstentions: 30,
      attendanceRate: 89
    },
    roles: ['Member of LIBE Committee', 'Member of ENVI Committee']
  },
  {
    id: '107',
    name: 'Henrik Nielsen (synthetic)',
    country: 'DK',
    politicalGroup: 'EPP',
    committees: ['BUDG', 'AGRI', 'AFET'],
    active: true,
    termStart: '2024-07-16',
    biography: 'Synthetic biography for Henrik Nielsen — EPP, Denmark.',
    website: 'https://example.test/mep-107',
    votingStatistics: {
      totalVotes: 300,
      votesFor: 205,
      votesAgainst: 70,
      abstentions: 25,
      attendanceRate: 90
    },
    roles: ['Member of BUDG Committee', 'Member of AFET Committee']
  }
];

// ── Paginated MEP response fixture ────────────────────────────────────────────

/** Paginated MEP response fixture — flat shape expected by Phase 6 tools */
export const osintPhase6PaginatedMEPs = {
  data: osintPhase6MEPs,
  total: osintPhase6MEPs.length,
  limit: 50,
  offset: 0,
  hasMore: false
};

// ── Voting records fixture ────────────────────────────────────────────────────

/** Synthetic voting records for Phase 6 tools (earlyWarningSystem, sentimentTracker) */
export const osintPhase6VotingRecords = {
  data: [
    {
      id: 'VOTE-2024-01-15-001',
      sessionId: 'P10-2024-01-15',
      topic: 'Vote on Climate Regulation Amendment (synthetic)',
      date: '2024-01-15T14:30:00Z',
      votesFor: 380,
      votesAgainst: 210,
      abstentions: 45,
      result: 'ADOPTED' as const
    },
    {
      id: 'VOTE-2024-02-06-001',
      sessionId: 'P10-2024-02-06',
      topic: 'Vote on Digital Economy Package (synthetic)',
      date: '2024-02-06T15:00:00Z',
      votesFor: 350,
      votesAgainst: 240,
      abstentions: 55,
      result: 'ADOPTED' as const
    },
    {
      id: 'VOTE-2024-03-12-001',
      sessionId: 'P10-2024-03-12',
      topic: 'Vote on Agricultural Subsidies Reform (synthetic)',
      date: '2024-03-12T16:00:00Z',
      votesFor: 290,
      votesAgainst: 280,
      abstentions: 70,
      result: 'ADOPTED' as const
    }
  ],
  total: 3,
  limit: 50,
  offset: 0,
  hasMore: false
};

// ── Helper to look up by ID ───────────────────────────────────────────────────

/** Look up a Phase 6 MEP fixture by string ID */
export function getOsintPhase6MEPById(id: string): MEP | undefined {
  return osintPhase6MEPs.find(m => m.id === id);
}

/** Look up Phase 6 MEP details by string ID */
export function getOsintPhase6MEPDetailsById(id: string): MEPDetails | undefined {
  return osintPhase6MEPDetails.find(m => m.id === id);
}
