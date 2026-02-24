[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/rateLimiter](../README.md) / RateLimiter

# Class: RateLimiter

Defined in: [utils/rateLimiter.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L43)

Token bucket rate limiter implementation

## Constructors

### Constructor

> **new RateLimiter**(`options`): `RateLimiter`

Defined in: [utils/rateLimiter.ts:49](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L49)

#### Parameters

##### options

`RateLimiterOptions`

#### Returns

`RateLimiter`

## Properties

### intervalMs

> `private` `readonly` **intervalMs**: `number`

Defined in: [utils/rateLimiter.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L46)

***

### lastRefill

> `private` **lastRefill**: `number`

Defined in: [utils/rateLimiter.ts:47](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L47)

***

### tokens

> `private` **tokens**: `number`

Defined in: [utils/rateLimiter.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L44)

***

### tokensPerInterval

> `private` `readonly` **tokensPerInterval**: `number`

Defined in: [utils/rateLimiter.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L45)

## Methods

### getAvailableTokens()

> **getAvailableTokens**(): `number`

Defined in: [utils/rateLimiter.ts:135](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L135)

Get current available tokens

#### Returns

`number`

***

### refill()

> `private` **refill**(): `void`

Defined in: [utils/rateLimiter.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L74)

Refill tokens based on elapsed time

#### Returns

`void`

***

### removeTokens()

> **removeTokens**(`count`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/rateLimiter.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L95)

Remove tokens from the bucket

#### Parameters

##### count

`number`

Number of tokens to remove

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when tokens are available

#### Throws

Error if rate limit exceeded

***

### reset()

> **reset**(): `void`

Defined in: [utils/rateLimiter.ts:143](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L143)

Reset the rate limiter to full capacity

#### Returns

`void`

***

### tryRemoveTokens()

> **tryRemoveTokens**(`count`): `boolean`

Defined in: [utils/rateLimiter.ts:121](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/rateLimiter.ts#L121)

Try to remove tokens without throwing error

#### Parameters

##### count

`number`

Number of tokens to remove

#### Returns

`boolean`

true if tokens were removed, false if not enough tokens
