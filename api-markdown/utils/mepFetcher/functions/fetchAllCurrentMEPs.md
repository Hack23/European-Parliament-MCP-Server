[**European Parliament MCP Server API v1.2.4**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/mepFetcher](../README.md) / fetchAllCurrentMEPs

# Function: fetchAllCurrentMEPs()

> **fetchAllCurrentMEPs**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`FetchMEPsResult`](../interfaces/FetchMEPsResult.md)\>

Defined in: [utils/mepFetcher.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/mepFetcher.ts#L40)

Fetch all current MEPs by paginating until no more pages remain.

If a page request fails mid-pagination, the error is logged via
[auditLogger.logError](../../auditLogger/classes/AuditLogger.md#logerror) and the function returns the MEPs
collected so far as partial results. Callers should check
[FetchMEPsResult.complete](../interfaces/FetchMEPsResult.md#complete) to know whether the data is complete.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`FetchMEPsResult`](../interfaces/FetchMEPsResult.md)\>

A [FetchMEPsResult](../interfaces/FetchMEPsResult.md) containing the MEPs, a `complete` flag,
  and an optional `failureOffset` when the fetch was incomplete.
