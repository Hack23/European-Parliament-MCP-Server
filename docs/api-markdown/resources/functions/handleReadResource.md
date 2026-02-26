[**European Parliament MCP Server API v0.8.2**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [resources](../README.md) / handleReadResource

# Function: handleReadResource()

> **handleReadResource**(`uri`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ResourceReadResult`](../interfaces/ResourceReadResult.md)\>

Defined in: [resources/index.ts:489](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/resources/index.ts#L489)

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
