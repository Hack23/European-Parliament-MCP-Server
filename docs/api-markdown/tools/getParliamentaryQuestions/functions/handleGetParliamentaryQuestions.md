[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getParliamentaryQuestions](../README.md) / handleGetParliamentaryQuestions

# Function: handleGetParliamentaryQuestions()

> **handleGetParliamentaryQuestions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getParliamentaryQuestions.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/tools/getParliamentaryQuestions.ts#L37)

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
