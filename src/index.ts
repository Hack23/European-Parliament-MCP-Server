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

const SERVER_NAME = 'european-parliament-mcp-server';
const SERVER_VERSION = '1.0.0';

/**
 * Main MCP Server class for European Parliament data access
 */
class EuropeanParliamentMCPServer {
  // Using Server for now until McpServer is available in the SDK version
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  private server: Server;

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
   * Start the MCP server
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
