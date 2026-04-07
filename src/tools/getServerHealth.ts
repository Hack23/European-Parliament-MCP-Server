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

import { SERVER_VERSION } from '../config.js';
import { feedHealthTracker } from '../services/FeedHealthTracker.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Derive the overall server status from the feed availability level.
 * Cyclomatic complexity: 3
 */
function deriveServerStatus(level: string): 'healthy' | 'degraded' | 'unhealthy' {
  if (level === 'Full') return 'healthy';
  if (level === 'Unavailable') return 'unhealthy';
  return 'degraded';
}

/**
 * Handles the get_server_health MCP tool request.
 *
 * Returns a structured health snapshot including:
 * - Server version, uptime, and overall status
 * - Per-feed health status (ok / error / unknown)
 * - Aggregate availability level (Full / Degraded / Sparse / Unavailable)
 *
 * @param _args - Ignored; tool accepts no parameters
 * @returns MCP tool result with JSON health payload
 */
export async function handleGetServerHealth(_args: unknown): Promise<ToolResult> {
  const feeds = feedHealthTracker.getAllStatuses();
  const availability = feedHealthTracker.getAvailability();

  const result = {
    server: {
      version: SERVER_VERSION,
      uptime_seconds: feedHealthTracker.getUptimeSeconds(),
      status: deriveServerStatus(availability.level),
    },
    feeds,
    availability: {
      operational_feeds: availability.operationalFeeds,
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
    'per-feed health status (ok/error/unknown), and overall availability level ' +
    '(Full/Degraded/Sparse/Unavailable). Does not make upstream API calls — reports ' +
    'cached status from recent tool invocations. Use this to check which feeds are ' +
    'healthy before making data requests and to adapt data collection strategy.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};
