/**
 * CLI command handlers for the MCP server.
 *
 * Provides `--help`, `--version`, and `--health` output for
 * standalone execution. These functions write directly to stdout
 * and exit the process.
 *
 * @module server/cli
 */

import { SERVER_NAME, SERVER_VERSION } from '../index.js';
import { getToolMetadataArray } from './toolRegistry.js';
import { getPromptMetadataArray } from '../prompts/index.js';
import { getResourceTemplateArray } from '../resources/index.js';

/** Number of core tools (non-advanced analysis tools) */
const CORE_TOOL_COUNT = 7;

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
  const advancedToolCount = tools.length - CORE_TOOL_COUNT;

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
  Tools:     ${String(tools.length)} (${String(CORE_TOOL_COUNT)} core + ${String(advancedToolCount)} advanced)
  Protocol:  Model Context Protocol (MCP) via stdio

ENVIRONMENT VARIABLES:
  EP_API_URL              Override EP API base URL
  EP_REQUEST_TIMEOUT_MS   Override request timeout (default: 10000ms)
  EP_CACHE_TTL            Cache TTL in ms (default: 900000)
  EP_RATE_LIMIT           Rate limit requests/min (default: 60)

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
 */
export function showHealth(): void {
  const tools = getToolMetadataArray();
  const advancedToolCount = tools.length - CORE_TOOL_COUNT;
  const prompts = getPromptMetadataArray();
  const resourceTemplates = getResourceTemplateArray();

  const health = {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    status: 'healthy',
    capabilities: ['tools', 'resources', 'prompts'],
    tools: {
      total: tools.length,
      core: CORE_TOOL_COUNT,
      advanced: advancedToolCount,
    },
    prompts: {
      total: prompts.length,
    },
    resources: {
      templates: resourceTemplates.length,
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    configuration: {
      apiUrl: sanitizeUrl(process.env['EP_API_URL'] ?? 'https://data.europarl.europa.eu/api/v2/'),
      cacheTTL: process.env['EP_CACHE_TTL'] ?? '900000',
      rateLimit: process.env['EP_RATE_LIMIT'] ?? '60',
    },
  };

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(health, null, 2));
}
