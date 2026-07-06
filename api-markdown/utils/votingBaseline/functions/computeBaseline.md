[**European Parliament MCP Server API v1.3.36**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / computeBaseline

# Function: computeBaseline()

> **computeBaseline**(`values`): [`BaselineSummary`](../interfaces/BaselineSummary.md)

Defined in: [utils/votingBaseline.ts:386](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L386)

Compute sample mean & standard deviation (ddof = 1) for a series of
numbers. Returns `{mean:0, stdev:0}` for empty input.

## Parameters

### values

`number`[]

## Returns

[`BaselineSummary`](../interfaces/BaselineSummary.md)
