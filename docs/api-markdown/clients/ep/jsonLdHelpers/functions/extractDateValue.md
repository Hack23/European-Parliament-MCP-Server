[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractDateValue

# Function: extractDateValue()

> **extractDateValue**(`dateField`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/clients/ep/jsonLdHelpers.ts#L69)

Extracts an ISO 8601 date string from various EP API date formats.

## Parameters

### dateField

`unknown`

Raw date field from EP API

## Returns

`string`

`YYYY-MM-DD` string, or empty string if not parseable
