[**European Parliament MCP Server API v1.2.10**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/FeedHealthTracker](../README.md) / FeedHealthTracker

# Class: FeedHealthTracker

Defined in: [services/FeedHealthTracker.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L97)

Singleton service that records feed tool invocation outcomes
and derives per-feed and overall availability health.

Does not make network calls — all data comes from tool dispatch hooks.

## Constructors

### Constructor

> **new FeedHealthTracker**(): `FeedHealthTracker`

Defined in: [services/FeedHealthTracker.ts:102](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L102)

#### Returns

`FeedHealthTracker`

## Properties

### feedToolSet

> `private` `readonly` **feedToolSet**: `ReadonlySet`\<`string`\>

Defined in: [services/FeedHealthTracker.ts:100](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L100)

***

### startTime

> `private` `readonly` **startTime**: `number`

Defined in: [services/FeedHealthTracker.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L99)

***

### statuses

> `private` `readonly` **statuses**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

Defined in: [services/FeedHealthTracker.ts:98](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L98)

## Methods

### getAllStatuses()

> **getAllStatuses**(): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

Defined in: [services/FeedHealthTracker.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L145)

Get the statuses of all tracked feeds keyed by tool name.

#### Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

***

### getAvailability()

> **getAvailability**(): [`FeedAvailability`](../interfaces/FeedAvailability.md)

Defined in: [services/FeedHealthTracker.ts:159](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L159)

Derive the overall availability level from current feed statuses.

#### Returns

[`FeedAvailability`](../interfaces/FeedAvailability.md)

***

### getStatus()

> **getStatus**(`feedName`): [`FeedStatus`](../interfaces/FeedStatus.md)

Defined in: [services/FeedHealthTracker.ts:140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L140)

Get the current status of a single feed (defaults to `unknown`).

#### Parameters

##### feedName

`string`

#### Returns

[`FeedStatus`](../interfaces/FeedStatus.md)

***

### getUptimeSeconds()

> **getUptimeSeconds**(): `number`

Defined in: [services/FeedHealthTracker.ts:154](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L154)

Server uptime in whole seconds since tracker creation.

#### Returns

`number`

***

### isFeedTool()

> **isFeedTool**(`name`): `boolean`

Defined in: [services/FeedHealthTracker.ts:108](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L108)

Returns `true` when the tool name identifies a tracked feed tool.

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### recordError()

> **recordError**(`feedName`, `errorMessage`): `void`

Defined in: [services/FeedHealthTracker.ts:124](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L124)

Record a failed feed invocation, preserving the last success timestamp. Silently ignores unknown feed names.

#### Parameters

##### feedName

`string`

##### errorMessage

`string`

#### Returns

`void`

***

### recordSuccess()

> **recordSuccess**(`feedName`): `void`

Defined in: [services/FeedHealthTracker.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L113)

Record a successful feed invocation. Silently ignores unknown feed names.

#### Parameters

##### feedName

`string`

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Defined in: [services/FeedHealthTracker.ts:185](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L185)

**`Internal`**

Reset all tracked statuses.
Intended for testing only.

#### Returns

`void`
