import { describe, expect, it, vi } from 'vitest';
import {
  cacheDetail,
  compactDetailMap,
  hasCachedDetail,
  pruneMissingIds,
  readIncrementalDetailState,
  refreshDetailBatch,
} from './weeklyCacheState.js';

describe('readIncrementalDetailState', () => {
  it('restores details and missing ids from a prior payload', () => {
    const state = readIncrementalDetailState(
      { mepDetails: { '1': { name: 'A' } }, missingDetailIds: ['2', '3'] },
      'mepDetails',
    );
    expect({ ...state.details }).toEqual({ '1': { name: 'A' } });
    expect([...state.missingIds]).toEqual(['2', '3']);
  });

  it('returns a fresh copy so mutation does not affect the source object', () => {
    const source = { mepDetails: { '1': { name: 'A' } } };
    const state = readIncrementalDetailState(source, 'mepDetails');
    state.details['2'] = { name: 'B' };
    expect(source.mepDetails).toEqual({ '1': { name: 'A' } });
  });

  it('reads details under a configurable key', () => {
    const state = readIncrementalDetailState(
      { corporateBodyDetails: { ENVI: {} } },
      'corporateBodyDetails',
    );
    expect({ ...state.details }).toEqual({ ENVI: {} });
  });

  it.each([null, undefined, 42, 'x', { mepDetails: 'bad', missingDetailIds: 'bad' }])(
    'yields empty state for malformed input %p',
    (input) => {
      const state = readIncrementalDetailState(input, 'mepDetails');
      expect({ ...state.details }).toEqual({});
      expect(state.missingIds.size).toBe(0);
    },
  );

  it('ignores non-string entries in the missing-id list', () => {
    const state = readIncrementalDetailState(
      { mepDetails: {}, missingDetailIds: ['1', 2, null, 'a'] },
      'mepDetails',
    );
    expect([...state.missingIds]).toEqual(['1', 'a']);
  });

  it('filters dangerous keys and returns a null-prototype map', () => {
    const state = readIncrementalDetailState(
      { mepDetails: { safe: { name: 'A' }, ['__proto__']: { polluted: true } } },
      'mepDetails',
    );
    expect(Object.getPrototypeOf(state.details)).toBeNull();
    expect(state.details.safe).toEqual({ name: 'A' });
    expect(state.details['__proto__']).toBeUndefined();
  });
});

describe('pruneMissingIds', () => {
  it('drops missing ids that are no longer in the active roster', () => {
    const missing = new Set(['1', '2', '3']);
    pruneMissingIds(missing, new Set(['2']));
    expect([...missing]).toEqual(['2']);
  });
});

describe('hasCachedDetail / cacheDetail', () => {
  it('detects a cached record under any identifier variant', () => {
    const details = { 'MEP-9': { name: 'X' } };
    expect(hasCachedDetail(details, ['9', 'MEP-9', 'person/9'])).toBe(true);
    expect(hasCachedDetail(details, ['10', 'MEP-10'])).toBe(false);
  });

  it('writes a record under every identifier variant', () => {
    const details: Record<string, unknown> = {};
    cacheDetail(details, ['9', 'MEP-9', 'person/9'], { name: 'X' });
    expect(details).toEqual({ '9': { name: 'X' }, 'MEP-9': { name: 'X' }, 'person/9': { name: 'X' } });
  });

  it('does not write dangerous identifier keys', () => {
    const details: Record<string, unknown> = {};
    cacheDetail(details, ['9', '__proto__', 'constructor', 'prototype'], { name: 'X' });
    expect(details['9']).toEqual({ name: 'X' });
    expect(Object.hasOwn(details, '__proto__')).toBe(false);
    expect(Object.hasOwn(details, 'constructor')).toBe(false);
    expect(Object.hasOwn(details, 'prototype')).toBe(false);
    expect(details.constructor).not.toEqual({ name: 'X' });
  });
});

describe('compactDetailMap', () => {
  it('keeps one canonical key per active item and drops stale aliases', () => {
    const compacted = compactDetailMap({
      items: [{ id: 'person/1' }, { id: 'person/2' }],
      details: {
        '1': { id: 'person/1' },
        'MEP-1': { id: 'person/1' },
        'person/1': { id: 'person/1' },
        stale: { id: 'person/999' },
      },
      idFor: (item) => item.id,
      keysFor: (item) => {
        const numericId = item.id.substring('person/'.length);
        return [item.id, numericId, `MEP-${numericId}`];
      },
    });

    expect({ ...compacted }).toEqual({ 'person/1': { id: 'person/1' } });
    expect(Object.getPrototypeOf(compacted)).toBeNull();
  });
});

describe('refreshDetailBatch', () => {
  const base = {
    idFor: (item: { id: string }) => item.id,
    keysFor: (item: { id: string }) => [item.id, `MEP-${item.id}`],
    isNotFound: (error: unknown) =>
      typeof error === 'object' && error !== null && (error as { statusCode?: number }).statusCode === 404,
  };

  it('fetches only uncached, non-missing items up to the batch size', async () => {
    const details: Record<string, unknown> = { '1': { cached: true }, 'MEP-1': { cached: true } };
    const missingIds = new Set(['2']);
    const fetchDetail = vi.fn(async (item: { id: string }) => ({ id: item.id }));

    const result = await refreshDetailBatch({
      ...base,
      items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
      batchSize: 1,
      details,
      missingIds,
      fetchDetail,
    });

    // '1' already cached, '2' flagged missing -> first pending is '3'.
    expect(fetchDetail).toHaveBeenCalledTimes(1);
    expect(fetchDetail).toHaveBeenCalledWith({ id: '3' });
    expect(details['3']).toEqual({ id: '3' });
    expect(details['MEP-3']).toEqual({ id: '3' });
    expect(result.fetchedInRun).toBe(1);
    expect(result.remainingDetails).toBe(1); // '4' still pending
    expect(result.complete).toBe(false);
  });

  it('records 404s as missing and does not retry them', async () => {
    const missingIds = new Set<string>();
    const onSkip = vi.fn();
    const fetchDetail = vi.fn(async () => {
      throw Object.assign(new Error('not found'), { statusCode: 404 });
    });

    const result = await refreshDetailBatch({
      ...base,
      items: [{ id: '5' }],
      batchSize: 10,
      details: {},
      missingIds,
      fetchDetail,
      onSkip,
    });

    expect([...missingIds]).toEqual(['5']);
    expect(onSkip).toHaveBeenCalledWith('5');
    expect(result.failedDetailIds).toEqual([]);
    expect(result.remainingDetails).toBe(0);
    expect(result.complete).toBe(true);
  });

  it('collects transient failures for retry without flagging them missing', async () => {
    const missingIds = new Set<string>();
    const onRetry = vi.fn();
    const fetchDetail = vi.fn(async () => {
      throw new Error('network');
    });

    const result = await refreshDetailBatch({
      ...base,
      items: [{ id: '6' }],
      batchSize: 10,
      details: {},
      missingIds,
      fetchDetail,
      onRetry,
    });

    expect(missingIds.size).toBe(0);
    expect(onRetry).toHaveBeenCalledWith('6');
    expect(result.failedDetailIds).toEqual(['6']);
    expect(result.remainingDetails).toBe(1);
    expect(result.complete).toBe(false);
  });

  it('caches under extra identifier keys derived from the fetched detail', async () => {
    const details: Record<string, unknown> = {};
    const result = await refreshDetailBatch({
      ...base,
      items: [{ id: '7' }],
      batchSize: 10,
      details,
      missingIds: new Set<string>(),
      fetchDetail: async () => ({ id: '7', identifier: 'person/7' }),
      extraKeysFromDetail: (detail) => {
        const identifier = (detail as { identifier?: string }).identifier;
        return identifier === undefined ? [] : [identifier];
      },
    });

    expect(details['person/7']).toEqual({ id: '7', identifier: 'person/7' });
    expect(result.complete).toBe(true);
  });

  it('reports completion when every item is already cached', async () => {
    const fetchDetail = vi.fn(async () => ({}));
    const result = await refreshDetailBatch({
      ...base,
      items: [{ id: '8' }],
      batchSize: 5,
      details: { '8': {} },
      missingIds: new Set<string>(),
      fetchDetail,
    });

    expect(fetchDetail).not.toHaveBeenCalled();
    expect(result.fetchedInRun).toBe(0);
    expect(result.complete).toBe(true);
  });
});
