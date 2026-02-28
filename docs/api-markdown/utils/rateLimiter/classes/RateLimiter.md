[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/rateLimiter](../README.md) / RateLimiter

# Class: RateLimiter

Defined in: [utils/rateLimiter.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L74)

Token bucket rate limiter implementation

## Constructors

### Constructor

> **new RateLimiter**(`options`): `RateLimiter`

Defined in: [utils/rateLimiter.ts:80](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L80)

#### Parameters

##### options

`RateLimiterOptions`

#### Returns

`RateLimiter`

## Properties

### intervalMs

> `private` `readonly` **intervalMs**: `number`

Defined in: [utils/rateLimiter.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L77)

***

### lastRefill

> `private` **lastRefill**: `number`

Defined in: [utils/rateLimiter.ts:78](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L78)

***

### tokens

> `private` **tokens**: `number`

Defined in: [utils/rateLimiter.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L75)

***

### tokensPerInterval

> `private` `readonly` **tokensPerInterval**: `number`

Defined in: [utils/rateLimiter.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L76)

## Methods

### getAvailableTokens()

> **getAvailableTokens**(): `number`

Defined in: [utils/rateLimiter.ts:268](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L268)

Returns the number of tokens currently available in the bucket.

Triggers a refill calculation based on elapsed time before returning
the value, so the result reflects the current real-time availability.

#### Returns

`number`

Current token count (may be fractional; floor before display)

#### Example

```typescript
const tokens = rateLimiter.getAvailableTokens();
console.log(`${tokens} / ${rateLimiter.getMaxTokens()} tokens available`);
```

#### Since

0.8.0

***

### getMaxTokens()

> **getMaxTokens**(): `number`

Defined in: [utils/rateLimiter.ts:288](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L288)

Returns the maximum token capacity of this bucket.

Equal to the `tokensPerInterval` value passed at construction time.
Does **not** trigger a refill calculation.

#### Returns

`number`

Maximum number of tokens the bucket can hold

#### Example

```typescript
const max = rateLimiter.getMaxTokens(); // e.g. 100
```

#### Since

0.8.0

***

### getStatus()

> **getStatus**(): [`RateLimiterStatus`](../interfaces/RateLimiterStatus.md)

Defined in: [utils/rateLimiter.ts:310](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L310)

Returns a typed status snapshot for health checks and monitoring.

Triggers a refill calculation so the snapshot reflects real-time bucket
state. Useful for `/health` endpoints and Prometheus exporters.

#### Returns

[`RateLimiterStatus`](../interfaces/RateLimiterStatus.md)

Current [RateLimiterStatus](../interfaces/RateLimiterStatus.md) snapshot with `availableTokens`,
  `maxTokens`, and `utilizationPercent` (0–100)

#### Example

```typescript
const status = rateLimiter.getStatus();
console.log(`${status.utilizationPercent}% utilized`);
// e.g. "45% utilized"
```

#### Since

0.8.0

***

### refill()

> `private` **refill**(): `void`

Defined in: [utils/rateLimiter.ts:123](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L123)

Refill tokens based on elapsed time

#### Returns

`void`

***

### removeTokens()

> **removeTokens**(`count`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RateLimitResult`](../type-aliases/RateLimitResult.md)\>

Defined in: [utils/rateLimiter.ts:166](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L166)

Attempts to consume `count` tokens from the bucket, waiting asynchronously
until tokens are available or the timeout expires.

Refills the bucket based on elapsed time before each check. If sufficient
tokens are available they are consumed immediately. Otherwise the method
sleeps until the bucket has enough tokens and retries. If the required wait
would exceed `options.timeoutMs` (default **5000 ms**) the call returns
immediately with `allowed: false` and a `retryAfterMs` hint.

#### Parameters

##### count

`number`

Number of tokens to consume (must be ≥ 1)

##### options?

###### timeoutMs?

`number`

Maximum time to wait in milliseconds (default 5000)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RateLimitResult`](../type-aliases/RateLimitResult.md)\>

Promise resolving to a [RateLimitResult](../type-aliases/RateLimitResult.md). `allowed` is `true`
  when tokens were consumed, `false` when the timeout was reached.

#### Example

```typescript
const result = await rateLimiter.removeTokens(1);
if (!result.allowed) {
  console.warn(`Rate limited – retry after ${result.retryAfterMs}ms`);
} else {
  const data = await fetchFromEPAPI('/meps');
}
```

#### Security

Prevents abusive high-frequency requests to the EP API.
  Per ISMS Policy AC-003, rate limiting is a mandatory access control.

#### Since

0.8.0

***

### reset()

> **reset**(): `void`

Defined in: [utils/rateLimiter.ts:338](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L338)

Resets the bucket to full capacity and clears the refill timer.

Useful in tests or after a planned maintenance window where queued
demand should not be penalised by an already-depleted bucket.

#### Returns

`void`

#### Example

```typescript
afterEach(() => {
  rateLimiter.reset();
});
```

#### Since

0.8.0

***

### tryRemoveTokens()

> **tryRemoveTokens**(`count`): `boolean`

Defined in: [utils/rateLimiter.ts:233](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L233)

Attempts to consume `count` tokens without throwing on failure.

Non-throwing alternative to [removeTokens](#removetokens). Useful in hot paths
where callers want to branch on availability rather than catch errors.

#### Parameters

##### count

`number`

Number of tokens to consume (must be ≥ 1)

#### Returns

`boolean`

`true` if tokens were successfully consumed, `false` if the
  bucket did not have enough tokens (bucket is left unchanged)

#### Example

```typescript
if (!rateLimiter.tryRemoveTokens(1)) {
  return { error: 'Rate limit exceeded. Please try again later.' };
}
const data = await fetchFromEPAPI('/meps');
```

#### Since

0.8.0

***

### resolveTimeout()

> `private` `static` **resolveTimeout**(`rawTimeoutMs`): `number`

Defined in: [utils/rateLimiter.ts:114](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L114)

Coerce an optional timeoutMs value to a safe finite number >= 0.

#### Parameters

##### rawTimeoutMs

`number` | `undefined`

#### Returns

`number`
