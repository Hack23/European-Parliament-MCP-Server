[**European Parliament MCP Server API v0.7.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeVotingPatterns](../README.md) / handleAnalyzeVotingPatterns

# Function: handleAnalyzeVotingPatterns()

> **handleAnalyzeVotingPatterns**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/analyzeVotingPatterns.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/tools/analyzeVotingPatterns.ts#L109)

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
