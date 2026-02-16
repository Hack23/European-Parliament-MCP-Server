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

const SERVER_NAME = 'european-parliament-mcp-server';
const SERVER_VERSION = '1.0.0';

/**
 * Main MCP Server class for European Parliament data access
 */
class EuropeanParliamentMCPServer {
  // Using Server for now until McpServer is available in the SDK version
  private server: Server;

  constructor() {
    // Using Server for now until McpServer is available in the SDK version
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
          {
            name: 'get_meps',
            description:
              'Get Members of European Parliament with optional filters (country, political group)',
            inputSchema: {
              type: 'object',
              properties: {
                country: {
                  type: 'string',
                  description: 'ISO 3166-1 alpha-2 country code (e.g., "SE" for Sweden)',
                },
                group: {
                  type: 'string',
                  description: 'Political group abbreviation',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (1-100)',
                  minimum: 1,
                  maximum: 100,
                  default: 50,
                },
              },
            },
          },
        ],
      });
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_meps':
          return this.handleGetMEPs(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  /**
   * Handle get_meps tool call
   */
  private handleGetMEPs(args: unknown): Promise<{ content: { type: string; text: string }[] }> {
    // TODO: Implement actual API call to European Parliament
    // For now, return mock data
    const response = {
      status: 'success',
      message: 'This is a skeleton implementation. API integration coming soon.',
      data: {
        meps: [],
        filters: args,
      },
    };

    return Promise.resolve({
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
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
  }
}

// Start the server
const server = new EuropeanParliamentMCPServer();
server.start().catch((error: unknown) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
