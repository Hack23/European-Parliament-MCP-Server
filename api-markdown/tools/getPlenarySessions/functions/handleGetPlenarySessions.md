[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenarySessions](../README.md) / handleGetPlenarySessions

# Function: handleGetPlenarySessions()

> **handleGetPlenarySessions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getPlenarySessions.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/tools/getPlenarySessions.ts#L36)

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
