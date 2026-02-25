[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractTextFromLangArray

# Function: extractTextFromLangArray()

> **extractTextFromLangArray**(`items`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/clients/ep/jsonLdHelpers.ts#L112)

Extracts preferred-language text from an array of language-tagged objects.
Prefers English (`en`) or multilingual (`mul`).

## Parameters

### items

`unknown`[]

Array of JSON-LD language-tagged objects

## Returns

`string`

Text in preferred language, or first available
