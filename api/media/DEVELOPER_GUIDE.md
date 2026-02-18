# Developer Guide

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">European Parliament MCP Server - Developer Guide</h1>

<p align="center">
  <strong>Complete guide for contributing and extending the MCP server</strong><br>
  <em>Project structure, development workflow, and best practices</em>
</p>

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Adding New Tools](#adding-new-tools)
- [Testing Strategy](#testing-strategy)
- [Code Style & Conventions](#code-style--conventions)
- [Security Considerations](#security-considerations)
- [Performance Guidelines](#performance-guidelines)
- [Contributing Workflow](#contributing-workflow)
- [Release Process](#release-process)

---

## 🚀 Getting Started

### Prerequisites

**Required**:
- Node.js 24.x or higher
- npm 10.x or higher
- Git
- TypeScript knowledge
- MCP protocol familiarity

**Recommended**:
- VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
- Docker (for containerized development)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Hack23/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

### Development Environment

```bash
# Install recommended tools
npm install -g tsx vitest

# Setup git hooks (optional)
npm run prepare

# Verify setup
npm run type-check
npm run lint
npm test
```

---

## 📁 Project Structure

```
European-Parliament-MCP-Server/
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   │   ├── test-and-report.yml    # Unit tests + coverage
│   │   ├── integration-tests.yml  # E2E + performance tests
│   │   └── release.yml            # Automated releases
│   ├── agents/                # Custom Copilot agents
│   └── skills/                # Reusable skill patterns
│
├── docs/                      # Documentation
│   ├── API_USAGE_GUIDE.md    # Tool usage documentation
│   ├── ARCHITECTURE_DIAGRAMS.md   # Visual architecture
│   ├── TROUBLESHOOTING.md    # Common issues
│   ├── DEVELOPER_GUIDE.md    # This file
│   ├── DEPLOYMENT_GUIDE.md   # Deployment instructions
│   └── PERFORMANCE_GUIDE.md  # Optimization strategies
│
├── src/                       # Source code
│   ├── index.ts              # Server entry point
│   │
│   ├── tools/                # MCP tool implementations
│   │   ├── getMEPs.ts
│   │   ├── getMEPDetails.ts
│   │   ├── getPlenarySessions.ts
│   │   ├── getVotingRecords.ts
│   │   ├── searchDocuments.ts
│   │   ├── getCommitteeInfo.ts
│   │   ├── getParliamentaryQuestions.ts
│   │   ├── analyzeVotingPatterns.ts
│   │   ├── trackLegislation.ts
│   │   └── generateReport.ts
│   │
│   ├── clients/              # External API clients
│   │   └── europeanParliamentClient.ts
│   │
│   ├── schemas/              # Zod validation schemas
│   │   └── europeanParliament.ts
│   │
│   ├── types/                # TypeScript type definitions
│   │   └── europeanParliament.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── cache.ts
│   │   ├── rateLimiter.ts
│   │   └── logger.ts
│   │
│   └── services/             # Business services
│       └── MetricsService.ts
│
├── tests/                     # Test files
│   ├── integration/          # Integration tests
│   ├── e2e/                  # End-to-end tests
│   ├── performance/          # Performance benchmarks
│   └── helpers/              # Test utilities
│
├── dist/                      # Compiled JavaScript (gitignored)
├── node_modules/              # Dependencies (gitignored)
│
├── package.json               # Project metadata
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Test configuration
├── eslint.config.js          # ESLint configuration
└── README.md                 # Project overview
```

### Key Directories

| Directory | Purpose | File Types |
|-----------|---------|------------|
| `src/tools/` | MCP tool implementations | `.ts`, `.test.ts` |
| `src/clients/` | External API clients | `.ts`, `.test.ts` |
| `src/schemas/` | Zod validation schemas | `.ts` |
| `src/types/` | TypeScript type definitions | `.ts` |
| `src/utils/` | Utility functions | `.ts`, `.test.ts` |
| `tests/integration/` | Integration tests | `.test.ts` |
| `tests/e2e/` | End-to-end MCP tests | `.e2e.test.ts` |
| `docs/` | Documentation | `.md` |

---

## 🔄 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes
# Edit files...

# 4. Run tests continuously
npm run test:watch

# 5. Lint and format
npm run lint:fix
npm run format

# 6. Build
npm run build

# 7. Run full test suite
npm test

# 8. Commit changes
git add .
git commit -m "feat: add new feature"

# 9. Push to GitHub
git push origin feature/my-feature

# 10. Create Pull Request
```

### Development Scripts

```bash
# Build
npm run build              # Production build
npm run build:watch        # Watch mode

# Testing
npm test                   # All tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests
npm run test:performance   # Performance benchmarks
npm run test:coverage      # Coverage report
npm run test:watch         # Watch mode

# Code Quality
npm run lint               # Check linting
npm run lint:fix           # Fix linting issues
npm run format             # Format with Prettier
npm run type-check         # TypeScript type checking

# Other
npm run dev                # Development server
npm run knip               # Find unused exports
npm run test:licenses      # Check license compliance
```

---

## 🛠️ Adding New Tools

### Step 1: Define Tool Schema

Create Zod schema in `src/schemas/europeanParliament.ts`:

```typescript
/**
 * Schema for new_tool input validation
 */
export const NewToolSchema = z.object({
  param1: z.string().min(1).max(100),
  param2: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  param3: z.number().int().min(1).max(100).default(50)
});

export type NewToolParams = z.infer<typeof NewToolSchema>;
```

### Step 2: Define TypeScript Types

Add types in `src/types/europeanParliament.ts`:

```typescript
/**
 * Result type for new_tool
 */
export interface NewToolResult {
  id: string;
  name: string;
  data: unknown[];
  metadata: {
    timestamp: string;
    source: string;
  };
}
```

### Step 3: Implement Tool Handler

Create `src/tools/newTool.ts`:

```typescript
/**
 * MCP Tool: new_tool
 * 
 * Brief description of what this tool does
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { NewToolSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import type { NewToolResult } from '../types/europeanParliament.js';

/**
 * New tool handler
 * 
 * @param args - Tool arguments
 * @returns MCP tool result
 * 
 * @example
 * ```json
 * {
 *   "param1": "value1",
 *   "param2": "2024-01-01"
 * }
 * ```
 */
export async function handleNewTool(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  // Step 1: Validate input
  const params = NewToolSchema.parse(args);
  
  try {
    // Step 2: Fetch data from EP API client
    const result = await epClient.getNewData(params);
    
    // Step 3: Transform to expected format
    const transformed: NewToolResult = {
      id: result.id,
      name: result.name,
      data: result.items,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'European Parliament'
      }
    };
    
    // Step 4: Return MCP-compliant response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(transformed, null, 2)
      }]
    };
  } catch (error) {
    // Step 5: Handle errors without exposing internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to execute new_tool: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const newToolMetadata = {
  name: 'new_tool',
  description: 'Brief description of what this tool does and what data it returns. Include key use cases.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      param1: {
        type: 'string',
        description: 'Description of param1',
        minLength: 1,
        maxLength: 100
      },
      param2: {
        type: 'string',
        description: 'Optional date parameter (YYYY-MM-DD)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      param3: {
        type: 'number',
        description: 'Page size (1-100)',
        minimum: 1,
        maximum: 100,
        default: 50
      }
    },
    required: ['param1']
  }
};
```

### Step 4: Register Tool

Add to `src/index.ts`:

```typescript
// Import tool
import { handleNewTool, newToolMetadata } from './tools/newTool.js';

// Register in tool handlers map
const toolHandlers: Record<string, (args: unknown) => Promise<any>> = {
  get_meps: handleGetMEPs,
  // ... other tools ...
  new_tool: handleNewTool  // Add new tool
};

// Register metadata in list_tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      getMEPsToolMetadata,
      // ... other tools ...
      newToolMetadata  // Add new tool metadata
    ]
  };
});
```

### Step 5: Add EP API Client Method

If needed, add method to `src/clients/europeanParliamentClient.ts`:

```typescript
/**
 * Get new data from European Parliament API
 */
async getNewData(params: {
  param1: string;
  param2?: string;
}): Promise<NewToolResult> {
  const cacheKey = `newdata:${params.param1}:${params.param2 ?? 'all'}`;
  
  // Check cache
  const cached = this.cache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Rate limiting
  await this.rateLimiter.waitForToken();
  
  // Build URL
  const url = new URL('/api/v2/newdata', this.baseUrl);
  url.searchParams.append('param1', params.param1);
  if (params.param2) {
    url.searchParams.append('param2', params.param2);
  }
  
  // Fetch data
  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/ld+json',
      'User-Agent': 'European-Parliament-MCP-Server/1.0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`EP API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform from JSON-LD to internal format
  const result = this.transformNewData(data);
  
  // Cache result
  this.cache.set(cacheKey, result);
  
  // Log access for audit
  this.logger.info('Fetched new data', { param1: params.param1 });
  
  return result;
}

/**
 * Transform EP API JSON-LD to internal format
 */
private transformNewData(apiData: any): NewToolResult {
  return {
    id: this.toSafeString(apiData['id']),
    name: this.toSafeString(apiData['label']),
    data: Array.isArray(apiData['items']) ? apiData['items'] : [],
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'European Parliament'
    }
  };
}
```

### Step 6: Write Tests

Create `src/tools/newTool.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleNewTool, newToolMetadata } from './newTool.js';
import { epClient } from '../clients/europeanParliamentClient.js';

// Mock EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getNewData: vi.fn()
  }
}));

describe('newTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept valid parameters', async () => {
      vi.mocked(epClient.getNewData).mockResolvedValue({
        id: 'test-id',
        name: 'Test Name',
        data: [],
        metadata: {
          timestamp: '2024-01-01T00:00:00Z',
          source: 'European Parliament'
        }
      });

      await expect(
        handleNewTool({
          param1: 'value1',
          param2: '2024-01-01'
        })
      ).resolves.toBeDefined();
    });

    it('should reject invalid param1', async () => {
      await expect(
        handleNewTool({
          param1: '',  // Empty not allowed
          param2: '2024-01-01'
        })
      ).rejects.toThrow();
    });

    it('should reject invalid date format', async () => {
      await expect(
        handleNewTool({
          param1: 'value1',
          param2: '01-01-2024'  // Wrong format
        })
      ).rejects.toThrow();
    });

    it('should use default values', async () => {
      vi.mocked(epClient.getNewData).mockResolvedValue({
        id: 'test-id',
        name: 'Test Name',
        data: [],
        metadata: {
          timestamp: '2024-01-01T00:00:00Z',
          source: 'European Parliament'
        }
      });

      await handleNewTool({ param1: 'value1' });
      
      expect(epClient.getNewData).toHaveBeenCalledWith(
        expect.objectContaining({
          param1: 'value1'
        })
      );
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response', async () => {
      const mockData = {
        id: 'test-id',
        name: 'Test Name',
        data: [{ item: 1 }],
        metadata: {
          timestamp: '2024-01-01T00:00:00Z',
          source: 'European Parliament'
        }
      };

      vi.mocked(epClient.getNewData).mockResolvedValue(mockData);

      const result = await handleNewTool({ param1: 'value1' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON', async () => {
      const mockData = {
        id: 'test-id',
        name: 'Test Name',
        data: [],
        metadata: {
          timestamp: '2024-01-01T00:00:00Z',
          source: 'European Parliament'
        }
      };

      vi.mocked(epClient.getNewData).mockResolvedValue(mockData);

      const result = await handleNewTool({ param1: 'value1' });
      const text = result.content[0].text;

      expect(() => JSON.parse(text)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle EP API errors gracefully', async () => {
      vi.mocked(epClient.getNewData).mockRejectedValue(
        new Error('EP API unavailable')
      );

      await expect(
        handleNewTool({ param1: 'value1' })
      ).rejects.toThrow('Failed to execute new_tool');
    });
  });

  describe('Tool Metadata', () => {
    it('should have correct tool name', () => {
      expect(newToolMetadata.name).toBe('new_tool');
    });

    it('should have description', () => {
      expect(newToolMetadata.description).toBeDefined();
      expect(newToolMetadata.description.length).toBeGreaterThan(10);
    });

    it('should define input schema', () => {
      expect(newToolMetadata.inputSchema).toBeDefined();
      expect(newToolMetadata.inputSchema.properties).toBeDefined();
    });
  });
});
```

### Step 7: Update Documentation

1. Add tool to `docs/API_USAGE_GUIDE.md`
2. Update tool count in `README.md`
3. Add to Architecture Diagrams if significant

---

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /E2E\        End-to-End (10%)
      /------\      - Full MCP client-server tests
     / Integr \     Integration (20%)
    /----------\    - EP API client tests
   /   Unit     \   Unit (70%)
  /--------------\  - Tool handlers, schemas, utils
```

### Unit Tests

**Location**: Colocated with source files (`*.test.ts`)

**Coverage Target**: 80% overall, 95% for security-critical code

**Example**:

```typescript
// src/utils/cache.test.ts
import { describe, it, expect } from 'vitest';
import { LRUCache } from 'lru-cache';

describe('Cache', () => {
  it('should store and retrieve values', () => {
    const cache = new LRUCache({ max: 10 });
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should respect TTL', async () => {
    const cache = new LRUCache({ max: 10, ttl: 100 });
    cache.set('key', 'value');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(cache.get('key')).toBeUndefined();
  });

  it('should evict oldest when max reached', () => {
    const cache = new LRUCache({ max: 2 });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(true);
    expect(cache.has('key3')).toBe(true);
  });
});
```

### Integration Tests

**Location**: `tests/integration/`

**Purpose**: Test EP API client integration

**Example**:

```typescript
// tests/integration/epClient.integration.test.ts
import { describe, it, expect } from 'vitest';
import { epClient } from '../../src/clients/europeanParliamentClient.js';

describe('EP API Client Integration', () => {
  it('should fetch MEPs from real API', async () => {
    const result = await epClient.getMEPs({
      country: 'SE',
      limit: 5
    });

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it('should respect rate limiting', async () => {
    const requests = Array(5).fill(null).map(() =>
      epClient.getMEPs({ limit: 1 })
    );

    const start = Date.now();
    await Promise.all(requests);
    const duration = Date.now() - start;

    // Should complete reasonably fast with caching
    expect(duration).toBeLessThan(5000);
  });
});
```

### E2E Tests

**Location**: `tests/e2e/`

**Purpose**: Test complete MCP client-server flow

**Example**:

```typescript
// tests/e2e/mepQueries.e2e.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

describe('MEP Queries E2E', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js']
    });

    client = new Client({
      name: 'test-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('should list MEPs', async () => {
    const result = await client.callTool('get_meps', {
      country: 'SE',
      limit: 10
    });

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');

    const data = JSON.parse(result.content[0].text);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

### Performance Tests

**Location**: `tests/performance/`

**Purpose**: Verify performance requirements (<200ms cached)

**Example**:

```typescript
// tests/performance/benchmarks.test.ts
import { describe, it, expect } from 'vitest';
import { measureTime } from '../helpers/testUtils.js';

describe('Performance Benchmarks', () => {
  it('should respond in <200ms for cached requests', async () => {
    // Warm cache
    await client.callTool('get_meps', { country: 'SE' });

    // Measure cached response
    const duration = await measureTime(() =>
      client.callTool('get_meps', { country: 'SE' })
    );

    expect(duration).toBeLessThan(200);
  });

  it('should handle 50 concurrent requests', async () => {
    const requests = Array(50).fill(null).map((_, i) =>
      client.callTool('get_meps', {
        country: 'SE',
        offset: i * 10,
        limit: 10
      })
    );

    const start = Date.now();
    await Promise.all(requests);
    const duration = Date.now() - start;

    // Should complete in reasonable time
    expect(duration).toBeLessThan(10000);
  });
});
```

---

## 🎨 Code Style & Conventions

### TypeScript Guidelines

**1. Use Strict Mode**

```typescript
// tsconfig.json already enables strict mode
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**2. Explicit Return Types**

```typescript
// ❌ Bad
export async function getData(id: string) {
  return await fetch(`/api/${id}`);
}

// ✅ Good
export async function getData(id: string): Promise<Response> {
  return await fetch(`/api/${id}`);
}
```

**3. No `any` Type**

```typescript
// ❌ Bad
function process(data: any) {
  return data.field;
}

// ✅ Good
function process(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'field' in data) {
    return String(data.field);
  }
  throw new Error('Invalid data structure');
}
```

**4. Use Branded Types**

```typescript
// Good for IDs
type MEPID = string & { readonly __brand: 'MEPID' };

function getMEP(id: MEPID): Promise<MEP> {
  // ...
}

// Prevents accidental string mixing
const id: MEPID = 'MEP-123' as MEPID;
getMEP(id); // OK
getMEP('random-string'); // ❌ Type error
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | camelCase | `getMEPs.ts` |
| Classes | PascalCase | `RateLimiter` |
| Interfaces | PascalCase | `MEPDetails` |
| Functions | camelCase | `handleGetMEPs` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_LIMIT` |
| Private fields | _camelCase | `_cache` |
| Types | PascalCase | `ToolMetadata` |

### Code Organization

**1. Import Order**

```typescript
// 1. External packages
import { z } from 'zod';
import { LRUCache } from 'lru-cache';

// 2. Internal modules (absolute imports)
import { epClient } from '../clients/europeanParliamentClient.js';
import { MEPSchema } from '../schemas/europeanParliament.js';

// 3. Types
import type { MEP, Committee } from '../types/europeanParliament.js';
```

**2. File Structure**

```typescript
/**
 * File header comment
 */

// Imports
import { ... } from '...';

// Constants
const DEFAULT_LIMIT = 50;

// Types/Interfaces
interface LocalType {
  // ...
}

// Main implementation
export async function mainFunction() {
  // ...
}

// Helper functions (private)
function helperFunction() {
  // ...
}

// Exports
export const metadata = {
  // ...
};
```

### Error Handling

```typescript
// Always catch and sanitize errors
try {
  const result = await externalAPI();
  return result;
} catch (error) {
  // Log full error internally
  logger.error('External API failed', { error });
  
  // Throw sanitized error
  const message = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`Operation failed: ${message}`);
}
```

### Documentation

**JSDoc for Public APIs**:

```typescript
/**
 * Retrieve Members of European Parliament with filters
 * 
 * @param args - Tool arguments including country, group, committee filters
 * @returns MCP-compliant response with paginated MEP data
 * @throws {ValidationError} If input parameters are invalid
 * @throws {APIError} If European Parliament API request fails
 * 
 * @example
 * ```typescript
 * const result = await handleGetMEPs({
 *   country: 'SE',
 *   group: 'S&D',
 *   limit: 20
 * });
 * ```
 * 
 * @security
 * - Input validated with Zod schemas
 * - Rate limited to 100 requests per 15 minutes
 * - All requests logged for audit
 * 
 * @performance
 * - Cached responses: <1ms
 * - API requests: ~150-200ms
 * - Cache TTL: 15 minutes
 */
export async function handleGetMEPs(args: unknown): Promise<MCPResponse> {
  // Implementation
}
```

---

## 🔒 Security Considerations

### Input Validation

**Always use Zod schemas**:

```typescript
// Define schema
const InputSchema = z.object({
  id: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  keywords: z.string().regex(/^[a-zA-Z0-9\s\-_]+$/)
});

// Validate input
export function handleTool(args: unknown) {
  const params = InputSchema.parse(args); // Throws on invalid
  // params is now type-safe
}
```

### Output Validation

```typescript
// Validate API responses
const OutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  data: z.array(z.unknown())
});

const apiResponse = await fetch(...);
const validated = OutputSchema.parse(apiResponse); // Ensure structure
return validated;
```

### Error Sanitization

```typescript
// ❌ Bad - Exposes internal details
catch (error) {
  throw error;
}

// ✅ Good - Sanitized error
catch (error) {
  logger.error('Internal error', { error });
  throw new Error('Operation failed');
}
```

### Rate Limiting

```typescript
// Always check rate limits
if (!await rateLimiter.tryRemoveTokens(1)) {
  throw new Error('Rate limit exceeded');
}

// Make request
const response = await fetch(...);
```

### Audit Logging

```typescript
// Log all data access
logger.info('Accessed MEP data', {
  user: 'client-id',
  mepId: params.id,
  timestamp: new Date().toISOString()
});
```

### Security Checklist

- [ ] Input validated with Zod schemas
- [ ] Output validated before returning
- [ ] Errors sanitized (no internal details exposed)
- [ ] Rate limiting applied
- [ ] Audit logging implemented
- [ ] No secrets in code or logs
- [ ] HTTPS only for external APIs
- [ ] GDPR compliance (data minimization)

---

## ⚡ Performance Guidelines

### Caching Strategy

```typescript
// Use LRU cache with appropriate TTL
const cache = new LRUCache<string, any>({
  max: 500,              // Max entries
  ttl: 15 * 60 * 1000,  // 15 minutes
  allowStale: false
});

// Cache key strategy
function getCacheKey(params: any): string {
  return `${method}:${JSON.stringify(params)}`;
}

// Check cache before API call
const cached = cache.get(cacheKey);
if (cached) {
  return cached;
}

// Fetch and cache
const fresh = await fetchFromAPI();
cache.set(cacheKey, fresh);
return fresh;
```

### Async Best Practices

```typescript
// ❌ Bad - Sequential
const meps = await getMEPs();
const sessions = await getSessions();
const votes = await getVotes();

// ✅ Good - Parallel
const [meps, sessions, votes] = await Promise.all([
  getMEPs(),
  getSessions(),
  getVotes()
]);
```

### Memory Management

```typescript
// Limit array sizes
const results = largeArray.slice(0, 100); // Take first 100

// Stream large datasets
async function* streamData() {
  let offset = 0;
  while (true) {
    const batch = await fetchBatch(offset, 100);
    if (batch.length === 0) break;
    
    for (const item of batch) {
      yield item;
    }
    
    offset += batch.length;
  }
}
```

---

## 🤝 Contributing Workflow

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server
git remote add upstream https://github.com/Hack23/European-Parliament-MCP-Server.git
```

### 2. Create Feature Branch

```bash
git checkout -b feature/my-feature
```

**Branch naming**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 3. Make Changes

Follow code style, add tests, update documentation.

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new MEP filtering option"
```

**Commit message format** ([Conventional Commits](https://www.conventionalcommits.org/)):

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Testing
- `chore`: Maintenance

**Examples**:
```
feat(tools): add committee member filtering
fix(cache): resolve cache invalidation bug
docs(api): update get_meps examples
test(e2e): add voting records integration test
```

### 5. Push and Create PR

```bash
git push origin feature/my-feature
```

Then create Pull Request on GitHub.

### 6. PR Review Process

1. **Automated Checks**:
   - All tests pass
   - Linting passes
   - Coverage meets threshold (80%)
   - Security scan passes

2. **Code Review**:
   - At least one approval required
   - Security team review for security-critical changes
   - Documentation updated
   - CHANGELOG.md updated for user-facing changes

3. **Merge**:
   - Squash and merge to main
   - Delete branch after merge

---

## 📦 Release Process

### Versioning

Follow [Semantic Versioning](https://semver.org/):

- **Major** (x.0.0): Breaking changes
- **Minor** (0.x.0): New features (backward compatible)
- **Patch** (0.0.x): Bug fixes (backward compatible)

### Automated Release

1. **Create Release PR**:
   - Update version in `package.json`
   - Update `CHANGELOG.md`
   - Commit: `chore(release): v1.2.0`

2. **Merge to Main**:
   - All tests pass
   - Approved by maintainers

3. **GitHub Actions**:
   - Automatically creates release
   - Generates release notes
   - Publishes to npm (if configured)
   - Creates git tag

### Manual Release

```bash
# Update version
npm version minor  # or major, patch

# Push with tags
git push origin main --follow-tags

# Create GitHub release
gh release create v1.2.0 \
  --title "v1.2.0" \
  --notes-file CHANGELOG.md
```

---

## 📚 Additional Resources

### Documentation
- [API Usage Guide](./API_USAGE_GUIDE.md) - Tool documentation
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md) - Visual architecture
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [Performance Guide](./PERFORMANCE_GUIDE.md) - Optimization strategies

### External Resources
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)

### ISMS Compliance
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>ISMS-compliant development demonstrating security excellence</em>
</p>
