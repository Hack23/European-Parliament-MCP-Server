[**European Parliament MCP Server API v1.2.9**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/FeedHealthTracker](../README.md) / FeedAvailability

# Interface: FeedAvailability

Defined in: [services/FeedHealthTracker.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L55)

Summary of feed availability.

## Properties

### errorFeeds

> **errorFeeds**: `number`

Defined in: [services/FeedHealthTracker.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L59)

Feeds with `status === 'error'` in the cache.

***

### level

> **level**: [`AvailabilityLevel`](../type-aliases/AvailabilityLevel.md)

Defined in: [services/FeedHealthTracker.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L63)

***

### operationalFeeds

> **operationalFeeds**: `number`

Defined in: [services/FeedHealthTracker.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L57)

Feeds with `status === 'ok'` in the cache.

***

### totalFeeds

> **totalFeeds**: `number`

Defined in: [services/FeedHealthTracker.ts:62](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L62)

***

### unknownFeeds

> **unknownFeeds**: `number`

Defined in: [services/FeedHealthTracker.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L61)

Feeds that have never been probed (`status === 'unknown'`).
