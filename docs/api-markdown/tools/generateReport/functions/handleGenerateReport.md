[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/generateReport](../README.md) / handleGenerateReport

# Function: handleGenerateReport()

> **handleGenerateReport**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/generateReport/index.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/tools/generateReport/index.ts#L64)

Generate report tool handler
Cyclomatic complexity: 3

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result with generated report

## Example

```json
{
  "reportType": "MEP_ACTIVITY",
  "subjectId": "MEP-124810",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31"
}
```
