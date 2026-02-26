[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / ToolCategory

# Type Alias: ToolCategory

> **ToolCategory** = `"core"` \| `"advanced"` \| `"osint"` \| `"phase4"` \| `"phase5"`

Defined in: [server/types.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/server/types.ts#L42)

Logical grouping for tools in the registry.

| Category | Description |
|----------|-------------|
| `core`     | Fundamental EP data retrieval tools (MEPs, plenary, etc.) |
| `advanced` | Multi-step analytical tools (voting patterns, reports) |
| `osint`    | Open-source intelligence analysis tools (influence, coalitions) |
| `phase4`   | EP API v2 endpoint tools added in phase 4 |
| `phase5`   | Complete EP API v2 coverage added in phase 5 |
