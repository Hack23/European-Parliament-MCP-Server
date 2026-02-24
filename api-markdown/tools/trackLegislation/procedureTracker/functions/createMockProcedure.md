[**European Parliament MCP Server API v0.7.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/trackLegislation/procedureTracker](../README.md) / createMockProcedure

# Function: createMockProcedure()

> **createMockProcedure**(`procedureId`): [`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)

Defined in: [tools/trackLegislation/procedureTracker.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/procedureTracker.ts#L93)

Create a placeholder legislative procedure with illustrative data.
Cyclomatic complexity: 1

Returns a data structure showing what tracked legislation looks like.
All data except the procedureId is illustrative—real EP Legislative
Observatory API integration is planned for a future release.

## Parameters

### procedureId

`string`

## Returns

[`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)
