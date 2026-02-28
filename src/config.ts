/**
 * Centralized configuration for the European Parliament MCP Server.
 *
 * All shared configuration constants and defaults are defined here to ensure
 * consistency across `src/index.ts`, `src/server/cli.ts`, and
 * `src/clients/ep/baseClient.ts`.
 *
 * @module config
 */

import { readFileSync } from 'fs';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
) as { version: string };

/** Canonical server name used in MCP handshake and CLI output */
export const SERVER_NAME = 'european-parliament-mcp-server';

/** Server version loaded from package.json at startup */
export const SERVER_VERSION: string = pkg.version;

/**
 * HTTP `User-Agent` header value sent with every request to the EP API.
 * Includes the actual package version instead of a hardcoded string.
 */
export const USER_AGENT = `European-Parliament-MCP-Server/${pkg.version}`;

/**
 * Default rate limit applied to EP API requests (requests per minute).
 * Used by both the base HTTP client and the CLI health/help output so that
 * the displayed default always matches the enforced default.
 */
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 100;

/** Default base URL for the European Parliament Open Data Portal API v2 */
export const DEFAULT_API_URL = 'https://data.europarl.europa.eu/api/v2/';
