[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/trackLegislation](../README.md) / handleTrackLegislation

# Function: handleTrackLegislation()

> **handleTrackLegislation**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/trackLegislation/index.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/trackLegislation/index.ts#L71)

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
