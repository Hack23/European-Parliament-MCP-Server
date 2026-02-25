[**European Parliament MCP Server API v0.7.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getParliamentaryQuestions](../README.md) / handleGetParliamentaryQuestions

# Function: handleGetParliamentaryQuestions()

> **handleGetParliamentaryQuestions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getParliamentaryQuestions.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/tools/getParliamentaryQuestions.ts#L37)

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
