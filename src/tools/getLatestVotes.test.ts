/**
 * Tests for get_latest_votes MCP tool
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGetLatestVotes } from './getLatestVotes.js';

// Mock the doceoClient
vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn(),
  },
}));

import { doceoClient } from '../clients/ep/doceoClient.js';

const mockGetLatestVotes = vi.mocked(doceoClient.getLatestVotes);

describe('handleGetLatestVotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns latest votes with default parameters', async () => {
    const mockResponse = {
      data: [{
        id: 'RCV-10-2026-04-27-001',
        date: '2026-04-27',
        term: 10,
        subject: 'Climate Amendment',
        reference: 'A10-0001/2026',
        votesFor: 385,
        votesAgainst: 210,
        abstentions: 45,
        result: 'ADOPTED' as const,
        mepVotes: { '100': 'FOR' as const },
        groupBreakdown: { 'EPP': { for: 200, against: 10, abstain: 5 } },
        sourceUrl: 'https://www.europarl.europa.eu/doceo/document/PV-10-2026-04-27-RCV_EN.xml',
      }],
      total: 1,
      datesAvailable: ['2026-04-27'],
      datesUnavailable: ['2026-04-28', '2026-04-29', '2026-04-30'],
      source: {
        type: 'DOCEO_XML' as const,
        term: 10,
        urls: ['https://www.europarl.europa.eu/doceo/document/PV-10-2026-04-27-RCV_EN.xml'],
      },
      limit: 50,
      offset: 0,
      hasMore: false,
    };

    mockGetLatestVotes.mockResolvedValue(mockResponse);

    const result = await handleGetLatestVotes({});
    expect(result.content).toHaveLength(1);
    expect(result.content[0]!.type).toBe('text');

    const parsed = JSON.parse(result.content[0]!.text) as { data: { subject: string }[]; source: { type: string } };
    expect(parsed.data).toHaveLength(1);
    expect(parsed.data[0]!.subject).toBe('Climate Amendment');
    expect(parsed.source.type).toBe('DOCEO_XML');
  });

  it('passes date parameter correctly', async () => {
    mockGetLatestVotes.mockResolvedValue({
      data: [],
      total: 0,
      datesAvailable: [],
      datesUnavailable: ['2026-04-27'],
      source: { type: 'DOCEO_XML', term: 10, urls: [] },
      limit: 50,
      offset: 0,
      hasMore: false,
    });

    await handleGetLatestVotes({ date: '2026-04-27' });
    expect(mockGetLatestVotes).toHaveBeenCalledWith(expect.objectContaining({
      date: '2026-04-27',
    }));
  });

  it('validates input schema - invalid date format', async () => {
    await expect(
      handleGetLatestVotes({ date: '2026/04/27' })
    ).rejects.toThrow('Invalid parameters');
  });

  it('validates input schema - rejects unknown parameters', async () => {
    await expect(
      handleGetLatestVotes({ unknownParam: 'value' })
    ).rejects.toThrow('Invalid parameters');
  });

  it('validates input schema - limit bounds', async () => {
    await expect(
      handleGetLatestVotes({ limit: 0 })
    ).rejects.toThrow('Invalid parameters');

    await expect(
      handleGetLatestVotes({ limit: 101 })
    ).rejects.toThrow('Invalid parameters');
  });

  it('validates input schema - date and weekStart are mutually exclusive', async () => {
    await expect(
      handleGetLatestVotes({ date: '2026-04-27', weekStart: '2026-04-27' })
    ).rejects.toThrow('Invalid parameters');
  });

  it('handles API errors gracefully', async () => {
    mockGetLatestVotes.mockRejectedValue(new Error('Network timeout'));

    await expect(
      handleGetLatestVotes({})
    ).rejects.toThrow('Failed to retrieve latest votes');
  });

  it('passes includeIndividualVotes parameter', async () => {
    mockGetLatestVotes.mockResolvedValue({
      data: [],
      total: 0,
      datesAvailable: [],
      datesUnavailable: [],
      source: { type: 'DOCEO_XML', term: 10, urls: [] },
      limit: 50,
      offset: 0,
      hasMore: false,
    });

    await handleGetLatestVotes({ includeIndividualVotes: false });
    expect(mockGetLatestVotes).toHaveBeenCalledWith(expect.objectContaining({
      includeIndividualVotes: false,
    }));
  });
});

// ─── Gap 4: line 109 — non-ZodError rethrow ──────────────────────────────────

describe('handleGetLatestVotes — non-ZodError rethrow', () => {
  it('rethrows non-ZodError from schema validation', async () => {
    const { GetLatestVotesSchema } = await import('./getLatestVotes.js');
    const parseError = new RangeError('unexpected crash');
    const parseSpy = vi.spyOn(GetLatestVotesSchema, 'parse').mockImplementationOnce(() => {
      throw parseError;
    });
    await expect(handleGetLatestVotes({})).rejects.toThrow('unexpected crash');
    parseSpy.mockRestore();
  });
});
