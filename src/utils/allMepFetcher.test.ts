import { describe, expect, it, vi } from 'vitest';
import { fetchAllMEPs, type MEPPageClient } from './allMepFetcher.js';

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
