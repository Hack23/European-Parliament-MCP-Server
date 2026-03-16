[**European Parliament MCP Server API v1.1.11**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractTextFromLangArray

# Function: extractTextFromLangArray()

> **extractTextFromLangArray**(`items`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:125](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/jsonLdHelpers.ts#L125)

Extracts preferred-language text from an array of language-tagged objects.
Prefers English (`en`) or multilingual (`mul`).

EP API sometimes returns plain string arrays (e.g. URI references in
`isAboutSubjectMatter`). When the array contains only plain strings,
they are joined with `, `.

## Parameters

### items

`unknown`[]

Array of JSON-LD language-tagged objects or plain strings

## Returns

`string`

Text in preferred language, or first available
