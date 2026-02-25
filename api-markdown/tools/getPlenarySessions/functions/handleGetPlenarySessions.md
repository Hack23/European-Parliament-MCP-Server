[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenarySessions](../README.md) / handleGetPlenarySessions

# Function: handleGetPlenarySessions()

> **handleGetPlenarySessions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getPlenarySessions.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/getPlenarySessions.ts#L36)

Get plenary sessions tool handler

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result with plenary session data

## Example

```json
{
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31",
  "limit": 20
}
```
