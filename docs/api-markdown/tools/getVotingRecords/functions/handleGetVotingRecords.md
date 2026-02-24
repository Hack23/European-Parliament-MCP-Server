[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getVotingRecords](../README.md) / handleGetVotingRecords

# Function: handleGetVotingRecords()

> **handleGetVotingRecords**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getVotingRecords.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/tools/getVotingRecords.ts#L37)

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
