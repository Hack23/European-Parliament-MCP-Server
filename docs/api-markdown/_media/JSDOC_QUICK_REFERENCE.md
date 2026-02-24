# JSDoc Quick Reference Guide

**European Parliament MCP Server**

Quick reference for writing consistent, comprehensive JSDoc comments.

---

## 📋 Table of Contents

- [Basic Structure](#basic-structure)
- [Common Tags](#common-tags)
- [Function Documentation](#function-documentation)
- [Interface/Type Documentation](#interface-type-documentation)
- [Class Documentation](#class-documentation)
- [Security-Sensitive Documentation](#security-sensitive-documentation)
- [Examples Best Practices](#examples-best-practices)
- [Common Patterns](#common-patterns)

---

## Basic Structure

```typescript
/**
 * One-line summary (imperative mood, no period)
 * 
 * Detailed description with multiple paragraphs if needed.
 * Explain what, why, and how. Include performance notes,
 * caching behavior, security considerations.
 * 
 * @param paramName - Parameter description
 * @returns Return value description
 * @throws {ErrorType} When this error occurs
 * @example
 * ```typescript
 * // Usage example
 * const result = myFunction('value');
 * ```
 */
```

---

## Common Tags

### Required Tags

| Tag | When to Use | Example |
|-----|-------------|---------|
| `@param` | All parameters | `@param id - Unique identifier` |
| `@returns` | All non-void returns | `@returns Array of MEP objects` |
| `@throws` | All thrown errors | `@throws {ValidationError} When ID invalid` |
| `@example` | All public APIs | See examples section |

### Optional but Recommended Tags

| Tag | When to Use | Example |
|-----|-------------|---------|
| `@security` | Security-sensitive code | `@security GDPR-compliant logging` |
| `@see` | Related documentation | `@see {@link MEP} for data structure` |
| `@deprecated` | Deprecated APIs | `@deprecated Use getMEPs() instead` |
| `@internal` | Private/internal APIs | `@internal Not for public use` |
| `@since` | Version added | `@since 1.2.0` |
| `@default` | Default values | `@default 50` |

---

## Function Documentation

### Minimal (Bad ❌)

```typescript
// Returns MEPs
async function getMEPs(params) {
  // ...
}
```

### Basic (Acceptable ⚠️)

```typescript
/**
 * Get Members of European Parliament
 * 
 * @param params - Query parameters
 * @returns Paginated MEP list
 */
async function getMEPs(params: GetMEPsParams): Promise<PaginatedResponse<MEP>>
```

### Complete (Excellent ✅)

```typescript
/**
 * Retrieves Members of the European Parliament with filtering options.
 * 
 * Fetches MEP data from the EP Open Data API with caching, rate limiting,
 * and GDPR-compliant audit logging. Results are cached for 15 minutes using
 * LRU eviction strategy. Target response time: <200ms (cached), <2s (uncached).
 * 
 * @param params - Query parameters for filtering MEPs
 * @param params.country - ISO 3166-1 alpha-2 country code (e.g., "SE")
 * @param params.group - Political group identifier (optional)
 * @param params.limit - Maximum results to return (1-100, default: 50)
 * @param params.offset - Pagination offset (default: 0)
 * @returns Paginated response with MEP data array and pagination metadata
 * 
 * @throws {ValidationError} When parameters fail validation (HTTP 400)
 * @throws {RateLimitError} When rate limit exceeded (HTTP 429)
 * @throws {EPAPIError} When EP API request fails
 * 
 * @example
 * ```typescript
 * // Get Swedish MEPs
 * const result = await getMEPs({ country: "SE", limit: 20 });
 * console.log(`Found ${result.total} Swedish MEPs`);
 * ```
 * 
 * @example
 * ```typescript
 * // Handle pagination
 * let offset = 0;
 * while (result.hasMore) {
 *   const result = await getMEPs({ limit: 50, offset });
 *   processBatch(result.data);
 *   offset += 50;
 * }
 * ```
 * 
 * @security Personal data access logged per GDPR Article 30
 * @see {@link MEP} for MEP data structure
 * @see {@link PaginatedResponse} for response format
 * @see https://data.europarl.europa.eu/api/v2/
 */
async function getMEPs(
  params: GetMEPsParams
): Promise<PaginatedResponse<MEP>> {
  // Implementation
}
```

---

## Interface/Type Documentation

### Minimal (Bad ❌)

```typescript
export interface MEP {
  id: string;
  name: string;
}
```

### Complete (Excellent ✅)

```typescript
/**
 * Member of the European Parliament.
 * 
 * Contains biographical information, political affiliation, and committee
 * memberships. All dates in ISO 8601 format. Personal data fields (email,
 * phone) are GDPR-protected and require audit logging for access.
 * 
 * **Data Source:** European Parliament Open Data Portal v2
 * 
 * **Identifiers:** MEP IDs are stable across parliamentary terms
 * 
 * @example
 * ```typescript
 * const mep: MEP = {
 *   id: "person/124936",
 *   name: "Jane Doe",
 *   country: "SE",
 *   politicalGroup: "EPP",
 *   committees: ["DEVE", "ENVI"],
 *   active: true,
 *   termStart: "2019-07-02"
 * };
 * ```
 * 
 * @see {@link MEPDetails} for extended information
 * @see https://data.europarl.europa.eu/
 */
export interface MEP {
  /** 
   * Unique identifier (format: "person/{id}")
   * Stable across parliamentary terms
   */
  id: string;
  
  /** 
   * Full name in official format
   * @example "Jane Marie Doe"
   */
  name: string;
  
  /** 
   * Country code (ISO 3166-1 alpha-2)
   * @example "SE", "DE", "FR"
   */
  country: string;
  
  /** 
   * Political group abbreviation
   * @example "EPP", "S&D", "Renew"
   */
  politicalGroup: string;
  
  /** 
   * Committee abbreviations
   * @example ["DEVE", "ENVI"]
   */
  committees: string[];
  
  /** 
   * Official email (GDPR-protected personal data)
   */
  email?: string;
  
  /** Current active status */
  active: boolean;
  
  /** 
   * Term start date (ISO 8601)
   * @example "2019-07-02"
   */
  termStart: string;
}
```

---

## Class Documentation

### Complete Class Example

```typescript
/**
 * European Parliament API Client
 * 
 * Provides type-safe access to European Parliament Open Data Portal with:
 * - LRU caching for performance (<200ms target)
 * - Token bucket rate limiting (100 req/min)
 * - GDPR-compliant audit logging
 * - Automatic retry with exponential backoff
 * 
 * **Configuration:**
 * - Base URL: https://data.europarl.europa.eu/api/v2/
 * - Cache: 15 min TTL, 500 entry max
 * - Rate Limit: 100 requests per minute
 * 
 * @example
 * ```typescript
 * const client = new EuropeanParliamentClient({
 *   cacheTTL: 1000 * 60 * 15, // 15 minutes
 *   maxCacheSize: 500
 * });
 * 
 * const meps = await client.getMEPs({ country: "SE" });
 * ```
 * 
 * @see https://data.europarl.europa.eu/api/v2/
 * @see https://github.com/Hack23/ISMS-PUBLIC - ISMS policies
 */
export class EuropeanParliamentClient {
  /**
   * Creates a new EP API client
   * 
   * @param config - Client configuration options
   * @param config.baseURL - API base URL (default: EP API v2)
   * @param config.cacheTTL - Cache time-to-live in ms (default: 15 min)
   * @param config.maxCacheSize - Max cache entries (default: 500)
   * @param config.rateLimiter - Custom rate limiter (optional)
   * 
   * @example
   * ```typescript
   * const client = new EuropeanParliamentClient({
   *   cacheTTL: 1000 * 60 * 30, // 30 minutes
   *   maxCacheSize: 1000
   * });
   * ```
   */
  constructor(config?: EPClientConfig) {
    // ...
  }
  
  /**
   * Fetches MEPs with filtering and pagination
   * 
   * @param params - Query parameters
   * @returns Paginated MEP list
   * @throws {ValidationError} Invalid parameters
   * @throws {RateLimitError} Rate limit exceeded
   * @throws {EPAPIError} API request failed
   * 
   * @example
   * ```typescript
   * const result = await client.getMEPs({
   *   country: "SE",
   *   limit: 50
   * });
   * ```
   */
  async getMEPs(params: GetMEPsParams): Promise<PaginatedResponse<MEP>> {
    // ...
  }
}
```

---

## Security-Sensitive Documentation

### Pattern for GDPR/Security Code

```typescript
/**
 * Logs personal data access for GDPR Article 30 compliance.
 * 
 * Creates append-only audit trail for all access to MEP personal data
 * (email, phone, address). Logs stored with 7-year retention per GDPR.
 * 
 * **Compliance:**
 * - GDPR Article 30 (Records of Processing Activities)
 * - ISMS Policy AU-002 (Audit Logging and Monitoring)
 * - ISO 27001:2022 A.8.15 (Logging)
 * 
 * **Log Storage:**
 * - Production: AWS CloudWatch Logs (encrypted, 7-year retention)
 * - Development: stderr (ephemeral, not persisted)
 * 
 * **Log Format:** JSON with timestamp, action, params, result
 * 
 * @param action - Action identifier (e.g., "get_mep_details")
 * @param params - Action parameters (sanitized, no PII)
 * @param count - Number of records accessed
 * 
 * @example
 * ```typescript
 * auditLogger.logDataAccess('get_mep_details', 
 *   { id: 'person/124936' }, 
 *   1
 * );
 * ```
 * 
 * @security
 * - Logs contain NO personal data (metadata only)
 * - Append-only (cannot be modified after creation)
 * - Access requires elevated privileges
 * - Encrypted at rest and in transit
 * - 7-year retention for regulatory compliance
 * - Automated monitoring for suspicious access patterns
 * 
 * @see https://gdpr-info.eu/art-30-gdpr/
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md
 */
function logDataAccess(
  action: string,
  params: Record<string, unknown>,
  count: number
): void {
  // ...
}
```

---

## Examples Best Practices

### ✅ Good Examples

```typescript
/**
 * @example
 * ```typescript
 * // Basic usage with country filter
 * const meps = await getMEPs({ country: "SE" });
 * console.log(`Found ${meps.total} Swedish MEPs`);
 * ```
 * 
 * @example
 * ```typescript
 * // Pagination with error handling
 * try {
 *   const result = await getMEPs({
 *     country: "SE",
 *     limit: 50,
 *     offset: 0
 *   });
 *   
 *   for (const mep of result.data) {
 *     console.log(`${mep.name} - ${mep.politicalGroup}`);
 *   }
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     console.log(`Rate limited. Retry after ${error.retryAfter}s`);
 *   }
 * }
 * ```
 */
```

### ❌ Bad Examples

```typescript
/**
 * @example
 * getMEPs(params) // Too minimal
 */

/**
 * @example
 * const x = getMEPs({a: "b"}) // Unclear variable names
 */

/**
 * @example
 * ```
 * // Missing language identifier
 * const result = getMEPs();
 * ```
 */
```

### Example Guidelines

1. **Use realistic data** - Not `foo`, `bar`, `test`
2. **Include comments** - Explain what the example does
3. **Show common patterns** - Error handling, pagination, filtering
4. **Specify language** - Always use ` ```typescript `
5. **Keep it simple** - Focus on one concept per example
6. **Show outputs** - Use `console.log` to show results
7. **Handle errors** - Demonstrate proper error handling

---

## Common Patterns

### Async Functions

```typescript
/**
 * Async operation description
 * 
 * @param param - Parameter description
 * @returns Promise resolving to result type
 * @throws {ErrorType} When error occurs
 * 
 * @example
 * ```typescript
 * const result = await asyncFunction(param);
 * ```
 */
async function asyncFunction(param: string): Promise<Result> {
  // ...
}
```

### Optional Parameters

```typescript
/**
 * Function with optional parameters
 * 
 * @param required - Required parameter
 * @param optional - Optional parameter (default: "default")
 * @returns Result
 * 
 * @example
 * ```typescript
 * // With optional parameter
 * myFunction("required", "custom");
 * 
 * // Without optional parameter (uses default)
 * myFunction("required");
 * ```
 */
function myFunction(required: string, optional = "default"): Result {
  // ...
}
```

### Union Types

```typescript
/**
 * Handles multiple input types
 * 
 * @param input - String or number input
 * @returns Formatted result
 * 
 * @example
 * ```typescript
 * handleInput("text");  // String input
 * handleInput(42);      // Number input
 * ```
 */
function handleInput(input: string | number): string {
  // ...
}
```

### Branded Types

```typescript
/**
 * MEP ID - unique identifier for Members of European Parliament.
 * 
 * Branded type prevents accidental mixing with other ID types at compile time.
 * Format: Numeric string (e.g., "124936") or "person/{id}"
 * 
 * @example
 * ```typescript
 * const id: MEPID = createMEPID("124936");
 * const mep = await getMEPDetails(id);
 * 
 * // Compile error - cannot use SessionID as MEPID:
 * // const wrongId: SessionID = createSessionID("P9-2024-11-20");
 * // getMEPDetails(wrongId); // Error!
 * ```
 * 
 * @see {@link createMEPID} for factory function
 * @see {@link isMEPID} for type guard
 */
export type MEPID = Brand<string, 'MEPID'>;
```

### Error Classes

```typescript
/**
 * Validation error thrown when input fails validation.
 * 
 * Always returns HTTP 400 status code. Includes details about what
 * failed validation for debugging (safe for client exposure).
 * 
 * @param message - Human-readable error message
 * @param details - Optional validation details
 * 
 * @example
 * ```typescript
 * if (!isValidCountryCode(country)) {
 *   throw new ValidationError(
 *     'Invalid country code',
 *     { 
 *       received: country,
 *       expected: 'ISO 3166-1 alpha-2 (e.g., "SE")'
 *     }
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Catching validation errors
 * try {
 *   await getMEPs({ country: "INVALID" });
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('Validation failed:', error.message);
 *     console.error('Details:', error.details);
 *   }
 * }
 * ```
 */
export class ValidationError extends MCPServerError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}
```

---

## Checklist

Before committing, ensure each public API has:

- [ ] One-line summary in imperative mood
- [ ] Detailed description (what, why, how)
- [ ] All `@param` tags with types and descriptions
- [ ] `@returns` tag with type and description
- [ ] All `@throws` tags for error conditions
- [ ] At least one `@example` block with realistic usage
- [ ] `@security` tag if handling personal data or security controls
- [ ] `@see` links to related types/documentation
- [ ] Property-level JSDoc for all interface fields
- [ ] Format specifications (dates, IDs, enums)

---

## Tools

### TypeDoc

Generate HTML documentation:

```bash
npm run docs:generate
```

### ESLint JSDoc Plugin

Enforce JSDoc standards:

```bash
npm run lint
```

### VSCode JSDoc Extension

- **Better Comments** - Highlight JSDoc sections
- **Document This** - Auto-generate JSDoc templates

---

## Resources

- **JSDoc Official:** https://jsdoc.app/
- **TypeScript JSDoc:** https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
- **TypeDoc:** https://typedoc.org/
- **Hack23 ISMS:** https://github.com/Hack23/ISMS-PUBLIC
- **GDPR Article 30:** https://gdpr-info.eu/art-30-gdpr/

---

**Last Updated:** 2024-12-19  
**Maintained By:** Documentation Team
