[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/allMepFetcher](../README.md) / fetchAllMEPs

# Function: fetchAllMEPs()

> **fetchAllMEPs**(`client`, `batchSize`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`[]\>

Defined in: [utils/allMepFetcher.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/allMepFetcher.ts#L48)

Fetches every MEP page, preserving the configured page size for each request.

## Parameters

### client

[`MEPPageClient`](../interfaces/MEPPageClient.md)

Client used to retrieve MEP pages.

### batchSize

`number`

Number of MEPs requested per page.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`[]\>

All MEP records returned by the paginated endpoint.
