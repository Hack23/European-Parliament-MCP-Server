---
name: security-by-design
description: "Enforces defense-in-depth security for MCP tools and European Parliament APIs — input validation, rate limiting, audit logging, and secure error handling. Use when implementing API security, adding authentication, protecting MCP endpoints, or reviewing code for vulnerabilities."
license: MIT
---

# Security By Design Skill

## Context
This skill applies when:
- Implementing MCP protocol tools and handlers
- Exposing European Parliament data through APIs
- Handling user inputs or external data sources
- Implementing auth, OAuth, API keys, or secure endpoints
- Designing rate limiting or abuse prevention
- Implementing audit logging and monitoring
- Handling errors and exceptions securely

Security is foundational, not optional. Every feature must be designed with security in mind from the start, following "secure by default" principles and defense-in-depth strategies aligned with Hack23 AB's ISMS policies.

## Rules

1. **Never Trust Input**: Validate and sanitize all inputs with Zod schemas — treat everything as potentially malicious
2. **Fail Securely**: Systems must fail to a secure state; never expose sensitive information in errors
3. **Least Privilege**: Grant minimal permissions required for functionality, nothing more
4. **Defense in Depth**: Layer multiple security controls (validation + rate limiting + audit logging)
5. **Rate Limit Aggressively**: Protect against abuse, DoS attacks, and resource exhaustion with burst and sustained limits
6. **Validate Schema**: Use `.strict()` Zod schemas for all MCP tool inputs — reject unknown fields
7. **Sanitize Output**: Encode data appropriately to prevent injection attacks (XSS, command injection)
8. **No Secrets in Code**: Never commit API keys, tokens, or credentials — use environment variables

## Workflow

1. Validate all inputs with Zod schemas and whitelist patterns — reject unknown fields with `.strict()`
2. Check rate limits (burst: 10 req/10s, sustained: 100 req/15min) before processing
3. Authorize the request — apply least-privilege access checks
4. Execute the MCP tool handler
5. Sanitize output — encode data, strip internal details from errors
6. Audit log the operation (actor, action, resource, outcome, timestamp)

## Examples

### ✅ Good Pattern: Input Validation with Zod

```typescript
const SearchQuerySchema = z.object({
  keywords: z.string().min(1).max(200).regex(/^[a-zA-Z0-9\s\-_]+$/),
  documentType: z.enum(['REPORT', 'RESOLUTION', 'DECISION', 'DIRECTIVE', 'REGULATION', 'OPINION']).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.number().int().min(1).max(100).default(20),
}).strict();

function validateSearchQuery(params: unknown): ValidatedSearchQuery {
  return SearchQuerySchema.parse(params);
}
```

### ✅ Good Pattern: Rate Limiting

```typescript
class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly MAX_REQUESTS = 100;
  private readonly WINDOW_MS = 15 * 60 * 1000;

  async checkLimit(clientId: string): Promise<void> {
    const now = Date.now();
    const recent = (this.requests.get(clientId) ?? []).filter(t => now - t < this.WINDOW_MS);
    if (recent.length >= this.MAX_REQUESTS) {
      throw new RateLimitError('Rate limit exceeded', Math.ceil((recent[0]! + this.WINDOW_MS - now) / 1000));
    }
    recent.push(now);
    this.requests.set(clientId, recent);
  }
}
```

### ✅ Good Pattern: Audit Logging

```typescript
interface AuditEvent {
  type: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  actor: string;
  action: string;
  resource: string;
  outcome: 'SUCCESS' | 'FAILURE';
}

async function logSecurityEvent(event: AuditEvent): Promise<void> {
  const entry = { ...event, timestamp: new Date().toISOString(), eventId: crypto.randomUUID() };
  await auditLogger.write(JSON.stringify(entry) + '\n');
}
```

### ✅ Good Pattern: Secure Error Handling

```typescript
function getSafeErrorMessage(error: Error): string {
  if (error instanceof ValidationError) return error.message;
  if (error instanceof RateLimitError) return error.message;
  return 'An error occurred. Please try again later.';
}

async function handleToolError(error: Error, context: ErrorContext): Promise<ToolResponse> {
  await auditLogger.log({ type: 'TOOL_ERROR', severity: 'ERROR', ...context, outcome: 'FAILURE' });
  return { isError: true, content: [{ type: 'text', text: getSafeErrorMessage(error) }] };
}
```

### ❌ Anti-Patterns

- **Never use unvalidated input** in queries or operations — always parse through Zod first
- **Never expose stack traces**, internal paths, or error details to clients
- **Never echo user input** in error messages (XSS risk)
- **Never commit API keys**, tokens, or credentials — use environment variables
- **Never skip rate limiting** on public-facing endpoints

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [Hack23 ISMS Public Repository](https://github.com/Hack23/ISMS-PUBLIC)
- [SC-002 Secure Coding Standards](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/SC-002.md)
