/**
 * Tests for PlenaryClient events-feed timeout behavior.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { PlenaryClient } from './plenaryClient.js';

interface CapturedGetCall {
  endpoint: string;
  params?: Record<string, unknown>;
  minimumTimeoutMs?: number;
}

describe('PlenaryClient getEventsFeed', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function captureGetEventsFeed(timeframe: 'one-week' | 'one-month'): Promise<CapturedGetCall> {
    let captured: CapturedGetCall | undefined;
    const getSpy = vi
      .spyOn(
        PlenaryClient.prototype as unknown as {
          get: (
            endpoint: string,
            params?: Record<string, unknown>,
            minimumTimeoutMs?: number,
          ) => Promise<Record<string, unknown>>;
        },
        'get',
      )
      .mockImplementation((endpoint, params, minimumTimeoutMs) => {
        captured = { endpoint, params, minimumTimeoutMs };
        return Promise.resolve({ data: [], '@context': [] });
      });

    const client = new PlenaryClient();
    await client.getEventsFeed({ timeframe });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(captured).toBeDefined();
    return captured as CapturedGetCall;
  }

  it('should keep one-week events feed on the global request timeout budget', async () => {
    const captured = await captureGetEventsFeed('one-week');

    expect(captured.endpoint).toBe('events/feed');
    expect(captured.params).toMatchObject({ timeframe: 'one-week' });
    expect(captured.minimumTimeoutMs).toBeUndefined();
  });

  it('should keep one-month events feed on the global request timeout budget', async () => {
    const captured = await captureGetEventsFeed('one-month');

    expect(captured.endpoint).toBe('events/feed');
    expect(captured.params).toMatchObject({ timeframe: 'one-month' });
    expect(captured.minimumTimeoutMs).toBeUndefined();
  });
});
