---
name: mcp-gateway-security
description: MCP gateway security patterns, token management, request validation, and audit logging for parliamentary data access
license: MIT
---

# MCP Gateway Security Skill

## Context

This skill applies when:
- Securing MCP gateway communications between clients and the EP MCP Server
- Implementing token-based authentication for MCP client connections
- Validating and sanitizing MCP requests at the gateway boundary
- Configuring audit logging for all parliamentary data access through the gateway
- Implementing defense-in-depth for multi-server MCP deployments
- Managing secrets and credentials for EP API backend authentication
- Protecting against common MCP protocol attack vectors

MCP gateways are a critical security boundary. All parliamentary data requests flow through the gateway, making it the primary enforcement point for authentication, authorization, input validation, and audit logging.

## Rules

1. **Authenticate All MCP Clients**: Require token-based authentication (API key, OAuth2, or mTLS) for every client connection to the gateway
2. **Validate Request Schemas**: Validate all incoming MCP requests against the protocol schema before forwarding to backends
3. **Sanitize Tool Arguments**: Apply input validation and sanitization to all tool arguments at the gateway level, before they reach the EP MCP Server
4. **Implement Audit Logging**: Log every tool invocation with client identity, tool name, timestamp, and response status — never log argument values containing personal data
5. **Rotate Tokens Regularly**: API keys and service tokens must have configurable expiration; implement automated rotation
6. **Enforce Transport Security**: All MCP gateway connections must use TLS 1.3; reject plaintext connections
7. **Rate Limit per Client Identity**: Enforce rate limits based on authenticated client identity, not just IP address
8. **Isolate Backend Credentials**: Gateway-to-backend credentials must be stored in a secrets manager, never in configuration files
9. **Detect and Block Anomalies**: Monitor for unusual request patterns (high volume, unusual tools, off-hours access) and alert or block
10. **Implement Request Signing**: For high-security deployments, require request signing to ensure message integrity between client and gateway

## Examples

### ✅ Good Pattern: Token Validation Middleware

```typescript
import { z } from 'zod';

const AuthHeaderSchema = z.string().regex(/^Bearer [A-Za-z0-9\-._~+/]+=*$/, 'Invalid bearer token format');

async function validateMCPClient(authHeader: string | undefined) {
  if (!authHeader) throw new Error('Authentication required');
  const bearerToken = AuthHeaderSchema.parse(authHeader).replace('Bearer ', '');
  const client = await tokenStore.validate(bearerToken);
  if (!client) throw new Error('Invalid or expired token');
  return client; // { clientId, tier, allowedTools }
}
```

### ✅ Good Pattern: MCP Request Validation

```typescript
const MCPRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  method: z.enum(['tools/call', 'tools/list', 'resources/read', 'resources/list']),
  params: z.record(z.unknown()).optional(),
}).strict();

function validateMCPRequest(request: unknown): void {
  const result = MCPRequestSchema.safeParse(request);
  if (!result.success) throw new Error(`Invalid MCP request: ${result.error.message}`);
}
```

### ✅ Good Pattern: Security Audit Logging

```typescript
interface AuditLogEntry {
  timestamp: string;
  clientId: string;
  toolName: string;
  responseStatus: 'success' | 'error' | 'denied';
  durationMs: number;
  // Never log: argument values, personal data, token values
}

function logToolInvocation(entry: AuditLogEntry): void {
  console.log(JSON.stringify({ level: 'audit', ...entry, timestamp: new Date().toISOString() }));
}
```

### ✅ Good Pattern: Secrets Validation at Startup

```typescript
function validateSecrets(): void {
  const required = ['EP_API_KEY', 'GATEWAY_TOKEN_SECRET', 'AUDIT_LOG_ENDPOINT'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required secrets: ${missing.join(', ')}`);
  }
}
```

## Anti-Patterns

### ❌ Bad: No Authentication on Gateway
```typescript
// NEVER allow unauthenticated MCP access
server.onRequest(async (request) => {
  return await forwardToBackend(request); // No auth check!
});
```

### ❌ Bad: Logging Sensitive Data
```typescript
// NEVER log token values or personal data
console.log(`Client token: ${token}, query: ${JSON.stringify(args)}`);
// Leaks credentials and potentially personal MEP queries
```

### ❌ Bad: Hardcoded Secrets
```typescript
// NEVER embed credentials in source code
const EP_API_KEY = "ep-key-a1b2c3d4e5f6";
const TOKEN_SECRET = "super-secret-signing-key";
```

## ISMS Compliance

- **AC-001**: Authentication required for all MCP client connections
- **AC-003**: Authorization enforcement based on client tier and tool access policies
- **AU-002**: Comprehensive audit logging for all parliamentary data access
- **SC-001**: Transport security (TLS 1.3) for all gateway communications
- **SM-001**: Secrets management for backend credentials and signing keys
- **IR-001**: Anomaly detection and incident response triggers for suspicious access patterns

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
