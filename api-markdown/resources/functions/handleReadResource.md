[**European Parliament MCP Server API v0.7.3**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [resources](../README.md) / handleReadResource

# Function: handleReadResource()

> **handleReadResource**(`uri`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`ResourceReadResult`\>

Defined in: [resources/index.ts:346](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/resources/index.ts#L346)

Handle ReadResource request

## Parameters

### uri

`string`

Resource URI (e.g., "ep://meps/12345")

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`ResourceReadResult`\>

Resource content

## Throws

Error if URI is invalid or resource not found
