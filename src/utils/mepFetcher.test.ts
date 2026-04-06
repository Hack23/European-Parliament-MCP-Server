/**
 * Unit tests for mepFetcher utility.
 *
 * Verifies paginated MEP fetching logic with proper batch handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAllCurrentMEPs } from './mepFetcher.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCurrentMEPs: vi.fn(),
  },
}));

vi.mock('./auditLogger.js', () => ({
  auditLogger: {
    logError: vi.fn(),
  },
}));

describe('fetchAllCurrentMEPs', () => {
  const mockMEP = (id: number) => ({
    id: `person/${String(id)}`,
    name: `MEP ${String(id)}`,
    country: 'SE',
    politicalGroup: 'Renew',
    committees: [] as string[],
    active: true,
    termStart: '2024-07-16',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a single page of MEPs when hasMore is false', async () => {
    vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValueOnce({
      data: [
        { id: 'person/1', name: 'MEP One', country: 'DE', politicalGroup: 'EPP', committees: [], active: true, termStart: '2024-07-16' },
        { id: 'person/2', name: 'MEP Two', country: 'FR', politicalGroup: 'S&D', committees: [], active: true, termStart: '2024-07-16' },
      ],
      total: 2,
      limit: 100,
      offset: 0,
      hasMore: false,
    });

    const result = await fetchAllCurrentMEPs();

    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('MEP One');
    expect(result[1]?.name).toBe('MEP Two');
    expect(epClientModule.epClient.getCurrentMEPs).toHaveBeenCalledTimes(1);
    expect(epClientModule.epClient.getCurrentMEPs).toHaveBeenCalledWith({ limit: 100, offset: 0 });
  });

  it('should paginate through multiple pages', async () => {
    // First page: 100 MEPs, hasMore = true
    vi.mocked(epClientModule.epClient.getCurrentMEPs)
      .mockResolvedValueOnce({
        data: Array.from({ length: 100 }, (_, i) => mockMEP(i + 1)),
        total: 150,
        limit: 100,
        offset: 0,
        hasMore: true,
      })
      // Second page: 50 MEPs, hasMore = false
      .mockResolvedValueOnce({
        data: Array.from({ length: 50 }, (_, i) => mockMEP(i + 101)),
        total: 150,
        limit: 100,
        offset: 100,
        hasMore: false,
      });

    const result = await fetchAllCurrentMEPs();

    expect(result).toHaveLength(150);
    expect(epClientModule.epClient.getCurrentMEPs).toHaveBeenCalledTimes(2);
    expect(epClientModule.epClient.getCurrentMEPs).toHaveBeenNthCalledWith(1, { limit: 100, offset: 0 });
    expect(epClientModule.epClient.getCurrentMEPs).toHaveBeenNthCalledWith(2, { limit: 100, offset: 100 });
  });

  it('should return empty array when no MEPs found', async () => {
    vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValueOnce({
      data: [],
      total: 0,
      limit: 100,
      offset: 0,
      hasMore: false,
    });

    const result = await fetchAllCurrentMEPs();

    expect(result).toHaveLength(0);
    expect(epClientModule.epClient.getCurrentMEPs).toHaveBeenCalledTimes(1);
  });

  it('should return empty array and log error on first page failure', async () => {
    const { auditLogger } = await import('./auditLogger.js');
    vi.mocked(epClientModule.epClient.getCurrentMEPs).mockRejectedValueOnce(
      new Error('Network timeout')
    );

    const result = await fetchAllCurrentMEPs();

    expect(result).toHaveLength(0);
    expect(auditLogger.logError).toHaveBeenCalledWith(
      'fetchAllCurrentMEPs',
      { offset: 0, batchSize: 100 },
      expect.stringContaining('Pagination failed at offset 0')
    );
  });

  it('should return partial results when API fails mid-pagination', async () => {
    const { auditLogger } = await import('./auditLogger.js');

    vi.mocked(epClientModule.epClient.getCurrentMEPs)
      .mockResolvedValueOnce({
        data: Array.from({ length: 100 }, (_, i) => mockMEP(i + 1)),
        total: 250,
        limit: 100,
        offset: 0,
        hasMore: true,
      })
      .mockRejectedValueOnce(new Error('Connection reset'));

    const result = await fetchAllCurrentMEPs();

    // Should return the 100 MEPs from the first successful page
    expect(result).toHaveLength(100);
    expect(epClientModule.epClient.getCurrentMEPs).toHaveBeenCalledTimes(2);
    expect(auditLogger.logError).toHaveBeenCalledWith(
      'fetchAllCurrentMEPs',
      { offset: 100, batchSize: 100 },
      expect.stringContaining('Pagination failed at offset 100')
    );
  });
});
