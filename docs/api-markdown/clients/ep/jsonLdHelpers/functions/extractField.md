[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractField

# Function: extractField()

> **extractField**(`data`, `fields`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:51](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/jsonLdHelpers.ts#L51)

Extracts a string value from the first matching field name.

## Parameters

### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Record to search

### fields

`string`[]

Field names to try in order

## Returns

`string`

String value from first matching field, or empty string
