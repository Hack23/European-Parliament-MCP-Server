[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / EPSharedResources

# Interface: EPSharedResources

Defined in: [clients/ep/baseClient.ts:206](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L206)

**`Internal`**

Pre-built shared resources passed from a facade to its sub-clients
so they all operate on the same cache and rate-limiter bucket.

## Properties

### baseURL

> **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:209](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L209)

***

### cache

> **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:207](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L207)

***

### cacheCounters

> **cacheCounters**: `object`

Defined in: [clients/ep/baseClient.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L215)

Shared cache hit/miss counters so all sub-clients contribute to aggregate stats.

#### hits

> **hits**: `number`

#### misses

> **misses**: `number`

***

### enableRetry

> **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:211](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L211)

***

### maxResponseBytes

> **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:213](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L213)

***

### maxRetries

> **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:212](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L212)

***

### rateLimiter

> **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:208](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L208)

***

### timeoutMs

> **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:210](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L210)
