[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractDateValue

# Function: extractDateValue()

> **extractDateValue**(`dateField`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/clients/ep/jsonLdHelpers.ts#L69)

Extracts an ISO 8601 date string from various EP API date formats.

## Parameters

### dateField

`unknown`

Raw date field from EP API

## Returns

`string`

`YYYY-MM-DD` string, or empty string if not parseable
