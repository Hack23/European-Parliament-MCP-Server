---
name: mcp-server-development
description: MCP protocol patterns, tool implementation, resource handlers, prompt templates, and error handling for Model Context Protocol servers
license: MIT
---

# MCP Server Development Skill

## Context

This skill applies when:
- Implementing MCP protocol tools, resources, and prompts
- Creating MCP server handlers for European Parliament data
- Designing tool input/output schemas
- Implementing resource URI patterns
- Creating prompt templates for AI assistants
- Handling MCP protocol errors and edge cases
- Testing MCP server implementations
- Optimizing MCP tool performance

MCP (Model Context Protocol) is the foundation of this server. All data access must follow MCP specification patterns to ensure compatibility with MCP clients.

## Rules

1. **Follow MCP Specification**: Implement all handlers according to [MCP protocol specification](https://spec.modelcontextprotocol.io/)
2. **Validate Tool Inputs**: Use Zod schemas to validate all tool inputs before processing
3. **Return Structured Responses**: Always return MCP-compliant response structures with `content` array
4. **Handle Errors Gracefully**: Catch errors and return safe error messages (never expose internal details)
5. **Use Type Safety**: Leverage TypeScript types for all MCP handlers and request/response objects
6. **Implement Resources with URIs**: Use consistent URI patterns (e.g., `ep://meps/{id}`)
7. **Provide Tool Descriptions**: Write clear, concise descriptions for all tools, resources, and prompts
8. **Document Input Schemas**: Use JSON Schema in tool listings to document expected inputs
9. **Log MCP Operations**: Log all tool invocations, resource accesses for audit trails
10. **Test MCP Handlers**: Write comprehensive tests for all MCP tools and resources

## Examples

### ✅ Good Pattern: MCP Tool Implementation

```typescript
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Input schema with validation
const SearchMEPsInputSchema = z.object({
  country: z.string().length(2).regex(/^[A-Z]{2}$/).optional(),
  limit: z.number().int().min(1).max(100).default(20),
}).strict();

// Tool handler
export async function handleSearchMEPs(request: typeof CallToolRequestSchema._type) {
  const input = SearchMEPsInputSchema.parse(request.params.arguments);
  
  try {
    const meps = await searchMEPs(input);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ count: meps.length, meps }, null, 2)
      }]
    };
  } catch (error) {
    console.error('[MCP Tool Error] search_meps:', error);
    throw new Error('Failed to search MEPs. Please try again.');
  }
}

// Tool registration
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "search_meps",
    description: "Search Members of the European Parliament by filters",
    inputSchema: {
      type: "object",
      properties: {
        country: { type: "string", pattern: "^[A-Z]{2}$" },
        limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
      },
    },
  }],
}));
```

### ✅ Good Pattern: MCP Resource Implementation

```typescript
// Resource URI pattern
const MEP_RESOURCE_TEMPLATE = "ep://meps/{id}";

// List resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{
    uri: MEP_RESOURCE_TEMPLATE,
    name: "European Parliament Member",
    description: "Detailed MEP information",
    mimeType: "application/json",
  }],
}));

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const match = uri.match(/^ep:\/\/meps\/(\d+)$/);
  
  if (!match) {
    throw new Error(`Invalid MEP resource URI: ${uri}`);
  }
  
  const mepId = parseInt(match[1], 10);
  const mep = await getMEPById(mepId);
  
  return {
    contents: [{
      uri,
      mimeType: "application/json",
      text: JSON.stringify(mep, null, 2),
    }],
  };
});
```

## Anti-Patterns

### ❌ Bad: No Input Validation
```typescript
// NEVER - no validation!
async function bad(request: any) {
  const data = await fetch(request.params.arguments.url); // Injection risk!
  return { content: [{ type: "text", text: data }] };
}
```

### ❌ Bad: Exposing Internal Errors
```typescript
// NEVER - exposes internals!
async function bad(request: any) {
  try {
    return await process(request);
  } catch (error) {
    throw error; // Exposes stack trace!
  }
}
```

## ISMS Compliance

- **SC-002**: Input validation for all tool parameters
- **AU-002**: Audit logging for tool invocations
- **AC-003**: Rate limiting and access control

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
