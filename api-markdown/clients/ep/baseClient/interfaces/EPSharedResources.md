[**European Parliament MCP Server API v1.4.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / EPSharedResources

# Interface: EPSharedResources

Defined in: [clients/ep/baseClient.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L196)

**`Internal`**

Pre-built shared resources passed from a facade to its sub-clients
so they all operate on the same cache and rate-limiter bucket.

## Properties

### baseURL

> **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:199](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L199)

***

### cache

> **cache**: `LRUCache`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:197](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L197)

***

### cacheCounters

> **cacheCounters**: `object`

Defined in: [clients/ep/baseClient.ts:205](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L205)

Shared cache hit/miss counters so all sub-clients contribute to aggregate stats.

#### hits

> **hits**: `number`

#### misses

> **misses**: `number`

***

### enableRetry

> **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:201](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L201)

***

### maxResponseBytes

> **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:203](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L203)

***

### maxRetries

> **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:202](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L202)

***

### rateLimiter

> **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:198](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L198)

***

### timeoutMs

> **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:200](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L200)
