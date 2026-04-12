[**European Parliament MCP Server API v1.2.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/FeedHealthTracker](../README.md) / FeedHealthTracker

# Class: FeedHealthTracker

Defined in: [services/FeedHealthTracker.ts:88](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L88)

Singleton service that records feed tool invocation outcomes
and derives per-feed and overall availability health.

Does not make network calls — all data comes from tool dispatch hooks.

## Constructors

### Constructor

> **new FeedHealthTracker**(): `FeedHealthTracker`

Defined in: [services/FeedHealthTracker.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L93)

#### Returns

`FeedHealthTracker`

## Properties

### feedToolSet

> `private` `readonly` **feedToolSet**: `ReadonlySet`\<`string`\>

Defined in: [services/FeedHealthTracker.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L91)

***

### startTime

> `private` `readonly` **startTime**: `number`

Defined in: [services/FeedHealthTracker.ts:90](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L90)

***

### statuses

> `private` `readonly` **statuses**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

Defined in: [services/FeedHealthTracker.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L89)

## Methods

### getAllStatuses()

> **getAllStatuses**(): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

Defined in: [services/FeedHealthTracker.ts:136](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L136)

Get the statuses of all tracked feeds keyed by tool name.

#### Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, [`FeedStatus`](../interfaces/FeedStatus.md)\>

***

### getAvailability()

> **getAvailability**(): [`FeedAvailability`](../interfaces/FeedAvailability.md)

Defined in: [services/FeedHealthTracker.ts:150](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L150)

Derive the overall availability level from current feed statuses.

#### Returns

[`FeedAvailability`](../interfaces/FeedAvailability.md)

***

### getStatus()

> **getStatus**(`feedName`): [`FeedStatus`](../interfaces/FeedStatus.md)

Defined in: [services/FeedHealthTracker.ts:131](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L131)

Get the current status of a single feed (defaults to `unknown`).

#### Parameters

##### feedName

`string`

#### Returns

[`FeedStatus`](../interfaces/FeedStatus.md)

***

### getUptimeSeconds()

> **getUptimeSeconds**(): `number`

Defined in: [services/FeedHealthTracker.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L145)

Server uptime in whole seconds since tracker creation.

#### Returns

`number`

***

### isFeedTool()

> **isFeedTool**(`name`): `boolean`

Defined in: [services/FeedHealthTracker.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L99)

Returns `true` when the tool name identifies a tracked feed tool.

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### recordError()

> **recordError**(`feedName`, `errorMessage`): `void`

Defined in: [services/FeedHealthTracker.ts:115](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L115)

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

Defined in: [services/FeedHealthTracker.ts:104](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L104)

Record a successful feed invocation. Silently ignores unknown feed names.

#### Parameters

##### feedName

`string`

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Defined in: [services/FeedHealthTracker.ts:167](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L167)

**`Internal`**

Reset all tracked statuses.
Intended for testing only.

#### Returns

`void`
