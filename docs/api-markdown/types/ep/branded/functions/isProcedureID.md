[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / isProcedureID

# Function: isProcedureID()

> **isProcedureID**(`value`): `value is ProcedureID`

Defined in: [types/ep/branded.ts:98](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/types/ep/branded.ts#L98)

Type guard: checks that a string looks like an EP procedure ID.

Expected format: `"YYYY-NNNN"` (e.g. `"2024-0006"`).

## Parameters

### value

`string`

String to validate

## Returns

`value is ProcedureID`
