/**
 * MCP Test Client
 * 
 * Test harness for end-to-end testing with MCP stdio transport
 * 
 * ISMS Policy: SC-002 (Secure Testing)
 * 
 * @see https://modelcontextprotocol.io/
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * MCP Test Client for E2E testing
 * 
 * Spawns MCP server process and connects via stdio transport
 */
export class MCPTestClient {
  private client?: Client;
  private transport?: StdioClientTransport;
  private connected = false;

  /**
   * Connect to MCP server
   * 
   * @param serverPath - Path to server executable (default: dist/index.js)
   */
  async connect(serverPath = 'dist/index.js'): Promise<void> {
    if (this.connected) {
      throw new Error('Client already connected');
    }

    // Create stdio transport with command and args
    // StdioClientTransport will spawn the server process for us
    this.transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });

    // Create MCP client
    this.client = new Client({
      name: 'test-client',
      version: '1.0.0',
    }, {
      capabilities: {}
    });

    // Connect to server
    try {
      await this.client.connect(this.transport);
      this.connected = true;
      console.log('[E2E] Connected to MCP server');
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  /**
   * List available prompts
   * 
   * @returns List of prompt definitions
   */
  async listPrompts(): Promise<Array<{ name: string; description?: string }>> {
    if (!this.client || !this.connected) {
      throw new Error('Client not connected');
    }

    const response = await this.client.listPrompts();
    return response.prompts;
  }

  /**
   * List available resource templates
   * 
   * @returns List of resource template definitions
   */
  async listResourceTemplates(): Promise<Array<{ uriTemplate: string; name: string; description?: string }>> {
    if (!this.client || !this.connected) {
      throw new Error('Client not connected');
    }

    const response = await this.client.listResourceTemplates();
    return response.resourceTemplates;
  }

  /**
   * List available tools
   * 
   * @returns List of tool definitions
   */
  async listTools(): Promise<Array<{ name: string; description?: string }>> {
    if (!this.client || !this.connected) {
      throw new Error('Client not connected');
    }

    const response = await this.client.listTools();
    return response.tools;
  }

  /**
   * Call a tool
   * 
   * @param name - Tool name
   * @param args - Tool arguments
   * @returns Tool response
   */
  async callTool(
    name: string, 
    args: Record<string, unknown> = {}
  ): Promise<{ content: Array<{ type: string; text?: string }> }> {
    if (!this.client || !this.connected) {
      throw new Error('Client not connected');
    }

    const response = await this.client.callTool({
      name,
      arguments: args
    });

    return response as { content: Array<{ type: string; text?: string }> };
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    await this.cleanup();
  }

  /**
   * Clean up resources
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.client && this.connected) {
        await this.client.close();
      }
    } catch (error) {
      console.error('Error closing client:', error);
    }

    try {
      if (this.transport) {
        await this.transport.close();
      }
    } catch (error) {
      console.error('Error closing transport:', error);
    }

    this.connected = false;
    this.client = undefined;
    this.transport = undefined;
    
    console.log('[E2E] Disconnected from MCP server');
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Create and connect a test client
 * 
 * @param serverPath - Path to server executable
 * @returns Connected MCP test client
 */
export async function createTestClient(serverPath?: string): Promise<MCPTestClient> {
  const client = new MCPTestClient();
  await client.connect(serverPath);
  return client;
}
