[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeVotingPatterns](../README.md) / handleAnalyzeVotingPatterns

# Function: handleAnalyzeVotingPatterns()

> **handleAnalyzeVotingPatterns**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/analyzeVotingPatterns.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/analyzeVotingPatterns.ts#L109)

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
