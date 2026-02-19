<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">🧪 Local Testing Guide</h1>

<p align="center">
  <strong>Comprehensive guide for testing the European Parliament MCP Server locally</strong><br>
  <em>Install, configure, test, and troubleshoot the MCP server</em>
</p>

<p align="center">
  <a href="https://github.com/Hack23/European-Parliament-MCP-Server">
    <img src="https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github" alt="GitHub Repository">
  </a>
  <a href="https://www.npmjs.com/package/european-parliament-mcp-server">
    <img src="https://img.shields.io/npm/v/european-parliament-mcp-server.svg?style=flat-square" alt="npm version">
  </a>
  <a href="./SECURITY.md">
    <img src="https://img.shields.io/badge/Security-Policy-red?style=flat-square" alt="Security Policy">
  </a>
</p>

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Installation Methods](#-installation-methods)
- [Testing the Server](#-testing-the-server)
- [MCP Client Configuration](#-mcp-client-configuration)
- [Development Workflow](#-development-workflow)
- [MCP Inspector Integration](#-mcp-inspector-integration)
- [Platform-Specific Testing](#-platform-specific-testing)
- [Troubleshooting](#-troubleshooting)
- [ISMS Compliance](#-isms-compliance)

---

## 📦 Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Notes |
|----------|----------------|-------------|-------|
| **Node.js** | 24.0.0 | 24.13.0+ | ES Modules and modern features required |
| **npm** | 10.0.0 | 10.8.0+ | For package management |
| **Git** | 2.40+ | Latest | For development workflow |

### System Requirements

- **Memory**: 512MB RAM minimum, 1GB recommended
- **Disk Space**: 100MB for installation and dependencies
- **Network**: Internet access for initial package download
- **OS**: Linux, macOS, or Windows 10+

### Verification

```bash
# Check Node.js version
node --version
# Should show v24.x.x or higher

# Check npm version
npm --version
# Should show 10.x.x or higher

# Check that npx is available
npx --version
```

---

## 🚀 Quick Start

### Install and Test (3 Steps)

```bash
# 1. Install via npx (no global installation needed)
npx european-parliament-mcp-server --version

# 2. Check server health
npx european-parliament-mcp-server --health

# 3. View help
npx european-parliament-mcp-server --help
```

### Example Output

```json
{
  "name": "european-parliament-mcp-server",
  "version": "0.0.4",
  "status": "healthy",
  "capabilities": ["tools", "resources", "prompts"],
  "tools": {
    "total": 10,
    "core": 7,
    "advanced": 3
  },
  "environment": {
    "nodeVersion": "v24.13.0",
    "platform": "linux",
    "arch": "x64"
  },
  "configuration": {
    "apiUrl": "https://data.europarl.europa.eu/api/v2/",
    "cacheTTL": "900000",
    "rateLimit": "60"
  }
}
```

---

## 🔧 Installation Methods

### Method 1: npx (Recommended for Users)

```bash
# No installation needed - npx downloads and runs automatically
npx european-parliament-mcp-server --help

# Use with MCP clients (Claude Desktop, VS Code, etc.)
# See configuration section below
```

**Pros:**
- ✅ No global installation
- ✅ Always uses latest version
- ✅ No maintenance required
- ✅ Works across all platforms

**Cons:**
- ⚠️ Slightly slower first run (downloads package)
- ⚠️ Requires internet on first use

---

### Method 2: Global Installation

```bash
# Install globally
npm install -g european-parliament-mcp-server

# Run directly
european-parliament-mcp-server --health

# Update to latest version
npm update -g european-parliament-mcp-server
```

**Pros:**
- ✅ Faster startup (no download)
- ✅ Works offline after installation
- ✅ Shorter command

**Cons:**
- ⚠️ Requires manual updates
- ⚠️ May conflict with other global packages

---

### Method 3: Local Development

```bash
# Clone the repository
git clone https://github.com/Hack23/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm run test-mcp

# Test locally
node dist/index.js --health

# Link for development
npm link
european-parliament-mcp-server --health
```

**Pros:**
- ✅ Full source code access
- ✅ Easy to modify and test changes
- ✅ Can contribute back via PR

**Cons:**
- ⚠️ Requires build step
- ⚠️ More complex setup

---

## 🧪 Testing the Server

### Basic CLI Tests

```bash
# Test 1: Version command
npx european-parliament-mcp-server --version
# Expected: european-parliament-mcp-server v0.0.4

# Test 2: Health check
npx european-parliament-mcp-server --health
# Expected: JSON with status "healthy"

# Test 3: Help command
npx european-parliament-mcp-server --help
# Expected: Usage instructions and configuration examples
```

### Automated Testing

```bash
# For local development only
git clone https://github.com/Hack23/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server

# Install dependencies
npm install

# Build project
npm run build

# Run comprehensive test suite
npm run test-mcp

# Expected output:
# ✅ Health check passed
# ✅ Version command passed
# ✅ Help command passed
# ✅ MCP protocol initialization passed
# ✅ Tool listing passed
```

### Package Verification

```bash
# Verify package before publishing (dev only)
npm run verify-package

# Expected output:
# ✅ dist/ directory exists
# ✅ Required files present
# ✅ Shebang present
# ✅ Package configuration valid
# ✅ ISMS compliance met
```

---

## 🔌 MCP Client Configuration

### Claude Desktop

**Location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Configuration (Production - npx):**

```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "npx",
      "args": ["european-parliament-mcp-server"],
      "env": {
        "EP_API_URL": "https://data.europarl.europa.eu/api/v2/",
        "EP_CACHE_TTL": "900000",
        "EP_RATE_LIMIT": "60"
      }
    }
  }
}
```

**Configuration (Development - Local):**

```json
{
  "mcpServers": {
    "european-parliament-dev": {
      "command": "node",
      "args": ["/absolute/path/to/European-Parliament-MCP-Server/dist/index.js"],
      "env": {
        "EP_API_URL": "https://data.europarl.europa.eu/api/v2/",
        "EP_CACHE_TTL": "900000",
        "EP_RATE_LIMIT": "60"
      }
    }
  }
}
```

**Test Configuration:**

1. Save the configuration file
2. Restart Claude Desktop completely
3. Open a new conversation
4. Type: "List available MCP tools"
5. You should see European Parliament tools listed

---

### VS Code / Cursor

**Location:** `.vscode/settings.json` in your project

**Configuration:**

```json
{
  "mcp.servers": {
    "european-parliament": {
      "command": "npx",
      "args": ["european-parliament-mcp-server"]
    }
  }
}
```

**Test:**
1. Install the MCP extension for VS Code
2. Open Command Palette (`Cmd/Ctrl + Shift + P`)
3. Search for "MCP: Connect to Server"
4. Select "european-parliament"

---

### Cline Extension

**Configuration:**

```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "npx",
      "args": ["european-parliament-mcp-server"]
    }
  }
}
```

---

## 🛠️ Development Workflow

### Full Development Cycle

```bash
# 1. Clone and setup
git clone https://github.com/Hack23/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server
npm install

# 2. Make code changes
# Edit files in src/

# 3. Build and test
npm run build
npm run lint
npm run test:unit

# 4. Test MCP functionality
npm run test-mcp

# 5. Verify package
npm run verify-package

# 6. Test with local link
npm link
european-parliament-mcp-server --health

# 7. Test with MCP client
# Configure Claude Desktop to use local build (see above)

# 8. Clean up
npm unlink
```

### Watch Mode Development

```bash
# Terminal 1: Watch and rebuild on changes
npm run dev

# Terminal 2: Test after changes
npm run test-mcp
```

---

## 🔍 MCP Inspector Integration

The MCP Inspector provides a web UI for testing MCP servers.

### Installation

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector
```

### Testing with npx (Production)

```bash
# Test published package
mcp-inspector npx european-parliament-mcp-server
```

### Testing Local Build (Development)

```bash
# From repository root
npm run build
mcp-inspector node dist/index.js
```

### Using the Inspector

1. **Start Inspector**: Run command above
2. **Open Browser**: Inspector opens at `http://localhost:5173`
3. **View Tools**: Navigate to "Tools" tab
4. **Test Tool**: 
   - Select tool (e.g., `get_meps`)
   - Enter parameters: `{"country": "SE", "limit": 5}`
   - Click "Execute"
   - View response

### Example Tool Tests

#### Test 1: Get MEPs from Sweden

```json
{
  "country": "SE",
  "limit": 5
}
```

#### Test 2: Search Documents

```json
{
  "keyword": "climate",
  "documentType": "REPORT",
  "limit": 10
}
```

#### Test 3: Get Plenary Sessions

```json
{
  "year": 2024,
  "limit": 10
}
```

---

## 🖥️ Platform-Specific Testing

### Linux (Ubuntu 22.04+)

```bash
# Install Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Test installation
npx european-parliament-mcp-server --health

# Docker test
docker run -it node:24-bookworm bash
npm install -g european-parliament-mcp-server
european-parliament-mcp-server --health
```

---

### macOS (13+)

```bash
# Install Node.js 24 via Homebrew
brew install node@24

# Test installation
npx european-parliament-mcp-server --health

# Configure Claude Desktop
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
# Add configuration from above
```

---

### Windows (10+)

```powershell
# Install Node.js 24
# Download from: https://nodejs.org/

# Test installation (PowerShell)
npx european-parliament-mcp-server --health

# Configure Claude Desktop
notepad %APPDATA%\Claude\claude_desktop_config.json
# Add configuration from above
```

**Windows-Specific Notes:**
- Use PowerShell or Command Prompt
- Paths use backslashes: `C:\Users\...`
- npm global packages in: `%APPDATA%\npm`

---

## 🔧 Troubleshooting

### Issue 1: Command Not Found

**Symptoms:**
```bash
npx: command not found
```

**Solution:**
```bash
# Verify Node.js and npm installation
node --version
npm --version

# Reinstall Node.js if needed
# Download from: https://nodejs.org/
```

---

### Issue 2: Wrong Node Version

**Symptoms:**
```bash
Error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check current version
node --version

# Required: Node.js 24+
# Install Node.js 24 from: https://nodejs.org/

# Or use nvm (Node Version Manager)
nvm install 24
nvm use 24
```

---

### Issue 3: npx Hangs or Timeout

**Symptoms:**
- Command hangs indefinitely
- No output after running npx command

**Solution:**
```bash
# Clear npx cache
rm -rf ~/.npm/_npx

# Try with explicit registry
npx --registry=https://registry.npmjs.org european-parliament-mcp-server --health

# Or install globally instead
npm install -g european-parliament-mcp-server
european-parliament-mcp-server --health
```

---

### Issue 4: Claude Desktop Not Detecting Server

**Symptoms:**
- Server not listed in Claude Desktop
- Connection errors in Claude

**Solution:**

1. **Verify configuration path:**
   ```bash
   # macOS
   ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Windows
   dir %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Validate JSON syntax:**
   - Use JSONLint or VS Code to check for syntax errors
   - Ensure no trailing commas
   - Ensure proper quotes (double quotes only)

3. **Test server independently:**
   ```bash
   npx european-parliament-mcp-server --health
   ```

4. **Restart Claude Desktop completely:**
   - Quit Claude Desktop (not just close window)
   - Start Claude Desktop again
   - Open new conversation

5. **Check logs:**
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

---

### Issue 5: MCP Protocol Errors

**Symptoms:**
```
Error: Failed to initialize MCP protocol
```

**Solution:**
```bash
# Test MCP protocol directly
npm run test-mcp

# If local development, rebuild
npm run build

# Check for conflicting global installations
npm list -g european-parliament-mcp-server

# Reinstall
npm uninstall -g european-parliament-mcp-server
npm install -g european-parliament-mcp-server
```

---

### Issue 6: Rate Limit Errors

**Symptoms:**
```
Error: Rate limit exceeded
```

**Solution:**
```bash
# Increase rate limit in configuration
# Edit claude_desktop_config.json:
{
  "mcpServers": {
    "european-parliament": {
      "command": "npx",
      "args": ["european-parliament-mcp-server"],
      "env": {
        "EP_RATE_LIMIT": "120"  # Increase from default 60
      }
    }
  }
}
```

---

### Issue 7: API Connection Errors

**Symptoms:**
```
Error: Failed to connect to European Parliament API
```

**Solution:**

1. **Check internet connection:**
   ```bash
   curl -I https://data.europarl.europa.eu/api/v2/
   ```

2. **Verify API is accessible:**
   ```bash
   curl https://data.europarl.europa.eu/api/v2/
   ```

3. **Check proxy settings:**
   ```bash
   # If behind corporate proxy
   export HTTP_PROXY=http://proxy:port
   export HTTPS_PROXY=http://proxy:port
   ```

---

## 🔒 ISMS Compliance

This MCP server follows [Hack23 AB's Information Security Management System](https://github.com/Hack23/ISMS-PUBLIC).

### Security Standards

| Standard | Compliance Level | Evidence |
|----------|-----------------|----------|
| **ISO 27001** | A.14.2 (System Testing) | Comprehensive test suite |
| **NIST CSF 2.0** | PR.DS-6 (Integrity Checking) | Package verification scripts |
| **CIS Controls v8.1** | 4.1 (Secure Configuration) | Configuration examples and validation |
| **SLSA Level 3** | Build Provenance | npm provenance enabled |

### Security Testing Checklist

- [x] CLI commands sanitize input
- [x] Health check reveals no sensitive data
- [x] Package verification validates integrity
- [x] SBOM included in npm package
- [x] Provenance attestation generated
- [x] Dependencies scanned for vulnerabilities
- [x] Rate limiting enforced
- [x] Audit logging implemented

### Vulnerability Disclosure

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email: security@hack23.com
3. Include: Steps to reproduce, impact assessment
4. See: [SECURITY.md](./SECURITY.md) for full policy

---

## 📚 Additional Resources

### Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development setup
- [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md) - API documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Extended troubleshooting

### External Links

- [European Parliament Open Data Portal](https://data.europarl.europa.eu/)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Claude Desktop Configuration](https://www.anthropic.com/claude/desktop)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)

### Support

- **Issues**: [GitHub Issues](https://github.com/Hack23/European-Parliament-MCP-Server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Hack23/European-Parliament-MCP-Server/discussions)
- **Email**: support@hack23.com

---

<p align="center">
  <strong>🎉 Happy Testing!</strong><br>
  <em>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></em>
</p>

<p align="center">
  <a href="https://github.com/Hack23/ISMS-PUBLIC">
    <img src="https://img.shields.io/badge/ISMS-ISO%2027001%20Compliant-brightgreen?style=flat-square" alt="ISMS Compliant">
  </a>
  <a href="https://slsa.dev">
    <img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA 3">
  </a>
</p>
