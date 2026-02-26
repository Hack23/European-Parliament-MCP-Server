[**European Parliament MCP Server API v0.8.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [resources](../README.md) / handleReadResource

# Function: handleReadResource()

> **handleReadResource**(`uri`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ResourceReadResult`](../interfaces/ResourceReadResult.md)\>

Defined in: [resources/index.ts:489](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/resources/index.ts#L489)

Handle ReadResource request

## Parameters

### uri

`string`

Resource URI (e.g., "ep://meps/12345")

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ResourceReadResult`](../interfaces/ResourceReadResult.md)\>

Resource content

## Throws

Error if URI is invalid or resource not found
