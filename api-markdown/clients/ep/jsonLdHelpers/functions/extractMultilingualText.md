[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractMultilingualText

# Function: extractMultilingualText()

> **extractMultilingualText**(`field`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/jsonLdHelpers.ts#L133)

Extracts a multilingual text value from an EP API JSON-LD field.

Handles plain strings, language-tagged objects, and arrays of language variants.

## Parameters

### field

`unknown`

Raw field from EP API

## Returns

`string`

Extracted text string, or empty string
