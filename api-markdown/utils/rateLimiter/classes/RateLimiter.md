[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/rateLimiter](../README.md) / RateLimiter

# Class: RateLimiter

Defined in: [utils/rateLimiter.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L63)

Token bucket rate limiter implementation

## Constructors

### Constructor

> **new RateLimiter**(`options`): `RateLimiter`

Defined in: [utils/rateLimiter.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L69)

#### Parameters

##### options

`RateLimiterOptions`

#### Returns

`RateLimiter`

## Properties

### intervalMs

> `private` `readonly` **intervalMs**: `number`

Defined in: [utils/rateLimiter.ts:66](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L66)

***

### lastRefill

> `private` **lastRefill**: `number`

Defined in: [utils/rateLimiter.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L67)

***

### tokens

> `private` **tokens**: `number`

Defined in: [utils/rateLimiter.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L64)

***

### tokensPerInterval

> `private` `readonly` **tokensPerInterval**: `number`

Defined in: [utils/rateLimiter.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L65)

## Methods

### getAvailableTokens()

> **getAvailableTokens**(): `number`

Defined in: [utils/rateLimiter.ts:155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L155)

Get current available tokens

#### Returns

`number`

***

### getMaxTokens()

> **getMaxTokens**(): `number`

Defined in: [utils/rateLimiter.ts:163](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L163)

Get the maximum token capacity of this bucket.

#### Returns

`number`

***

### getStatus()

> **getStatus**(): [`RateLimiterStatus`](../interfaces/RateLimiterStatus.md)

Defined in: [utils/rateLimiter.ts:172](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L172)

Get a typed status snapshot for health checks and monitoring.

#### Returns

[`RateLimiterStatus`](../interfaces/RateLimiterStatus.md)

Current [RateLimiterStatus](../interfaces/RateLimiterStatus.md) snapshot

***

### refill()

> `private` **refill**(): `void`

Defined in: [utils/rateLimiter.ts:94](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L94)

Refill tokens based on elapsed time

#### Returns

`void`

***

### removeTokens()

> **removeTokens**(`count`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/rateLimiter.ts:115](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L115)

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

Defined in: [utils/rateLimiter.ts:188](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L188)

Reset the rate limiter to full capacity

#### Returns

`void`

***

### tryRemoveTokens()

> **tryRemoveTokens**(`count`): `boolean`

Defined in: [utils/rateLimiter.ts:141](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/rateLimiter.ts#L141)

Try to remove tokens without throwing error

#### Parameters

##### count

`number`

Number of tokens to remove

#### Returns

`boolean`

true if tokens were removed, false if not enough tokens
