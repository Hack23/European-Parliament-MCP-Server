/**
 * CLI command handlers for the MCP server.
 *
 * Provides `--help`, `--version`, and `--health` output for
 * standalone execution. These functions write directly to stdout
 * and exit the process.
 *
 * @module server/cli
 */

import { SERVER_NAME, SERVER_VERSION, DEFAULT_RATE_LIMIT_PER_MINUTE, DEFAULT_API_URL } from '../config.js';
import { getToolMetadataArray } from './toolRegistry.js';
import { getPromptMetadataArray } from '../prompts/index.js';
import { getResourceTemplateArray } from '../resources/index.js';
import { RateLimiter } from '../utils/rateLimiter.js';
import { MetricsService } from '../services/MetricsService.js';
import { HealthService } from '../services/HealthService.js';
import type { CLIOptions } from './types.js';

/** Re-export CLIOptions for consumers */
export type { CLIOptions };

/**
 * Sanitize URL to remove credentials.
 *
 * @param urlString - URL to sanitize
 * @returns Sanitized URL without credentials
 * @internal
 */
export function sanitizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    const withoutQuery = urlString.split('?')[0] ?? urlString;
    const withoutFragment = withoutQuery.split('#')[0] ?? withoutQuery;
    return withoutFragment;
  }
}

/**
 * Display help text.
 */
export function showHelp(): void {
  const tools = getToolMetadataArray();
  const coreToolCount = tools.filter(t => t.category === 'core').length;
  const advancedToolCount = tools.length - coreToolCount;

  // eslint-disable-next-line no-console
  console.log(`
${SERVER_NAME} v${SERVER_VERSION}

European Parliament MCP Server - Access EU parliamentary data via Model Context Protocol

USAGE:
  npx european-parliament-mcp-server [OPTIONS]

OPTIONS:
  --help      Show this help message
  --version   Show version information
  --health    Show health check / diagnostics

CAPABILITIES:
  Tools:     ${String(tools.length)} (${String(coreToolCount)} core + ${String(advancedToolCount)} advanced)
  Protocol:  Model Context Protocol (MCP) via stdio

ENVIRONMENT VARIABLES:
  EP_API_URL              Override EP API base URL
  EP_REQUEST_TIMEOUT_MS   Override request timeout (default: 10000ms)
  EP_CACHE_TTL            Cache TTL in ms (default: 900000)
  EP_RATE_LIMIT           Rate limit requests/min (default: ${String(DEFAULT_RATE_LIMIT_PER_MINUTE)})

For more information: https://github.com/Hack23/European-Parliament-MCP-Server
  `.trim());
}

/**
 * Display version information.
 */
export function showVersion(): void {
  // eslint-disable-next-line no-console
  console.log(`${SERVER_NAME} v${SERVER_VERSION}`);
}

/**
 * Display health check / diagnostics.
 *
 * Combines a static capability report with a dynamic health snapshot
 * produced by {@link HealthService}.
 */
export function showHealth(): void {
  const tools = getToolMetadataArray();
  const coreToolCount = tools.filter(t => t.category === 'core').length;
  const advancedToolCount = tools.length - coreToolCount;
  const prompts = getPromptMetadataArray();
  const resourceTemplates = getResourceTemplateArray();

  const rateLimitEnv = parseInt(process.env['EP_RATE_LIMIT'] ?? String(DEFAULT_RATE_LIMIT_PER_MINUTE), 10);
  const tokensPerInterval = Number.isFinite(rateLimitEnv) && rateLimitEnv > 0 ? rateLimitEnv : DEFAULT_RATE_LIMIT_PER_MINUTE;
  const rateLimiter = new RateLimiter({ tokensPerInterval, interval: 'minute' });
  const metricsService = new MetricsService();
  const healthService = new HealthService(rateLimiter, metricsService);
  const dynamicHealth = healthService.checkHealth();

  const health = {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    status: dynamicHealth.status,
    capabilities: ['tools', 'resources', 'prompts'],
    tools: {
      total: tools.length,
      core: coreToolCount,
      advanced: advancedToolCount,
    },
    prompts: {
      total: prompts.length,
    },
    resources: {
      templates: resourceTemplates.length,
    },
    epApiReachable: dynamicHealth.epApiReachable,
    cache: dynamicHealth.cache,
    rateLimiter: dynamicHealth.rateLimiter,
    uptimeMs: dynamicHealth.uptimeMs,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    configuration: {
      apiUrl: sanitizeUrl(process.env['EP_API_URL'] ?? DEFAULT_API_URL),
      cacheTTL: process.env['EP_CACHE_TTL'] ?? '900000',
      rateLimit: process.env['EP_RATE_LIMIT'] ?? String(DEFAULT_RATE_LIMIT_PER_MINUTE),
    },
  };

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(health, null, 2));
}

/**
 * Parse an array of CLI argument strings into a typed {@link CLIOptions} object.
 *
 * Supports the canonical flags `--help` / `-h`, `--version` / `-v`,
 * and `--health`.
 *
 * @param argv - Array of raw argument strings (typically `process.argv.slice(2)`)
 * @returns Typed CLI options with boolean flags
 *
 * @example
 * ```typescript
 * const opts = parseCLIArgs(['--health']);
 * if (opts.health) showHealth();
 * ```
 */
export function parseCLIArgs(argv: string[]): CLIOptions {
  return {
    help: argv.includes('--help') || argv.includes('-h'),
    version: argv.includes('--version') || argv.includes('-v'),
    health: argv.includes('--health'),
  };
}
