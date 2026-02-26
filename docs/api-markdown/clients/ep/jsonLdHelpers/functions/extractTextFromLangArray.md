[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractTextFromLangArray

# Function: extractTextFromLangArray()

> **extractTextFromLangArray**(`items`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/clients/ep/jsonLdHelpers.ts#L112)

Extracts preferred-language text from an array of language-tagged objects.
Prefers English (`en`) or multilingual (`mul`).

## Parameters

### items

`unknown`[]

Array of JSON-LD language-tagged objects

## Returns

`string`

Text in preferred language, or first available
