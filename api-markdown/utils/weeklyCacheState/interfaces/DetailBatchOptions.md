[**European Parliament MCP Server API v1.4.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyCacheState](../README.md) / DetailBatchOptions

# Interface: DetailBatchOptions\<Item\>

Defined in: [utils/weeklyCacheState.ts:126](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L126)

Options controlling a single incremental detail-refresh batch.

## Type Parameters

### Item

`Item`

## Properties

### batchSize

> **batchSize**: `number`

Defined in: [utils/weeklyCacheState.ts:130](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L130)

Maximum number of uncached items to fetch this run.

***

### details

> **details**: `Record`\<`string`, `unknown`\>

Defined in: [utils/weeklyCacheState.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L132)

Detail map fetched so far (mutated in place).

***

### fetchDetail

> **fetchDetail**: (`item`) => `Promise`\<`unknown`\>

Defined in: [utils/weeklyCacheState.ts:140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L140)

Fetches the detail record for one item.

#### Parameters

##### item

`Item`

#### Returns

`Promise`\<`unknown`\>

***

### idFor

> **idFor**: (`item`) => `string`

Defined in: [utils/weeklyCacheState.ts:136](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L136)

Primary identifier used for missing-id bookkeeping.

#### Parameters

##### item

`Item`

#### Returns

`string`

***

### isNotFound

> **isNotFound**: (`error`) => `boolean`

Defined in: [utils/weeklyCacheState.ts:144](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L144)

Classifies an error as a definitive 404 so the id is not retried.

#### Parameters

##### error

`unknown`

#### Returns

`boolean`

***

### items

> **items**: readonly `Item`[]

Defined in: [utils/weeklyCacheState.ts:128](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L128)

Full current roster of items.

***

### keysFor

> **keysFor**: (`item`) => readonly `string`[]

Defined in: [utils/weeklyCacheState.ts:138](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L138)

All identifier variants a detail record should be stored/looked up under.

#### Parameters

##### item

`Item`

#### Returns

readonly `string`[]

***

### missingIds

> **missingIds**: `Set`\<`string`\>

Defined in: [utils/weeklyCacheState.ts:134](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L134)

Not-found identifiers to skip this cycle (mutated in place).

***

### extraKeysFromDetail?

> `optional` **extraKeysFromDetail?**: (`detail`) => readonly `string`[]

Defined in: [utils/weeklyCacheState.ts:142](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L142)

Additional keys derived from the fetched detail (e.g. canonical identifier).

#### Parameters

##### detail

`unknown`

#### Returns

readonly `string`[]

***

### onRetry?

> `optional` **onRetry?**: (`id`) => `void`

Defined in: [utils/weeklyCacheState.ts:148](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L148)

Invoked when an item fetch fails transiently and will be retried later.

#### Parameters

##### id

`string`

#### Returns

`void`

***

### onSkip?

> `optional` **onSkip?**: (`id`) => `void`

Defined in: [utils/weeklyCacheState.ts:146](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L146)

Invoked when an item is recorded as permanently missing (404).

#### Parameters

##### id

`string`

#### Returns

`void`
