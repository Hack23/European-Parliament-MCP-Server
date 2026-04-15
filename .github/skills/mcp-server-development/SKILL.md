---
name: mcp-server-development
description: "Implements MCP tool handlers with Zod validation, defines resource endpoints with URI patterns, and creates prompt templates for the European Parliament MCP server. Use when building MCP tools, registering resources, designing prompts, or debugging Model Context Protocol integrations."
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

## Rules

1. **Follow MCP Specification**: Implement all handlers according to [MCP protocol specification](https://spec.modelcontextprotocol.io/) — use `ListToolsRequestSchema`, `CallToolRequestSchema`, `ListResourcesRequestSchema`, and `ReadResourceRequestSchema` from `@modelcontextprotocol/sdk`
2. **Validate Tool Inputs with Zod**: Define a `.strict()` Zod schema for every tool's arguments and call `.parse()` before any processing to reject unknown fields
3. **Return Structured Responses**: Always return `{ content: [{ type: "text", text: string }] }` for tools and `{ contents: [{ uri, mimeType, text }] }` for resources
4. **Handle Errors Gracefully**: Catch errors, log them internally with `console.error`, and re-throw a safe user-facing message via `throw new Error('...')` — never expose stack traces or internal details
5. **Implement Resources with URI Patterns**: Use consistent URI templates (e.g., `ep://meps/{id}`, `ep://committees/{code}`) and validate URIs with regex before parsing
6. **Provide Tool Descriptions**: Write clear, action-oriented descriptions for every tool, resource, and prompt so MCP clients can discover and present them accurately

## Workflow

1. Define a Zod input schema with `.strict()` to reject unknown fields
2. Register the tool via `server.setRequestHandler(ListToolsRequestSchema, ...)` with name, description, and JSON Schema
3. Implement the handler: parse input with Zod → fetch/process data → wrap result in `{ content: [{ type: "text", text }] }`
4. Add error handling: catch errors, log internally with `console.error`, return safe message via `throw new Error('...')`
5. Verify registration with `server.listTools()` and test with sample inputs

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

- **No input validation**: Never use `request.params.arguments` directly without Zod parsing — risks injection and malformed data
- **Exposing internal errors**: Never re-throw raw errors (`throw error`) — wrap them in a safe message to avoid leaking stack traces
- **Missing content wrapper**: Never return plain strings — always wrap in `{ content: [{ type: "text", text }] }`
- **Hardcoded resource URIs**: Never skip URI validation with regex before parsing resource identifiers

## ISMS Compliance

- **SC-002**: Input validation for all tool parameters
- **AU-002**: Audit logging for tool invocations
- **AC-003**: Rate limiting and access control

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
