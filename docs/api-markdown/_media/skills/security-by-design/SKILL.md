---
name: security-by-design
description: API security, MCP tool security, input validation, rate limiting, audit logging, secure authentication, and defense-in-depth principles
license: MIT
---

# Security By Design Skill

## Context
This skill applies when:
- Implementing MCP protocol tools and handlers
- Exposing European Parliament data through APIs
- Handling user inputs or external data sources
- Implementing authentication or authorization mechanisms
- Processing sensitive or classified information
- Designing rate limiting or abuse prevention
- Implementing audit logging and monitoring
- Writing security-critical validation logic
- Handling errors and exceptions securely
- Configuring network security or TLS

Security is foundational, not optional. Every feature must be designed with security in mind from the start, following the principle of "secure by default" and implementing defense-in-depth strategies aligned with Hack23 AB's ISMS policies.

## Rules

1. **Never Trust Input**: Validate and sanitize all user inputs - treat everything as potentially malicious
2. **Fail Securely**: Systems must fail to a secure state, never expose sensitive information in errors
3. **Principle of Least Privilege**: Grant minimal permissions required for functionality, nothing more
4. **Defense in Depth**: Implement multiple overlapping security controls (validation + rate limiting + audit logging)
5. **Encrypt Everything**: Use TLS 1.3+ for transit, AES-256 for at rest, never store secrets in plaintext
6. **Audit All Actions**: Log authentication attempts, authorization failures, input validation errors
7. **Rate Limit Aggressively**: Protect against abuse, DoS attacks, and resource exhaustion
8. **Validate Schema**: Use strict schema validation for all MCP tool inputs and outputs
9. **Sanitize Output**: Encode data appropriately to prevent injection attacks (XSS, command injection)
10. **Secure Defaults**: All features must be secure by default, require opt-in for permissive settings
11. **No Secrets in Code**: Never commit API keys, tokens, or credentials to source control
12. **Regular Updates**: Keep dependencies updated, scan for vulnerabilities continuously
13. **Assume Breach**: Design systems assuming attackers will get in - limit blast radius
14. **Document Security**: Reference ISMS policies, document threat models and security controls
15. **Test Security**: Write tests for authentication, authorization, input validation, and error handling

## Examples

### ✅ Good Pattern: Comprehensive Input Validation

```typescript
/**
 * Input validation service for MCP tool parameters
 * 
 * Security controls:
 * - Whitelist validation (only allow known-good patterns)
 * - Length limits to prevent buffer overflow or DoS
 * - Type checking to prevent type confusion
 * - Character set restrictions to prevent injection
 * - Sanitization to remove dangerous content
 * 
 * ISMS Policy: SC-002 (Secure Coding Standards)
 * Compliance: OWASP Top 10 (A03:2021 - Injection), ISO 27001:2022 A.8.3
 * 
 * @security Defense: SQL injection, XSS, command injection, path traversal
 */
export class InputValidationService {
  private readonly MAX_KEYWORD_LENGTH = 200;
  private readonly MAX_DOCUMENT_ID_LENGTH = 50;
  private readonly MAX_ARRAY_SIZE = 100;
  
  // Whitelist: Only alphanumeric, spaces, hyphens, underscores
  private readonly SAFE_KEYWORD_PATTERN = /^[a-zA-Z0-9\s\-_]+$/;
  
  // European Parliament document ID format: EP-YYYYMMDD-NNNNN
  private readonly DOCUMENT_ID_PATTERN = /^EP-\d{8}-\d{5}$/;
  
  // ISO 8601 date format: YYYY-MM-DD
  private readonly DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  
  // Allowed document types (whitelist)
  private readonly ALLOWED_DOCUMENT_TYPES = new Set([
    'REPORT',
    'RESOLUTION',
    'DECISION',
    'DIRECTIVE',
    'REGULATION',
    'OPINION',
  ]);
  
  /**
   * Validate search query parameters
   * Throws ValidationError with safe error message (no input echoing)
   */
  validateSearchQuery(params: unknown): ValidatedSearchQuery {
    if (typeof params !== 'object' || params === null) {
      throw new ValidationError('Invalid parameters object');
    }
    
    const query = params as Record<string, unknown>;
    
    return {
      keywords: this.validateKeywords(query.keywords),
      documentType: this.validateDocumentType(query.documentType),
      dateFrom: this.validateDate(query.dateFrom, 'dateFrom'),
      dateTo: this.validateDate(query.dateTo, 'dateTo'),
      limit: this.validateLimit(query.limit),
    };
  }
  
  /**
   * Validate search keywords
   * Defense: SQL injection, XSS, command injection
   */
  private validateKeywords(value: unknown): string {
    if (typeof value !== 'string') {
      throw new ValidationError('Keywords must be a string');
    }
    
    const trimmed = value.trim();
    
    // Length check (DoS prevention)
    if (trimmed.length === 0) {
      throw new ValidationError('Keywords cannot be empty');
    }
    
    if (trimmed.length > this.MAX_KEYWORD_LENGTH) {
      throw new ValidationError(
        `Keywords exceed maximum length of ${this.MAX_KEYWORD_LENGTH} characters`
      );
    }
    
    // Whitelist validation (injection prevention)
    if (!this.SAFE_KEYWORD_PATTERN.test(trimmed)) {
      throw new ValidationError(
        'Keywords contain invalid characters. Only alphanumeric, spaces, hyphens, and underscores are allowed.'
      );
    }
    
    // Additional sanitization: Remove multiple spaces
    return trimmed.replace(/\s+/g, ' ');
  }
  
  /**
   * Validate document type
   * Defense: Enumeration attacks, injection
   */
  private validateDocumentType(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    
    if (typeof value !== 'string') {
      throw new ValidationError('Document type must be a string');
    }
    
    const normalized = value.trim().toUpperCase();
    
    // Whitelist validation
    if (!this.ALLOWED_DOCUMENT_TYPES.has(normalized)) {
      throw new ValidationError(
        `Invalid document type. Allowed types: ${Array.from(this.ALLOWED_DOCUMENT_TYPES).join(', ')}`
      );
    }
    
    return normalized;
  }
  
  /**
   * Validate date parameter
   * Defense: Format string injection, logic errors
   */
  private validateDate(value: unknown, field: string): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    
    if (typeof value !== 'string') {
      throw new ValidationError(`${field} must be a string`);
    }
    
    // Format validation
    if (!this.DATE_PATTERN.test(value)) {
      throw new ValidationError(
        `${field} must be in ISO 8601 format (YYYY-MM-DD)`
      );
    }
    
    // Semantic validation
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`${field} is not a valid date`);
    }
    
    // Range validation (European Parliament established 1952)
    const minDate = new Date('1952-01-01');
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 1); // Allow tomorrow for timezone issues
    
    if (date < minDate || date > maxDate) {
      throw new ValidationError(
        `${field} must be between 1952-01-01 and today`
      );
    }
    
    return value;
  }
  
  /**
   * Validate result limit
   * Defense: DoS, resource exhaustion
   */
  private validateLimit(value: unknown): number {
    if (value === undefined || value === null) {
      return 20; // Safe default
    }
    
    const num = Number(value);
    
    // Type check
    if (!Number.isFinite(num)) {
      throw new ValidationError('Limit must be a valid number');
    }
    
    // Integer check
    if (!Number.isInteger(num)) {
      throw new ValidationError('Limit must be an integer');
    }
    
    // Range check (DoS prevention)
    if (num < 1 || num > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }
    
    return num;
  }
  
  /**
   * Validate document ID
   * Defense: Path traversal, injection, enumeration
   */
  validateDocumentId(value: unknown): string {
    if (typeof value !== 'string') {
      throw new ValidationError('Document ID must be a string');
    }
    
    const trimmed = value.trim();
    
    // Length check
    if (trimmed.length > this.MAX_DOCUMENT_ID_LENGTH) {
      throw new ValidationError('Document ID exceeds maximum length');
    }
    
    // Format validation (strict whitelist)
    if (!this.DOCUMENT_ID_PATTERN.test(trimmed)) {
      throw new ValidationError(
        'Invalid document ID format. Expected: EP-YYYYMMDD-NNNNN'
      );
    }
    
    return trimmed;
  }
  
  /**
   * Validate array parameter
   * Defense: DoS via large arrays
   */
  validateArray<T>(
    value: unknown,
    validator: (item: unknown) => T,
    maxSize: number = this.MAX_ARRAY_SIZE
  ): T[] {
    if (!Array.isArray(value)) {
      throw new ValidationError('Value must be an array');
    }
    
    // Size check (DoS prevention)
    if (value.length === 0) {
      throw new ValidationError('Array cannot be empty');
    }
    
    if (value.length > maxSize) {
      throw new ValidationError(
        `Array size exceeds maximum of ${maxSize} items`
      );
    }
    
    // Validate each item
    return value.map((item, index) => {
      try {
        return validator(item);
      } catch (error) {
        throw new ValidationError(
          `Invalid item at index ${index}: ${(error as Error).message}`
        );
      }
    });
  }
}

/**
 * Custom error class that never exposes user input
 * Prevents information leakage through error messages
 */
export class ValidationError extends Error {
  constructor(message: string) {
    // Only include safe error message, never user input
    super(message);
    this.name = 'ValidationError';
  }
}
```

### ✅ Good Pattern: Rate Limiting with Multiple Strategies

```typescript
/**
 * Multi-layer rate limiting for MCP tool requests
 * 
 * Rate limiting strategies:
 * 1. Fixed window (simple, prevents burst)
 * 2. Sliding window (accurate, prevents boundary gaming)
 * 3. Token bucket (flexible, allows burst within limits)
 * 4. IP-based limiting (prevents distributed abuse)
 * 
 * ISMS Policy: AC-002 (Access Control - Rate Limiting)
 * Compliance: NIST CSF PR.AC-4, CIS Control 13.3, OWASP API Security (API4:2023)
 * 
 * @security Defense: DoS attacks, brute force, resource exhaustion
 */
export class RateLimiter {
  private readonly fixedWindow = new Map<string, FixedWindowState>();
  private readonly slidingWindow = new Map<string, number[]>();
  
  // Rate limit: 100 requests per 15 minutes
  private readonly MAX_REQUESTS = 100;
  private readonly WINDOW_MS = 15 * 60 * 1000;
  
  // Burst limit: 10 requests per 10 seconds
  private readonly BURST_MAX = 10;
  private readonly BURST_WINDOW_MS = 10 * 1000;
  
  /**
   * Check rate limit for client
   * Uses sliding window algorithm for accuracy
   */
  async checkLimit(clientId: string): Promise<void> {
    const now = Date.now();
    
    // Check burst limit first (faster)
    await this.checkBurstLimit(clientId, now);
    
    // Check sustained rate limit
    await this.checkSustainedLimit(clientId, now);
    
    // Record this request
    this.recordRequest(clientId, now);
  }
  
  /**
   * Check burst limit (short window)
   * Prevents rapid-fire abuse
   */
  private async checkBurstLimit(clientId: string, now: number): Promise<void> {
    const requests = this.slidingWindow.get(clientId) || [];
    
    const recentBurst = requests.filter(
      timestamp => now - timestamp < this.BURST_WINDOW_MS
    );
    
    if (recentBurst.length >= this.BURST_MAX) {
      const oldestRequest = Math.min(...recentBurst);
      const retryAfter = Math.ceil(
        (oldestRequest + this.BURST_WINDOW_MS - now) / 1000
      );
      
      // Log rate limit violation for monitoring
      await this.logRateLimitViolation(clientId, 'burst', recentBurst.length);
      
      throw new RateLimitError(
        'Burst rate limit exceeded. Slow down your requests.',
        retryAfter
      );
    }
  }
  
  /**
   * Check sustained rate limit (long window)
   * Prevents sustained abuse
   */
  private async checkSustainedLimit(clientId: string, now: number): Promise<void> {
    const requests = this.slidingWindow.get(clientId) || [];
    
    const recentRequests = requests.filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );
    
    if (recentRequests.length >= this.MAX_REQUESTS) {
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = Math.ceil(
        (oldestRequest + this.WINDOW_MS - now) / 1000
      );
      
      // Log rate limit violation
      await this.logRateLimitViolation(clientId, 'sustained', recentRequests.length);
      
      throw new RateLimitError(
        `Rate limit exceeded. Maximum ${this.MAX_REQUESTS} requests per 15 minutes. Try again in ${retryAfter} seconds.`,
        retryAfter
      );
    }
  }
  
  /**
   * Record request timestamp
   */
  private recordRequest(clientId: string, now: number): void {
    const requests = this.slidingWindow.get(clientId) || [];
    
    // Add current request
    requests.push(now);
    
    // Clean up old requests (memory management)
    const filtered = requests.filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );
    
    this.slidingWindow.set(clientId, filtered);
  }
  
  /**
   * Log rate limit violation for security monitoring
   * ISMS Policy: IM-001 (Incident Management)
   */
  private async logRateLimitViolation(
    clientId: string,
    type: 'burst' | 'sustained',
    requestCount: number
  ): Promise<void> {
    const event = {
      timestamp: new Date().toISOString(),
      eventType: 'RATE_LIMIT_VIOLATION',
      severity: 'WARNING',
      clientId: this.hashClientId(clientId), // Hash for privacy
      limitType: type,
      requestCount,
      limit: type === 'burst' ? this.BURST_MAX : this.MAX_REQUESTS,
      window: type === 'burst' ? this.BURST_WINDOW_MS : this.WINDOW_MS,
    };
    
    // Log to audit system
    await auditLogger.log(event);
    
    // Alert if sustained abuse detected
    if (requestCount > this.MAX_REQUESTS * 2) {
      await alerting.sendAlert({
        type: 'SEVERE_RATE_LIMIT_VIOLATION',
        clientId: this.hashClientId(clientId),
        details: event,
      });
    }
  }
  
  /**
   * Hash client ID for privacy in logs
   * Never log raw IP addresses or identifiers
   */
  private hashClientId(clientId: string): string {
    return crypto
      .createHash('sha256')
      .update(clientId)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Periodic cleanup of old data
   */
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [clientId, requests] of this.slidingWindow.entries()) {
        const active = requests.filter(
          timestamp => now - timestamp < this.WINDOW_MS
        );
        
        if (active.length === 0) {
          this.slidingWindow.delete(clientId);
        } else {
          this.slidingWindow.set(clientId, active);
        }
      }
    }, 60 * 1000); // Clean up every minute
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
```

### ✅ Good Pattern: Comprehensive Audit Logging

```typescript
/**
 * Security audit logging for MCP server operations
 * 
 * Logs all security-relevant events:
 * - Authentication attempts (success/failure)
 * - Authorization checks (granted/denied)
 * - Input validation failures
 * - Rate limit violations
 * - Configuration changes
 * - Error conditions
 * 
 * ISMS Policy: IM-001 (Incident Management), AU-001 (Audit Logging)
 * Compliance: ISO 27001:2022 A.8.15, NIST CSF DE.AE-3, CIS Control 8.2
 * 
 * @security Immutable audit trail for forensics and compliance
 */
export class AuditLogger {
  private readonly logStream: fs.WriteStream;
  
  constructor(logPath: string) {
    // Append-only log file for immutability
    this.logStream = fs.createWriteStream(logPath, {
      flags: 'a',
      encoding: 'utf8',
    });
    
    // Ensure logs are flushed on shutdown
    process.on('SIGTERM', () => this.close());
    process.on('SIGINT', () => this.close());
  }
  
  /**
   * Log security event
   * All events are JSON formatted with consistent schema
   */
  async log(event: AuditEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventId: crypto.randomUUID(),
      eventType: event.type,
      severity: event.severity,
      actor: this.sanitizeActor(event.actor),
      action: event.action,
      resource: event.resource,
      outcome: event.outcome,
      metadata: event.metadata,
      ipAddress: event.ipAddress ? this.hashIp(event.ipAddress) : undefined,
    };
    
    // Write as newline-delimited JSON
    return new Promise((resolve, reject) => {
      this.logStream.write(
        JSON.stringify(logEntry) + '\n',
        (error) => {
          if (error) {
            // Critical: Audit logging failure
            console.error('CRITICAL: Audit log write failed:', error);
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }
  
  /**
   * Log authentication attempt
   */
  async logAuthentication(
    actor: string,
    success: boolean,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      type: 'AUTHENTICATION',
      severity: success ? 'INFO' : 'WARNING',
      actor,
      action: 'authenticate',
      resource: 'mcp-server',
      outcome: success ? 'SUCCESS' : 'FAILURE',
      metadata,
    });
  }
  
  /**
   * Log authorization check
   */
  async logAuthorization(
    actor: string,
    action: string,
    resource: string,
    granted: boolean
  ): Promise<void> {
    await this.log({
      type: 'AUTHORIZATION',
      severity: granted ? 'INFO' : 'WARNING',
      actor,
      action,
      resource,
      outcome: granted ? 'GRANTED' : 'DENIED',
    });
  }
  
  /**
   * Log input validation failure
   */
  async logValidationFailure(
    actor: string,
    tool: string,
    errorType: string
  ): Promise<void> {
    await this.log({
      type: 'INPUT_VALIDATION',
      severity: 'WARNING',
      actor,
      action: 'validate_input',
      resource: tool,
      outcome: 'FAILURE',
      metadata: { errorType },
    });
  }
  
  /**
   * Log tool invocation
   */
  async logToolInvocation(
    actor: string,
    tool: string,
    success: boolean,
    duration?: number
  ): Promise<void> {
    await this.log({
      type: 'TOOL_INVOCATION',
      severity: 'INFO',
      actor,
      action: 'invoke_tool',
      resource: tool,
      outcome: success ? 'SUCCESS' : 'FAILURE',
      metadata: { duration },
    });
  }
  
  /**
   * Sanitize actor information
   * Remove PII, hash identifiers
   */
  private sanitizeActor(actor?: string): string {
    if (!actor) {
      return 'anonymous';
    }
    
    // Hash actor ID for privacy
    return crypto
      .createHash('sha256')
      .update(actor)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Hash IP address for privacy compliance
   * GDPR requires minimizing PII in logs
   */
  private hashIp(ip: string): string {
    return crypto
      .createHash('sha256')
      .update(ip)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Close log stream gracefully
   */
  close(): void {
    this.logStream.end();
  }
}

interface AuditEvent {
  type: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  actor?: string;
  action: string;
  resource: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'GRANTED' | 'DENIED';
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}
```

### ✅ Good Pattern: Secure Error Handling

```typescript
/**
 * Secure error handling for MCP tools
 * 
 * Security principles:
 * - Never expose internal implementation details
 * - Never echo user input in error messages
 * - Log detailed errors internally, return generic externally
 * - Fail securely (deny by default)
 * 
 * ISMS Policy: SC-002 (Secure Coding Standards)
 * Compliance: OWASP Top 10 (A05:2021 - Security Misconfiguration)
 */
export class SecureErrorHandler {
  constructor(
    private readonly auditLogger: AuditLogger
  ) {}
  
  /**
   * Handle error from MCP tool execution
   * Returns safe error message to client, logs details internally
   */
  async handleToolError(
    error: Error,
    context: ErrorContext
  ): Promise<ToolResponse> {
    // Log full error details for debugging (internal only)
    await this.auditLogger.log({
      type: 'TOOL_ERROR',
      severity: 'ERROR',
      actor: context.actor,
      action: context.action,
      resource: context.resource,
      outcome: 'FAILURE',
      metadata: {
        errorType: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
      },
    });
    
    // Return safe error message to client
    const safeMessage = this.getSafeErrorMessage(error);
    
    return {
      isError: true,
      content: [{
        type: 'text',
        text: safeMessage,
      }],
    };
  }
  
  /**
   * Generate safe error message for client
   * Never exposes internal details or user input
   */
  private getSafeErrorMessage(error: Error): string {
    // Known safe error types (validation errors)
    if (error instanceof ValidationError) {
      return error.message; // Already safe
    }
    
    if (error instanceof RateLimitError) {
      return error.message; // Already safe
    }
    
    if (error instanceof AuthorizationError) {
      return 'Access denied. Insufficient permissions.';
    }
    
    // Unknown errors: Generic message
    // NEVER expose error.message, error.stack, or any internal details
    return 'An error occurred while processing your request. Please try again later.';
  }
}

interface ErrorContext {
  actor: string;
  action: string;
  resource: string;
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}
```

### ❌ Bad Pattern: No Input Validation

```typescript
// Bad: Accepting user input without validation
export async function searchDocuments(query: any): Promise<Results> {
  // Direct use of unvalidated input - SQL injection vulnerability!
  const sql = `SELECT * FROM documents WHERE title LIKE '%${query.keywords}%'`;
  return await db.query(sql);
}

// Bad: Type assertion without validation
export async function getDocument(params: any): Promise<Document> {
  const id = params.documentId as string; // Unsafe cast!
  return await europeanParliamentApi.getDocument(id);
}

// Bad: No length limits - DoS vulnerability
export async function processText(text: string): Promise<string> {
  // What if text is 1GB? Server crashes!
  return text.toUpperCase();
}
```

### ❌ Bad Pattern: Exposing Sensitive Information

```typescript
// Bad: Exposing internal error details
export async function handleRequest(req: Request): Promise<Response> {
  try {
    return await processRequest(req);
  } catch (error) {
    // NEVER expose stack traces, error details, or internal paths!
    return {
      error: error.message,
      stack: error.stack, // Exposes code structure!
      file: error.fileName, // Exposes internal paths!
    };
  }
}

// Bad: Echoing user input in errors
export function validateInput(input: string): void {
  if (input.includes('<script>')) {
    // NEVER echo user input - XSS vulnerability!
    throw new Error(`Invalid input: ${input}`);
  }
}

// Bad: Logging sensitive data
export async function authenticate(username: string, password: string): Promise<boolean> {
  console.log(`Authenticating user: ${username} with password: ${password}`);
  // NEVER log credentials!
  return checkCredentials(username, password);
}
```

### ❌ Bad Pattern: No Rate Limiting

```typescript
// Bad: No rate limiting - DoS vulnerability
export async function searchDocuments(query: SearchQuery): Promise<Results> {
  // Anyone can make unlimited requests
  // European Parliament API will block us!
  // Server resources exhausted!
  return await europeanParliamentApi.search(query);
}

// Bad: No burst protection
export async function handleRequests(requests: Request[]): Promise<Response[]> {
  // Processing 10,000 requests simultaneously - server crash!
  return Promise.all(requests.map(r => processRequest(r)));
}
```

### ❌ Bad Pattern: Secrets in Code

```typescript
// Bad: Hardcoded API key
const API_KEY = 'sk-1234567890abcdef'; // NEVER commit secrets!

// Bad: Credentials in config file (committed to Git)
const config = {
  database: {
    host: 'db.example.com',
    username: 'admin',
    password: 'SuperSecret123', // Committed to Git history forever!
  },
};

// Bad: API key in URL
const url = `https://api.example.com/data?apikey=${API_KEY}`;
// Logged in access logs, browser history, proxy logs!
```

## References

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### ISMS Policies
- [Hack23 ISMS Public Repository](https://github.com/Hack23/ISMS-PUBLIC)
- [SC-002 Secure Coding Standards](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/SC-002.md)
- [AC-002 Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/AC-002.md)
- [IM-001 Incident Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/IM-001.md)

### Security Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency vulnerability scanning
- [Snyk](https://snyk.io/) - Continuous security monitoring
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)
- [Semgrep](https://semgrep.dev/) - Static analysis security testing

### Cryptography
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [libsodium](https://libsodium.gitbook.io/) - Modern cryptography library
- [TLS Best Practices](https://wiki.mozilla.org/Security/Server_Side_TLS)

## Remember

- **Never trust input**: Validate everything, sanitize always, encode appropriately
- **Fail securely**: Default deny, safe error messages, no information leakage
- **Defense in depth**: Multiple overlapping security controls
- **Least privilege**: Minimal permissions, need-to-know basis
- **Audit everything**: Log security events, monitor for anomalies
- **Rate limit aggressively**: Protect against abuse and DoS attacks
- **Encrypt always**: TLS 1.3+ for transit, AES-256 for at rest
- **Secure by default**: All features secure unless explicitly configured otherwise
- **No secrets in code**: Use environment variables, secret management systems
- **Update dependencies**: Patch vulnerabilities quickly, scan continuously
- **Assume breach**: Limit blast radius, segment networks, monitor for indicators
- **Document security**: Reference ISMS policies, explain threat mitigations
- **Test security controls**: Write tests for auth, authz, validation, encryption
- **European Parliament data**: Respect data protection regulations, handle sensitively
- **MCP protocol**: Validate tool schemas strictly, sanitize responses
