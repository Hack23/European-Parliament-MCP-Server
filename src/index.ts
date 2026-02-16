#!/usr/bin/env node
/**
 * European Parliament MCP Server
 * 
 * Model Context Protocol server providing access to European Parliament open data.
 * 
 * @see https://data.europarl.europa.eu/
 * @see https://spec.modelcontextprotocol.io/
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

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
// Export types for public API
export type * from './types/index.js';
export * from './types/index.js';

const SERVER_NAME = 'european-parliament-mcp-server';
const SERVER_VERSION = '1.0.0';

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
        tools: [
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
          generateReportToolMetadata
        ],
      });
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Core tools
          case 'get_meps':
            return await handleGetMEPs(args);
          case 'get_mep_details':
            return await handleGetMEPDetails(args);
          case 'get_plenary_sessions':
            return await handleGetPlenarySessions(args);
          case 'get_voting_records':
            return await handleGetVotingRecords(args);
          case 'search_documents':
            return await handleSearchDocuments(args);
          case 'get_committee_info':
            return await handleGetCommitteeInfo(args);
          case 'get_parliamentary_questions':
            return await handleGetParliamentaryQuestions(args);
          // Advanced analysis tools
          case 'analyze_voting_patterns':
            return await handleAnalyzeVotingPatterns(args);
          case 'track_legislation':
            return await handleTrackLegislation(args);
          case 'generate_report':
            return await handleGenerateReport(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
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
  }

  /**
   * Handle get_meps tool call
   * 
   * Retrieves Members of European Parliament with optional filtering.
   * This tool provides access to MEP data from the European Parliament Open Data Portal.
   * Results are cached for 15 minutes to improve performance and reduce API load.
   * All access to personal data is logged for GDPR compliance.
   * 
   * @param args - Query parameters for filtering MEPs
   * @param args.country - ISO 3166-1 alpha-2 country code (e.g., "SE" for Sweden)
   * @param args.group - Political group identifier (e.g., "EPP", "S&D")
   * @param args.limit - Maximum number of results (1-100, default: 50)
   * 

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

    // Log to stderr (stdout is used for MCP protocol)
    console.error(`${SERVER_NAME} v${SERVER_VERSION} started`);
    console.error('Server ready to handle requests');
    console.error('Available tools: 10 (7 core + 3 advanced analysis)');
  }
}

// Start the server
const server = new EuropeanParliamentMCPServer();
server.start().catch((error: unknown) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
