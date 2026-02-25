/**
 * Mock European Parliament API Data
 * 
 * Provides fixtures for testing without hitting real API.
 * Extended with EP API v2 endpoints for comprehensive coverage.
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 */

import type {
  MEP,
  PlenarySession,
  VotingRecord,
  LegislativeDocument,
  Committee,
  ParliamentaryQuestion,
  Speech,
  Procedure,
  AdoptedText,
  EPEvent,
  MeetingActivity,
  MEPDeclaration,
} from '../../src/types/europeanParliament.js';

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
 * Mock speech data — EP API v2 /speeches endpoint
 */
export const mockSpeeches: Speech[] = [
  {
    id: 'speech-2024-001',
    title: 'Debate on Climate Regulation',
    speakerId: 'mep-12345',
    speakerName: 'Anna Andersson',
    date: '2024-01-15',
    type: 'DEBATE_SPEECH',
    language: 'en',
    text: 'We must act now to protect the environment for future generations...',
    sessionReference: 'session-2024-01'
  }
];

/**
 * Mock procedure data — EP API v2 /procedures endpoint
 */
export const mockProcedures: Procedure[] = [
  {
    id: 'COD/2024/0001',
    title: 'Regulation on Climate Neutrality Framework',
    reference: '2024/0001(COD)',
    type: 'COD',
    subjectMatter: 'Environment',
    stage: 'Awaiting Parliament position in 1st reading',
    status: 'Ongoing',
    dateInitiated: '2024-01-15',
    dateLastActivity: '2024-06-10',
    responsibleCommittee: 'ENVI',
    rapporteur: 'Anna Andersson',
    documents: ['doc-001']
  }
];

/**
 * Mock adopted text data — EP API v2 /adopted-texts endpoint
 */
export const mockAdoptedTexts: AdoptedText[] = [
  {
    id: 'adopted-2024-001',
    title: 'Resolution on Climate Action',
    reference: 'P9-TA(2024)0001',
    date: '2024-01-15',
    type: 'LEGISLATIVE_RESOLUTION',
    status: 'ADOPTED',
    text: 'The European Parliament, having regard to its Rules of Procedure...',
    votes: { for: 520, against: 140, abstentions: 55 }
  }
];

/**
 * Mock event data — EP API v2 /events endpoint
 */
export const mockEvents: EPEvent[] = [
  {
    id: 'event-2024-001',
    title: 'ENVI Committee Hearing on Climate',
    type: 'COMMITTEE_HEARING',
    date: '2024-01-20',
    location: 'Brussels',
    committees: ['ENVI'],
    description: 'Public hearing on implementation of climate regulation'
  }
];

/**
 * Mock meeting activity data — EP API v2 /meetings activities endpoint
 */
export const mockMeetingActivities: MeetingActivity[] = [
  {
    id: 'activity-2024-001',
    meetingId: 'session-2024-01',
    type: 'VOTE',
    title: 'Vote on Climate Amendment',
    date: '2024-01-15',
    result: 'ADOPTED',
    documents: ['doc-001']
  }
];

/**
 * Mock MEP declaration data — EP API v2 /mep-declarations endpoint
 */
export const mockMEPDeclarations: MEPDeclaration[] = [
  {
    id: 'decl-2024-001',
    mepId: 'mep-12345',
    type: 'FINANCIAL_INTEREST',
    title: 'Declaration of Financial Interests 2024',
    date: '2024-01-10',
    content: 'No financial interests to declare.',
    documentUrl: 'https://www.europarl.europa.eu/meps/declarations/mep-12345.pdf'
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

/**
 * Get mock speeches by MEP ID
 */
export function getMockSpeechesByMep(mepId: string): Speech[] {
  return mockSpeeches.filter(s => s.speakerId === mepId);
}

/**
 * Get mock procedures by status
 */
export function getMockProceduresByStatus(status: string): Procedure[] {
  return mockProcedures.filter(p => p.status === status);
}

/**
 * Get mock declarations by MEP ID
 */
export function getMockDeclarationsByMep(mepId: string): MEPDeclaration[] {
  return mockMEPDeclarations.filter(d => d.mepId === mepId);
}
