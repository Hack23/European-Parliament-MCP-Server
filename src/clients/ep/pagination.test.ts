/**
 * Tests for pagination metadata correctness across all EP API clients.
 *
 * Verifies that `total`, `hasMore`, `limit`, and `offset` are computed
 * consistently for server-paginated, client-filtered, and in-memory
 * paginated responses.
 *
 * @see https://github.com/Hack23/European-Parliament-MCP-Server/issues/XXX
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EuropeanParliamentClient } from '../europeanParliamentClient.js';

vi.mock('undici', () => ({ fetch: vi.fn() }));

import { fetch } from 'undici';
const mockFetch = fetch as ReturnType<typeof vi.fn>;

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build a minimal JSON-LD envelope with `count` items. */
function buildResponse(count: number, prefix = 'item') {
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

function buildDocumentResponse(count: number) {
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

function buildMeetingResponse(count: number) {
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

function buildQuestionResponse(count: number) {
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

function buildProcedureResponse(count: number) {
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

function mockOk(data: unknown) {
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
    it('hasMore=true based on pre-filter page size', async () => {
      mockOk(buildDocumentResponse(20));
      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 20,
        offset: 0,
      });
      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(21);
    });

    it('hasMore=false on partial page', async () => {
      mockOk(buildDocumentResponse(5));
      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 20,
        offset: 10,
      });
      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(15);
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
