---
name: isms-compliance
description: ISMS policy alignment and compliance verification for Hack23 AB security standards (ISO 27001, NIST CSF 2.0, CIS Controls v8.1)
license: MIT
---

# ISMS Compliance Skill

## Context
This skill applies when:
- Adding new features, dependencies, or security controls
- Documenting security practices or policies
- Conducting security reviews or audits
- Implementing authentication, authorization, or cryptography
- Handling sensitive data or user information
- Creating security documentation or policy references

All security practices in this repository align with [Hack23 AB's Information Security Management System (ISMS)](https://github.com/Hack23/ISMS-PUBLIC) implementing ISO 27001:2022, NIST CSF 2.0, and CIS Controls v8.1.

## Rules

1. **Reference ISMS Policies**: Every security-related code change must reference applicable ISMS policies in comments or documentation
2. **Follow Defense in Depth**: Implement multiple layers of security controls (input validation + rate limiting + audit logging + access control)
3. **Document Security Decisions**: All security architecture decisions must be documented with ISMS policy references
4. **Verify Dependencies**: All new dependencies must be checked for known vulnerabilities before addition
5. **Maintain Security Headers**: Always configure security headers for HTTP responses (when applicable)
6. **Implement Secure Defaults**: All configurations must be secure by default (disable unused features, minimize attack surface)
7. **Apply Least Privilege**: Grant minimal permissions required for functionality
8. **Validate All Inputs**: Never trust user input - validate, sanitize, and encode on both client and server
9. **Encrypt Sensitive Data**: Use strong encryption (AES-256) for data at rest and TLS 1.3+ for data in transit
10. **Log Security Events**: Log authentication attempts, authorization failures, and security-relevant events
11. **Follow Secure SDLC**: Integrate security at every phase (design, development, testing, deployment)
12. **Conduct Code Reviews**: All security-related code requires peer review before merge
13. **Test Security Controls**: Write tests for authentication, authorization, input validation, and encryption
14. **Document Threat Model**: Identify and document threats, vulnerabilities, and mitigations
15. **Maintain Audit Trail**: Keep immutable logs of security events for compliance and forensics

## Examples

### ✅ Good Pattern: ISMS Policy Reference in Code

```typescript
/**
 * MCP tool input validation service
 * 
 * ISMS Policy: SC-002 (Secure Coding Standards)
 * - Implements input validation for all MCP tool parameters
 * - Sanitizes user-provided search queries and filters
 * - Prevents injection attacks and data exfiltration
 * 
 * Compliance: ISO 27001:2022 A.8.3, NIST CSF PR.DS-5, CIS Control 4.1
 */
export class InputValidationService {
  private readonly MAX_QUERY_LENGTH = 200;
  private readonly ALLOWED_CHARS = /^[a-zA-Z0-9\s\-_.]+$/;
  
  /**
   * Validates and sanitizes search query parameters
   * Throws ValidationError if input is malformed or malicious
   */
  validateSearchQuery(query: string): string {
    if (typeof query !== 'string') {
      throw new ValidationError('Query must be a string');
    }
    
    if (query.length > this.MAX_QUERY_LENGTH) {
      throw new ValidationError(`Query exceeds maximum length of ${this.MAX_QUERY_LENGTH}`);
    }
    
    if (!this.ALLOWED_CHARS.test(query)) {
      throw new ValidationError('Query contains invalid characters');
    }
    
    return query.trim();
  }
}
```

### ✅ Good Pattern: Security Documentation

```markdown
## Security Architecture

### Authentication & Authorization
- **Policy**: [AC-001 Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/AC-001.md)
- **Implementation**: API key authentication with rate limiting
- **Compliance**: ISO 27001:2022 A.5.15, NIST CSF PR.AC-1

### Data Protection
- **Policy**: [DP-001 Data Protection Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/DP-001.md)
- **Encryption**: TLS 1.3 for all API communications
- **Compliance**: ISO 27001:2022 A.8.24, NIST CSF PR.DS-1

### Input Validation
- **Policy**: [SC-002 Secure Coding Standards](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/SC-002.md)
- **Implementation**: Whitelist validation for all user inputs
- **Compliance**: OWASP API Security Top 10 (API1:2023)
```

### ✅ Good Pattern: Input Validation with ISMS Reference

```typescript
/**
 * Validate and sanitize European Parliament document ID
 * ISMS Policy: SC-002 (Secure Coding Standards)
 * Compliance: OWASP Top 10 (A03:2021 - Injection)
 */
export function validateDocumentId(id: string): string {
  if (typeof id !== 'string') {
    throw new ValidationError('Document ID must be a string');
  }
  
  // European Parliament document IDs follow format: EP-YYYYMMDD-NNNNN
  const documentIdPattern = /^EP-\d{8}-\d{5}$/;
  
  if (!documentIdPattern.test(id)) {
    throw new ValidationError('Invalid document ID format');
  }
  
  return id;
}
```

### ✅ Good Pattern: Dependency Security Check

```json
{
  "scripts": {
    "preinstall": "npm audit --audit-level=moderate",
    "test:security": "npm audit && npm run test:licenses",
    "test:licenses": "license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause;ISC'",
    "prepare": "npm run build && npm run test:security"
  }
}
```

### ✅ Good Pattern: Rate Limiting for MCP Tools

```typescript
/**
 * Rate limiting middleware for MCP tool requests
 * ISMS Policy: AC-002 (Access Control Policy - Rate Limiting)
 * Prevents abuse and DoS attacks
 * Compliance: NIST CSF PR.AC-4, CIS Control 13.3
 */
export class RateLimiter {
  private readonly requests: Map<string, number[]> = new Map();
  private readonly MAX_REQUESTS = 100;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  
  async checkLimit(clientId: string): Promise<void> {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];
    
    // Remove requests outside the window
    const recentRequests = clientRequests.filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );
    
    if (recentRequests.length >= this.MAX_REQUESTS) {
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = Math.ceil((oldestRequest + this.WINDOW_MS - now) / 1000);
      
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      );
    }
    
    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
  }
}
```

### ❌ Bad Pattern: No ISMS Reference

```typescript
// Bad: No security policy reference or documentation
export class ApiService {
  async queryDocuments(query: string) {
    // Implementation without security context
    return fetch(`/api/search?q=${query}`); // Potential injection!
  }
}
```

### ❌ Bad Pattern: Weak Input Validation

```typescript
// Bad: Insufficient validation, no policy reference
function validateInput(input: string): boolean {
  return input.length > 0; // Too permissive!
}

// Bad: Directly using unvalidated input
async function search(query: string): Promise<Results> {
  // No validation or sanitization - XSS/injection vulnerability
  return await db.query(`SELECT * FROM docs WHERE title LIKE '%${query}%'`);
}
```

### ❌ Bad Pattern: Missing Security Logging

```typescript
// Bad: No audit logging of security events
async function handleToolRequest(request: ToolRequest): Promise<ToolResponse> {
  try {
    return await processRequest(request);
    // No logging of successful requests
  } catch (error) {
    return { error: error.message };
    // No logging of failed requests or security violations
  }
}
```

### ❌ Bad Pattern: No Rate Limiting

```typescript
// Bad: No rate limiting allows abuse
export async function searchDocuments(query: SearchQuery): Promise<Results> {
  // Anyone can make unlimited requests
  return await europeanParliamentApi.search(query);
}
```

## References

### ISMS Policies
- [Hack23 AB ISMS Public Repository](https://github.com/Hack23/ISMS-PUBLIC)
- [ISO 27001:2022 Controls](https://www.iso.org/isoiec-27001-information-security.html)
- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
- [CIS Controls v8.1](https://www.cisecurity.org/controls/v8)

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [SANS Top 25](https://www.sans.org/top25-software-errors/)

### Tools
- `npm audit` - Dependency vulnerability scanning
- `license-checker` - License compliance verification
- Dependabot - Automated dependency updates
- Snyk - Continuous security monitoring

## Remember

- **Security is not optional**: Every feature must consider security implications and align with ISMS policies
- **Document everything**: Security decisions, threat models, and policy references must be documented
- **Defense in depth**: Implement multiple overlapping security controls
- **Fail securely**: Systems must fail to a secure state, not an insecure one
- **Assume breach**: Design systems assuming attackers will get in - limit blast radius
- **Compliance is continuous**: Security compliance is not a one-time activity but an ongoing process
- **Test security controls**: Security features must be tested as rigorously as functional features
- **Keep dependencies updated**: Regularly update dependencies to patch known vulnerabilities
- **Encrypt sensitive data**: Never store or transmit sensitive data in plaintext
- **Principle of least privilege**: Grant only the minimum permissions required
- **Validate all inputs**: Never trust user input - validate and sanitize everything
- **Audit everything**: Log security-relevant events for compliance and incident response
- **European Parliament context**: Respect data protection regulations and European Parliament data policies
