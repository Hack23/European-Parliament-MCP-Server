/**
 * Tests for pagination metadata correctness across representative EP API client scenarios.
 *
 * Verifies that `total`, `hasMore`, `limit`, and `offset` are computed
 * consistently for server-paginated, client-filtered, and in-memory
 * paginated responses covered by this suite.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EuropeanParliamentClient } from '../europeanParliamentClient.js';
import type { JSONLDResponse } from './baseClient.js';

vi.mock('undici', () => ({ fetch: vi.fn() }));

import { fetch } from 'undici';
const mockFetch = fetch as ReturnType<typeof vi.fn>;

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build a minimal JSON-LD envelope with `count` items. */
function buildResponse(count: number, prefix = 'item'): JSONLDResponse {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: `${prefix}/${i + 1}`,
      type: 'Item',
      identifier: String(i + 1),
      label: `Test ${prefix} ${i + 1}`,
      familyName: `Last${i + 1}`,
      givenName: `First${i + 1}`,
      sortLabel: `LAST${i + 1}`,
      'api:country-of-representation': 'DE',
      'api:political-group': 'EPP',
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld',
    ],
  };
}

function buildDocumentResponse(count: number): JSONLDResponse {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: `doc-${i + 1}`,
      work_id: `A-9-2024-${String(i + 1).padStart(4, '0')}`,
      work_type: 'REPORT_PLENARY',
      title_dcterms: [{ '@language': 'en', '@value': `Document ${i + 1}` }],
      work_date_document: '2024-01-15',
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld',
    ],
  };
}

function buildMeetingResponse(count: number): JSONLDResponse {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: `eli/dl/event/MTG-PL-2024-01-${10 + i}`,
      type: 'Activity',
      'eli-dl:activity_date': { '@value': `2024-01-${10 + i}T00:00:00+01:00`, type: 'xsd:dateTime' },
      activity_id: `MTG-PL-2024-01-${10 + i}`,
      activity_label: { en: `Meeting ${i + 1}` },
      hasLocality: 'http://publications.europa.eu/resource/authority/place/FRA_SXB',
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld',
    ],
  };
}

function buildQuestionResponse(count: number): JSONLDResponse {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: `question-${i + 1}`,
      work_id: `E-${String(i + 1).padStart(6, '0')}/2024`,
      work_type: 'QUESTION_WRITTEN',
      title_dcterms: [{ '@language': 'en', '@value': `Question ${i + 1}` }],
      work_date_document: '2024-01-15',
      was_attributed_to: [{ label: `Author ${i + 1}` }],
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld',
    ],
  };
}

function buildProcedureResponse(count: number): JSONLDResponse {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: `procedure-${i + 1}`,
      process_id: `2024-${String(i + 1).padStart(4, '0')}`,
      title_dcterms: [{ '@language': 'en', '@value': `Procedure ${i + 1}` }],
      work_date_document: '2024-01-15',
      label: `Procedure label ${i + 1}`,
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld',
    ],
  };
}

function buildSpeechResponse(count: number): JSONLDResponse {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: `speech-${i + 1}`,
      identifier: `SPEECH-${i + 1}`,
      label: `Speech on topic ${i + 1}`,
      had_activity_type: 'DEBATE_SPEECH',
      had_participant_person: `person/1000${i}`,
      participant_label: `Speaker ${i + 1}`,
      activity_date: { '@value': `2024-03-${String(10 + i)}T10:00:00Z`, type: 'xsd:dateTime' },
      language: 'en',
      text: `Speech content ${i + 1}`,
      was_part_of: `event/MTG-PL-2024-03-${String(10 + i)}`,
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld',
    ],
  };
}

function buildCorporateBodyResponse(count: number): JSONLDResponse {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: `org/BODY-${i + 1}`,
      body_id: `BODY-${i + 1}`,
      label: [{ '@language': 'en', '@value': `Body ${i + 1}` }],
      notation: `BODY${i + 1}`,
      classification: 'COMMITTEE_PARLIAMENTARY_STANDING',
      hasMembership: [],
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld',
    ],
  };
}

function buildVocabularyResponse(count: number): JSONLDResponse {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: `vocab-${i + 1}`,
      label: `Vocabulary ${i + 1}`,
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld',
    ],
  };
}

function mockOk(data: unknown): void {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    headers: new Headers(),
    json: async () => data,
  });
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe('Pagination metadata correctness', () => {
  let client: EuropeanParliamentClient;

  beforeEach(() => {
    client = new EuropeanParliamentClient();
    client.clearCache();
    vi.clearAllMocks();
  });

  // ── getMEPs ─────────────────────────────────────────────────────────────

  describe('getMEPs', () => {
    it('hasMore=true and total includes +1 when page is full', async () => {
      mockOk(buildResponse(10, 'person'));
      const result = await client.getMEPs({ limit: 10, offset: 0 });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(11); // 0 + 10 + 1
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('hasMore=false and exact total when page is partial', async () => {
      mockOk(buildResponse(3, 'person'));
      const result = await client.getMEPs({ limit: 10, offset: 20 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(23); // 20 + 3 + 0
    });

    it('hasMore=false and total=0 for empty results', async () => {
      mockOk(buildResponse(0));
      const result = await client.getMEPs({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    it('uses strict equality (===) not >=', async () => {
      // When returned items < limit, hasMore must be false even if count is close
      mockOk(buildResponse(49, 'person'));
      const result = await client.getMEPs({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(49);
    });
  });

  // ── getCurrentMEPs (server pagination path) ─────────────────────────────

  describe('getCurrentMEPs (unfiltered)', () => {
    it('hasMore=true when page is full', async () => {
      mockOk(buildResponse(50, 'person'));
      const result = await client.getCurrentMEPs({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(51); // 0 + 50 + 1
    });

    it('hasMore=false when page is partial', async () => {
      mockOk(buildResponse(10, 'person'));
      const result = await client.getCurrentMEPs({ limit: 50, offset: 100 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(110); // 100 + 10 + 0
    });
  });

  // ── getCurrentMEPs (filtered path) ──────────────────────────────────────

  describe('getCurrentMEPs (filtered — in-memory pagination)', () => {
    it('returns exact total for filtered results', async () => {
      // The filtered path fetches all MEPs in batches. We return a partial
      // batch (< batchSize=100) so the internal loop stops after one page.
      const response = buildResponse(5, 'person');
      // Ensure all have country 'DE' so they pass the filter
      mockOk(response);
      const result = await client.getCurrentMEPs({ country: 'DE', limit: 3, offset: 0 });
      expect(result.total).toBe(5); // exact: 5 matched DE
      expect(result.data).toHaveLength(3); // page slice
      expect(result.hasMore).toBe(true);
    });

    it('hasMore=false on last page of filtered results', async () => {
      mockOk(buildResponse(5, 'person'));
      const result = await client.getCurrentMEPs({ country: 'DE', limit: 10, offset: 0 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(5);
      expect(result.data).toHaveLength(5);
    });
  });

  // ── getIncomingMEPs / getOutgoingMEPs / getHomonymMEPs ──────────────────

  describe.each([
    ['getIncomingMEPs'],
    ['getOutgoingMEPs'],
    ['getHomonymMEPs'],
  ] as const)('%s', (method) => {
    it('hasMore=true when page is full', async () => {
      mockOk(buildResponse(20, 'person'));
      const result = await (client as unknown as Record<string, (p: { limit: number; offset: number }) => Promise<{ hasMore: boolean; total: number }>>)[method]({ limit: 20, offset: 0 });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(21);
    });

    it('hasMore=false when page is partial', async () => {
      mockOk(buildResponse(5, 'person'));
      const result = await (client as unknown as Record<string, (p: { limit: number; offset: number }) => Promise<{ hasMore: boolean; total: number }>>)[method]({ limit: 20, offset: 10 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(15); // 10 + 5
    });
  });

  // ── getPlenarySessions ──────────────────────────────────────────────────

  describe('getPlenarySessions', () => {
    it('hasMore uses pre-filter page size (location filter)', async () => {
      // Return a full page from the server, but only some match the filter
      mockOk(buildMeetingResponse(10));
      const result = await client.getPlenarySessions({
        limit: 10,
        offset: 0,
        location: 'Strasbourg',
      });
      // hasMore should be true because server returned 10 === limit
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(11); // 0 + 10 + 1 (pre-filter page size)
    });

    it('hasMore=false when server returns partial page', async () => {
      mockOk(buildMeetingResponse(3));
      const result = await client.getPlenarySessions({ limit: 10, offset: 5 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(8); // 5 + 3
    });
  });

  // ── searchDocuments ─────────────────────────────────────────────────────

  describe('searchDocuments', () => {
    it('full server page with all items matching keyword: hasMore=true, total=offset+pageSize+1', async () => {
      // All 20 documents have title "Climate report N" → match keyword "climate"
      const response: JSONLDResponse = {
        data: Array.from({ length: 20 }, (_, i) => ({
          id: `doc-${i + 1}`,
          work_id: `A-9-2024-${String(i + 1).padStart(4, '0')}`,
          work_type: 'REPORT_PLENARY',
          title_dcterms: [{ '@language': 'en', '@value': `Climate report ${i + 1}` }],
          work_date_document: '2024-01-15',
        })),
        '@context': [
          { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
          'https://data.europarl.europa.eu/api/v2/context.jsonld',
        ],
      };
      mockOk(response);
      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 20,
        offset: 0,
      });
      expect(result.data.length).toBe(20);
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(21); // 0 + 20 filtered + 1 sentinel
    });

    it('full server page with all items filtered out by keyword: envelope invariant holds', async () => {
      // 20 documents with titles "Document N" do NOT match keyword "climate" —
      // this reproduces the reported bug scenario (data:[] total:21 hasMore:true).
      // Fix: total reflects the post-filter count so `total - offset >= data.length`.
      mockOk(buildDocumentResponse(20));
      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 20,
        offset: 0,
      });
      expect(result.data.length).toBe(0);
      expect(result.hasMore).toBe(true); // server page was full, more may follow
      expect(result.total).toBe(1); // 0 + 0 filtered + 1 sentinel (NOT 21)
      // Envelope invariant
      expect(result.total - result.offset).toBeGreaterThanOrEqual(result.data.length);
    });

    it('partial server page with all items filtered out: total === offset, hasMore=false', async () => {
      // 5 documents with titles "Document N" do NOT match keyword "climate".
      // Partial page → hasMore=false; total reflects exhausted filter result.
      mockOk(buildDocumentResponse(5));
      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 20,
        offset: 10,
      });
      expect(result.data.length).toBe(0);
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(10); // offset + 0 filtered (no +1 since hasMore=false)
      expect(result.total).toBe(result.offset);
    });
  });

  // ── getParliamentaryQuestions ────────────────────────────────────────────

  describe('getParliamentaryQuestions', () => {
    it('hasMore uses pre-filter page size', async () => {
      mockOk(buildQuestionResponse(10));
      const result = await client.getParliamentaryQuestions({
        limit: 10,
        offset: 0,
      });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(11);
    });

    it('hasMore=false on partial page even with client-side filters', async () => {
      mockOk(buildQuestionResponse(3));
      const result = await client.getParliamentaryQuestions({
        limit: 10,
        offset: 5,
        topic: 'nonexistent',
      });
      // Server returned 3 items (partial page → hasMore=false)
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(8); // 5 + 3 (pre-filter)
    });
  });

  // ── getProcedures ───────────────────────────────────────────────────────

  describe('getProcedures', () => {
    it('hasMore=true when full page', async () => {
      mockOk(buildProcedureResponse(50));
      const result = await client.getProcedures({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(51);
    });

    it('hasMore=false on partial page', async () => {
      mockOk(buildProcedureResponse(10));
      const result = await client.getProcedures({ limit: 50, offset: 100 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(110);
    });
  });

  // ── getSpeeches ──────────────────────────────────────────────────────────

  describe('getSpeeches', () => {
    it('hasMore=true and total includes +1 when page is full', async () => {
      mockOk(buildSpeechResponse(10));
      const result = await client.getSpeeches({ limit: 10, offset: 0 });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(11); // 0 + 10 + 1
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('hasMore=false and exact total when page is partial', async () => {
      mockOk(buildSpeechResponse(3));
      const result = await client.getSpeeches({ limit: 10, offset: 20 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(23); // 20 + 3 + 0
    });

    it('hasMore=false for empty results', async () => {
      mockOk(buildSpeechResponse(0));
      const result = await client.getSpeeches({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  // ── getCurrentCorporateBodies ───────────────────────────────────────────

  describe('getCurrentCorporateBodies', () => {
    it('hasMore=true and total includes +1 when page is full', async () => {
      mockOk(buildCorporateBodyResponse(10));
      const result = await client.getCurrentCorporateBodies({ limit: 10, offset: 0 });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(11); // 0 + 10 + 1
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('hasMore=false and exact total when page is partial', async () => {
      mockOk(buildCorporateBodyResponse(5));
      const result = await client.getCurrentCorporateBodies({ limit: 10, offset: 30 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(35); // 30 + 5 + 0
    });

    it('hasMore=false for empty results', async () => {
      mockOk(buildCorporateBodyResponse(0));
      const result = await client.getCurrentCorporateBodies({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  // ── getControlledVocabularies ───────────────────────────────────────────

  describe('getControlledVocabularies', () => {
    it('hasMore=true and total includes +1 when page is full', async () => {
      mockOk(buildVocabularyResponse(10));
      const result = await client.getControlledVocabularies({ limit: 10, offset: 0 });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(11); // 0 + 10 + 1
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('hasMore=false and exact total when page is partial', async () => {
      mockOk(buildVocabularyResponse(7));
      const result = await client.getControlledVocabularies({ limit: 10, offset: 40 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(47); // 40 + 7 + 0
    });

    it('hasMore=false for empty results', async () => {
      mockOk(buildVocabularyResponse(0));
      const result = await client.getControlledVocabularies({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('empty result set returns total=0, hasMore=false', async () => {
      mockOk(buildResponse(0));
      const result = await client.getMEPs({ limit: 50, offset: 0 });
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
      expect(result.data).toHaveLength(0);
    });

    it('single item page returns hasMore=false', async () => {
      mockOk(buildResponse(1, 'person'));
      const result = await client.getMEPs({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(1);
    });

    it('offset > 0 with empty results gives correct total', async () => {
      mockOk(buildResponse(0));
      const result = await client.getMEPs({ limit: 50, offset: 999 });
      expect(result.total).toBe(999); // 999 + 0
      expect(result.hasMore).toBe(false);
    });

    it('exact boundary: items === limit → hasMore=true', async () => {
      mockOk(buildResponse(50, 'person'));
      const result = await client.getMEPs({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(51);
    });

    it('one less than limit → hasMore=false', async () => {
      mockOk(buildResponse(49, 'person'));
      const result = await client.getMEPs({ limit: 50, offset: 0 });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(49);
    });
  });
});
