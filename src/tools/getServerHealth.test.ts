/**
 * Tests for get_server_health MCP tool
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handleGetServerHealth, getServerHealthToolMetadata, GetServerHealthSchema } from './getServerHealth.js';
import { feedHealthTracker } from '../services/FeedHealthTracker.js';
import { FEED_TOOL_NAMES } from '../services/FeedHealthTracker.js';

describe('get_server_health Tool', () => {
  beforeEach(() => {
    feedHealthTracker.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetServerHealth({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetServerHealth({});
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should include server, feeds, and availability sections', async () => {
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;

      expect(parsed).toHaveProperty('server');
      expect(parsed).toHaveProperty('feeds');
      expect(parsed).toHaveProperty('availability');
    });
  });

  describe('Server Section', () => {
    it('should include version string', async () => {
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        server: { version: string };
      };

      expect(typeof parsed.server.version).toBe('string');
      expect(parsed.server.version.length).toBeGreaterThan(0);
    });

    it('should include uptime_seconds as a number', async () => {
      vi.advanceTimersByTime(3000);
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        server: { uptime_seconds: number };
      };

      expect(typeof parsed.server.uptime_seconds).toBe('number');
      expect(parsed.server.uptime_seconds).toBeGreaterThanOrEqual(0);
    });

    it('should report unknown when no feeds have been called (cache empty, not an outage)', async () => {
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        server: { status: string };
      };

      expect(parsed.server.status).toBe('unknown');
    });

    it('should report unhealthy when all probed feeds have errored', async () => {
      feedHealthTracker.recordError('get_meps_feed', 'HTTP 500');

      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        server: { status: string };
      };

      expect(parsed.server.status).toBe('unhealthy');
    });

    it('should report healthy when enough feeds are ok', async () => {
      for (const name of FEED_TOOL_NAMES.slice(0, 10)) {
        feedHealthTracker.recordSuccess(name);
      }

      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        server: { status: string };
      };

      expect(parsed.server.status).toBe('healthy');
    });

    it('should report degraded when some feeds are ok', async () => {
      for (const name of FEED_TOOL_NAMES.slice(0, 5)) {
        feedHealthTracker.recordSuccess(name);
      }

      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        server: { status: string };
      };

      expect(parsed.server.status).toBe('degraded');
    });
  });

  describe('Feeds Section', () => {
    it('should include all 13 feed statuses', async () => {
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        feeds: Record<string, unknown>;
      };

      expect(Object.keys(parsed.feeds)).toHaveLength(FEED_TOOL_NAMES.length);
    });

    it('should default all feeds to unknown', async () => {
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        feeds: Record<string, { status: string }>;
      };

      for (const name of FEED_TOOL_NAMES) {
        expect(parsed.feeds[name]?.status).toBe('unknown');
      }
    });

    it('should reflect successful feed calls', async () => {
      feedHealthTracker.recordSuccess('get_meps_feed');

      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        feeds: Record<string, { status: string; lastSuccess?: string }>;
      };

      expect(parsed.feeds['get_meps_feed']?.status).toBe('ok');
      expect(parsed.feeds['get_meps_feed']?.lastSuccess).toBeDefined();
    });

    it('should reflect failed feed calls', async () => {
      feedHealthTracker.recordError('get_events_feed', 'HTTP 404');

      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        feeds: Record<string, { status: string; lastError?: string }>;
      };

      expect(parsed.feeds['get_events_feed']?.status).toBe('error');
      expect(parsed.feeds['get_events_feed']?.lastError).toBe('HTTP 404');
    });

    it('should expose lastProbedAt alias alongside lastAttempt for probed feeds', async () => {
      feedHealthTracker.recordSuccess('get_meps_feed');

      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        feeds: Record<
          string,
          { status: string; lastAttempt?: string; lastProbedAt?: string }
        >;
      };

      const feed = parsed.feeds['get_meps_feed'];
      expect(feed?.lastAttempt).toBeDefined();
      expect(feed?.lastProbedAt).toBeDefined();
      expect(feed?.lastProbedAt).toBe(feed?.lastAttempt);
    });

    it('should omit lastProbedAt for feeds that have never been probed', async () => {
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        feeds: Record<string, { status: string; lastProbedAt?: string }>;
      };

      expect(parsed.feeds['get_meps_feed']?.status).toBe('unknown');
      expect(parsed.feeds['get_meps_feed']?.lastProbedAt).toBeUndefined();
    });
  });

  describe('Availability Section', () => {
    it('should include operational_feeds, error_feeds, unknown_feeds, total_feeds, and level', async () => {
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        availability: {
          operational_feeds: number;
          error_feeds: number;
          unknown_feeds: number;
          total_feeds: number;
          level: string;
        };
      };

      expect(typeof parsed.availability.operational_feeds).toBe('number');
      expect(typeof parsed.availability.error_feeds).toBe('number');
      expect(typeof parsed.availability.unknown_feeds).toBe('number');
      expect(typeof parsed.availability.total_feeds).toBe('number');
      expect(typeof parsed.availability.level).toBe('string');
    });

    it('should report Unknown with zero operational and zero error feeds initially', async () => {
      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        availability: {
          operational_feeds: number;
          error_feeds: number;
          unknown_feeds: number;
          total_feeds: number;
          level: string;
        };
      };

      expect(parsed.availability.operational_feeds).toBe(0);
      expect(parsed.availability.error_feeds).toBe(0);
      expect(parsed.availability.unknown_feeds).toBe(parsed.availability.total_feeds);
      expect(parsed.availability.level).toBe('Unknown');
    });

    it('should report Unavailable only when operational is 0 and at least one feed errored', async () => {
      feedHealthTracker.recordError('get_meps_feed', 'timeout');

      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        availability: { operational_feeds: number; error_feeds: number; level: string };
      };

      expect(parsed.availability.operational_feeds).toBe(0);
      expect(parsed.availability.error_feeds).toBe(1);
      expect(parsed.availability.level).toBe('Unavailable');
    });

    it('should report Sparse with 2 operational feeds', async () => {
      feedHealthTracker.recordSuccess('get_meps_feed');
      feedHealthTracker.recordSuccess('get_adopted_texts_feed');

      const result = await handleGetServerHealth({});
      const parsed = JSON.parse(result.content[0]?.text ?? '') as {
        availability: { operational_feeds: number; level: string };
      };

      expect(parsed.availability.operational_feeds).toBe(2);
      expect(parsed.availability.level).toBe('Sparse');
    });
  });

  describe('Input Validation', () => {
    it('should accept empty object', async () => {
      const result = await handleGetServerHealth({});
      expect(result).toHaveProperty('content');
    });

    it('should accept undefined (coerced to empty object)', async () => {
      const result = await handleGetServerHealth(undefined);
      expect(result).toHaveProperty('content');
    });

    it('should accept null (coerced to empty object)', async () => {
      const result = await handleGetServerHealth(null);
      expect(result).toHaveProperty('content');
    });

    it('should strip unknown properties via Zod default behavior', () => {
      const parsed = GetServerHealthSchema.parse({ extra: true });
      expect(parsed).toEqual({});
    });

    it('should reject with ToolError via promise for non-object input', async () => {
      await expect(handleGetServerHealth('bad')).rejects.toThrow('Invalid parameters');
    });

    it('should produce clean error message without leading colon for empty path', async () => {
      try {
        await handleGetServerHealth('bad');
        expect.fail('should have rejected');
      } catch (error: unknown) {
        const msg = (error as Error).message;
        // Empty path should NOT produce ": Expected" (leading colon before message)
        expect(msg).toMatch(/Invalid parameters: [A-Z]/);
        expect(msg).toContain('expected object, received string');
      }
    });
  });

  describe('Metadata', () => {
    it('should export tool metadata with correct name', () => {
      expect(getServerHealthToolMetadata).toHaveProperty('name', 'get_server_health');
    });

    it('should export tool metadata with description', () => {
      expect(getServerHealthToolMetadata).toHaveProperty('description');
      expect(getServerHealthToolMetadata.description.length).toBeGreaterThan(10);
    });

    it('should export tool metadata with inputSchema', () => {
      expect(getServerHealthToolMetadata).toHaveProperty('inputSchema');
      expect(getServerHealthToolMetadata.inputSchema).toHaveProperty('type', 'object');
      expect(getServerHealthToolMetadata.inputSchema).toHaveProperty('properties');
    });
  });
});
