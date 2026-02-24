[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/searchDocuments](../README.md) / handleSearchDocuments

# Function: handleSearchDocuments()

> **handleSearchDocuments**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/searchDocuments.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/tools/searchDocuments.ts#L41)

Search documents tool handler

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result with document data

## Example

```json
{
  "keyword": "climate change",
  "documentType": "REPORT",
  "dateFrom": "2024-01-01",
  "limit": 20
}
```
