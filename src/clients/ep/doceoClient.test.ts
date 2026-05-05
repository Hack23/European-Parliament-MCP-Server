/**
 * Tests for DoceoClient HTTP layer
 *
 * Covers: HTTP error handling, size limits, XML parsing, date logic,
 * pagination, RCV/VOT fallback, and individual-votes stripping.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DoceoClient } from './doceoClient.js';

// Mock undici fetch before any imports that use it
vi.mock('undici', () => ({
  fetch: vi.fn(),
}));

import * as undici from 'undici';

// ── Helper to build a minimal mock Response ──────────────────────────────────

function makeMockResponse(opts: {
  ok: boolean;
  status?: number;
  text?: string;
  headers?: Record<string, string>;
}): Response {
  const headers = new Map(Object.entries(opts.headers ?? {}));
  return {
    ok: opts.ok,
    status: opts.status ?? (opts.ok ? 200 : 404),
    headers: { get: (k: string) => headers.get(k) ?? null },
    text: async () => opts.text ?? '',
    body: {
      cancel: async () => { /* noop */ },
    },
  } as unknown as Response;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DoceoClient', () => {
  let client: DoceoClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DoceoClient(10);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── fetchRcvForDate ─────────────────────────────────────────────────────────

  describe('fetchRcvForDate', () => {
    it('returns empty array when server returns 404', async () => {
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: false, status: 404 })
      );
      const result = await client.fetchRcvForDate('2026-04-27');
      expect(result).toEqual([]);
    });

    it('returns empty array on non-404 HTTP error', async () => {
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: false, status: 503 })
      );
      const result = await client.fetchRcvForDate('2026-04-27');
      expect(result).toEqual([]);
    });

    it('returns empty array when content-length header exceeds 5 MiB limit', async () => {
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({
          ok: true,
          headers: { 'content-length': '6000000' }, // > 5 MiB
          text: '<xml/>',
        })
      );
      const result = await client.fetchRcvForDate('2026-04-27');
      expect(result).toEqual([]);
    });

    it('returns empty array when response body exceeds 5 MiB limit', async () => {
      const bigBody = 'x'.repeat(5_300_000); // > 5 MiB
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: true, text: bigBody })
      );
      const result = await client.fetchRcvForDate('2026-04-27');
      expect(result).toEqual([]);
    });

    it('returns empty array on network error (fetch throws)', async () => {
      vi.mocked(undici.fetch).mockRejectedValueOnce(new Error('ECONNREFUSED'));
      const result = await client.fetchRcvForDate('2026-04-27');
      expect(result).toEqual([]);
    });

    it('parses valid RCV XML response', async () => {
      const xml = `<RollCallVoteResults>
        <RollCallVote.Result Identifier="1">
          <RollCallVote.Description.Text>Test Vote</RollCallVote.Description.Text>
          <Result.For Number="3">
            <PoliticalGroup.List Identifier="EPP">
              <PoliticalGroup.Member.Name MepId="1" Country="DE">Alice</PoliticalGroup.Member.Name>
              <PoliticalGroup.Member.Name MepId="2" Country="FR">Bob</PoliticalGroup.Member.Name>
              <PoliticalGroup.Member.Name MepId="3" Country="IT">Carlo</PoliticalGroup.Member.Name>
            </PoliticalGroup.List>
          </Result.For>
          <Result.Against></Result.Against>
          <Result.Abstention></Result.Abstention>
        </RollCallVote.Result>
      </RollCallVoteResults>`;
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: true, text: xml })
      );
      const result = await client.fetchRcvForDate('2026-04-27');
      expect(result).toHaveLength(1);
      expect(result[0]!.description).toBe('Test Vote');
      expect(result[0]!.votesFor).toHaveLength(3);
      expect(result[0]!.officialForCount).toBe(3);
    });
  });

  // ── fetchVotForDate ─────────────────────────────────────────────────────────

  describe('fetchVotForDate', () => {
    it('returns empty array when server returns 404', async () => {
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: false, status: 404 })
      );
      const result = await client.fetchVotForDate('2026-04-27');
      expect(result).toEqual([]);
    });

    it('parses valid VOT XML response', async () => {
      const xml = `<VoteResults>
        <Vote.Result Number="1">
          <Subject>Climate Vote</Subject>
          <Reference>A10-0001/2026</Reference>
          <For>300</For>
          <Against>100</Against>
          <Abstention>50</Abstention>
          <Result>Adopted</Result>
        </Vote.Result>
      </VoteResults>`;
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: true, text: xml })
      );
      const result = await client.fetchVotForDate('2026-04-27');
      expect(result).toHaveLength(1);
      expect(result[0]!.subject).toBe('Climate Vote');
      expect(result[0]!.votesFor).toBe(300);
      expect(result[0]!.result).toBe('ADOPTED');
    });
  });

  // ── getLatestVotes ──────────────────────────────────────────────────────────

  describe('getLatestVotes', () => {
    it('returns empty data with all dates unavailable when all fetches fail', async () => {
      vi.mocked(undici.fetch).mockResolvedValue(
        makeMockResponse({ ok: false, status: 404 })
      );
      const result = await client.getLatestVotes({ date: '2026-04-27' });
      expect(result.data).toEqual([]);
      expect(result.datesUnavailable).toContain('2026-04-27');
      expect(result.datesAvailable).toHaveLength(0);
    });

    it('prefers RCV over VOT when RCV data is available for a date', async () => {
      const rcvXml = `<RollCallVoteResults>
        <RollCallVote.Result Identifier="1">
          <RollCallVote.Description.Text>RCV Vote</RollCallVote.Description.Text>
          <Result.For Number="200">
            <PoliticalGroup.List Identifier="EPP">
              <PoliticalGroup.Member.Name MepId="1" Country="DE">A</PoliticalGroup.Member.Name>
            </PoliticalGroup.List>
          </Result.For>
          <Result.Against Number="100"></Result.Against>
          <Result.Abstention Number="50"></Result.Abstention>
        </RollCallVote.Result>
      </RollCallVoteResults>`;

      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: true, text: rcvXml })
      );

      const result = await client.getLatestVotes({ date: '2026-04-27' });
      expect(result.data[0]!.dataSource).toBe('RCV');
      expect(result.datesAvailable).toContain('2026-04-27');
    });

    it('falls back to VOT when RCV returns no results', async () => {
      const votXml = `<VoteResults>
        <Vote.Result Number="1">
          <Subject>VOT Fallback</Subject>
          <Reference>A10-0002/2026</Reference>
          <For>150</For>
          <Against>50</Against>
          <Abstention>20</Abstention>
          <Result>Adopted</Result>
        </Vote.Result>
      </VoteResults>`;

      // First call (RCV URL) → 404
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: false, status: 404 })
      );
      // Second call (VOT URL) → success
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: true, text: votXml })
      );

      const result = await client.getLatestVotes({ date: '2026-04-27' });
      expect(result.data[0]!.dataSource).toBe('VOT');
      expect(result.data[0]!.subject).toBe('VOT Fallback');
    });

    it('strips mepVotes when includeIndividualVotes=false', async () => {
      const rcvXml = `<RollCallVoteResults>
        <RollCallVote.Result Identifier="1">
          <RollCallVote.Description.Text>Test</RollCallVote.Description.Text>
          <Result.For Number="1">
            <PoliticalGroup.List Identifier="EPP">
              <PoliticalGroup.Member.Name MepId="42" Country="DE">Hans</PoliticalGroup.Member.Name>
            </PoliticalGroup.List>
          </Result.For>
          <Result.Against Number="0"></Result.Against>
          <Result.Abstention Number="0"></Result.Abstention>
        </RollCallVote.Result>
      </RollCallVoteResults>`;
      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: true, text: rcvXml })
      );

      const result = await client.getLatestVotes({
        date: '2026-04-27',
        includeIndividualVotes: false,
      });
      expect(result.data[0]!.mepVotes).toBeUndefined();
      // groupBreakdown is kept even when individual votes are stripped
      expect(result.data[0]!.groupBreakdown).toBeDefined();
    });

    it('applies limit and offset pagination', async () => {
      const rows = Array.from(
        { length: 5 },
        (_, i) => `
        <RollCallVote.Result Identifier="${String(i + 1)}">
          <RollCallVote.Description.Text>Vote ${String(i + 1)}</RollCallVote.Description.Text>
          <Result.For Number="${String(i + 1)}"></Result.For>
          <Result.Against Number="0"></Result.Against>
          <Result.Abstention Number="0"></Result.Abstention>
        </RollCallVote.Result>`
      ).join('');
      const rcvXml = `<RollCallVoteResults>${rows}</RollCallVoteResults>`;

      vi.mocked(undici.fetch).mockResolvedValueOnce(
        makeMockResponse({ ok: true, text: rcvXml })
      );

      const result = await client.getLatestVotes({
        date: '2026-04-27',
        limit: 2,
        offset: 1,
      });
      expect(result.total).toBe(5);
      expect(result.data).toHaveLength(2);
      expect(result.offset).toBe(1);
      expect(result.hasMore).toBe(true);
    });

    it('uses weekStart parameter to determine Mon–Thu date range', async () => {
      vi.mocked(undici.fetch).mockResolvedValue(
        makeMockResponse({ ok: false, status: 404 })
      );
      const result = await client.getLatestVotes({ weekStart: '2026-04-27' });
      // Should have tried 4 dates (Mon-Thu)
      expect(result.datesUnavailable).toHaveLength(4);
      expect(result.datesUnavailable[0]).toBe('2026-04-27');
      expect(result.datesUnavailable[3]).toBe('2026-04-30');
    });

    it('uses custom term when provided', async () => {
      // Create a client with term 9 directly to verify term-based URL construction
      const term9Client = new DoceoClient(9);
      const capturedUrls: string[] = [];
      vi.mocked(undici.fetch).mockImplementation(async (url: unknown) => {
        capturedUrls.push(String(url));
        return makeMockResponse({ ok: false, status: 404 });
      });

      await term9Client.getLatestVotes({ date: '2026-04-27' });
      expect(capturedUrls.some((u) => u.includes('PV-9-'))).toBe(true);
    });
  });
});
