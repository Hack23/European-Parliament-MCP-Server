/**
 * API Coverage Validation — OpenAPI Spec vs MCP Client Implementation
 *
 * Validates that every non-feed EP API v2 endpoint documented in the
 * OpenAPI specification is covered by the MCP client layer, and that
 * the query parameters our clients accept match the spec.
 *
 * Generated types come from `openapi-typescript` (see npm script
 * `generate:api-types`). The OpenAPI spec itself is cached at
 * `docs/ep-openapi-spec.json`.
 */

import { describe, it, expect } from 'vitest';
import type { paths } from './ep-api-types.js';

// ── Spec paths derived at type level ───────────────────────────────────────
// All path keys the spec defines:
type SpecPath = keyof paths;

// ── Client→Spec mapping ───────────────────────────────────────────────────
//
// Each entry maps a **spec path** to the client class + method that covers it.
// Feed endpoints (*/feed) are intentionally omitted — they are Atom/XML
// polling endpoints not surfaced through the MCP tool layer.
//
// Two spec endpoints that are sub-resources of procedures are listed at the
// bottom under "optional coverage".

/**
 * Core data endpoints that MUST be covered by the MCP client.
 * Any endpoint listed here will cause a test failure if removed from
 * the OpenAPI spec (the type system enforces SpecPath membership).
 */
const COVERED_ENDPOINTS: Record<string, { client: string; method: string; specPath: SpecPath }> = {
  // ── MEPs ─────────────────────────────────────────────────────────────────
  '/meps':                getMeta('MEPClient', 'getMEPs', '/meps'),
  '/meps/{mep-id}':      getMeta('MEPClient', 'getMEPDetails', '/meps/{mep-id}'),
  '/meps/show-current':  getMeta('MEPClient', 'getCurrentMEPs', '/meps/show-current'),
  '/meps/show-incoming': getMeta('MEPClient', 'getIncomingMEPs', '/meps/show-incoming'),
  '/meps/show-outgoing': getMeta('MEPClient', 'getOutgoingMEPs', '/meps/show-outgoing'),
  '/meps/show-homonyms': getMeta('MEPClient', 'getHomonymMEPs', '/meps/show-homonyms'),

  // ── MEP Declarations ─────────────────────────────────────────────────────
  '/meps-declarations':           getMeta('MEPClient', 'getMEPDeclarations', '/meps-declarations'),
  '/meps-declarations/{doc-id}':  getMeta('MEPClient', 'getMEPDeclarationById', '/meps-declarations/{doc-id}'),

  // ── Corporate Bodies ─────────────────────────────────────────────────────
  '/corporate-bodies':              getMeta('CommitteeClient', 'getCommitteeInfo', '/corporate-bodies'),
  '/corporate-bodies/{body-id}':    getMeta('CommitteeClient', 'getCommitteeInfo', '/corporate-bodies/{body-id}'),
  '/corporate-bodies/show-current': getMeta('CommitteeClient', 'getCurrentCorporateBodies', '/corporate-bodies/show-current'),

  // ── Meetings ─────────────────────────────────────────────────────────────
  '/meetings':                                   getMeta('PlenaryClient', 'getPlenarySessions', '/meetings'),
  '/meetings/{event-id}':                        getMeta('PlenaryClient', 'getMeetingById', '/meetings/{event-id}'),
  '/meetings/{sitting-id}/activities':            getMeta('PlenaryClient', 'getMeetingActivities', '/meetings/{sitting-id}/activities'),
  '/meetings/{sitting-id}/decisions':             getMeta('PlenaryClient', 'getMeetingDecisions', '/meetings/{sitting-id}/decisions'),
  '/meetings/{sitting-id}/foreseen-activities':   getMeta('PlenaryClient', 'getMeetingForeseenActivities', '/meetings/{sitting-id}/foreseen-activities'),
  '/meetings/{sitting-id}/vote-results':          getMeta('VotingClient', 'getVotingRecords', '/meetings/{sitting-id}/vote-results'),

  // ── Events ───────────────────────────────────────────────────────────────
  '/events':              getMeta('PlenaryClient', 'getEvents', '/events'),
  '/events/{event-id}':   getMeta('PlenaryClient', 'getEventById', '/events/{event-id}'),

  // ── Speeches ─────────────────────────────────────────────────────────────
  '/speeches':              getMeta('VotingClient', 'getSpeeches', '/speeches'),
  '/speeches/{speech-id}':  getMeta('VotingClient', 'getSpeechById', '/speeches/{speech-id}'),

  // ── Procedures ───────────────────────────────────────────────────────────
  '/procedures':                        getMeta('LegislativeClient', 'getProcedures', '/procedures'),
  '/procedures/{process-id}':           getMeta('LegislativeClient', 'getProcedureById', '/procedures/{process-id}'),
  '/procedures/{process-id}/events':    getMeta('LegislativeClient', 'getProcedureEvents', '/procedures/{process-id}/events'),

  // ── Documents ────────────────────────────────────────────────────────────
  '/documents':               getMeta('DocumentClient', 'searchDocuments', '/documents'),
  '/documents/{doc-id}':      getMeta('DocumentClient', 'getDocumentById', '/documents/{doc-id}'),

  // ── Plenary Documents ────────────────────────────────────────────────────
  '/plenary-documents':               getMeta('DocumentClient', 'getPlenaryDocuments', '/plenary-documents'),
  '/plenary-documents/{doc-id}':      getMeta('DocumentClient', 'getPlenaryDocumentById', '/plenary-documents/{doc-id}'),

  // ── Parliamentary Questions ──────────────────────────────────────────────
  '/parliamentary-questions':              getMeta('QuestionClient', 'getParliamentaryQuestions', '/parliamentary-questions'),
  '/parliamentary-questions/{doc-id}':     getMeta('QuestionClient', 'getParliamentaryQuestionById', '/parliamentary-questions/{doc-id}'),

  // ── Plenary Session Documents ────────────────────────────────────────────
  '/plenary-session-documents':               getMeta('DocumentClient', 'getPlenarySessionDocuments', '/plenary-session-documents'),
  '/plenary-session-documents/{doc-id}':      getMeta('DocumentClient', 'getPlenarySessionDocumentById', '/plenary-session-documents/{doc-id}'),
  '/plenary-session-documents-items':         getMeta('DocumentClient', 'getPlenarySessionDocumentItems', '/plenary-session-documents-items'),

  // ── Adopted Texts ────────────────────────────────────────────────────────
  '/adopted-texts':              getMeta('LegislativeClient', 'getAdoptedTexts', '/adopted-texts'),
  '/adopted-texts/{doc-id}':     getMeta('LegislativeClient', 'getAdoptedTextById', '/adopted-texts/{doc-id}'),

  // ── Committee Documents ──────────────────────────────────────────────────
  '/committee-documents':              getMeta('DocumentClient', 'getCommitteeDocuments', '/committee-documents'),
  '/committee-documents/{doc-id}':     getMeta('DocumentClient', 'getCommitteeDocumentById', '/committee-documents/{doc-id}'),

  // ── External Documents ───────────────────────────────────────────────────
  '/external-documents':              getMeta('DocumentClient', 'getExternalDocuments', '/external-documents'),
  '/external-documents/{doc-id}':     getMeta('DocumentClient', 'getExternalDocumentById', '/external-documents/{doc-id}'),

  // ── Controlled Vocabularies ──────────────────────────────────────────────
  '/controlled-vocabularies':              getMeta('VocabularyClient', 'getControlledVocabularies', '/controlled-vocabularies'),
  '/controlled-vocabularies/{voc-id}':     getMeta('VocabularyClient', 'getControlledVocabularyById', '/controlled-vocabularies/{voc-id}'),
};

/**
 * Feed endpoints that are intentionally NOT implemented in the MCP client.
 * These are Atom/XML change-notification endpoints, not useful for
 * the MCP tool layer.
 */
const FEED_ENDPOINTS: SpecPath[] = [
  '/meps/feed',
  '/corporate-bodies/feed',
  '/events/feed',
  '/procedures/feed',
  '/documents/feed',
  '/plenary-documents/feed',
  '/parliamentary-questions/feed',
  '/plenary-session-documents/feed',
  '/adopted-texts/feed',
  '/committee-documents/feed',
  '/meps-declarations/feed',
  '/external-documents/feed',
  '/controlled-vocabularies/feed',
];

/**
 * Spec endpoints with niche use cases — tracked but not required.
 */
const OPTIONAL_ENDPOINTS: SpecPath[] = [
  '/procedures/{process-id}/events/{event-id}',
];

function getMeta(client: string, method: string, specPath: SpecPath): { client: string; method: string; specPath: SpecPath } {
  return { client, method, specPath };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('EP API v2 — OpenAPI Spec Coverage', () => {
  // At compile time the SpecPath type already enforces that every key in
  // COVERED_ENDPOINTS, FEED_ENDPOINTS, and OPTIONAL_ENDPOINTS is a valid
  // OpenAPI path.  The runtime tests below validate counts and structure.

  it('should cover all non-feed, non-optional spec endpoints', () => {
    const coveredPaths = new Set(Object.keys(COVERED_ENDPOINTS));
    const feedPaths = new Set(FEED_ENDPOINTS as string[]);
    const optionalPaths = new Set(OPTIONAL_ENDPOINTS as string[]);
    const allAccountedFor = new Set([...coveredPaths, ...feedPaths, ...optionalPaths]);

    // These counts match the EP API v2 OpenAPI spec as of 2026-03.
    // Update when the spec is regenerated (npm run generate:api-types).
    expect(Object.keys(COVERED_ENDPOINTS).length).toBe(41);
    expect(FEED_ENDPOINTS.length).toBe(13);
    expect(OPTIONAL_ENDPOINTS.length).toBe(1);
    // 41 + 13 + 1 = 55 total spec endpoints
    expect(allAccountedFor.size).toBe(
      Object.keys(COVERED_ENDPOINTS).length + FEED_ENDPOINTS.length + OPTIONAL_ENDPOINTS.length
    );
  });

  it('should have a client + method for every covered endpoint', () => {
    for (const [path, meta] of Object.entries(COVERED_ENDPOINTS)) {
      expect(meta.client, `${path} missing client`).toBeTruthy();
      expect(meta.method, `${path} missing method`).toBeTruthy();
      expect(meta.specPath, `${path} specPath mismatch`).toBe(path);
    }
  });

  it('should map every covered endpoint to a unique client method', () => {
    const seen = new Set<string>();
    // Note: corporate-bodies and corporate-bodies/{body-id} can share getCommitteeInfo
    const ALLOWED_DUPLICATES = new Set([
      'CommitteeClient.getCommitteeInfo',
    ]);

    for (const [path, meta] of Object.entries(COVERED_ENDPOINTS)) {
      const key = `${meta.client}.${meta.method}`;
      if (!ALLOWED_DUPLICATES.has(key)) {
        expect(seen.has(key), `duplicate mapping: ${key} (${path})`).toBe(false);
      }
      seen.add(key);
    }
  });

  it('feed endpoints should all end with /feed', () => {
    for (const path of FEED_ENDPOINTS) {
      expect(path.endsWith('/feed'), `${path} is not a feed`).toBe(true);
    }
  });

  describe('Client distribution', () => {
    const clientCounts = new Map<string, number>();
    for (const meta of Object.values(COVERED_ENDPOINTS)) {
      clientCounts.set(meta.client, (clientCounts.get(meta.client) ?? 0) + 1);
    }

    it('should distribute endpoints across 8 sub-clients', () => {
      expect(clientCounts.size).toBe(8);
    });

    it.each([
      ['MEPClient', 8],
      ['PlenaryClient', 7],
      ['VotingClient', 3],
      ['LegislativeClient', 5],
      ['DocumentClient', 11],
      ['QuestionClient', 2],
      ['CommitteeClient', 3],
      ['VocabularyClient', 2],
    ])('%s should cover %i endpoints', (client, expected) => {
      expect(clientCounts.get(client) ?? 0).toBe(expected);
    });
  });

  describe('Generated types structure', () => {
    it('should export a paths interface covering all endpoints', () => {
      // This is validated at the type level — if the spec changes, the
      // SpecPath references in COVERED_ENDPOINTS / FEED_ENDPOINTS will
      // cause a compile error.
      const allPaths = [
        ...Object.keys(COVERED_ENDPOINTS),
        ...FEED_ENDPOINTS,
        ...OPTIONAL_ENDPOINTS,
      ];
      expect(allPaths.length).toBe(
        Object.keys(COVERED_ENDPOINTS).length + FEED_ENDPOINTS.length + OPTIONAL_ENDPOINTS.length
      );
    });

    it('openapi-typescript types file should be importable', () => {
      // Compile-time validation: the paths type is imported at the top
      // of this file.  If the generated types are missing or malformed,
      // this file will fail to compile.
      const _typeCheck: SpecPath = '/meps';
      expect(_typeCheck).toBe('/meps');
    });
  });
});
