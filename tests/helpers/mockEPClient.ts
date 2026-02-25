/**
 * Mock European Parliament Client
 *
 * Provides a vi.fn()-based mock of EuropeanParliamentClient for use in
 * performance, unit, and integration tests without hitting the real EP API.
 *
 * All 39 tool endpoints are covered. Uses synthetic fixture data.
 *
 * ISMS Policy: SC-002 (Secure Testing), DP-001 (GDPR Compliance)
 */

import { vi } from 'vitest';
import { mepFixtures, mepDetailsFixtures } from '../fixtures/mepFixtures.js';
import { plenaryFixtures } from '../fixtures/plenaryFixtures.js';
import { votingFixtures } from '../fixtures/votingFixtures.js';
import { documentFixtures } from '../fixtures/documentFixtures.js';
import { committeeFixtures } from '../fixtures/committeeFixtures.js';
import { procedureFixtures } from '../fixtures/procedureFixtures.js';
import { questionFixtures } from '../fixtures/questionFixtures.js';

/** Generic paginated response */
function paginated<T>(items: T[], limit = 10, offset = 0) {
  return {
    data: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
    hasMore: offset + limit < items.length
  };
}

/** Synthetic speech fixtures */
const speechFixtures = [
  {
    id: 'speech-test-001',
    title: 'Debate on Climate Regulation (synthetic)',
    speakerId: 'mep-test-001',
    speakerName: 'Anna Andersson (synthetic)',
    date: '2024-01-15',
    type: 'DEBATE_SPEECH',
    language: 'en',
    text: 'Synthetic speech content on climate regulation...',
    sessionReference: 'session-test-001'
  },
  {
    id: 'speech-test-002',
    title: 'Statement on Digital Economy (synthetic)',
    speakerId: 'mep-test-002',
    speakerName: 'Klaus Mueller (synthetic)',
    date: '2024-02-06',
    type: 'STATEMENT',
    language: 'de',
    text: 'Synthetic speech content on digital economy...',
    sessionReference: 'session-test-002'
  }
];

/** Synthetic adopted text fixtures */
const adoptedTextFixtures = [
  {
    id: 'adopted-test-001',
    title: 'Resolution on Climate Targets (synthetic)',
    reference: 'P9-TA(2024)0001',
    date: '2024-01-15',
    type: 'LEGISLATIVE_RESOLUTION',
    status: 'ADOPTED',
    text: 'Synthetic adopted text content...',
    votes: { for: 520, against: 140, abstentions: 55 }
  }
];

/** Synthetic event fixtures */
const eventFixtures = [
  {
    id: 'event-test-001',
    title: 'ENVI Committee Hearing (synthetic)',
    type: 'COMMITTEE_HEARING',
    date: '2024-01-20',
    endDate: '2024-01-20',
    location: 'Brussels',
    organizer: 'ENVI',
    status: 'CONFIRMED'
  },
  {
    id: 'event-test-002',
    title: 'Plenary Debate on Budget (synthetic)',
    type: 'PLENARY_DEBATE',
    date: '2024-02-05',
    endDate: '2024-02-05',
    location: 'Strasbourg',
    organizer: 'EP-PLENARY',
    status: 'CONFIRMED'
  }
];

/** Synthetic meeting activity fixtures */
const meetingActivityFixtures = [
  {
    id: 'activity-test-001',
    type: 'VOTE',
    title: 'Vote on Climate Amendment (synthetic)',
    date: '2024-01-15',
    order: 1,
    reference: 'ACT-TEST-001',
    responsibleBody: 'ENVI'
  }
];

/** Synthetic meeting decision fixtures */
const meetingDecisionFixtures = [
  {
    id: 'decision-test-001',
    meetingId: 'session-test-001',
    title: 'Decision on Committee Composition (synthetic)',
    date: '2024-01-15',
    type: 'PROCEDURAL',
    documents: []
  }
];

/** Synthetic MEP declaration fixtures */
const mepDeclarationFixtures = [
  {
    id: 'decl-test-001',
    mepId: 'mep-test-001',
    mepName: 'Test MEP',
    type: 'FINANCIAL_INTEREST',
    title: 'Declaration of Financial Interests 2024 (synthetic)',
    dateFiled: '2024-01-10',
    status: 'PUBLISHED'
  }
];

/** Synthetic controlled vocabulary fixtures */
const controlledVocabularyFixtures = [
  {
    id: 'vocab-test-001',
    conceptType: 'POLITICAL_GROUP',
    label: 'Progressive Alliance of Socialists and Democrats',
    abbreviation: 'S&D',
    language: 'en'
  },
  {
    id: 'vocab-test-002',
    conceptType: 'COMMITTEE',
    label: 'Committee on the Environment, Public Health and Food Safety',
    abbreviation: 'ENVI',
    language: 'en'
  }
];

/** Synthetic meeting foreseen activity fixtures */
const meetingForeseenActivityFixtures = [
  {
    id: 'foreseen-test-001',
    meetingId: 'session-test-001',
    title: 'Planned Vote on Climate Package (synthetic)',
    scheduledDate: '2024-01-15',
    type: 'VOTE',
    description: 'Synthetic foreseen activity description.'
  }
];

/** Synthetic procedure event fixtures */
const procedureEventFixtures = [
  {
    id: 'proc-event-test-001',
    procedureId: 'proc-test-001',
    title: 'Committee vote on Climate Regulation (synthetic)',
    date: '2024-03-15',
    type: 'COMMITTEE_VOTE',
    institution: 'European Parliament',
    documents: ['doc-test-001']
  }
];

/** Synthetic external document fixtures */
const externalDocumentFixtures = [
  {
    id: 'ext-doc-test-001',
    type: 'COUNCIL_POSITION',
    title: 'Council Position on Climate Regulation (synthetic)',
    date: '2024-04-10',
    authors: [],
    status: 'PUBLISHED',
    summary: 'Synthetic council position on climate regulation.'
  }
];

/**
 * Creates a fully mocked EuropeanParliamentClient using vi.fn() stubs.
 * Each method returns synthetic fixture data by default.
 * Override individual methods in tests using mockResolvedValue / mockImplementation.
 */
export function createMockEPClient() {
  return {
    // --- Core MEP methods ---
    getMEPs: vi.fn().mockImplementation(
      (params: { country?: string; limit?: number; offset?: number } = {}) => {
        const items = params.country
          ? mepFixtures.filter(m => m.country === params.country)
          : mepFixtures;
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),

    getMEPDetails: vi.fn().mockImplementation((id: string) => {
      const details = mepDetailsFixtures.find(m => m.id === id)
        ?? { ...mepFixtures[0], ...mepDetailsFixtures[0], id };
      return Promise.resolve(details);
    }),

    getCurrentMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(mepFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    getIncomingMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(mepFixtures.slice(0, 2), params.limit ?? 10, params.offset ?? 0))
    ),

    getOutgoingMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(mepFixtures.slice(3), params.limit ?? 10, params.offset ?? 0))
    ),

    getHomonymMEPs: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated([], params.limit ?? 10, params.offset ?? 0))
    ),

    getMEPDeclarations: vi.fn().mockImplementation(
      (params: { mepId?: string; limit?: number; offset?: number } = {}) => {
        const items = params.mepId
          ? mepDeclarationFixtures.filter(d => d.mepId === params.mepId)
          : mepDeclarationFixtures;
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),

    // --- Plenary methods ---
    getPlenarySessions: vi.fn().mockImplementation(
      (params: { location?: string; dateFrom?: string; dateTo?: string; limit?: number; offset?: number } = {}) => {
        let items = [...plenaryFixtures];
        if (params.location) items = items.filter(s => s.location === params.location);
        if (params.dateFrom) items = items.filter(s => s.date >= params.dateFrom!);
        if (params.dateTo) items = items.filter(s => s.date <= params.dateTo!);
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),

    // --- Voting methods ---
    getVotingRecords: vi.fn().mockImplementation(
      (params: { mepId?: string; dateFrom?: string; dateTo?: string; limit?: number; offset?: number } = {}) => {
        let items = [...votingFixtures];
        if (params.dateFrom) items = items.filter(v => v.date >= params.dateFrom!);
        if (params.dateTo) items = items.filter(v => v.date <= params.dateTo!);
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),

    // --- Document methods ---
    searchDocuments: vi.fn().mockImplementation(
      (params: { keyword?: string; type?: string; limit?: number; offset?: number } = {}) => {
        let items = [...documentFixtures];
        if (params.keyword) {
          const kw = params.keyword.toLowerCase();
          items = items.filter(d =>
            d.title.toLowerCase().includes(kw) ||
            (d.summary?.toLowerCase().includes(kw) ?? false)
          );
        }
        if (params.type) items = items.filter(d => d.type === params.type);
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),

    getPlenaryDocuments: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(documentFixtures.slice(0, 3), params.limit ?? 10, params.offset ?? 0))
    ),

    getCommitteeDocuments: vi.fn().mockImplementation(
      (params: { committeeId?: string; limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(documentFixtures.slice(1, 4), params.limit ?? 10, params.offset ?? 0))
    ),

    getPlenarySessionDocuments: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(documentFixtures.slice(0, 2), params.limit ?? 10, params.offset ?? 0))
    ),

    getPlenarySessionDocumentItems: vi.fn().mockImplementation(
      (params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(documentFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    getExternalDocuments: vi.fn().mockImplementation(
      (params: { year?: number; limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(externalDocumentFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    // --- Committee methods ---
    getCommitteeInfo: vi.fn().mockImplementation(
      (params: { abbreviation?: string; id?: string } = {}) => {
        const committee = params.abbreviation
          ? committeeFixtures.find(c => c.abbreviation === params.abbreviation)
          : params.id
            ? committeeFixtures.find(c => c.id === params.id)
            : committeeFixtures[0];
        return Promise.resolve(committee ?? committeeFixtures[0]);
      }
    ),

    // --- Parliamentary questions ---
    getParliamentaryQuestions: vi.fn().mockImplementation(
      (params: { mepId?: string; type?: string; dateFrom?: string; limit?: number; offset?: number } = {}) => {
        let items = [...questionFixtures];
        if (params.mepId) items = items.filter(q => q.author === params.mepId);
        if (params.type) items = items.filter(q => q.type === params.type);
        if (params.dateFrom) items = items.filter(q => q.date >= params.dateFrom!);
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),

    // --- Speeches ---
    getSpeeches: vi.fn().mockImplementation(
      (params: { mepId?: string; limit?: number; offset?: number } = {}) => {
        const items = params.mepId
          ? speechFixtures.filter(s => s.speakerId === params.mepId)
          : speechFixtures;
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),

    // --- Adopted texts ---
    getAdoptedTexts: vi.fn().mockImplementation(
      (params: { year?: number; limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(adoptedTextFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    // --- Events ---
    getEvents: vi.fn().mockImplementation(
      (params: { dateFrom?: string; dateTo?: string; limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(eventFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    // --- Meeting activities ---
    getMeetingActivities: vi.fn().mockImplementation(
      (_sittingId: string, params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(meetingActivityFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    getMeetingDecisions: vi.fn().mockImplementation(
      (_sittingId: string, params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(meetingDecisionFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    getMeetingForeseenActivities: vi.fn().mockImplementation(
      (_sittingId: string, params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(meetingForeseenActivityFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    // --- Procedures ---
    getProcedures: vi.fn().mockImplementation(
      (params: { year?: number; limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(procedureFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    getProcedureEvents: vi.fn().mockImplementation(
      (_processId: string, params: { limit?: number; offset?: number } = {}) =>
        Promise.resolve(paginated(procedureEventFixtures, params.limit ?? 10, params.offset ?? 0))
    ),

    // --- Controlled vocabularies ---
    getControlledVocabularies: vi.fn().mockImplementation(
      (params: { conceptType?: string; limit?: number; offset?: number } = {}) => {
        const items = params.conceptType
          ? controlledVocabularyFixtures.filter(v => v.conceptType === params.conceptType)
          : controlledVocabularyFixtures;
        return Promise.resolve(paginated(items, params.limit ?? 10, params.offset ?? 0));
      }
    ),

    // --- Cache control ---
    clearCache: vi.fn().mockResolvedValue(undefined)
  };
}

/** Type alias for the mock EP client */
export type MockEPClient = ReturnType<typeof createMockEPClient>;

/**
 * Singleton mock instance — reset between tests with resetMockEPClient()
 */
let _mockInstance: MockEPClient | null = null;

/** Get or create the singleton mock EP client */
export function getMockEPClient(): MockEPClient {
  if (!_mockInstance) {
    _mockInstance = createMockEPClient();
  }
  return _mockInstance;
}

/** Reset all mock functions on the singleton instance */
export function resetMockEPClient(): void {
  if (_mockInstance) {
    Object.values(_mockInstance).forEach(fn => {
      if (typeof fn === 'function' && 'mockReset' in fn) {
        (fn as ReturnType<typeof vi.fn>).mockReset();
      }
    });
    _mockInstance = null;
  }
}
