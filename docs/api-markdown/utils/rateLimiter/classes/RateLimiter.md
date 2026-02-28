[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/rateLimiter](../README.md) / RateLimiter

# Class: RateLimiter

Defined in: [utils/rateLimiter.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L63)

Token bucket rate limiter implementation

## Constructors

### Constructor

> **new RateLimiter**(`options`): `RateLimiter`

Defined in: [utils/rateLimiter.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L69)

#### Parameters

##### options

`RateLimiterOptions`

#### Returns

`RateLimiter`

## Properties

### intervalMs

> `private` `readonly` **intervalMs**: `number`

Defined in: [utils/rateLimiter.ts:66](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L66)

***

### lastRefill

> `private` **lastRefill**: `number`

Defined in: [utils/rateLimiter.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L67)

***

### tokens

> `private` **tokens**: `number`

Defined in: [utils/rateLimiter.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L64)

***

### tokensPerInterval

> `private` `readonly` **tokensPerInterval**: `number`

Defined in: [utils/rateLimiter.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L65)

## Methods

### getAvailableTokens()

> **getAvailableTokens**(): `number`

Defined in: [utils/rateLimiter.ts:204](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L204)

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

Defined in: [utils/rateLimiter.ts:224](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L224)

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

Defined in: [utils/rateLimiter.ts:246](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L246)

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

Defined in: [utils/rateLimiter.ts:94](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L94)

Refill tokens based on elapsed time

#### Returns

`void`

***

### removeTokens()

> **removeTokens**(`count`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/rateLimiter.ts:137](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L137)

Attempts to consume `count` tokens from the bucket.

Refills the bucket based on elapsed time before checking availability.
If sufficient tokens are available they are consumed immediately and the
returned promise resolves. If not, a [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) is thrown describing
how long to wait before retrying.

#### Parameters

##### count

`number`

Number of tokens to consume (must be ≥ 1)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when the tokens have been consumed

#### Throws

If there are not enough tokens in the bucket, with a
  message indicating the retry-after duration in seconds

#### Example

```typescript
try {
  await rateLimiter.removeTokens(1);
  const data = await fetchFromEPAPI('/meps');
} catch (err) {
  if (err instanceof Error) {
    console.warn('Rate limited:', err.message);
  }
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

Defined in: [utils/rateLimiter.ts:274](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L274)

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

Defined in: [utils/rateLimiter.ts:177](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L177)

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
