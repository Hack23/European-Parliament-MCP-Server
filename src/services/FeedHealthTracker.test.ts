/**
 * Tests for FeedHealthTracker service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  FeedHealthTracker,
  FEED_TOOL_NAMES,
} from './FeedHealthTracker.js';
import type { FeedStatus, AvailabilityLevel } from './FeedHealthTracker.js';

describe('FeedHealthTracker', () => {
  let tracker: FeedHealthTracker;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    tracker = new FeedHealthTracker();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── isFeedTool ──────────────────────────────────────────────────

  describe('isFeedTool', () => {
    it('returns true for all known feed tool names', () => {
      for (const name of FEED_TOOL_NAMES) {
        expect(tracker.isFeedTool(name)).toBe(true);
      }
    });

    it('returns false for non-feed tool names', () => {
      expect(tracker.isFeedTool('get_meps')).toBe(false);
      expect(tracker.isFeedTool('get_server_health')).toBe(false);
      expect(tracker.isFeedTool('analyze_voting_patterns')).toBe(false);
      expect(tracker.isFeedTool('')).toBe(false);
    });
  });

  // ── recordSuccess / recordError / getStatus ─────────────────────

  describe('recordSuccess', () => {
    it('sets status to ok with timestamps', () => {
      tracker.recordSuccess('get_meps_feed');
      const status = tracker.getStatus('get_meps_feed');

      expect(status.status).toBe('ok');
      expect(status.lastSuccess).toBeDefined();
      expect(status.lastAttempt).toBeDefined();
      expect(status.lastError).toBeUndefined();
    });

    it('silently ignores unknown feed names', () => {
      tracker.recordSuccess('not_a_feed_tool');
      // Should not appear in allStatuses (only tracked feeds are listed)
      const statuses = tracker.getAllStatuses();
      expect(statuses).not.toHaveProperty('not_a_feed_tool');
      // Should still return unknown for unknown names
      expect(tracker.getStatus('not_a_feed_tool').status).toBe('unknown');
    });
  });

  describe('recordError', () => {
    it('sets status to error with error message', () => {
      tracker.recordError('get_events_feed', 'HTTP 404');
      const status = tracker.getStatus('get_events_feed');

      expect(status.status).toBe('error');
      expect(status.lastError).toBe('HTTP 404');
      expect(status.lastAttempt).toBeDefined();
    });

    it('preserves lastSuccess from previous successful call', () => {
      tracker.recordSuccess('get_meps_feed');
      const afterSuccess = tracker.getStatus('get_meps_feed');
      const successTimestamp = afterSuccess.lastSuccess;

      tracker.recordError('get_meps_feed', 'timeout');
      const afterError = tracker.getStatus('get_meps_feed');

      expect(afterError.status).toBe('error');
      expect(afterError.lastSuccess).toBe(successTimestamp);
      expect(afterError.lastError).toBe('timeout');
    });

    it('silently ignores unknown feed names', () => {
      tracker.recordError('not_a_feed_tool', 'some error');
      const statuses = tracker.getAllStatuses();
      expect(statuses).not.toHaveProperty('not_a_feed_tool');
      expect(tracker.getStatus('not_a_feed_tool').status).toBe('unknown');
    });
  });

  describe('getStatus', () => {
    it('returns unknown for feeds that have not been invoked', () => {
      const status = tracker.getStatus('get_meps_feed');
      expect(status.status).toBe('unknown');
      expect(status.lastSuccess).toBeUndefined();
      expect(status.lastError).toBeUndefined();
      expect(status.lastAttempt).toBeUndefined();
    });

    it('returns unknown for unrecognized feed names', () => {
      const status = tracker.getStatus('not_a_real_feed');
      expect(status.status).toBe('unknown');
    });
  });

  // ── getAllStatuses ──────────────────────────────────────────────

  describe('getAllStatuses', () => {
    it('returns an entry for every tracked feed', () => {
      const statuses = tracker.getAllStatuses();
      expect(Object.keys(statuses)).toHaveLength(FEED_TOOL_NAMES.length);
      for (const name of FEED_TOOL_NAMES) {
        expect(statuses).toHaveProperty(name);
      }
    });

    it('defaults all feeds to unknown initially', () => {
      const statuses = tracker.getAllStatuses();
      for (const name of FEED_TOOL_NAMES) {
        const feedStatus = statuses[name] as FeedStatus;
        expect(feedStatus.status).toBe('unknown');
      }
    });

    it('reflects recorded successes and errors', () => {
      tracker.recordSuccess('get_meps_feed');
      tracker.recordError('get_events_feed', 'HTTP 500');

      const statuses = tracker.getAllStatuses();
      expect((statuses['get_meps_feed'] as FeedStatus).status).toBe('ok');
      expect((statuses['get_events_feed'] as FeedStatus).status).toBe('error');
      expect((statuses['get_procedures_feed'] as FeedStatus).status).toBe('unknown');
    });
  });

  // ── getUptimeSeconds ────────────────────────────────────────────

  describe('getUptimeSeconds', () => {
    it('returns 0 immediately after creation', () => {
      expect(tracker.getUptimeSeconds()).toBe(0);
    });

    it('returns elapsed seconds', () => {
      vi.advanceTimersByTime(5000);
      expect(tracker.getUptimeSeconds()).toBe(5);
    });
  });

  // ── getAvailability ─────────────────────────────────────────────

  describe('getAvailability', () => {
    it('returns Unknown when no feeds have been called (cache empty)', () => {
      const avail = tracker.getAvailability();
      expect(avail.level).toBe('Unknown');
      expect(avail.operationalFeeds).toBe(0);
      expect(avail.errorFeeds).toBe(0);
      expect(avail.unknownFeeds).toBe(FEED_TOOL_NAMES.length);
      expect(avail.totalFeeds).toBe(FEED_TOOL_NAMES.length);
    });

    it('returns Unavailable when 0 ok and at least one probed feed has errored', () => {
      tracker.recordError('get_meps_feed', 'HTTP 500');
      const avail = tracker.getAvailability();
      expect(avail.level).toBe('Unavailable');
      expect(avail.operationalFeeds).toBe(0);
      expect(avail.errorFeeds).toBe(1);
      expect(avail.unknownFeeds).toBe(FEED_TOOL_NAMES.length - 1);
    });

    it('returns Sparse when 1–4 feeds are ok', () => {
      tracker.recordSuccess('get_meps_feed');
      expect(tracker.getAvailability().level).toBe('Sparse');

      tracker.recordSuccess('get_events_feed');
      tracker.recordSuccess('get_procedures_feed');
      tracker.recordSuccess('get_adopted_texts_feed');
      expect(tracker.getAvailability().level).toBe('Sparse');
    });

    it('returns Degraded when 5–9 feeds are ok', () => {
      const feedsToSucceed = FEED_TOOL_NAMES.slice(0, 5);
      for (const name of feedsToSucceed) {
        tracker.recordSuccess(name);
      }
      expect(tracker.getAvailability().level).toBe('Degraded');
    });

    it('returns Full when ≥10 feeds are ok', () => {
      const feedsToSucceed = FEED_TOOL_NAMES.slice(0, 10);
      for (const name of feedsToSucceed) {
        tracker.recordSuccess(name);
      }
      expect(tracker.getAvailability().level).toBe('Full');
    });

    it('returns Full when all 13 feeds are ok', () => {
      for (const name of FEED_TOOL_NAMES) {
        tracker.recordSuccess(name);
      }
      const avail = tracker.getAvailability();
      expect(avail.level).toBe('Full');
      expect(avail.operationalFeeds).toBe(13);
    });

    it('counts only ok feeds, not error or unknown', () => {
      tracker.recordSuccess('get_meps_feed');
      tracker.recordError('get_events_feed', 'HTTP 404');
      // rest are unknown

      const avail = tracker.getAvailability();
      expect(avail.operationalFeeds).toBe(1);
    });
  });

  // ── reset ───────────────────────────────────────────────────────

  describe('reset', () => {
    it('clears all recorded statuses', () => {
      tracker.recordSuccess('get_meps_feed');
      tracker.recordError('get_events_feed', 'error');
      tracker.reset();

      const statuses = tracker.getAllStatuses();
      for (const name of FEED_TOOL_NAMES) {
        expect((statuses[name] as FeedStatus).status).toBe('unknown');
      }
    });
  });

  // ── Availability level boundaries ───────────────────────────────

  describe('availability level boundaries', () => {
    const testCases: Array<{ ok: number; expected: AvailabilityLevel }> = [
      { ok: 0, expected: 'Unknown' },
      { ok: 1, expected: 'Sparse' },
      { ok: 4, expected: 'Sparse' },
      { ok: 5, expected: 'Degraded' },
      { ok: 9, expected: 'Degraded' },
      { ok: 10, expected: 'Full' },
      { ok: 13, expected: 'Full' },
    ];

    for (const { ok, expected } of testCases) {
      it(`${String(ok)} operational feeds → ${expected}`, () => {
        for (let i = 0; i < ok; i++) {
          const feedName = FEED_TOOL_NAMES[i];
          if (feedName !== undefined) {
            tracker.recordSuccess(feedName);
          }
        }
        expect(tracker.getAvailability().level).toBe(expected);
      });
    }
  });
});
