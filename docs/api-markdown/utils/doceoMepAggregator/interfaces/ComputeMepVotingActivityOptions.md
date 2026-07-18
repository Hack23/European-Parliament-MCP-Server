[**European Parliament MCP Server API v1.4.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/doceoMepAggregator](../README.md) / ComputeMepVotingActivityOptions

# Interface: ComputeMepVotingActivityOptions

Defined in: [utils/doceoMepAggregator.ts:248](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L248)

Options accepted by [computeMepVotingActivityFromDoceo](../functions/computeMepVotingActivityFromDoceo.md).

## Properties

### dateFrom?

> `optional` **dateFrom?**: `string`

Defined in: [utils/doceoMepAggregator.ts:250](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L250)

Inclusive lower bound for the sitting date (`YYYY-MM-DD`).

***

### dateTo?

> `optional` **dateTo?**: `string`

Defined in: [utils/doceoMepAggregator.ts:252](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L252)

Inclusive upper bound for the sitting date (`YYYY-MM-DD`).

***

### limit?

> `optional` **limit?**: `number`

Defined in: [utils/doceoMepAggregator.ts:264](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L264)

Maximum number of DOCEO vote records to fetch (defaults to 100, the same
page size used by `analyzeCoalitionDynamics`).

***

### politicalGroup?

> `optional` **politicalGroup?**: `string`

Defined in: [utils/doceoMepAggregator.ts:257](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L257)

The MEP's canonical political-group code (e.g. `EPP`, `S&D`). When provided
the aggregator computes a real `loyaltyScore` from DOCEO group breakdowns.

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: [utils/doceoMepAggregator.ts:259](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L259)

Override the default 2 s DOCEO timeout (ms).
