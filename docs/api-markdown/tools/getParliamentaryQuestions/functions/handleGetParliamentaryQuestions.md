[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getParliamentaryQuestions](../README.md) / handleGetParliamentaryQuestions

# Function: handleGetParliamentaryQuestions()

> **handleGetParliamentaryQuestions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getParliamentaryQuestions.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/tools/getParliamentaryQuestions.ts#L37)

Get parliamentary questions tool handler

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result with parliamentary question data

## Example

```json
{
  "type": "WRITTEN",
  "status": "ANSWERED",
  "topic": "climate policy",
  "limit": 20
}
```
