[**European Parliament MCP Server API v1.2.17**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/FeedHealthTracker](../README.md) / FeedStatus

# Interface: FeedStatus

Defined in: [services/FeedHealthTracker.ts:27](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L27)

Per-feed health status.

| Value     | Meaning |
|-----------|---------|
| `ok`      | Last invocation succeeded |
| `error`   | Last invocation failed |
| `unknown` | Feed has not been invoked yet |

## Properties

### status

> **status**: `"unknown"` \| `"error"` \| `"ok"`

Defined in: [services/FeedHealthTracker.ts:29](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L29)

Current feed health verdict

***

### lastAttempt?

> `optional` **lastAttempt?**: `string`

Defined in: [services/FeedHealthTracker.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L35)

ISO-8601 timestamp of the last invocation attempt

***

### lastError?

> `optional` **lastError?**: `string`

Defined in: [services/FeedHealthTracker.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L33)

Error message from the last failed invocation

***

### lastSuccess?

> `optional` **lastSuccess?**: `string`

Defined in: [services/FeedHealthTracker.ts:31](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L31)

ISO-8601 timestamp of the last successful invocation
