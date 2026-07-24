[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/allMepFetcher](../README.md) / fetchMEPBatch

# Function: fetchMEPBatch()

> **fetchMEPBatch**(`client`, `batchSize`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`[]\>

Defined in: [utils/allMepFetcher.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/allMepFetcher.ts#L36)

Fetches one MEP listing page for an incremental detail-cache refresh.

## Parameters

### client

[`MEPPageClient`](../interfaces/MEPPageClient.md)

Client used to retrieve the MEP page.

### batchSize

`number`

Number of MEPs requested for this refresh.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`[]\>

MEP records from the first listing page.
