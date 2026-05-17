[**European Parliament MCP Server API v1.3.7**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / EPSharedResources

# Interface: EPSharedResources

Defined in: [clients/ep/baseClient.ts:192](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L192)

**`Internal`**

Pre-built shared resources passed from a facade to its sub-clients
so they all operate on the same cache and rate-limiter bucket.

## Properties

### baseURL

> **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:195](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L195)

***

### cache

> **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:193](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L193)

***

### cacheCounters

> **cacheCounters**: `object`

Defined in: [clients/ep/baseClient.ts:201](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L201)

Shared cache hit/miss counters so all sub-clients contribute to aggregate stats.

#### hits

> **hits**: `number`

#### misses

> **misses**: `number`

***

### enableRetry

> **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:197](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L197)

***

### maxResponseBytes

> **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:199](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L199)

***

### maxRetries

> **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:198](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L198)

***

### rateLimiter

> **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L194)

***

### timeoutMs

> **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L196)
