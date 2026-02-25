[**European Parliament MCP Server API v0.8.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [resources](../README.md) / handleReadResource

# Function: handleReadResource()

> **handleReadResource**(`uri`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ResourceReadResult`](../interfaces/ResourceReadResult.md)\>

Defined in: [resources/index.ts:489](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/resources/index.ts#L489)

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
