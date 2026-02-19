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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

/**
 * Run a command and return its output
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @returns {Promise<string>} - Command output
 */
async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd: ROOT_DIR });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}\nStderr: ${stderr}\nStdout: ${stdout}`));
      } else {
        resolve(stdout || stderr);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Test MCP protocol initialization by sending initialize request
 * @returns {Promise<object>} - Server response
 */
async function testMCPProtocol() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['dist/index.js'], { cwd: ROOT_DIR });
    let response = '';
    let timeout;

    proc.stdout.on('data', (data) => {
      response += data.toString();
      // Try to parse JSON-RPC response
      const lines = response.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.result || parsed.error) {
            clearTimeout(timeout);
            proc.kill();
            resolve(parsed);
            return;
          }
        } catch (e) {
          // Not valid JSON yet, continue reading
        }
      }
    });

    proc.stderr.on('data', (data) => {
      // Ignore stderr (used for logging)
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Send initialize request
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: { listChanged: true },
          sampling: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    proc.stdin.write(JSON.stringify(initRequest) + '\n');

    // Timeout after 5 seconds
    timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('MCP protocol test timeout'));
    }, 5000);
  });
}

/**
 * Test tool listing via MCP protocol
 * @returns {Promise<object>} - Tools list
 */
async function listTools() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['dist/index.js'], { cwd: ROOT_DIR });
    let response = '';
    let initialized = false;
    let timeout;

    proc.stdout.on('data', (data) => {
      response += data.toString();
      const lines = response.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          
          if (!initialized && parsed.result) {
            // Initialization succeeded, send initialized notification
            initialized = true;
            const initializedNotification = {
              jsonrpc: '2.0',
              method: 'notifications/initialized',
              params: {}
            };
            proc.stdin.write(JSON.stringify(initializedNotification) + '\n');
            
            // Then request tools
            const toolsRequest = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/list',
              params: {}
            };
            proc.stdin.write(JSON.stringify(toolsRequest) + '\n');
          } else if (initialized && parsed.result && parsed.result.tools) {
            // Got tools list
            clearTimeout(timeout);
            proc.kill();
            resolve(parsed.result.tools);
            return;
          }
        } catch (e) {
          // Not valid JSON yet
        }
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Send initialize request first
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };

    proc.stdin.write(JSON.stringify(initRequest) + '\n');

    timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('Tools listing timeout'));
    }, 5000);
  });
}

/**
 * Main test runner
 */
async function testMCPServer() {
  console.log('🧪 Testing European Parliament MCP Server...\n');
  
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Health check
  try {
    console.log('1️⃣  Testing health check...');
    // Test via npm exec to simulate actual npx usage
    const health = await runCommand('npm', ['exec', '--', 'european-parliament-mcp-server', '--health']);
    const healthData = JSON.parse(health);
    
    if (healthData.status === 'healthy' && healthData.name === 'european-parliament-mcp-server') {
      console.log('✅ Health check passed');
      console.log(`   Server: ${healthData.name} v${healthData.version}`);
      console.log(`   Tools: ${healthData.tools.total} (${healthData.tools.core} core + ${healthData.tools.advanced} advanced)`);
      passedTests++;
    } else {
      throw new Error('Invalid health response');
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    failedTests++;
  }
  console.log();

  // Test 2: Version command
  try {
    console.log('2️⃣  Testing version command...');
    // Test via npm exec to simulate actual npx usage
    const version = await runCommand('npm', ['exec', '--', 'european-parliament-mcp-server', '--version']);
    
    if (version.includes('european-parliament-mcp-server') && version.includes('v')) {
      console.log('✅ Version command passed');
      console.log(`   ${version.trim()}`);
      passedTests++;
    } else {
      throw new Error('Invalid version response');
    }
  } catch (error) {
    console.log('❌ Version command failed:', error.message);
    failedTests++;
  }
  console.log();

  // Test 3: Help command
  try {
    console.log('3️⃣  Testing help command...');
    // Test via npm exec to simulate actual npx usage
    const help = await runCommand('npm', ['exec', '--', 'european-parliament-mcp-server', '--help']);
    
    if (help.includes('Usage:') && help.includes('Options:') && help.includes('--health')) {
      console.log('✅ Help command passed');
      console.log('   Help text includes usage, options, and configuration');
      passedTests++;
    } else {
      throw new Error('Invalid help response');
    }
  } catch (error) {
    console.log('❌ Help command failed:', error.message);
    failedTests++;
  }
  console.log();

  // Test 4: MCP protocol initialization
  try {
    console.log('4️⃣  Testing MCP protocol initialization...');
    const initResponse = await testMCPProtocol();
    
    if (initResponse.result && initResponse.result.protocolVersion) {
      console.log('✅ MCP protocol initialization passed');
      console.log(`   Protocol version: ${initResponse.result.protocolVersion}`);
      console.log(`   Server: ${initResponse.result.serverInfo.name} v${initResponse.result.serverInfo.version}`);
      passedTests++;
    } else if (initResponse.error) {
      throw new Error(`MCP error: ${initResponse.error.message}`);
    } else {
      throw new Error('Invalid MCP response');
    }
  } catch (error) {
    console.log('❌ MCP protocol initialization failed:', error.message);
    failedTests++;
  }
  console.log();

  // Test 5: Tool listing
  try {
    console.log('5️⃣  Testing tool listing...');
    const tools = await listTools();
    
    if (Array.isArray(tools) && tools.length > 0) {
      console.log('✅ Tool listing passed');
      console.log(`   Found ${tools.length} tools:`);
      tools.slice(0, 5).forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description?.substring(0, 60)}...`);
      });
      if (tools.length > 5) {
        console.log(`   ... and ${tools.length - 5} more`);
      }
      passedTests++;
    } else {
      throw new Error('No tools found');
    }
  } catch (error) {
    console.log('❌ Tool listing failed:', error.message);
    failedTests++;
  }
  console.log();

  // Summary
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

// Run tests
testMCPServer().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
