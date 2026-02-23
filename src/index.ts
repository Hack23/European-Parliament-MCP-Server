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

// Import tool handlers
import { handleGetMEPs, getMEPsToolMetadata } from './tools/getMEPs.js';
import { handleGetMEPDetails, getMEPDetailsToolMetadata } from './tools/getMEPDetails.js';
import { handleGetPlenarySessions, getPlenarySessionsToolMetadata } from './tools/getPlenarySessions.js';
import { handleGetVotingRecords, getVotingRecordsToolMetadata } from './tools/getVotingRecords.js';
import { handleSearchDocuments, searchDocumentsToolMetadata } from './tools/searchDocuments.js';
import { handleGetCommitteeInfo, getCommitteeInfoToolMetadata } from './tools/getCommitteeInfo.js';
import { handleGetParliamentaryQuestions, getParliamentaryQuestionsToolMetadata } from './tools/getParliamentaryQuestions.js';
import { handleAnalyzeVotingPatterns, analyzeVotingPatternsToolMetadata } from './tools/analyzeVotingPatterns.js';
import { handleTrackLegislation, trackLegislationToolMetadata } from './tools/trackLegislation.js';
import { handleGenerateReport, generateReportToolMetadata } from './tools/generateReport.js';
// Phase 1 OSINT Intelligence Tools
import { handleAssessMepInfluence, assessMepInfluenceToolMetadata } from './tools/assessMepInfluence.js';
import { handleAnalyzeCoalitionDynamics, analyzeCoalitionDynamicsToolMetadata } from './tools/analyzeCoalitionDynamics.js';
import { handleDetectVotingAnomalies, detectVotingAnomaliesToolMetadata } from './tools/detectVotingAnomalies.js';
import { handleComparePoliticalGroups, comparePoliticalGroupsToolMetadata } from './tools/comparePoliticalGroups.js';
import { handleAnalyzeLegislativeEffectiveness, analyzeLegislativeEffectivenessToolMetadata } from './tools/analyzeLegislativeEffectiveness.js';
import { handleMonitorLegislativePipeline, monitorLegislativePipelineToolMetadata } from './tools/monitorLegislativePipeline.js';
// Phase 2 OSINT Intelligence Tools
import { handleAnalyzeCommitteeActivity, analyzeCommitteeActivityToolMetadata } from './tools/analyzeCommitteeActivity.js';
import { handleTrackMepAttendance, trackMepAttendanceToolMetadata } from './tools/trackMepAttendance.js';
// MCP Prompts
import { getPromptMetadataArray, handleGetPrompt } from './prompts/index.js';
// MCP Resources
import { getResourceTemplateArray, handleReadResource } from './resources/index.js';
// Export types for public API
export type * from './types/index.js';
export * from './types/index.js';

const SERVER_NAME = 'european-parliament-mcp-server';
const SERVER_VERSION = '0.0.4';

/**
 * Number of core tools (non-advanced analysis tools)
 * Update this constant when adding/removing core tools in getToolMetadataArray()
 */
const CORE_TOOL_COUNT = 7;

/**
 * Display help message
 */
function showHelp(): void {
  // CLI output - intentional stdout usage
  // eslint-disable-next-line no-console
  console.log(`
${SERVER_NAME} v${SERVER_VERSION}

Model Context Protocol server for European Parliament open data

Usage:
  npx european-parliament-mcp-server [options]

Options:
  --health         Check server health and capabilities
  -v, --version    Show version information
  -h, --help       Show this help message

Environment Variables:
  EP_API_URL          European Parliament API base URL
                      (default: https://data.europarl.europa.eu/api/v2/)
  EP_CACHE_TTL        Cache TTL in milliseconds (default: 900000)
  EP_RATE_LIMIT       Rate limit requests per minute (default: 60)

MCP Client Configuration:

  Claude Desktop (claude_desktop_config.json):
  {
    "mcpServers": {
      "european-parliament": {
        "command": "npx",
        "args": ["european-parliament-mcp-server"]
      }
    }
  }

  VS Code / Cursor (settings.json):
  {
    "mcp.servers": {
      "european-parliament": {
        "command": "npx",
        "args": ["european-parliament-mcp-server"]
      }
    }
  }

For more information:
  Documentation: https://hack23.github.io/European-Parliament-MCP-Server/api/
  GitHub: https://github.com/Hack23/European-Parliament-MCP-Server
  Issues: https://github.com/Hack23/European-Parliament-MCP-Server/issues
`);
}

/**
 * Display version information
 */
function showVersion(): void {
  // CLI output - intentional stdout usage
  // eslint-disable-next-line no-console
  console.log(`${SERVER_NAME} v${SERVER_VERSION}`);
}

/**
 * Get tool metadata array
 * @internal
 */
function getToolMetadataArray(): { name: string; description: string; inputSchema: unknown }[] {
  return [
    // Core tools
    getMEPsToolMetadata,
    getMEPDetailsToolMetadata,
    getPlenarySessionsToolMetadata,
    getVotingRecordsToolMetadata,
    searchDocumentsToolMetadata,
    getCommitteeInfoToolMetadata,
    getParliamentaryQuestionsToolMetadata,
    // Advanced analysis tools
    analyzeVotingPatternsToolMetadata,
    trackLegislationToolMetadata,
    generateReportToolMetadata,
    // Phase 1 OSINT Intelligence Tools
    assessMepInfluenceToolMetadata,
    analyzeCoalitionDynamicsToolMetadata,
    detectVotingAnomaliesToolMetadata,
    comparePoliticalGroupsToolMetadata,
    analyzeLegislativeEffectivenessToolMetadata,
    monitorLegislativePipelineToolMetadata,
    // Phase 2 OSINT Intelligence Tools
    analyzeCommitteeActivityToolMetadata,
    trackMepAttendanceToolMetadata
  ];
}

/**
 * Display health check information
 */
function showHealth(): void {
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
      advanced: advancedToolCount
    },
    prompts: {
      total: prompts.length
    },
    resources: {
      templates: resourceTemplates.length
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    configuration: {
      apiUrl: sanitizeUrl(process.env['EP_API_URL'] ?? 'https://data.europarl.europa.eu/api/v2/'),
      cacheTTL: process.env['EP_CACHE_TTL'] ?? '900000',
      rateLimit: process.env['EP_RATE_LIMIT'] ?? '60'
    }
  };
  
  // CLI output - intentional stdout usage
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(health, null, 2));
}

/**
 * Sanitize URL to remove credentials
 * @param urlString - URL to sanitize
 * @returns Sanitized URL without credentials
 */
function sanitizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    // Remove username and password
    url.username = '';
    url.password = '';
    // Remove query parameters and fragment that might contain tokens
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    // If URL parsing fails, remove query and fragment parts as a safe fallback
    const withoutQuery = urlString.split('?')[0] ?? urlString;
    const withoutFragment = withoutQuery.split('#')[0] ?? withoutQuery;
    return withoutFragment;
  }
}

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
class EuropeanParliamentMCPServer {
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
    const toolHandlers: Record<string, (args: unknown) => Promise<{ content: { type: string; text: string }[] }>> = {
      // Core tools
      'get_meps': handleGetMEPs,
      'get_mep_details': handleGetMEPDetails,
      'get_plenary_sessions': handleGetPlenarySessions,
      'get_voting_records': handleGetVotingRecords,
      'search_documents': handleSearchDocuments,
      'get_committee_info': handleGetCommitteeInfo,
      'get_parliamentary_questions': handleGetParliamentaryQuestions,
      // Advanced analysis tools
      'analyze_voting_patterns': handleAnalyzeVotingPatterns,
      'track_legislation': handleTrackLegislation,
      'generate_report': handleGenerateReport,
      // Phase 1 OSINT Intelligence Tools
      'assess_mep_influence': handleAssessMepInfluence,
      'analyze_coalition_dynamics': handleAnalyzeCoalitionDynamics,
      'detect_voting_anomalies': handleDetectVotingAnomalies,
      'compare_political_groups': handleComparePoliticalGroups,
      'analyze_legislative_effectiveness': handleAnalyzeLegislativeEffectiveness,
      'monitor_legislative_pipeline': handleMonitorLegislativePipeline,
      // Phase 2 OSINT Intelligence Tools
      'analyze_committee_activity': handleAnalyzeCommitteeActivity,
      'track_mep_attendance': handleTrackMepAttendance
    };
    
    const handler = toolHandlers[name];
    if (handler === undefined) {
      throw new Error(`Unknown tool: ${name}`);
    }
    
    return await handler(args);
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
    await this.server.connect(transport);

    const tools = getToolMetadataArray();
    const advancedToolCount = tools.length - CORE_TOOL_COUNT;
    const prompts = getPromptMetadataArray();
    const resourceTemplates = getResourceTemplateArray();

    // Log to stderr (stdout is used for MCP protocol)
    console.error(`${SERVER_NAME} v${SERVER_VERSION} started`);
    console.error('Server ready to handle requests');
    console.error(`Available tools: ${String(tools.length)} (${String(CORE_TOOL_COUNT)} core + ${String(advancedToolCount)} advanced analysis)`);
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
  // Parse command-line arguments
  const args = process.argv.slice(2);

  // Handle CLI commands
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
  }

  if (args.includes('--health')) {
    showHealth();
    process.exit(0);
  }
}

// Start the MCP server (default behavior)
const server = new EuropeanParliamentMCPServer();
server.start().catch((error: unknown) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
