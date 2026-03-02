[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / firstDefined

# Function: firstDefined()

> **firstDefined**(`data`, ...`keys`): `unknown`

Defined in: [clients/ep/jsonLdHelpers.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/jsonLdHelpers.ts#L35)

Returns the first non-undefined value from a record, looked up by key list.

## Parameters

### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Record to search

### keys

...`string`[]

Field names to try in order

## Returns

`unknown`

First non-undefined value, or `undefined` if none found
