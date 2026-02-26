[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeVotingPatterns](../README.md) / handleAnalyzeVotingPatterns

# Function: handleAnalyzeVotingPatterns()

> **handleAnalyzeVotingPatterns**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/analyzeVotingPatterns.ts:111](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/tools/analyzeVotingPatterns.ts#L111)

Analyze voting patterns tool handler

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

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
