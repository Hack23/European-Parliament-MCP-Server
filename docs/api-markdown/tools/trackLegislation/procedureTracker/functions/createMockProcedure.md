[**European Parliament MCP Server API v0.6.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/trackLegislation/procedureTracker](../README.md) / createMockProcedure

# Function: createMockProcedure()

> **createMockProcedure**(`procedureId`): [`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)

Defined in: [tools/trackLegislation/procedureTracker.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/tools/trackLegislation/procedureTracker.ts#L93)

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
