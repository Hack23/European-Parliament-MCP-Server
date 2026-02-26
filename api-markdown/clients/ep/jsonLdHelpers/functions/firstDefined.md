[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / firstDefined

# Function: firstDefined()

> **firstDefined**(`data`, ...`keys`): `unknown`

Defined in: [clients/ep/jsonLdHelpers.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/clients/ep/jsonLdHelpers.ts#L35)

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
