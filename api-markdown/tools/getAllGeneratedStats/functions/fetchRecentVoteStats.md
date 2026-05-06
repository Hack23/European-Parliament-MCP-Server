[**European Parliament MCP Server API v1.3.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAllGeneratedStats](../README.md) / fetchRecentVoteStats

# Function: fetchRecentVoteStats()

> **fetchRecentVoteStats**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RecentVoteActivity`](../interfaces/RecentVoteActivity.md) \| `null`\>

Defined in: [tools/getAllGeneratedStats.ts:255](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L255)

Fetch recent vote statistics from EP DOCEO XML for near-realtime enrichment.
Returns null on any upstream error — callers treat absence as degraded-upstream.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RecentVoteActivity`](../interfaces/RecentVoteActivity.md) \| `null`\>
