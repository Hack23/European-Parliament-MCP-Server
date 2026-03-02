/**
 * Centralized Mock Factory for Tool Tests
 *
 * Provides a type-safe `createStubEPClient()` factory with sensible defaults
 * for all EP client methods, and a `setupToolTest()` convenience helper that
 * registers a `beforeEach(() => vi.clearAllMocks())` in the calling test suite.
 *
 * The factory return type is `Mocked<EPClientPublicAPI>` (the public API of
 * `EuropeanParliamentClient`), ensuring that mock method names and signatures
 * stay aligned with production code at compile time. Type-checking is enforced
 * in CI via `npm run type-check:helpers` (uses `tsconfig.tests.json`).
 *
 * ## Usage
 *
 * Tool test files must still call `vi.mock()` at module level (Vitest hoists it).
 * Use this factory to get a typed mock client and reduce per-test boilerplate:
 *
 * ```typescript
 * import { vi } from 'vitest';
 * import { setupToolTest } from '../../tests/helpers/mockFactory.js';
 * import { expectValidMCPResponse } from '../../tests/helpers/assertions.js';
 * import * as epClientModule from '../clients/europeanParliamentClient.js';
 *
 * vi.mock('../clients/europeanParliamentClient.js', () => ({
 *   epClient: { getHomonymMEPs: vi.fn() },
 * }));
 *
 * setupToolTest(); // registers beforeEach(vi.clearAllMocks)
 *
 * describe('...', () => {
 *   beforeEach(() => {
 *     vi.mocked(epClientModule.epClient.getHomonymMEPs).mockResolvedValue({ ... });
 *   });
 * });
 * ```
 *
 * Or use the full client mock so every method is immediately available:
 *
 * ```typescript
 * import { vi } from 'vitest';
 * import { createStubEPClient, setupToolTest } from '../../tests/helpers/mockFactory.js';
 * import * as epClientModule from '../clients/europeanParliamentClient.js';
 *
 * const client = createStubEPClient();
 *
 * vi.mock('../clients/europeanParliamentClient.js', () => ({ epClient: client }));
 *
 * setupToolTest(); // registers beforeEach(vi.clearAllMocks)
 *
 * describe('...', () => {
 *   beforeEach(() => {
 *     client.getMEPs.mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0, hasMore: false });
 *   });
 * });
 * ```
 *
 * ISMS Policy: SC-002 (Secure Testing), DP-001 (GDPR Compliance)
 */

import { vi, beforeEach, type Mocked } from 'vitest';
import type { EuropeanParliamentClient } from '../../src/clients/europeanParliamentClient.js';

/**
 * Structural type containing only the public instance API of `EuropeanParliamentClient`.
 *
 * `keyof EuropeanParliamentClient` resolves to the public instance property/method
 * names of the class, so `Pick<EuropeanParliamentClient, keyof EuropeanParliamentClient>`
 * is equivalent to extracting only the public instance surface. Because constructors
 * are not part of the instance type, a plain object literal CAN satisfy this type,
 * which lets us use `satisfies EPClientPublicAPI` on the mock base and catch any
 * drift in method names or signatures at compile time — without the `as unknown as`
 * escape hatch.
 */
type EPClientPublicAPI = Pick<EuropeanParliamentClient, keyof EuropeanParliamentClient>;

/** Default empty paginated response used across all list endpoints. */
const DEFAULT_PAGINATED = { data: [], total: 0, limit: 50, offset: 0, hasMore: false };

/**
 * Minimal valid `MEP`-shaped object used as the default return value for
 * single-MEP endpoints (`getMEPDetails`, etc.).
 * Placeholder values make mock data easy to identify during debugging.
 */
const EMPTY_MEP = {
  id: 'mock-mep-id',
  name: 'Mock MEP Name',
  country: 'XX',
  politicalGroup: 'MOCK-GROUP',
  committees: [] as string[],
  active: false,
  termStart: '2024-01-01',
};

/** Minimal valid `LegislativeDocument`-shaped object. */
const EMPTY_DOCUMENT = {
  id: 'mock-doc-id',
  type: 'REPORT' as const,
  title: 'Mock Document Title',
  date: '2024-01-01',
  authors: [] as string[],
  status: 'DRAFT' as const,
};

/**
 * Creates a fully typed mock of `epClient` with sensible default return values.
 *
 * The factory return type is `Mocked<EPClientPublicAPI>` (where
 * `EPClientPublicAPI = Pick<EuropeanParliamentClient, keyof EuropeanParliamentClient>`),
 * which keeps method names and signatures coupled to production code — TypeScript
 * will flag any method that no longer exists on the real client. Using `Pick`
 * instead of the class directly strips private members and avoids the need for
 * an `as unknown as ...` escape hatch. Every list endpoint defaults to an empty
 * paginated response; every single-item endpoint returns a minimal valid object
 * matching the real return type (never `null`).
 *
 * Override specific methods per-test with `.mockResolvedValue()` or
 * `.mockRejectedValue()`.
 *
 * @param overrides - Partial overrides for specific mock methods.
 * @returns A `Mocked<EPClientPublicAPI>` instance.
 */
export function createStubEPClient(
  overrides?: Partial<Mocked<EPClientPublicAPI>>
): Mocked<EPClientPublicAPI> {
  const base = {
    // ── MEP ──────────────────────────────────────────────────────────────
    getMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMEPDetails: vi.fn().mockResolvedValue(EMPTY_MEP),
    getCurrentMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getIncomingMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getOutgoingMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getHomonymMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMEPDeclarations: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMEPDeclarationById: vi.fn().mockResolvedValue({
      id: 'mock-decl-id',
      title: 'Mock Declaration Title',
      mepId: 'mock-mep-id',
      mepName: 'Mock MEP Name',
      type: 'FINANCIAL_INTEREST',
      dateFiled: '2024-01-01',
      status: 'PUBLISHED',
    }),

    // ── Plenary / Meetings ───────────────────────────────────────────────
    getPlenarySessions: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingById: vi.fn().mockResolvedValue({
      id: 'mock-meeting-id',
      date: '2024-01-15',
      location: 'Strasbourg',
      agendaItems: [] as string[],
    }),
    getMeetingActivities: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingDecisions: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingForeseenActivities: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingPlenarySessionDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingPlenarySessionDocumentItems: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getEvents: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getEventById: vi.fn().mockResolvedValue({
      id: 'mock-event-id',
      title: 'Mock Event Title',
      date: '2024-01-15',
      endDate: '2024-01-15',
      type: 'COMMITTEE_HEARING',
      location: 'Brussels',
      organizer: 'MOCK-COMMITTEE',
      status: 'CONFIRMED',
    }),

    // ── Voting ───────────────────────────────────────────────────────────
    getVotingRecords: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),

    // ── Speeches ─────────────────────────────────────────────────────────
    getSpeeches: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getSpeechById: vi.fn().mockResolvedValue({
      id: 'mock-speech-id',
      title: 'Mock Speech Title',
      speakerId: 'mock-mep-id',
      speakerName: 'Mock MEP Name',
      date: '2024-01-15',
      type: 'DEBATE_SPEECH',
      language: 'en',
      text: 'Mock speech text content.',
      sessionReference: 'mock-session-id',
    }),

    // ── Committees ───────────────────────────────────────────────────────
    getCommitteeInfo: vi.fn().mockResolvedValue({
      id: 'mock-committee-id',
      name: 'Mock Committee Name',
      abbreviation: 'MOCK',
      members: [] as string[],
    }),
    getCurrentCorporateBodies: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),

    // ── Documents ────────────────────────────────────────────────────────
    searchDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getPlenaryDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getCommitteeDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getPlenarySessionDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getPlenarySessionDocumentItems: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getExternalDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getDocumentById: vi.fn().mockResolvedValue(EMPTY_DOCUMENT),
    getPlenaryDocumentById: vi.fn().mockResolvedValue(EMPTY_DOCUMENT),
    getPlenarySessionDocumentById: vi.fn().mockResolvedValue(EMPTY_DOCUMENT),
    getCommitteeDocumentById: vi.fn().mockResolvedValue(EMPTY_DOCUMENT),
    getExternalDocumentById: vi.fn().mockResolvedValue(EMPTY_DOCUMENT),

    // ── Legislative Procedures ───────────────────────────────────────────
    getProcedures: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getProcedureById: vi.fn().mockResolvedValue({
      id: 'mock-procedure-id',
      title: 'Mock Procedure Title',
      reference: '2024/0001(COD)',
      type: 'COD',
      subjectMatter: 'Internal Market',
      stage: 'First reading',
      status: 'Ongoing',
      dateInitiated: '2024-01-01',
      dateLastActivity: '2024-06-01',
      responsibleCommittee: 'MOCK',
      rapporteur: 'Mock MEP Name',
      documents: [] as string[],
    }),
    getProcedureEvents: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getAdoptedTexts: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getAdoptedTextById: vi.fn().mockResolvedValue({
      id: 'mock-adopted-text-id',
      title: 'Mock Adopted Text Title',
      reference: 'P9-TA(2024)0001',
      type: 'LEGISLATIVE_RESOLUTION',
      dateAdopted: '2024-01-15',
      procedureReference: '2024/0001(COD)',
      subjectMatter: 'Internal Market',
    }),

    // ── Parliamentary Questions ──────────────────────────────────────────
    getParliamentaryQuestions: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getParliamentaryQuestionById: vi.fn().mockResolvedValue({
      id: 'mock-question-id',
      type: 'WRITTEN' as const,
      author: 'mock-mep-id',
      date: '2024-01-15',
      topic: 'Mock Question Topic',
      questionText: 'Mock question text.',
      status: 'PENDING' as const,
    }),

    // ── Controlled Vocabularies ──────────────────────────────────────────
    getControlledVocabularies: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getControlledVocabularyById: vi.fn().mockResolvedValue({}),

    // ── Feed Endpoints ─────────────────────────────────────────────────
    getMEPsFeed: vi.fn().mockResolvedValue({}),
    getMEPDeclarationsFeed: vi.fn().mockResolvedValue({}),
    getEventsFeed: vi.fn().mockResolvedValue({}),
    getCorporateBodiesFeed: vi.fn().mockResolvedValue({}),
    getDocumentsFeed: vi.fn().mockResolvedValue({}),
    getPlenaryDocumentsFeed: vi.fn().mockResolvedValue({}),
    getCommitteeDocumentsFeed: vi.fn().mockResolvedValue({}),
    getPlenarySessionDocumentsFeed: vi.fn().mockResolvedValue({}),
    getExternalDocumentsFeed: vi.fn().mockResolvedValue({}),
    getProceduresFeed: vi.fn().mockResolvedValue({}),
    getAdoptedTextsFeed: vi.fn().mockResolvedValue({}),
    getParliamentaryQuestionsFeed: vi.fn().mockResolvedValue({}),
    getControlledVocabulariesFeed: vi.fn().mockResolvedValue({}),
    getProcedureEventById: vi.fn().mockResolvedValue({}),

    // ── Cache Control ────────────────────────────────────────────────────
    clearCache: vi.fn(),
    getCacheStats: vi.fn().mockReturnValue({ size: 0, maxSize: 0, hitRate: 0 }),
    // `satisfies EPClientPublicAPI` validates that every key in this object
    // literal is a real public method on EuropeanParliamentClient with a
    // compatible function signature. If the production API gains or removes
    // a method, TypeScript surfaces the mismatch here at compile time.
    // `...overrides` is applied after to allow per-test customisation.
  } satisfies EPClientPublicAPI;

  // Single cast — safe because `base` satisfies the structural shape of
  // `EPClientPublicAPI` (all public methods present), and `Mocked<EPClientPublicAPI>`
  // only requires the structural public surface (no private members).
  return { ...base, ...overrides } as Mocked<EPClientPublicAPI>;
}

/**
 * Convenience helper for tool test suites.
 *
 * Registers a `beforeEach(() => vi.clearAllMocks())` in the current Vitest
 * describe scope so every test starts with a clean slate.
 *
 * Note: `vi.mock()` itself must still be declared at the top of each test file
 * because Vitest hoists `vi.mock()` calls to before any imports. This function
 * only manages test lifecycle hooks; use `createStubEPClient()` separately to
 * build a typed mock and pass it directly in your `vi.mock()` factory.
 *
 * @example
 * ```typescript
 * vi.mock('../clients/europeanParliamentClient.js', () => ({ epClient: createStubEPClient() }));
 *
 * setupToolTest(); // registers beforeEach(vi.clearAllMocks)
 * ```
 */
export function setupToolTest(): void {
  beforeEach(() => {
    vi.clearAllMocks();
  });
}
