[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractMultilingualText

# Function: extractMultilingualText()

> **extractMultilingualText**(`field`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/clients/ep/jsonLdHelpers.ts#L133)

Extracts a multilingual text value from an EP API JSON-LD field.

Handles plain strings, language-tagged objects, and arrays of language variants.

## Parameters

### field

`unknown`

Raw field from EP API

## Returns

`string`

Extracted text string, or empty string
