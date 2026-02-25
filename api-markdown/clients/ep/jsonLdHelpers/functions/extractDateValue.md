[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractDateValue

# Function: extractDateValue()

> **extractDateValue**(`dateField`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/jsonLdHelpers.ts#L69)

Extracts an ISO 8601 date string from various EP API date formats.

## Parameters

### dateField

`unknown`

Raw date field from EP API

## Returns

`string`

`YYYY-MM-DD` string, or empty string if not parseable
