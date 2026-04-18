/**
 * MCP Tool: get_server_health
 *
 * Returns server health status and per-feed availability diagnostics.
 * Does NOT make upstream API calls — reports cached status from recent
 * feed tool invocations.
 *
 * **Intelligence Perspective:** Operational awareness of data source
 * availability is critical for reliable intelligence products.
 *
 * **Business Perspective:** Provides dashboard-ready health metrics
 * and enables clients to adapt data collection strategies based on
 * current feed availability.
 *
 * ISMS Policy: MO-001 (Monitoring and Alerting), PE-001 (Performance Standards)
 *
 * @module tools/getServerHealth
 */

import { z } from 'zod';
import { SERVER_VERSION } from '../config.js';
import { feedHealthTracker } from '../services/FeedHealthTracker.js';
import type { AvailabilityLevel } from '../services/FeedHealthTracker.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import type { ToolResult } from './shared/types.js';

/** Zod schema for the (empty) input of this tool. */
export const GetServerHealthSchema = z.object({});

/**
 * Derive the overall server status from the feed availability level.
 *
 * The `Unknown` level maps to `'unknown'` — distinct from `'unhealthy'` —
 * so consumers do not treat an empty health cache as a feeds outage.
 * Cyclomatic complexity: 4
 */
function deriveServerStatus(
  level: AvailabilityLevel,
): 'healthy' | 'degraded' | 'unhealthy' | 'unknown' {
  switch (level) {
    case 'Full':
      return 'healthy';
    case 'Unavailable':
      return 'unhealthy';
    case 'Unknown':
      return 'unknown';
    case 'Degraded':
    case 'Sparse':
      return 'degraded';
    default: {
      const exhaustiveCheck: never = level;
      throw new Error(`Unhandled availability level: ${String(exhaustiveCheck)}`);
    }
  }
}

/**
 * Handles the get_server_health MCP tool request.
 *
 * Returns a structured health snapshot including:
 * - Server version, uptime, and overall status
 * - Per-feed health status (ok / error / unknown)
 * - Aggregate availability level (Full / Degraded / Sparse / Unavailable)
 *
 * @param args - Validated against empty-object schema (no parameters accepted)
 * @returns MCP tool result with JSON health payload
 */
export async function handleGetServerHealth(args: unknown): Promise<ToolResult> {
  try {
    GetServerHealthSchema.parse(args ?? {});
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues
        .map((e) => {
          const path = e.path.join('.');
          return path ? `${path}: ${e.message}` : e.message;
        })
        .join('; ');
      throw new ToolError({
        toolName: 'get_server_health',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  const feeds = feedHealthTracker.getAllStatuses();
  const availability = feedHealthTracker.getAvailability();

  // Project per-feed statuses for the tool response. Preserves the existing
  // `lastSuccess` / `lastError` / `lastAttempt` fields (backward compatible)
  // and adds a `lastProbedAt` alias for `lastAttempt` so consumers can judge
  // cache staleness (see issue #1, recommendation 3).
  interface FeedProjection {
    status: 'ok' | 'error' | 'unknown';
    lastAttempt?: string;
    lastProbedAt?: string;
    lastSuccess?: string;
    lastError?: string;
  }
  const feedsProjection: Record<string, FeedProjection> = {};
  for (const [name, feed] of Object.entries(feeds)) {
    const entry: FeedProjection = { status: feed.status };
    if (feed.lastAttempt !== undefined) {
      entry.lastAttempt = feed.lastAttempt;
      entry.lastProbedAt = feed.lastAttempt;
    }
    if (feed.lastSuccess !== undefined) entry.lastSuccess = feed.lastSuccess;
    if (feed.lastError !== undefined) entry.lastError = feed.lastError;
    feedsProjection[name] = entry;
  }

  const result = {
    server: {
      version: SERVER_VERSION,
      uptime_seconds: feedHealthTracker.getUptimeSeconds(),
      status: deriveServerStatus(availability.level),
    },
    feeds: feedsProjection,
    availability: {
      operational_feeds: availability.operationalFeeds,
      error_feeds: availability.errorFeeds,
      unknown_feeds: availability.unknownFeeds,
      total_feeds: availability.totalFeeds,
      level: availability.level,
    },
  };

  return await Promise.resolve(buildToolResponse(result));
}

/** Tool metadata for MCP registration. */
export const getServerHealthToolMetadata = {
  name: 'get_server_health',
  description:
    'Check server health and feed availability status. Returns server version, uptime, ' +
    'per-feed health status (ok/error/unknown) with `lastProbedAt` staleness timestamps, ' +
    'and overall availability level (Full/Degraded/Sparse/Unavailable/Unknown). ' +
    '`Unknown` is reported when no feeds have been probed yet (cache empty) and must ' +
    'NOT be interpreted as an outage — consumers should attempt at least one feed probe ' +
    'before treating the server as down. Does not make upstream API calls — reports ' +
    'cached status from recent tool invocations. Use this to check which feeds are ' +
    'healthy before making data requests and to adapt data collection strategy.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};
