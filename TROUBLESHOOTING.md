# Troubleshooting Guide

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">European Parliament MCP Server - Troubleshooting Guide</h1>

<p align="center">
  <strong>Common issues, solutions, and debugging strategies</strong><br>
  <em>Quick resolutions for MCP server problems</em>
</p>

---

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Connection Issues](#connection-issues)
- [Tool Errors](#tool-errors)
- [Performance Issues](#performance-issues)
- [Authentication Problems](#authentication-problems)
- [Data Quality Issues](#data-quality-issues)
- [Debugging Strategies](#debugging-strategies)
- [Getting Help](#getting-help)

---

## 🔍 Quick Diagnostics

### Health Check

Run these commands to verify the server is working correctly:

```bash
# Check Node.js version (must be 22.x+)
node --version

# Build the server
cd /path/to/European-Parliament-MCP-Server
npm run build

# Run tests
npm test

# Check for linting errors
npm run lint

# Verify dependencies
npm audit
```

### Common Symptoms

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Server won't start | Missing dependencies | Run `npm install` |
| Tools not appearing | Build not run | Run `npm run build` |
| Slow responses | No cache or EP API slow | Check cache configuration |
| "Rate limit exceeded" | Too many requests | Wait 15 minutes or increase limit |
| Validation errors | Invalid parameters | Check parameter format |
| Connection refused | Wrong path/permissions | Verify server path in config |

---

## 🔌 Connection Issues

### Issue: MCP Server Not Starting

**Symptoms**:
- Claude Desktop shows "Server failed to start"
- VS Code extension shows "Connection refused"
- Server process exits immediately

**Causes & Solutions**:

#### Cause 1: Missing Dependencies

```bash
# Check if node_modules exists
ls -la node_modules

# Reinstall dependencies
npm install

# Verify installation
npm list --depth=0
```

#### Cause 2: Build Not Run

```bash
# Build the project
npm run build

# Verify dist directory exists
ls -la dist/

# Check dist/index.js exists
test -f dist/index.js && echo "Build OK" || echo "Build failed"
```

#### Cause 3: Wrong Node.js Version

```bash
# Check version
node --version

# Must be v22.x or higher
# Install correct version using nvm
nvm install 22
nvm use 22
```

#### Cause 4: Permission Issues

```bash
# Check file permissions
ls -la dist/index.js

# Make executable if needed
chmod +x dist/index.js

# Check directory permissions
ls -ld /path/to/European-Parliament-MCP-Server
```

---

### Issue: Claude Desktop Can't Find Server

**Symptoms**:
- Server not appearing in Claude Desktop tools
- "Command not found" error
- No tools available

**Solution 1: Verify Configuration File**

Location: `~/.config/claude/claude_desktop_config.json` (Linux/Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": [
        "/absolute/path/to/European-Parliament-MCP-Server/dist/index.js"
      ],
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

**Important**:
- Use **absolute paths**, not relative paths
- Use forward slashes `/` even on Windows
- Verify the path exists: `test -f /path/to/dist/index.js`

**Solution 2: Restart Claude Desktop**

```bash
# Kill all Claude processes
killall -9 Claude

# Or on Windows
taskkill /F /IM Claude.exe

# Restart Claude Desktop
```

**Solution 3: Check Logs**

```bash
# Claude Desktop logs location (Mac)
tail -f ~/Library/Logs/Claude/main.log

# Linux
tail -f ~/.config/claude/logs/main.log

# Look for errors related to "european-parliament"
grep "european-parliament" ~/Library/Logs/Claude/main.log
```

---

### Issue: VS Code Extension Not Connecting

**Symptoms**:
- Extension shows "Disconnected"
- Tools not available in command palette
- No response from server

**Solution 1: Check .vscode/mcp.json**

```json
{
  "servers": {
    "european-parliament": {
      "type": "stdio",
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "${workspaceFolder}/European-Parliament-MCP-Server"
    }
  }
}
```

**Solution 2: Verify Workspace Folder**

```bash
# Ensure server is in workspace
ls -la ${workspaceFolder}/European-Parliament-MCP-Server/dist/index.js

# Or use absolute path
```

**Solution 3: Check VS Code Output**

1. Open VS Code
2. View → Output
3. Select "MCP Extension" from dropdown
4. Look for connection errors

---

## 🛠️ Tool Errors

### Issue: "ValidationError: Invalid country code"

**Cause**: Country parameter not in ISO 3166-1 alpha-2 format

**Solution**:

```typescript
// ❌ Wrong
await client.callTool('get_meps', {
  country: 'Sweden'  // Full name not allowed
});

// ❌ Wrong
await client.callTool('get_meps', {
  country: 'se'  // Must be uppercase
});

// ✅ Correct
await client.callTool('get_meps', {
  country: 'SE'  // ISO 3166-1 alpha-2
});
```

**Valid Country Codes**: AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK

---

### Issue: "ValidationError: Invalid date format"

**Cause**: Date not in YYYY-MM-DD format

**Solution**:

```typescript
// ❌ Wrong
await client.callTool('get_plenary_sessions', {
  dateFrom: '01/01/2024'  // US format not allowed
});

// ❌ Wrong
await client.callTool('get_plenary_sessions', {
  dateFrom: '2024-1-1'  // Must be zero-padded
});

// ✅ Correct
await client.callTool('get_plenary_sessions', {
  dateFrom: '2024-01-01'  // YYYY-MM-DD
});
```

---

### Issue: "ValidationError: keywords contains invalid characters"

**Cause**: Search keywords contain special characters

**Solution**:

```typescript
// ❌ Wrong
await client.callTool('search_documents', {
  keywords: 'climate@change'  // Special chars not allowed
});

// ❌ Wrong
await client.callTool('search_documents', {
  keywords: 'climate/change'  // Slashes not allowed
});

// ✅ Correct
await client.callTool('search_documents', {
  keywords: 'climate change'  // Alphanumeric, spaces, hyphens only
});

// ✅ Correct
await client.callTool('search_documents', {
  keywords: 'climate-change'  // Hyphens allowed
});
```

---

### Issue: "RateLimitError: Rate limit exceeded"

**Cause**: Exceeded 100 requests per 15 minutes

**Symptoms**:
```json
{
  "error": "RateLimitError: Rate limit exceeded, retry in 300 seconds"
}
```

**Solution 1: Implement Exponential Backoff**

```typescript
async function callWithRetry(toolName, params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.callTool(toolName, params);
    } catch (error) {
      if (error.message.includes('Rate limit')) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Solution 2: Implement Request Throttling**

```typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly delayMs = 1000; // 1 request per second
  
  async enqueue(fn: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.process();
      }
    });
  }
  
  private async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) {
        await fn();
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
      }
    }
    
    this.processing = false;
  }
}

// Usage
const queue = new RequestQueue();
const result = await queue.enqueue(() => 
  client.callTool('get_meps', { country: 'SE' })
);
```

**Solution 3: Use Caching**

```typescript
// Cache frequently accessed data
const cache = new Map();

async function getCachedMEPs(country) {
  const key = `meps:${country}`;
  
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    const age = Date.now() - timestamp;
    
    // Use cache if < 15 minutes old
    if (age < 15 * 60 * 1000) {
      return data;
    }
  }
  
  // Fetch fresh data
  const result = await client.callTool('get_meps', { country });
  cache.set(key, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
}
```

---

### Issue: "NotFoundError: MEP not found"

**Cause**: Invalid MEP ID or MEP no longer exists

**Solution**:

```typescript
// Step 1: Search for MEPs first
const meps = await client.callTool('get_meps', {
  country: 'SE',
  limit: 10
});

const data = JSON.parse(meps.content[0].text);

// Step 2: Use valid MEP ID from results
if (data.data.length > 0) {
  const mepId = data.data[0].id;
  
  const details = await client.callTool('get_mep_details', {
    id: mepId  // Valid ID from get_meps
  });
}

// Step 3: Handle not found gracefully
try {
  const details = await client.callTool('get_mep_details', {
    id: 'MEP-123456'
  });
} catch (error) {
  if (error.message.includes('NotFoundError')) {
    console.log('MEP not found, may be historical or invalid ID');
  } else {
    throw error;
  }
}
```

---

### Issue: "APIError: Failed to fetch from European Parliament API"

**Cause**: European Parliament API is down or unreachable

**Symptoms**:
```json
{
  "error": "APIError: Failed to retrieve MEPs: API request failed"
}
```

**Solution 1: Check EP API Status**

```bash
# Test EP API directly
curl -I https://data.europarl.europa.eu/api/v2/meps

# Should return 200 OK
# If 5xx error, EP API is down
```

**Solution 2: Implement Retry Logic**

```typescript
async function callToolWithRetry(toolName, params, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.callTool(toolName, params);
    } catch (error) {
      lastError = error;
      
      if (error.message.includes('APIError')) {
        const delay = Math.pow(2, i) * 2000; // 2s, 4s, 8s
        console.log(`API error, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Don't retry validation errors
      }
    }
  }
  
  throw lastError;
}
```

**Solution 3: Check Firewall/Network**

```bash
# Verify network connectivity
ping data.europarl.europa.eu

# Check DNS resolution
nslookup data.europarl.europa.eu

# Test HTTPS connection
curl -v https://data.europarl.europa.eu/api/v2/meps
```

---

## ⚡ Performance Issues

### Issue: Slow Response Times (>1 second)

**Symptoms**:
- Tool responses take several seconds
- Timeouts occur
- Poor user experience

**Diagnosis**:

```typescript
// Measure response time
console.time('tool_call');
const result = await client.callTool('get_meps', { country: 'SE' });
console.timeEnd('tool_call');
// Should be <200ms for cached, <500ms for API call
```

**Solution 1: Enable Debug Logging**

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "LOG_LEVEL": "debug",
        "ENABLE_METRICS": "true"
      }
    }
  }
}
```

**Solution 2: Check Cache Configuration**

```typescript
// Verify cache is working
const cache = new LRUCache({
  max: 500,
  ttl: 15 * 60 * 1000  // 15 minutes
});

// Test cache hit
const key = 'test';
cache.set(key, 'value');
console.log(cache.has(key)); // Should be true
```

**Solution 3: Monitor EP API Response Times**

```bash
# Test EP API speed
time curl -s https://data.europarl.europa.eu/api/v2/meps > /dev/null

# Should be < 1 second
# If > 5 seconds, EP API is slow
```

---

### Issue: High Memory Usage

**Symptoms**:
- Server process uses >500MB RAM
- Out of memory errors
- Server becomes unresponsive

**Diagnosis**:

```bash
# Check memory usage
ps aux | grep "node.*index.js"

# Monitor over time
watch -n 5 'ps aux | grep "node.*index.js"'
```

**Solution 1: Reduce Cache Size**

```typescript
// Adjust cache configuration
const cache = new LRUCache({
  max: 100,  // Reduce from 500
  ttl: 10 * 60 * 1000  // 10 minutes instead of 15
});
```

**Solution 2: Implement Memory Limits**

```bash
# Start with memory limit
node --max-old-space-size=256 dist/index.js
```

**Solution 3: Clear Cache Periodically**

```typescript
// Clear cache every hour
setInterval(() => {
  cache.clear();
  console.log('Cache cleared');
}, 60 * 60 * 1000);
```

---

### Issue: Cache Not Working

**Symptoms**:
- Every request hits EP API
- Response times always >200ms
- Rate limits hit quickly

**Diagnosis**:

```typescript
// Test cache manually
const LRUCache = require('lru-cache');
const cache = new LRUCache({ max: 10, ttl: 60000 });

cache.set('test', 'value');
console.log(cache.get('test')); // Should return 'value'

// Check cache stats
console.log({
  size: cache.size,
  max: cache.max,
  ttl: cache.ttl
});
```

**Solution**:

Check cache configuration in `src/clients/europeanParliamentClient.ts`:

```typescript
// Verify cache is initialized
private cache = new LRUCache<string, any>({
  max: 500,
  ttl: 15 * 60 * 1000,
  allowStale: false,
  updateAgeOnGet: false
});

// Verify cache key generation
private getCacheKey(method: string, params: any): string {
  return `${method}:${JSON.stringify(params)}`;
}
```

---

## 🔐 Authentication Problems

### Issue: "Unauthorized" (Future)

**Note**: Current version does not implement authentication. This section covers planned OAuth 2.0 authentication.

**Symptoms**:
- 401 Unauthorized error
- "Invalid token" error
- Tools return authentication errors

**Solution 1: Verify Token**

```typescript
// Check token format
const token = 'your-token-here';
console.log('Token length:', token.length);
console.log('Token starts with:', token.substring(0, 10));

// Verify token hasn't expired
const decoded = jwt.decode(token);
console.log('Expires:', new Date(decoded.exp * 1000));
```

**Solution 2: Refresh Token**

```typescript
// Implement token refresh
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://oauth.provider/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: 'your-client-id'
    })
  });
  
  const data = await response.json();
  return data.access_token;
}
```

---

## 📊 Data Quality Issues

### Issue: Missing or Incomplete Data

**Symptoms**:
- Fields are null or undefined
- Arrays are empty
- Data doesn't match expectations

**Cause**: European Parliament API may return incomplete data

**Solution 1: Handle Missing Fields**

```typescript
// Always check for undefined
const result = await client.callTool('get_mep_details', {
  id: 'MEP-124810'
});

const mep = JSON.parse(result.content[0].text);

// Safe field access
const email = mep.email ?? 'Email not available';
const committees = mep.committees ?? [];
const votingStats = mep.votingStatistics ?? {
  totalVotes: 0,
  attendanceRate: 0
};

console.log(`Email: ${email}`);
console.log(`Committees: ${committees.join(', ')}`);
```

**Solution 2: Validate Response**

```typescript
// Validate response structure
function validateMEP(mep: any): boolean {
  return (
    typeof mep.id === 'string' &&
    typeof mep.name === 'string' &&
    typeof mep.country === 'string' &&
    Array.isArray(mep.committees)
  );
}

const result = await client.callTool('get_mep_details', {
  id: 'MEP-124810'
});

const mep = JSON.parse(result.content[0].text);

if (!validateMEP(mep)) {
  console.error('Invalid MEP data structure');
}
```

---

### Issue: Unexpected Data Format

**Symptoms**:
- JSON parsing fails
- Type mismatches
- Data doesn't match schema

**Diagnosis**:

```typescript
// Log raw response
const result = await client.callTool('get_meps', {
  country: 'SE'
});

console.log('Raw content:', result.content[0].text);

// Try parsing
try {
  const data = JSON.parse(result.content[0].text);
  console.log('Parsed successfully:', typeof data);
} catch (error) {
  console.error('JSON parse error:', error.message);
}
```

**Solution**: Update client if API format changed

```bash
# Pull latest version
git pull origin main

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Run tests to verify
npm test
```

---

## 🐛 Debugging Strategies

### Enable Debug Logging

**Method 1: Environment Variable**

```bash
# Set log level
export LOG_LEVEL=debug

# Run server
node dist/index.js
```

**Method 2: Config File**

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "LOG_LEVEL": "debug",
        "NODE_ENV": "development"
      }
    }
  }
}
```

**Method 3: Code**

```typescript
// src/index.ts
import { logger } from './utils/logger.js';

logger.level = 'debug';
logger.debug('Server starting with debug logging');
```

---

### Trace Tool Execution

**Add logging to tools**:

```typescript
// src/tools/getMEPs.ts
export async function handleGetMEPs(args: unknown) {
  console.log('[getMEPs] Input:', JSON.stringify(args));
  
  const params = GetMEPsSchema.parse(args);
  console.log('[getMEPs] Validated params:', params);
  
  const result = await epClient.getMEPs(params);
  console.log('[getMEPs] Result count:', result.data.length);
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}
```

---

### Monitor Network Requests

**Use network debugging**:

```bash
# Monitor HTTP requests
export NODE_DEBUG=http

node dist/index.js
```

**Capture requests with tcpdump**:

```bash
# Capture EP API requests
sudo tcpdump -i any -A 'host data.europarl.europa.eu'
```

---

### Profile Performance

**Use Node.js profiler**:

```bash
# Generate CPU profile
node --prof dist/index.js

# Process profile
node --prof-process isolate-*.log > profile.txt

# Analyze profile
less profile.txt
```

**Memory profiling**:

```bash
# Generate heap snapshot
node --heapsnapshot-signal=SIGUSR2 dist/index.js

# Send signal to generate snapshot
kill -USR2 <pid>

# Analyze with Chrome DevTools
```

---

### Test Individual Components

**Test EP API client directly**:

```typescript
// test-client.ts
import { epClient } from './src/clients/europeanParliamentClient.js';

async function test() {
  try {
    const meps = await epClient.getMEPs({ country: 'SE', limit: 10 });
    console.log('Success:', meps.data.length, 'MEPs');
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
```

```bash
# Run test
npx tsx test-client.ts
```

---

## 🆘 Getting Help

### Before Asking for Help

**Gather diagnostic information**:

```bash
#!/bin/bash
# diagnostic.sh - Collect debugging information

echo "=== System Information ==="
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "OS: $(uname -a)"

echo -e "\n=== MCP Server ==="
echo "Path: $(pwd)"
echo "Build exists: $(test -f dist/index.js && echo 'Yes' || echo 'No')"

echo -e "\n=== Dependencies ==="
npm list --depth=0

echo -e "\n=== Recent Logs ==="
tail -n 50 logs/server.log 2>/dev/null || echo "No logs found"

echo -e "\n=== Test Results ==="
npm test 2>&1 | tail -n 20
```

---

### GitHub Issues

**Create an issue**: https://github.com/Hack23/European-Parliament-MCP-Server/issues/new

**Include**:
1. Server version: `git rev-parse HEAD`
2. Node.js version: `node --version`
3. Operating system
4. Configuration (remove sensitive data)
5. Full error message
6. Steps to reproduce
7. Expected vs actual behavior

**Example Issue**:

```markdown
## Bug Report

**Server Version**: `git commit hash`
**Node Version**: v22.1.0
**OS**: Ubuntu 22.04

### Description
Server returns "ValidationError" when using get_meps with valid country code.

### Steps to Reproduce
1. Start server with `node dist/index.js`
2. Call `get_meps` with `{country: "SE"}`
3. Observe error

### Expected Behavior
Should return list of Swedish MEPs

### Actual Behavior
Returns: `ValidationError: country must match pattern ^[A-Z]{2}$`

### Configuration
```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

### Logs
```
[ERROR] Validation failed: ...
```
```

---

### GitHub Discussions

**For questions**: https://github.com/Hack23/European-Parliament-MCP-Server/discussions

**Categories**:
- **Q&A**: Usage questions
- **Ideas**: Feature requests
- **Show and Tell**: Your implementations
- **General**: Other discussions

---

### Security Issues

**For security vulnerabilities**: See [SECURITY.md](../SECURITY.md)

**Do NOT post security issues publicly**. Email: security@hack23.com

---

## 📚 Additional Resources

### Documentation
- [API Usage Guide](./API_USAGE_GUIDE.md) - Complete tool documentation
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md) - Visual architecture
- [Developer Guide](./DEVELOPER_GUIDE.md) - Development and contributing
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Installation instructions
- [Performance Guide](./PERFORMANCE_GUIDE.md) - Optimization strategies

### External Resources
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Protocol docs
- [European Parliament API](https://data.europarl.europa.eu/en/developer-corner) - EP API docs
- [Node.js Debugging](https://nodejs.org/en/docs/guides/debugging-getting-started/) - Node.js debugging guide

### ISMS Compliance
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC) - Security standards

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>ISMS-compliant troubleshooting for production reliability</em>
</p>
