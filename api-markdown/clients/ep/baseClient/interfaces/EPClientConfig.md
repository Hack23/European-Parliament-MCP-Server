[**European Parliament MCP Server API v1.1.19**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / EPClientConfig

# Interface: EPClientConfig

Defined in: [clients/ep/baseClient.ts:166](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L166)

**`Internal`**

Configuration options for EP API clients.

## Properties

### baseURL?

> `optional` **baseURL?**: `string`

Defined in: [clients/ep/baseClient.ts:168](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L168)

Base URL for European Parliament API.

#### Default

```ts
DEFAULT_EP_API_BASE_URL
```

***

### cacheTTL?

> `optional` **cacheTTL?**: `number`

Defined in: [clients/ep/baseClient.ts:170](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L170)

Cache time-to-live in milliseconds.

#### Default

```ts
900000
```

***

### enableRetry?

> `optional` **enableRetry?**: `boolean`

Defined in: [clients/ep/baseClient.ts:178](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L178)

Enable automatic retry on transient failures.

#### Default

```ts
true
```

***

### maxCacheSize?

> `optional` **maxCacheSize?**: `number`

Defined in: [clients/ep/baseClient.ts:172](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L172)

Maximum number of entries in LRU cache.

#### Default

```ts
500
```

***

### maxResponseBytes?

> `optional` **maxResponseBytes?**: `number`

Defined in: [clients/ep/baseClient.ts:182](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L182)

Maximum allowed response body size in bytes.

#### Default

```ts
10485760 (10 MiB)
```

***

### maxRetries?

> `optional` **maxRetries?**: `number`

Defined in: [clients/ep/baseClient.ts:180](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L180)

Maximum number of retry attempts.

#### Default

```ts
2
```

***

### rateLimiter?

> `optional` **rateLimiter?**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:174](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L174)

Custom rate limiter instance.

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: [clients/ep/baseClient.ts:176](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L176)

Request timeout in milliseconds.

#### Default

```ts
10000
```
