[**European Parliament MCP Server API v1.4.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/allMepFetcher](../README.md) / fetchAllCurrentMEPs

# Function: fetchAllCurrentMEPs()

> **fetchAllCurrentMEPs**(`client`, `batchSize`): `Promise`\<`unknown`[]\>

Defined in: [utils/allMepFetcher.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/allMepFetcher.ts#L73)

Fetches every currently active MEP via the `/meps/show-current` endpoint.

Unlike [fetchAllMEPs](fetchAllMEPs.md) (which pages `/meps?status=all` and surfaces the
oldest historical members first), this returns the present-day roster with
`active: true`, country of representation, and political-group enrichment —
the data that OSINT tooling (e.g. `get_meps`, defaulting to `active: true`)
actually consumes.

## Parameters

### client

[`CurrentMEPPageClient`](../interfaces/CurrentMEPPageClient.md)

Client used to retrieve current MEP pages.

### batchSize

`number`

Number of MEPs requested per page.

## Returns

`Promise`\<`unknown`[]\>

All currently active MEP records.
