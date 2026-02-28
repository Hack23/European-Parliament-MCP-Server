/**
 * Centralized Mock Factory for Tool Tests
 *
 * Provides a type-safe `createMockEPClient()` factory with sensible defaults
 * for all EP client methods, and a `setupToolTest()` convenience helper that
 * registers a `beforeEach(() => vi.clearAllMocks())` in the calling test suite.
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
 * import { createMockEPClient, setupToolTest } from '../../tests/helpers/mockFactory.js';
 * import * as epClientModule from '../clients/europeanParliamentClient.js';
 *
 * const client = createMockEPClient();
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

import { vi, beforeEach } from 'vitest';

/** Default empty paginated response used across all list endpoints. */
const DEFAULT_PAGINATED = { data: [], total: 0, limit: 50, offset: 0, hasMore: false };

/**
 * Creates a fully typed mock of `epClient` with sensible default return values.
 *
 * Every method returns `mockResolvedValue` with an empty-but-valid response by
 * default. Override specific methods per-test with `.mockResolvedValue()` or
 * `.mockRejectedValue()`.
 *
 * @param overrides - Partial overrides for specific mock methods.
 * @returns A typed mock object mirroring the `EuropeanParliamentClient` public API.
 */
export function createMockEPClient(
  overrides?: Partial<ReturnType<typeof buildDefaultMockClient>>
): ReturnType<typeof buildDefaultMockClient> {
  return { ...buildDefaultMockClient(), ...overrides };
}

/** @internal */
function buildDefaultMockClient() {
  return {
    // ── MEP ──────────────────────────────────────────────────────────────
    getMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMEPDetails: vi.fn().mockResolvedValue(null),
    getCurrentMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getIncomingMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getOutgoingMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getHomonymMEPs: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMEPDeclarations: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMEPDeclarationById: vi.fn().mockResolvedValue(null),

    // ── Plenary / Meetings ───────────────────────────────────────────────
    getPlenarySessions: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingById: vi.fn().mockResolvedValue(null),
    getMeetingActivities: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingDecisions: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingForeseenActivities: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingPlenarySessionDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getMeetingPlenarySessionDocumentItems: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getEvents: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getEventById: vi.fn().mockResolvedValue(null),

    // ── Voting ───────────────────────────────────────────────────────────
    getVotingRecords: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),

    // ── Speeches ─────────────────────────────────────────────────────────
    getSpeeches: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getSpeechById: vi.fn().mockResolvedValue(null),

    // ── Committees ───────────────────────────────────────────────────────
    getCommitteeInfo: vi.fn().mockResolvedValue(null),
    getCurrentCorporateBodies: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),

    // ── Documents ────────────────────────────────────────────────────────
    searchDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getPlenaryDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getCommitteeDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getPlenarySessionDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getPlenarySessionDocumentItems: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getExternalDocuments: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getDocumentById: vi.fn().mockResolvedValue(null),
    getPlenaryDocumentById: vi.fn().mockResolvedValue(null),
    getPlenarySessionDocumentById: vi.fn().mockResolvedValue(null),
    getCommitteeDocumentById: vi.fn().mockResolvedValue(null),
    getExternalDocumentById: vi.fn().mockResolvedValue(null),

    // ── Legislative Procedures ───────────────────────────────────────────
    getProcedures: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getProcedureById: vi.fn().mockResolvedValue(null),
    getProcedureEvents: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getAdoptedTexts: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getAdoptedTextById: vi.fn().mockResolvedValue(null),

    // ── Parliamentary Questions ──────────────────────────────────────────
    getParliamentaryQuestions: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getParliamentaryQuestionById: vi.fn().mockResolvedValue(null),

    // ── Controlled Vocabularies ──────────────────────────────────────────
    getControlledVocabularies: vi.fn().mockResolvedValue(DEFAULT_PAGINATED),
    getControlledVocabularyById: vi.fn().mockResolvedValue(null),

    // ── Cache Control ────────────────────────────────────────────────────
    clearCache: vi.fn().mockResolvedValue(undefined),
    getCacheStats: vi.fn().mockReturnValue({ size: 0, hitRate: 0 }),
  };
}

/** Type of the mock EP client returned by {@link createMockEPClient}. */
export type MockEPClient = ReturnType<typeof createMockEPClient>;

/**
 * Convenience helper for tool test suites.
 *
 * Registers a `beforeEach(() => vi.clearAllMocks())` in the current Vitest
 * describe scope so every test starts with a clean slate.
 *
 * Note: `vi.mock()` itself must still be declared at the top of each test file
 * because Vitest hoists `vi.mock()` calls to before any imports. This function
 * only manages test lifecycle hooks; use `createMockEPClient()` separately to
 * build a typed mock and pass it directly in your `vi.mock()` factory.
 *
 * @example
 * ```typescript
 * vi.mock('../clients/europeanParliamentClient.js', () => ({ epClient: { getMEPs: vi.fn() } }));
 *
 * setupToolTest(); // registers beforeEach(vi.clearAllMocks)
 * ```
 */
export function setupToolTest(): void {
  beforeEach(() => {
    vi.clearAllMocks();
  });
}
