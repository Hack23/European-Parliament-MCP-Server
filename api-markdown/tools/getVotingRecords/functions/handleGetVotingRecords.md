[**European Parliament MCP Server API v0.7.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getVotingRecords](../README.md) / handleGetVotingRecords

# Function: handleGetVotingRecords()

> **handleGetVotingRecords**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getVotingRecords.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/tools/getVotingRecords.ts#L37)

Get voting records tool handler

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result with voting record data

## Example

```json
{
  "sessionId": "PLENARY-2024-01",
  "topic": "Climate Change",
  "limit": 20
}
```
