[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeVotingPatterns](../README.md) / handleAnalyzeVotingPatterns

# Function: handleAnalyzeVotingPatterns()

> **handleAnalyzeVotingPatterns**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/analyzeVotingPatterns.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/tools/analyzeVotingPatterns.ts#L109)

Analyze voting patterns tool handler

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result with voting pattern analysis

## Example

```json
{
  "mepId": "MEP-124810",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31",
  "compareWithGroup": true
}
```
