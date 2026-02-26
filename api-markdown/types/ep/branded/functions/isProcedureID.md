[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / isProcedureID

# Function: isProcedureID()

> **isProcedureID**(`value`): `value is ProcedureID`

Defined in: [types/ep/branded.ts:98](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/ep/branded.ts#L98)

Type guard: checks that a string looks like an EP procedure ID.

Expected format: `"YYYY-NNNN"` (e.g. `"2024-0006"`).

## Parameters

### value

`string`

String to validate

## Returns

`value is ProcedureID`
