[**European Parliament MCP Server API v1.2.10**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/common](../README.md) / refineDateRange

# Function: refineDateRange()

> **refineDateRange**(`data`): `boolean`

Defined in: [schemas/ep/common.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/common.ts#L54)

Cross-field date range refinement helper.
Ensures dateFrom is before or equal to dateTo when both are provided.

## Parameters

### data

#### dateFrom?

`string`

#### dateTo?

`string`

## Returns

`boolean`
