#!/usr/bin/env node
/**
 * European Parliament MCP Server
 * 
 * Model Context Protocol server providing access to European Parliament open data.
 * 
 * **Intelligence Perspective:** Serves as the primary OSINT platform for EU parliamentary
 * intelligence—enabling MEP profiling, voting pattern analysis, coalition detection,
 * legislative monitoring, and political risk assessment through structured MCP tools.
 * 
 * **Business Perspective:** Core product offering structured access to EU parliamentary
 * data via MCP protocol—targeting AI developers, civic tech platforms, journalists,
 * researchers, and enterprise government affairs teams.
 * 
 * **Marketing Perspective:** First MCP server for European Parliament data—positioned
 * at the intersection of AI/LLM tooling and democratic transparency, targeting the
 * growing MCP ecosystem and EU civic tech market.
 * 
 * @see https://data.europarl.europa.eu/
 * @see https://spec.modelcontextprotocol.io/
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import { realpathSync } from 'fs';

// ── Extracted modules ─────────────────────────────────────────────
import { getToolMetadataArray, dispatchToolCall } from './server/toolRegistry.js';
import { showHelp, showVersion, showHealth, parseCLIArgs } from './server/cli.js';
import { SERVER_NAME, SERVER_VERSION } from './config.js';
// MCP Prompts
import { getPromptMetadataArray, handleGetPrompt } from './prompts/index.js';
// MCP Resources
import { getResourceTemplateArray, handleReadResource } from './resources/index.js';
/** Re-export all public types, branded identifiers, and error classes */
export type * from './types/index.js';
/** Re-export all runtime type guards, factory functions, and error utilities */
export * from './types/index.js';
/** Re-export tool registry for consumers */
export { getToolMetadataArray } from './server/toolRegistry.js';
/** Re-export CLI utilities */
export { sanitizeUrl } from './server/cli.js';
/** Re-export server types */
export type { ToolHandler, ToolMetadata, ToolCategory, CLIOptions, ToolResult } from './server/types.js';
/** Re-export DI token registry */
export type { DIToken } from './di/tokens.js';
/** Re-export DI container and default factory for consumers */
export { createDefaultContainer } from './di/container.js';
/** Re-export metric names and key type for consumers using the metrics service */
export { MetricName } from './services/MetricsService.js';
export type { MetricKey } from './services/MetricsService.js';
/** Re-export performance thresholds, timeout defaults, and related config types for consumers */
export { DEFAULT_PERFORMANCE_THRESHOLDS } from './utils/performance.js';
export type { PerformanceThresholds } from './utils/performance.js';
export { DEFAULT_TIMEOUTS } from './utils/timeout.js';
export type { TimeoutConfig } from './utils/timeout.js';
export type { RateLimiterConfig, RateLimiterStatus } from './utils/rateLimiter.js';
export type { AuditEvent, AuditLogEntry, LogLevel } from './utils/auditLogger.js';
/** Re-export prompt argument schemas for integration tests and client validation */
export {
  MepBriefingArgsSchema,
  CoalitionAnalysisArgsSchema,
  LegislativeTrackingArgsSchema,
  PoliticalGroupComparisonArgsSchema,
  CommitteeActivityArgsSchema,
  VotingPatternArgsSchema,
  CountryDelegationArgsSchema,
} from './prompts/index.js';

/** @internal Server name constant */
export { SERVER_NAME, SERVER_VERSION } from './config.js';

/**
 * Main MCP Server class for European Parliament data access
 * 
 * Implements the Model Context Protocol (MCP) to provide AI assistants,
 * IDEs, and other MCP clients with structured access to European Parliament
 * open data, including information about MEPs, plenary sessions, committees,
 * legislative documents, and parliamentary questions.
 * 
 * **Features:**
 * - MCP protocol implementation with tools, resources, and prompts
 * - Type-safe TypeScript implementation with strict mode
 * - GDPR-compliant data handling
 * - Rate limiting and security controls
 * - Comprehensive error handling
 * 
 * **Data Sources:**
 * - European Parliament Open Data Portal (https://data.europarl.europa.eu/)
 * - API v2: https://data.europarl.europa.eu/api/v2/
 * 
 * @example
 * ```typescript
 * const server = new EuropeanParliamentMCPServer();
 * await server.start();
 * ```
 * 
 * @see https://spec.modelcontextprotocol.io/ - MCP specification
 * @see https://data.europarl.europa.eu/ - EP Open Data Portal
 * @see https://github.com/Hack23/ISMS-PUBLIC - ISMS compliance policies
 */
export class EuropeanParliamentMCPServer {
  // Using Server for now until McpServer is available in the SDK version
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  private readonly server: Server;

  constructor() {
    // Using Server for now until McpServer is available in the SDK version
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Set up MCP protocol handlers
   * 
   * Registers handlers for:
   * - Tool listing: Returns available tools with schemas
   * - Tool execution: Routes tool calls to appropriate handlers
   * 
   * **Security:**
   * - All inputs validated before processing
   * - Rate limiting applied per client
   * - GDPR compliance enforced
   * - Audit logging for all data access
   * 
   * @throws {Error} If handler registration fails
   * 
   * @internal
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      return Promise.resolve({
        tools: getToolMetadataArray(),
      });
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        return await this.dispatchToolCall(name, args);
      } catch (error) {
        // Log error to stderr (stdout is used for MCP protocol)
        console.error(`[ERROR] Tool ${name} failed:`, error);
        
        // Re-throw with clean error message
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Tool execution failed: ${String(error)}`);
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, () => {
      return Promise.resolve({
        prompts: getPromptMetadataArray(),
      });
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, (request) => {
      const { name, arguments: args } = request.params;

      try {
        return Promise.resolve(handleGetPrompt(name, args));
      } catch (error) {
        console.error(`[ERROR] Prompt ${name} failed:`, error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Prompt execution failed: ${String(error)}`);
      }
    });

    // List resource templates
    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, () => {
      return Promise.resolve({
        resourceTemplates: getResourceTemplateArray(),
      });
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        return await handleReadResource(uri);
      } catch (error) {
        console.error(`[ERROR] Resource ${uri} failed:`, error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Resource read failed: ${String(error)}`);
      }
    });
  }

  /**
   * Dispatch tool calls to appropriate handlers
   * 
   * @internal
   * @param name - Tool name
   * @param args - Tool arguments
   * @returns Tool execution result
   */
  private async dispatchToolCall(
    name: string,
    args: unknown
  ): Promise<{ content: { type: string; text: string }[] }> {
    return await dispatchToolCall(name, args);
  }

  /**
   * Start the MCP server
   * 
   * Initializes the server with stdio transport and begins listening for
   * MCP protocol messages. The server communicates via standard input/output
   * following the MCP specification.
   * 
   * **Lifecycle:**
   * 1. Create stdio transport
   * 2. Connect server to transport
   * 3. Log startup message to stderr
   * 4. Begin handling MCP requests
   * 
   * @returns Promise that resolves when server is started
   * 
   * @throws {Error} If server initialization fails
   * 
   * @example
   * ```typescript
   * const server = new EuropeanParliamentMCPServer();
   * await server.start();
   * // Server now listening on stdio
   * ```
   * 
   * @see https://spec.modelcontextprotocol.io/specification/architecture/
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();

    try {
      await this.server.connect(transport);
    } catch (connectError) {
      console.error('[FATAL] Failed to connect MCP transport:', connectError);
      throw connectError;
    }

    const tools = getToolMetadataArray();
    const coreToolCount = tools.filter(t => t.category === 'core').length;
    const advancedToolCount = tools.length - coreToolCount;
    const prompts = getPromptMetadataArray();
    const resourceTemplates = getResourceTemplateArray();

    // Log to stderr (stdout is used for MCP protocol)
    console.error(`${SERVER_NAME} v${SERVER_VERSION} started`);
    console.error('Server ready to handle requests');
    console.error(`Available tools: ${String(tools.length)} (${String(coreToolCount)} core + ${String(advancedToolCount)} advanced analysis)`);
    console.error(`Available prompts: ${String(prompts.length)}`);
    console.error(`Available resource templates: ${String(resourceTemplates.length)}`);
  }
}

// Only execute CLI logic if this module is the entry point
// This prevents CLI behavior from interfering when imported as a library
// Use realpathSync to handle npm bin symlinks/shims correctly
const isMainModule =
  process.argv[1] !== undefined &&
  realpathSync(resolve(fileURLToPath(import.meta.url))) === realpathSync(resolve(process.argv[1]));

if (isMainModule) {
  // Parse command-line arguments using typed CLIOptions
  const cliArgs = process.argv.slice(2);
  const opts = parseCLIArgs(cliArgs);

  // Handle CLI commands
  if (opts.help === true) {
    showHelp();
    process.exit(0);
  }

  if (opts.version === true) {
    showVersion();
    process.exit(0);
  }

  if (opts.health === true) {
    showHealth();
    process.exit(0);
  }

  // Start the MCP server (default behavior)
  const server = new EuropeanParliamentMCPServer();

  // Shutdown signal handlers — exit immediately on SIGTERM / SIGINT
  // (stdio would otherwise keep the event loop alive in containers)
  function handleShutdownSignal(signal: string): void {
    console.error(`[${SERVER_NAME}] Received ${signal} — exiting`);
    // Explicitly exit so that stdio doesn't keep the event loop alive in containers
    process.exit(0);
  }

  process.once('SIGTERM', () => { handleShutdownSignal('SIGTERM'); });
  process.once('SIGINT', () => { handleShutdownSignal('SIGINT'); });

  server.start().catch((error: unknown) => {
    console.error('[FATAL] Server startup failed:', error);
    process.exit(1);
  });
}
