[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/trackLegislation](../README.md) / handleTrackLegislation

# Function: handleTrackLegislation()

> **handleTrackLegislation**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/trackLegislation/index.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/tools/trackLegislation/index.ts#L71)

Track legislation tool handler

Fetches real procedure data from the EP API `/procedures` endpoint
and returns structured legislative tracking information derived
entirely from the API response.

Accepts both EP API process-id format (`2024-0006`) and human-readable
reference format (`2024/0006(COD)`).

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result with legislative procedure tracking data

## Example

```json
{
  "procedureId": "2024/0006(COD)"
}
```
