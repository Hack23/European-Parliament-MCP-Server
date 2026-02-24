[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getParliamentaryQuestions](../README.md) / handleGetParliamentaryQuestions

# Function: handleGetParliamentaryQuestions()

> **handleGetParliamentaryQuestions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getParliamentaryQuestions.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/getParliamentaryQuestions.ts#L37)

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
