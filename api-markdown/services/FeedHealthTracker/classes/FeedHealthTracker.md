[**European Parliament MCP Server API v1.3.31**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/FeedHealthTracker](../README.md) / FeedHealthTracker

# Class: FeedHealthTracker

Defined in: [services/FeedHealthTracker.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L91)

Singleton service that records feed tool invocation outcomes
and derives per-feed and overall availability health.

Does not make network calls — all data comes from tool dispatch hooks.

## Constructors

### Constructor

> **new FeedHealthTracker**(): `FeedHealthTracker`

Defined in: [services/FeedHealthTracker.ts:96](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L96)

#### Returns

`FeedHealthTracker`

## Properties

### feedToolSet

> `private` `readonly` **feedToolSet**: `ReadonlySet`\<`string`\>

Defined in: [services/FeedHealthTracker.ts:94](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L94)

***

### startTime

> `private` `readonly` **startTime**: `number`

Defined in: [services/FeedHealthTracker.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L93)

***

### statuses

> `private` `readonly` **statuses**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

Defined in: [services/FeedHealthTracker.ts:92](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L92)

## Methods

### getAllStatuses()

> **getAllStatuses**(): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

Defined in: [services/FeedHealthTracker.ts:139](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L139)

Get the statuses of all tracked feeds keyed by tool name.

#### Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

***

### getAvailability()

> **getAvailability**(): [`FeedAvailability`](../interfaces/FeedAvailability.md)

Defined in: [services/FeedHealthTracker.ts:153](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L153)

Derive the overall availability level from current feed statuses.

#### Returns

[`FeedAvailability`](../interfaces/FeedAvailability.md)

***

### getStatus()

> **getStatus**(`feedName`): [`FeedStatus`](../interfaces/FeedStatus.md)

Defined in: [services/FeedHealthTracker.ts:134](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L134)

Get the current status of a single feed (defaults to `unknown`).

#### Parameters

##### feedName

`string`

#### Returns

[`FeedStatus`](../interfaces/FeedStatus.md)

***

### getUptimeSeconds()

> **getUptimeSeconds**(): `number`

Defined in: [services/FeedHealthTracker.ts:148](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L148)

Server uptime in whole seconds since tracker creation.

#### Returns

`number`

***

### isFeedTool()

> **isFeedTool**(`name`): `boolean`

Defined in: [services/FeedHealthTracker.ts:102](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L102)

Returns `true` when the tool name identifies a tracked feed tool.

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### recordError()

> **recordError**(`feedName`, `errorMessage`): `void`

Defined in: [services/FeedHealthTracker.ts:118](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L118)

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

Defined in: [services/FeedHealthTracker.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L107)

Record a successful feed invocation. Silently ignores unknown feed names.

#### Parameters

##### feedName

`string`

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Defined in: [services/FeedHealthTracker.ts:179](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L179)

**`Internal`**

Reset all tracked statuses.
Intended for testing only.

#### Returns

`void`
