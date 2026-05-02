[**European Parliament MCP Server API v1.2.20**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / EPClientConfig

# Interface: EPClientConfig

Defined in: [clients/ep/baseClient.ts:182](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L182)

**`Internal`**

Configuration options for EP API clients.

## Properties

### baseURL?

> `optional` **baseURL?**: `string`

Defined in: [clients/ep/baseClient.ts:184](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L184)

Base URL for European Parliament API.

#### Default

```ts
DEFAULT_EP_API_BASE_URL
```

***

### cacheTTL?

> `optional` **cacheTTL?**: `number`

Defined in: [clients/ep/baseClient.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L186)

Cache time-to-live in milliseconds.

#### Default

```ts
900000
```

***

### enableRetry?

> `optional` **enableRetry?**: `boolean`

Defined in: [clients/ep/baseClient.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L194)

Enable automatic retry on transient failures.

#### Default

```ts
true
```

***

### maxCacheSize?

> `optional` **maxCacheSize?**: `number`

Defined in: [clients/ep/baseClient.ts:188](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L188)

Maximum number of entries in LRU cache.

#### Default

```ts
500
```

***

### maxResponseBytes?

> `optional` **maxResponseBytes?**: `number`

Defined in: [clients/ep/baseClient.ts:198](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L198)

Maximum allowed response body size in bytes.

#### Default

```ts
10485760 (10 MiB)
```

***

### maxRetries?

> `optional` **maxRetries?**: `number`

Defined in: [clients/ep/baseClient.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L196)

Maximum number of retry attempts.

#### Default

```ts
2
```

***

### rateLimiter?

> `optional` **rateLimiter?**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:190](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L190)

Custom rate limiter instance.

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: [clients/ep/baseClient.ts:192](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L192)

Request timeout in milliseconds.

#### Default

```ts
DEFAULT_TIMEOUTS.EP_API_REQUEST_MS
```
