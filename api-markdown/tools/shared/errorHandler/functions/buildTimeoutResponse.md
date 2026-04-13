[**European Parliament MCP Server API v1.2.6**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / buildTimeoutResponse

# Function: buildTimeoutResponse()

> **buildTimeoutResponse**(`toolName`, `timeoutMs`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/errorHandler.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorHandler.ts#L113)

Builds a structured non-error timeout response.

Instead of returning `isError: true` (which causes MCP clients to retry
the same slow request), this returns a well-formed success response with
explicit timeout indicators and OSINT-standard metadata so callers can
reliably distinguish a timeout from a normal successful analysis result.

The payload preserves the legacy `data: []` and `'@context': []` fields for
compatibility, while also including standard OSINT output fields such as
`confidenceLevel`, `methodology`, `dataFreshness`, and `sourceAttribution`.

## Parameters

### toolName

`string`

Name of the tool that timed out

### timeoutMs

`number` \| `undefined`

Configured timeout duration (if known)

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)

MCP-compliant ToolResult **without** `isError` — clients treat this as a
         successful timeout outcome and will not retry automatically.
