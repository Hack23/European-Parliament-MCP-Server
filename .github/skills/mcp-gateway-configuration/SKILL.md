---
name: mcp-gateway-configuration
description: Multi-server MCP gateway setup, tool routing, access control, and configuration for parliamentary data integration
license: MIT
---

# MCP Gateway Configuration Skill

## Context

This skill applies when:
- Configuring multi-server MCP gateway deployments with the EP MCP Server
- Routing MCP tool requests across multiple parliamentary data sources
- Setting up access control policies for different MCP client types
- Integrating the EP MCP Server alongside other MCP servers in a unified gateway
- Configuring tool namespacing to avoid conflicts between MCP servers
- Managing connection pooling and failover for EP API backend connections
- Deploying MCP gateway configurations for development, staging, and production environments

MCP gateways enable AI applications to access multiple MCP servers through a single connection point. The EP MCP Server must be configurable as a backend within larger MCP gateway architectures.

## Rules

1. **Namespace All Tools**: Prefix EP tools with `ep_` or `europarl_` to avoid naming collisions with other MCP servers in a gateway
2. **Define Explicit Tool Routes**: Map each MCP tool to its backend server explicitly; avoid wildcard routing that could expose unintended tools
3. **Configure Per-Client Access Control**: Assign tool access policies based on client identity; not all clients should access all EP data tools
4. **Use Environment-Based Configuration**: Store gateway configuration in environment variables or secure config files, never hardcoded
5. **Implement Health Checks**: Configure readiness and liveness probes for the EP MCP Server backend within the gateway
6. **Set Timeout Policies**: Define per-tool timeout values; EP API calls may have variable latency depending on dataset size
7. **Enable Request Correlation**: Propagate correlation IDs from gateway to EP MCP Server for end-to-end request tracing
8. **Configure Rate Limiting at Gateway Level**: Enforce rate limits at the gateway to protect the EP API from excessive downstream requests
9. **Support Graceful Degradation**: If the EP backend is unavailable, return informative error responses rather than gateway-level failures
10. **Version Tool Registrations**: Include version metadata in tool listings so clients can detect breaking changes

## Examples

### ✅ Good Pattern: MCP Gateway Configuration

```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "EP_API_BASE_URL": "https://data.europarl.europa.eu/api/v2",
        "EP_CACHE_TTL_SECONDS": "900",
        "EP_RATE_LIMIT_PER_MINUTE": "60",
        "NODE_ENV": "production"
      },
      "toolPrefix": "ep",
      "healthCheck": {
        "interval": 30,
        "timeout": 10,
        "path": "/health"
      }
    },
    "national-parliament": {
      "command": "node",
      "args": ["national-server/dist/index.js"],
      "toolPrefix": "nat"
    }
  }
}
```

### ✅ Good Pattern: Tool Routing with Access Levels

```yaml
# Gateway tool routing and access control
tool_routes:
  ep_search_meps:
    backend: european-parliament
    timeout: 15000
    rate_limit: 100/15min
    access: public

  ep_get_voting_records:
    backend: european-parliament
    timeout: 30000
    rate_limit: 50/15min
    access: authenticated

  ep_admin_cache_clear:
    backend: european-parliament
    timeout: 5000
    rate_limit: 5/hour
    access: admin
```

## Anti-Patterns

### ❌ Bad: Wildcard Tool Exposure
```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": ["dist/index.js"],
      "exposeAllTools": true
    }
  }
}
```

### ❌ Bad: Hardcoded Gateway Configuration
```typescript
// NEVER hardcode backend URLs or credentials
const EP_SERVER = "http://localhost:3001";
const API_KEY = "sk-hardcoded-key-12345";
```

### ❌ Bad: No Timeout Configuration
```typescript
// NEVER call backends without timeouts
const result = await epServer.callTool(request); // Could hang indefinitely
```

## ISMS Compliance

- **AC-003**: Per-client access control for MCP tool authorization
- **CM-002**: Configuration management for gateway deployment environments
- **AU-002**: Request correlation and audit trail across gateway and backends
- **BC-001**: Graceful degradation and failover for business continuity

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
