/**
 * Mock European Parliament API Data
 * 
 * Provides fixtures for testing without hitting real API
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 */

import type { MEP, PlenarySession, VotingRecord, LegislativeDocument, Committee, ParliamentaryQuestion } from '../../src/types/europeanParliament.js';

/**
 * Mock MEP data
 */
export const mockMEPs: MEP[] = [
  {
    id: 'mep-12345',
    name: 'Anna Andersson',
    country: 'SE',
    politicalGroup: 'S&D',
    committees: ['ENVI', 'ITRE'],
    active: true,
    termStart: '2019-07-02'
  },
  {
    id: 'mep-12346',
    name: 'Lars Larsson',
    country: 'SE',
    politicalGroup: 'EPP',
    committees: ['ECON', 'BUDG'],
    active: true,
    termStart: '2019-07-02'
  }
];

/**
 * Mock plenary session data
 */
export const mockPlenarySessions: PlenarySession[] = [
  {
    id: 'session-2024-01',
    date: '2024-01-15',
    location: 'Strasbourg',
    agendaItems: ['Budget discussion', 'Climate policy debate'],
    attendanceCount: 705,
    documents: ['doc-001', 'doc-002']
  }
];

/**
 * Mock voting record data
 */
export const mockVotingRecords: VotingRecord[] = [
  {
    id: 'vote-001',
    sessionId: 'session-2024-01',
    topic: 'Climate Action Amendment',
    date: '2024-01-15',
    votesFor: 450,
    votesAgainst: 200,
    abstentions: 55,
    result: 'ADOPTED',
    mepVotes: {
      'mep-12345': 'FOR',
      'mep-12346': 'AGAINST'
    }
  }
];

/**
 * Mock legislative document data
 */
export const mockDocuments: LegislativeDocument[] = [
  {
    id: 'doc-001',
    type: 'REGULATION',
    title: 'Regulation on Climate Neutrality',
    date: '2024-01-10',
    authors: ['mep-12345'],
    status: 'IN_COMMITTEE',
    summary: 'Regulation establishing framework for climate neutrality by 2050'
  }
];

/**
 * Mock committee data
 */
export const mockCommittees: Committee[] = [
  {
    id: 'ENVI',
    name: 'Committee on the Environment, Public Health and Food Safety',
    abbreviation: 'ENVI',
    members: ['mep-12345'],
    chair: 'mep-12345'
  },
  {
    id: 'ECON',
    name: 'Committee on Economic and Monetary Affairs',
    abbreviation: 'ECON',
    members: ['mep-12346'],
    chair: 'mep-12346'
  }
];

/**
 * Mock parliamentary question data
 */
export const mockQuestions: ParliamentaryQuestion[] = [
  {
    id: 'q-001',
    type: 'WRITTEN',
    author: 'mep-12345',
    date: '2024-01-10',
    topic: 'EU Climate Policy Implementation',
    questionText: 'What measures is the Commission taking to ensure member states meet 2030 climate targets?',
    answerText: 'The Commission is implementing various measures including...',
    answerDate: '2024-01-20',
    status: 'ANSWERED'
  }
];

/**
 * Get mock MEP by ID
 */
export function getMockMEPById(id: string): MEP | undefined {
  return mockMEPs.find(mep => mep.id === id);
}

/**
 * Get mock MEPs by country
 */
export function getMockMEPsByCountry(country: string): MEP[] {
  return mockMEPs.filter(mep => mep.country === country);
}

/**
 * Get mock voting records by session
 */
export function getMockVotingRecordsBySession(sessionId: string): VotingRecord[] {
  return mockVotingRecords.filter(vote => vote.sessionId === sessionId);
}
