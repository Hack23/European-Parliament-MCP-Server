[**European Parliament MCP Server API v1.3.23**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/doceoMepAggregator](../README.md) / DoceoMepAggregateResult

# Interface: DoceoMepAggregateResult

Defined in: [utils/doceoMepAggregator.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L67)

Result returned by [computeMepVotingActivityFromDoceo](../functions/computeMepVotingActivityFromDoceo.md).

## Properties

### cacheHit

> **cacheHit**: `boolean`

Defined in: [utils/doceoMepAggregator.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L73)

`true` when this result was served from the in-memory cache.

***

### dataSource

> **dataSource**: `"DOCEO"`

Defined in: [utils/doceoMepAggregator.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L71)

Always `'DOCEO'`.

***

### rcvVotesInspected

> **rcvVotesInspected**: `number`

Defined in: [utils/doceoMepAggregator.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L75)

Number of DOCEO RCV votes inspected (mirrors `stats.rcvVotesInspected`).

***

### stats

> **stats**: [`MepVotingAggregateStats`](MepVotingAggregateStats.md)

Defined in: [utils/doceoMepAggregator.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L69)

Aggregated voting statistics.
