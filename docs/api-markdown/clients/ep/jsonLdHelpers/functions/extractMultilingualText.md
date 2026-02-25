[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractMultilingualText

# Function: extractMultilingualText()

> **extractMultilingualText**(`field`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/clients/ep/jsonLdHelpers.ts#L133)

Extracts a multilingual text value from an EP API JSON-LD field.

Handles plain strings, language-tagged objects, and arrays of language variants.

## Parameters

### field

`unknown`

Raw field from EP API

## Returns

`string`

Extracted text string, or empty string
