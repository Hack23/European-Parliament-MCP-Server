[**European Parliament MCP Server API v0.7.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [resources](../README.md) / handleReadResource

# Function: handleReadResource()

> **handleReadResource**(`uri`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`ResourceReadResult`\>

Defined in: [resources/index.ts:346](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/resources/index.ts#L346)

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
