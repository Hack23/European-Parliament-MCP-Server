#!/usr/bin/env node
/**
 * MCP Server Testing CLI
 *
 * Tests the European Parliament MCP Server locally to verify:
 * - Health check functionality
 * - Version command
 * - Help command
 * - MCP protocol initialization
 * - Tool listing via MCP protocol
 *
 * @see https://spec.modelcontextprotocol.io/
 * @see https://github.com/Hack23/European-Parliament-MCP-Server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** MCP protocol version used for all initialize requests */
const PROTOCOL_VERSION = '2024-11-05' as const;

/** Default timeout (ms) before giving up waiting for an MCP server response */
const DEFAULT_TIMEOUT_MS = 5000 as const;

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Parameters for the MCP initialize request */
interface McpInitParams {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  clientInfo: {
    name: string;
    version: string;
  };
}

/** A JSON-RPC 2.0 MCP request message */
interface McpRequest {
  jsonrpc: '2.0';
  id?: number;
  method: string;
  params?: McpInitParams | Record<string, unknown>;
}

/** A JSON-RPC 2.0 MCP response message */
interface McpResponse {
  jsonrpc: '2.0';
  id?: number;
  result?: {
    protocolVersion?: string;
    serverInfo?: {
      name: string;
      version: string;
    };
    tools?: McpToolResult[];
    [key: string]: unknown;
  };
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/** A single tool entry returned by the tools/list MCP method */
interface McpToolResult {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

/** Shape of the JSON payload returned by the --health flag */
interface HealthData {
  status: string;
  name: string;
  version: string;
  tools: {
    total: number;
    core: number;
    advanced: number;
  };
}

// ---------------------------------------------------------------------------
// Shared helper – build a standard MCP initialize request (DRY)
// ---------------------------------------------------------------------------

/**
 * Creates a JSON-RPC 2.0 `initialize` request for the MCP protocol.
 *
 * @param capabilities - Optional client capability map (defaults to empty).
 * @returns A fully-typed {@link McpRequest} ready to send over stdin.
 */
function createInitRequest(capabilities: Record<string, unknown> = {}): McpRequest {
  return {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: PROTOCOL_VERSION,
      capabilities,
      clientInfo: {
        name: 'test-client',
        version: '1.0.0',
      },
    },
  };
}

// ---------------------------------------------------------------------------
// runCommand
// ---------------------------------------------------------------------------

/**
 * Run a command and return its combined stdout (or stderr on success).
 *
 * @param command - Executable to run.
 * @param args    - Arguments to pass to the executable.
 * @returns Resolves with the command's stdout (or stderr when stdout is empty).
 */
async function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd: ROOT_DIR });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code: number | null) => {
      if (code !== 0) {
        reject(
          new Error(
            `Command failed with code ${code}\nStderr: ${stderr}\nStdout: ${stdout}`,
          ),
        );
      } else {
        resolve(stdout || stderr);
      }
    });

    proc.on('error', (err: Error) => {
      reject(err);
    });
  });
}

// ---------------------------------------------------------------------------
// testMCPProtocol
// ---------------------------------------------------------------------------

/**
 * Test MCP protocol initialization by sending an `initialize` request.
 *
 * @returns Resolves with the server's JSON-RPC response object.
 */
async function testMCPProtocol(): Promise<McpResponse> {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['dist/index.js'], { cwd: ROOT_DIR });
    let response = '';
    let timeout: ReturnType<typeof setTimeout>;

    proc.stdout.on('data', (data: Buffer) => {
      response += data.toString();
      // Try to parse each newline-delimited JSON-RPC response line
      const lines = response.split('\n').filter((line) => line.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as McpResponse;
          if (parsed.result !== undefined || parsed.error !== undefined) {
            clearTimeout(timeout);
            proc.kill();
            resolve(parsed);
            return;
          }
        } catch {
          // Not valid JSON yet – continue reading
        }
      }
    });

    proc.stderr.on('data', (data: Buffer) => {
      // Log server stderr so unexpected errors are visible during testing
      console.warn(`[server stderr]: ${data.toString().trim()}`);
    });

    proc.on('error', (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Send initialize request with explicit capabilities
    const initRequest = createInitRequest({
      roots: { listChanged: true },
      sampling: {},
    });

    if (proc.stdin) {
      proc.stdin.write(JSON.stringify(initRequest) + '\n');
    }

    // Timeout after DEFAULT_TIMEOUT_MS
    timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('MCP protocol test timeout'));
    }, DEFAULT_TIMEOUT_MS);
  });
}

// ---------------------------------------------------------------------------
// listTools
// ---------------------------------------------------------------------------

/**
 * Test tool listing via MCP protocol.
 * Performs initialization then requests `tools/list`.
 *
 * @returns Resolves with the array of available MCP tools.
 */
async function listTools(): Promise<McpToolResult[]> {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['dist/index.js'], { cwd: ROOT_DIR });
    let response = '';
    let initialized = false;
    let timeout: ReturnType<typeof setTimeout>;

    proc.stdout.on('data', (data: Buffer) => {
      response += data.toString();
      const lines = response.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as McpResponse;

          if (!initialized && parsed.result !== undefined) {
            // Initialization succeeded – send `notifications/initialized` then `tools/list`
            initialized = true;

            const initializedNotification: McpRequest = {
              jsonrpc: '2.0',
              method: 'notifications/initialized',
              params: {},
            };
            const toolsRequest: McpRequest = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/list',
              params: {},
            };

            if (proc.stdin) {
              proc.stdin.write(JSON.stringify(initializedNotification) + '\n');
              proc.stdin.write(JSON.stringify(toolsRequest) + '\n');
            }
          } else if (initialized && parsed.result?.tools !== undefined) {
            // Got the tools list
            clearTimeout(timeout);
            proc.kill();
            resolve(parsed.result.tools);
            return;
          }
        } catch {
          // Not valid JSON yet – continue reading
        }
      }
    });

    proc.stderr.on('data', (data: Buffer) => {
      // Log server stderr so unexpected errors are visible during testing
      console.warn(`[server stderr]: ${data.toString().trim()}`);
    });

    proc.on('error', (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Send initialize request (no special capabilities needed for tool listing)
    const initRequest = createInitRequest();

    if (proc.stdin) {
      proc.stdin.write(JSON.stringify(initRequest) + '\n');
    }

    timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('Tools listing timeout'));
    }, DEFAULT_TIMEOUT_MS);
  });
}

// ---------------------------------------------------------------------------
// Main test runner
// ---------------------------------------------------------------------------

/**
 * Runs all MCP server smoke tests and exits with an appropriate code.
 */
async function testMCPServer(): Promise<void> {
  console.log('🧪 Testing European Parliament MCP Server...\n');

  let passedTests = 0;
  let failedTests = 0;

  // ── Test 1: Health check ────────────────────────────────────────────────
  try {
    console.log('1️⃣  Testing health check...');
    const health = await runCommand('npm', [
      'exec',
      '--',
      'european-parliament-mcp-server',
      '--health',
    ]);
    const healthData = JSON.parse(health) as HealthData;

    if (
      healthData.status === 'healthy' &&
      healthData.name === 'european-parliament-mcp-server'
    ) {
      console.log('✅ Health check passed');
      console.log(`   Server: ${healthData.name} v${healthData.version}`);
      console.log(
        `   Tools: ${healthData.tools.total} (${healthData.tools.core} core + ${healthData.tools.advanced} advanced)`,
      );
      passedTests++;
    } else {
      throw new Error('Invalid health response');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log('❌ Health check failed:', message);
    failedTests++;
  }
  console.log();

  // ── Test 2: Version command ─────────────────────────────────────────────
  try {
    console.log('2️⃣  Testing version command...');
    const version = await runCommand('npm', [
      'exec',
      '--',
      'european-parliament-mcp-server',
      '--version',
    ]);

    if (
      version.includes('european-parliament-mcp-server') &&
      version.includes('v')
    ) {
      console.log('✅ Version command passed');
      console.log(`   ${version.trim()}`);
      passedTests++;
    } else {
      throw new Error('Invalid version response');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log('❌ Version command failed:', message);
    failedTests++;
  }
  console.log();

  // ── Test 3: Help command ────────────────────────────────────────────────
  try {
    console.log('3️⃣  Testing help command...');
    const help = await runCommand('npm', [
      'exec',
      '--',
      'european-parliament-mcp-server',
      '--help',
    ]);

    if (
      help.includes('Usage:') &&
      help.includes('Options:') &&
      help.includes('--health')
    ) {
      console.log('✅ Help command passed');
      console.log('   Help text includes usage, options, and configuration');
      passedTests++;
    } else {
      throw new Error('Invalid help response');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log('❌ Help command failed:', message);
    failedTests++;
  }
  console.log();

  // ── Test 4: MCP protocol initialization ────────────────────────────────
  try {
    console.log('4️⃣  Testing MCP protocol initialization...');
    const initResponse = await testMCPProtocol();

    if (initResponse.result?.protocolVersion !== undefined) {
      console.log('✅ MCP protocol initialization passed');
      console.log(
        `   Protocol version: ${initResponse.result.protocolVersion}`,
      );
      const serverInfo = initResponse.result.serverInfo;
      if (serverInfo) {
        console.log(`   Server: ${serverInfo.name} v${serverInfo.version}`);
      }
      passedTests++;
    } else if (initResponse.error !== undefined) {
      throw new Error(`MCP error: ${initResponse.error.message}`);
    } else {
      throw new Error('Invalid MCP response');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log('❌ MCP protocol initialization failed:', message);
    failedTests++;
  }
  console.log();

  // ── Test 5: Tool listing ────────────────────────────────────────────────
  try {
    console.log('5️⃣  Testing tool listing...');
    const tools = await listTools();

    if (Array.isArray(tools) && tools.length > 0) {
      console.log('✅ Tool listing passed');
      console.log(`   Found ${tools.length} tools:`);
      tools.slice(0, 5).forEach((tool) => {
        const desc = tool.description?.substring(0, 60) ?? '';
        console.log(`   - ${tool.name}: ${desc}...`);
      });
      if (tools.length > 5) {
        console.log(`   ... and ${tools.length - 5} more`);
      }
      passedTests++;
    } else {
      throw new Error('No tools found');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log('❌ Tool listing failed:', message);
    failedTests++;
  }
  console.log();

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════');
  console.log(`📊 Test Summary: ${passedTests} passed, ${failedTests} failed`);
  console.log('═══════════════════════════════════════════════════');

  if (failedTests === 0) {
    console.log('🎉 All tests passed!');
    console.log('\n✨ MCP server is ready for use with:');
    console.log('   - npx european-parliament-mcp-server');
    console.log('   - Claude Desktop');
    console.log('   - VS Code / Cursor');
    console.log('   - MCP Inspector');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

testMCPServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('💥 Fatal error:', message);
  process.exit(1);
});
