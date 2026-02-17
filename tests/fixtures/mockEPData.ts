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
    nationalParty: 'Swedish Social Democratic Party',
    active: true,
    termStart: '2019-07-02',
    committees: ['ENVI', 'ITRE']
  },
  {
    id: 'mep-12346',
    name: 'Lars Larsson',
    country: 'SE',
    politicalGroup: 'EPP',
    nationalParty: 'Moderate Party',
    active: true,
    termStart: '2019-07-02',
    committees: ['ECON', 'BUDG']
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
    agenda: ['Budget discussion', 'Climate policy debate'],
    attendees: ['mep-12345', 'mep-12346'],
    documents: ['doc-001', 'doc-002']
  }
];

/**
 * Mock voting record data
 */
export const mockVotingRecords: VotingRecord[] = [
  {
    id: 'vote-001',
    date: '2024-01-15',
    title: 'Climate Action Amendment',
    mepId: 'mep-12345',
    vote: 'FOR',
    sessionId: 'session-2024-01'
  },
  {
    id: 'vote-002',
    date: '2024-01-15',
    title: 'Climate Action Amendment',
    mepId: 'mep-12346',
    vote: 'AGAINST',
    sessionId: 'session-2024-01'
  }
];

/**
 * Mock legislative document data
 */
export const mockDocuments: LegislativeDocument[] = [
  {
    id: 'doc-001',
    title: 'Regulation on Climate Neutrality',
    type: 'REGULATION',
    date: '2024-01-10',
    status: 'IN_PROGRESS',
    rapporteur: 'mep-12345',
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
    acronym: 'ENVI',
    members: ['mep-12345'],
    chair: 'mep-12345'
  },
  {
    id: 'ECON',
    name: 'Committee on Economic and Monetary Affairs',
    acronym: 'ECON',
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
    date: '2024-01-10',
    author: 'mep-12345',
    title: 'Question on EU Climate Policy Implementation',
    body: 'What measures is the Commission taking to ensure member states meet 2030 climate targets?',
    answered: true,
    answerDate: '2024-01-20'
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
 * Get mock voting records by MEP
 */
export function getMockVotingRecordsByMEP(mepId: string): VotingRecord[] {
  return mockVotingRecords.filter(vote => vote.mepId === mepId);
}
