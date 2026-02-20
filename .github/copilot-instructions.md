# Copilot Instructions

This file provides guidance for GitHub Copilot coding agent when working on this repository.

## 📋 Required Context Files

**ALWAYS read these files at the start of your session:**
- `.github/workflows/copilot-setup.yml` - Environment setup and permissions
- `.github/copilot-mcp.json` - MCP server configuration and available tools
- `README.md` - Repository overview and project context
- `.github/agents/README.md` - Available custom agents
- `.github/skills/README.md` - Agent skills catalog
- `SECURITY.md` - Security policy and vulnerability disclosure
- `SECURITY_HEADERS.md` - API security headers implementation

## 🎯 Agent Skills Catalog

This repository includes **27 comprehensive skills** that provide reusable patterns:

### Core Development Skills (11)
- **mcp-server-development** - MCP protocol patterns, tool implementation
- **european-parliament-api** - EP API integration, caching, attribution
- **gdpr-compliance** - GDPR and data protection patterns
- **typescript-strict-patterns** - Branded types, discriminated unions, strict typing
- **testing-mcp-tools** - MCP testing patterns, 80%+ coverage
- **security-by-design** - Defense-in-depth, OWASP, secure coding for APIs
- **isms-compliance** - ISO 27001, NIST CSF 2.0, CIS Controls alignment
- **testing-strategy** - 80%+ coverage, deterministic API tests
- **documentation-standards** - JSDoc, OpenAPI, ISMS documentation
- **performance-optimization** - Node.js/API performance optimization
- **ai-development-governance** - AI-augmented dev controls, GitHub Copilot governance

### Security & Compliance Skills (6)
- **secure-code-review** - OWASP Top 10 review, input validation, TypeScript security
- **secrets-management** - Credential handling, environment variables, GitHub secrets
- **vulnerability-management** - Vulnerability lifecycle, SLAs, Dependabot handling
- **secure-development-lifecycle** - SDLC security, DevSecOps, supply chain security
- **incident-response** - Detection, containment, recovery per NIST SP 800-61r2
- **contribution-guidelines** - PR workflow, code review standards, commit conventions

### DevOps & Quality Skills (4)
- **github-agentic-workflows** - Copilot coding agent orchestration, stacked PRs
- **c4-architecture-documentation** - C4 model, architecture documentation portfolio
- **github-actions-workflows** - CI/CD pipelines, security scans, deployments
- **code-quality-excellence** - ESLint, TypeScript strict, quality gates

### Comprehensive ISMS Skills (6)
- **open-source-governance** - OpenSSF Scorecard, SLSA, SBOM, license compliance, vulnerability management
- **threat-modeling-framework** - STRIDE methodology, threat model docs, trust boundaries
- **architecture-documentation** - C4 model, SECURITY_ARCHITECTURE.md, Mermaid diagrams
- **aws-security-architecture** - AWS Control Tower, Well-Architected, VPC, GuardDuty, HA/DR
- **compliance-frameworks** - ISO 27001, NIST CSF 2.0, CIS Controls, EU CRA mapping
- **ai-development-governance** - AI-augmented dev controls, GitHub Copilot governance

Reference these skills when working on related tasks. All skills include evidence links to [Hack23 ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) policies.

## Project Overview

This is an MCP (Model Context Protocol) server providing access to European Parliament datasets. Built with TypeScript and Node.js with a strong focus on security, GDPR compliance, and code quality.

**Security & Compliance:** All security practices in this repository align with [Hack23 AB's Information Security Management System (ISMS)](https://github.com/Hack23/ISMS-PUBLIC). For complete policy details, see `SECURITY.md`.

**European Parliament Data:** This server provides structured access to:
- MEP (Member of European Parliament) information
- Plenary sessions and votes
- Committee meetings and documents
- Legislative procedures and documents
- Parliamentary questions and answers

## Development Workflow

### Setup and Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

### Code Quality and Testing

```bash
# Run linter
npm run lint

# Run unit tests with Vitest/Jest
npm test

# Run tests with coverage
npm run test:coverage

# Check license compliance
npm run test:licenses

# Check for unused dependencies
npm run knip
```

### Testing Approach

- **Unit Tests**: Use Vitest or Jest for TypeScript modules and MCP tools
- **Integration Tests**: Test API endpoints and MCP tool integration
- **Coverage Target**: Minimum 80% code coverage (95% for security-critical code)
- **Test Location**: Tests should be colocated with source files using `.test.ts` extension

## Coding Guidelines

### Strict Typing

- **Use explicit types and interfaces**: Avoid `any` (use `unknown` if needed)
- **Leverage utility types**: Use `Pick`, `Omit`, `Partial` and always define return types
- **TypeScript strict mode enabled**: `strictNullChecks`, `noImplicitAny`, `noUncheckedIndexedAccess` are all enabled
- **Type all function parameters and returns**: Never rely on implicit types
- **Use Zod for runtime validation**: Define schemas for all external data

### Code Organization

- **Source Code**: Place TypeScript modules in `src/` directory
- **Tools**: MCP tool implementations in `src/tools/`
- **Resources**: MCP resource implementations in `src/resources/`
- **Types**: Define custom types in `src/types/`
- **Tests**: Colocate unit tests with source files using `.test.ts` extension
- **Schemas**: Zod schemas in `src/schemas/` or colocated with tools

### Code Quality

- **No unused variables**: Code must not have unused locals or parameters
- **No implicit returns**: Always explicitly return values
- **Exhaustive switch cases**: Handle all cases in switch statements
- **Safe array access**: Handle potential undefined values from array/object access
- **Input validation**: Always validate and sanitize external input
- **Error handling**: Use proper error handling with typed errors

## Testing Guidelines

### Unit Testing Standards

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getMEPs } from './getMEPs';

describe('getMEPs', () => {
  it('should return list of MEPs with proper structure', async () => {
    const meps = await getMEPs({ country: 'Sweden' });
    
    expect(meps).toBeDefined();
    expect(Array.isArray(meps)).toBe(true);
    expect(meps[0]).toHaveProperty('id');
    expect(meps[0]).toHaveProperty('name');
    expect(meps[0]).toHaveProperty('country');
  });

  it('should handle API errors gracefully', async () => {
    vi.mock('./api', () => ({
      fetchFromEP: vi.fn().mockRejectedValue(new Error('API Error'))
    }));

    await expect(getMEPs()).rejects.toThrow('API Error');
  });
});
```

### Security Testing

- Test input validation for all public APIs
- Test rate limiting behavior
- Test authentication/authorization
- Test error handling (don't leak sensitive info)
- Test GDPR compliance (data minimization, right to erasure)

### Coverage Requirements

- **Minimum coverage**: 80% line coverage, 70% branch coverage
- **Security code**: 95% coverage required
- **Test all error paths**: Especially for external API calls
- **Mock external dependencies**: Use vi.mock() for European Parliament API

## MCP Protocol Implementation

### Tool Development

```typescript
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Define input schema
const GetMEPsSchema = z.object({
  country: z.string().optional(),
  group: z.string().optional(),
  limit: z.number().min(1).max(100).default(50)
});

// Implement tool
export async function handleGetMEPs(args: z.infer<typeof GetMEPsSchema>) {
  const validated = GetMEPsSchema.parse(args);
  
  // Fetch from European Parliament API
  const meps = await fetchMEPs(validated);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify(meps, null, 2)
    }]
  };
}
```

### Resource Development

```typescript
// Define resource URI pattern
const RESOURCE_TEMPLATE = "ep://meps/{id}";

export async function handleReadResource(uri: string) {
  const id = extractIdFromUri(uri);
  const mep = await fetchMEPById(id);
  
  return {
    contents: [{
      uri,
      mimeType: "application/json",
      text: JSON.stringify(mep, null, 2)
    }]
  };
}
```

## Security Guidelines

### Input Validation

```typescript
import { z } from 'zod';

// Always validate input
const schema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  country: z.string().length(2) // ISO country code
});

function processInput(data: unknown) {
  const validated = schema.parse(data); // Throws if invalid
  // ... safe to use validated data
}
```

### API Security

- **Rate limiting**: Implement rate limiting for all endpoints
- **Authentication**: Use API keys or OAuth tokens
- **Authorization**: Validate permissions before data access
- **CORS**: Configure proper CORS policies for MCP clients
- **Headers**: Implement security headers (see SECURITY_HEADERS.md)

### GDPR Compliance

- **Data minimization**: Only request necessary data
- **Purpose limitation**: Use data only for stated purpose
- **Storage limitation**: Don't cache personal data longer than needed
- **Right to erasure**: Support data deletion requests
- **Audit logging**: Log all access to MEP personal data

### European Parliament Specific

- **Parliamentary privilege**: Respect parliamentary proceedings confidentiality
- **Personal data**: Handle MEP contact information with extra care
- **Historical data**: Maintain data integrity for legislative history
- **Attribution**: Always attribute data to European Parliament
- **Terms of use**: Comply with EP data portal terms of use

## Performance Guidelines

### API Optimization

```typescript
// Use caching for frequently accessed data
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, MEP[]>({
  max: 500,
  ttl: 1000 * 60 * 15, // 15 minutes
  allowStale: false
});

async function getMEPs(params: GetMEPsParams): Promise<MEP[]> {
  const cacheKey = JSON.stringify(params);
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const data = await fetchFromEPAPI(params);
  cache.set(cacheKey, data);
  
  return data;
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## European Parliament Data Sources

### Primary Data Source

- **Base URL**: `https://data.europarl.europa.eu/api/v2/`
- **Documentation**: https://data.europarl.europa.eu/en/developer-corner
- **Data Format**: JSON-LD, RDF, XML
- **Rate Limits**: Respect EP API rate limits
- **Attribution**: Always include data source attribution

### Available Datasets

1. **MEPs**: Current and historical members
2. **Plenary**: Sessions, votes, attendance
3. **Committees**: Meetings, documents, membership
4. **Documents**: Legislative texts, reports, amendments
5. **Questions**: Parliamentary questions and answers

### Data Access Patterns

```typescript
// Example: Fetch MEP information
const response = await fetch(
  'https://data.europarl.europa.eu/api/v2/meps',
  {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'European-Parliament-MCP-Server/1.0'
    }
  }
);

const data = await response.json();
```

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Retrieves information about Members of European Parliament.
 * 
 * @param options - Query parameters for filtering MEPs
 * @param options.country - Filter by country (ISO 3166-1 alpha-2)
 * @param options.group - Filter by political group
 * @param options.limit - Maximum number of results (1-100)
 * @returns Promise resolving to array of MEP objects
 * @throws {ValidationError} If input parameters are invalid
 * @throws {APIError} If European Parliament API request fails
 * 
 * @example
 * ```typescript
 * const swedishMEPs = await getMEPs({ country: 'SE' });
 * console.log(`Found ${swedishMEPs.length} Swedish MEPs`);
 * ```
 * 
 * @security
 * - Rate limited to 100 requests per 15 minutes
 * - Personal data cached for max 15 minutes (GDPR compliance)
 * - All requests logged for audit purposes
 */
export async function getMEPs(
  options: GetMEPsOptions
): Promise<MEP[]> {
  // Implementation
}
```

### OpenAPI/Swagger

- Document all API endpoints with OpenAPI 3.0
- Include request/response schemas
- Document authentication requirements
- Provide example requests and responses

## Error Handling

### Error Types

```typescript
// Define custom error types
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

### Error Response Format

```typescript
// Consistent error response structure
interface ErrorResponse {
  error: {
    type: string;
    message: string;
    field?: string;
    details?: unknown;
  };
}

// Never expose internal errors to clients
function handleError(error: Error): ErrorResponse {
  if (error instanceof ValidationError) {
    return {
      error: {
        type: 'ValidationError',
        message: error.message,
        field: error.field
      }
    };
  }
  
  // Log full error internally
  console.error('Internal error:', error);
  
  // Return generic message
  return {
    error: {
      type: 'InternalError',
      message: 'An unexpected error occurred'
    }
  };
}
```

## Continuous Improvement

### Code Reviews

- All PRs require review before merge
- Use GitHub code review features
- Check security implications
- Verify test coverage
- Validate GDPR compliance

### Monitoring

- Monitor API response times
- Track error rates
- Monitor rate limit violations
- Log all data access for audit

### Updates

- Keep dependencies up to date (Dependabot)
- Monitor security advisories
- Update ISMS compliance documentation
- Review and update documentation regularly

## Custom Agents

This repository includes specialized agents for different tasks:

- **documentation-writer**: Technical documentation and API docs
- **frontend-specialist**: TypeScript development and API clients  
- **security-specialist**: Security reviews and ISMS compliance
- **test-engineer**: Test strategy and implementation
- **product-task-agent**: Product analysis and task coordination

See `.github/agents/README.md` for complete agent documentation.

## ISMS Compliance

This project follows Hack23 AB's ISMS policies:

- **Open Source Policy**: Public transparency, security badges, SBOM
- **Secure Development Policy**: Security by design, SLSA Level 3
- **Privacy Policy**: GDPR compliance, data protection by design
- **Access Control Policy**: Least privilege, role-based access

See `SECURITY.md` for complete compliance details.

## 📐 Architecture Documentation Requirements

Every Hack23 AB repository MUST maintain comprehensive architectural documentation per the [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md):

### Required Security Architecture Documents

| Document | Purpose |
|----------|---------|
| 🏛️ `SECURITY_ARCHITECTURE.md` | Current implemented security design and controls |
| 🚀 `FUTURE_SECURITY_ARCHITECTURE.md` | Planned security improvements and roadmap |

### Required Architecture Documentation Portfolio

**Current State:**
- 🏛️ `ARCHITECTURE.md` — Complete C4 models (Context, Container, Component views)
- 📊 `DATA_MODEL.md` — Data structures, entities, and relationships
- 🔄 `FLOWCHART.md` — Business process and data flows
- 📈 `STATEDIAGRAM.md` — System state transitions and lifecycles
- 🧠 `MINDMAP.md` — System conceptual relationships
- 💼 `SWOT.md` — Strategic analysis and positioning

**Future State:**
- 🚀 `FUTURE_ARCHITECTURE.md` — Architectural evolution roadmap
- 📊 `FUTURE_DATA_MODEL.md` — Enhanced data architecture plans
- 🔄 `FUTURE_FLOWCHART.md` — Improved process workflows
- 📈 `FUTURE_STATEDIAGRAM.md` — Advanced state management
- 🧠 `FUTURE_MINDMAP.md` — Capability expansion plans
- 💼 `FUTURE_SWOT.md` — Future strategic opportunities

### Reference Implementations

See architecture documentation in other Hack23 repositories:
- [CIA Security Architecture](https://github.com/Hack23/cia/blob/master/SECURITY_ARCHITECTURE.md)
- [CIA Architecture](https://github.com/Hack23/cia/blob/master/ARCHITECTURE.md)
- [Black Trigram Security Architecture](https://github.com/Hack23/blacktrigram/blob/master/SECURITY_ARCHITECTURE.md)
- [CIA Compliance Manager Security Architecture](https://github.com/Hack23/cia-compliance-manager/blob/main/SECURITY_ARCHITECTURE.md)

## Resources

- [European Parliament Open Data Portal](https://data.europarl.europa.eu/en/home)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)

---

**For questions or support, see the repository's CONTRIBUTING.md file.**
