import { describe, expect, it, vi } from 'vitest';
import {
  fetchAllCurrentMEPs,
  fetchAllMEPs,
  fetchMEPBatch,
  type CurrentMEPPageClient,
  type MEPPageClient,
} from './allMepFetcher.js';

describe('fetchAllMEPs', () => {
  it('uses the configured batch size for every MEP listing page', async () => {
    const getMEPs = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: '1' }, { id: '2' }], hasMore: true })
      .mockResolvedValueOnce({ data: [{ id: '3' }, { id: '4' }], hasMore: true })
      .mockResolvedValueOnce({ data: [{ id: '5' }], hasMore: false });
    const client: MEPPageClient = { getMEPs };

    const meps = await fetchAllMEPs(client, 2);

    expect(meps).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }]);
    expect(getMEPs).toHaveBeenNthCalledWith(1, { active: false, limit: 2, offset: 0 });
    expect(getMEPs).toHaveBeenNthCalledWith(2, { active: false, limit: 2, offset: 2 });
    expect(getMEPs).toHaveBeenNthCalledWith(3, { active: false, limit: 2, offset: 4 });
  });

  it('uses an oversized configured batch size rather than a fixed listing limit', async () => {
    const getMEPs = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: '1' }, { id: '2' }, { id: '3' }], hasMore: true })
      .mockResolvedValueOnce({ data: [{ id: '4' }], hasMore: false });
    const client: MEPPageClient = { getMEPs };

    await fetchAllMEPs(client, 250);

    expect(getMEPs).toHaveBeenNthCalledWith(1, { active: false, limit: 250, offset: 0 });
    expect(getMEPs).toHaveBeenNthCalledWith(2, { active: false, limit: 250, offset: 250 });
  });
});

describe('fetchMEPBatch', () => {
  it('fetches only the first listing page with the configured batch size', async () => {
    const getMEPs = vi.fn().mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }],
      hasMore: true,
    });
    const client: MEPPageClient = { getMEPs };

    const meps = await fetchMEPBatch(client, 250);

    expect(meps).toEqual([{ id: '1' }, { id: '2' }]);
    expect(getMEPs).toHaveBeenCalledOnce();
    expect(getMEPs).toHaveBeenCalledWith({ active: false, limit: 250, offset: 0 });
  });
});

describe('fetchAllCurrentMEPs', () => {
  it('pages the current-MEP endpoint until it is exhausted', async () => {
    const getCurrentMEPs = vi.fn()
      .mockResolvedValueOnce({ data: [{ id: 'person/1' }, { id: 'person/2' }], hasMore: true })
      .mockResolvedValueOnce({ data: [{ id: 'person/3' }], hasMore: false });
    const client: CurrentMEPPageClient = { getCurrentMEPs };

    const meps = await fetchAllCurrentMEPs(client, 2);

    expect(meps).toEqual([{ id: 'person/1' }, { id: 'person/2' }, { id: 'person/3' }]);
    expect(getCurrentMEPs).toHaveBeenNthCalledWith(1, { limit: 2, offset: 0 });
    expect(getCurrentMEPs).toHaveBeenNthCalledWith(2, { limit: 2, offset: 2 });
  });

  it('stops after a single page when there is no more data', async () => {
    const getCurrentMEPs = vi.fn().mockResolvedValue({ data: [{ id: 'person/9' }], hasMore: false });
    const client: CurrentMEPPageClient = { getCurrentMEPs };

    const meps = await fetchAllCurrentMEPs(client, 100);

    expect(meps).toEqual([{ id: 'person/9' }]);
    expect(getCurrentMEPs).toHaveBeenCalledOnce();
    expect(getCurrentMEPs).toHaveBeenCalledWith({ limit: 100, offset: 0 });
  });

  it('caps oversized requests at the endpoint limit while preserving pagination', async () => {
    const getCurrentMEPs = vi.fn()
      .mockResolvedValueOnce({ data: Array.from({ length: 100 }, (_, index) => ({ id: `person/${index}` })), hasMore: true })
      .mockResolvedValueOnce({ data: [{ id: 'person/100' }], hasMore: false });
    const client: CurrentMEPPageClient = { getCurrentMEPs };

    const meps = await fetchAllCurrentMEPs(client, 250);

    expect(meps).toHaveLength(101);
    expect(getCurrentMEPs).toHaveBeenNthCalledWith(1, { limit: 100, offset: 0 });
    expect(getCurrentMEPs).toHaveBeenNthCalledWith(2, { limit: 100, offset: 100 });
  });
});
