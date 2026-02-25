[**European Parliament MCP Server API v0.7.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/trackLegislation](../README.md) / toProcessId

# Function: toProcessId()

> **toProcessId**(`ref`): `string`

Defined in: [tools/trackLegislation/index.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/tools/trackLegislation/index.ts#L37)

Convert a user-supplied procedure reference to the EP API process-id format.

The EP API uses process IDs like `2024-0006` (dashes, no type suffix),
while users typically supply references like `2024/0006(COD)`.

Supported input formats:
- Process-id: `"2024-0006"` (returned as-is)
- Reference: `"2024/0006(COD)"` → `"2024-0006"`
- Bare reference: `"2024/0006"` → `"2024-0006"` (fallback)

## Parameters

### ref

`string`

Procedure reference (e.g. `"2024/0006(COD)"` or `"2024-0006"`)

## Returns

`string`

Process ID suitable for the EP API (e.g. `"2024-0006"`)
