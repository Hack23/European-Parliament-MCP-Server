[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getVotingRecords](../README.md) / handleGetVotingRecords

# Function: handleGetVotingRecords()

> **handleGetVotingRecords**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getVotingRecords.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/getVotingRecords.ts#L37)

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
