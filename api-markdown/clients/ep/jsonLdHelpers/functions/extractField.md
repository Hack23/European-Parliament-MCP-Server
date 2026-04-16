[**European Parliament MCP Server API v1.2.8**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractField

# Function: extractField()

> **extractField**(`data`, `fields`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/jsonLdHelpers.ts#L55)

Extracts a string value from the first matching field name.

EP API JSON-LD responses sometimes return single-value fields as arrays
(e.g. `inverse_decided_on_a_realization_of: ["eli/dl/event/..."]`).
When the value is an array, the first element is used.

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
