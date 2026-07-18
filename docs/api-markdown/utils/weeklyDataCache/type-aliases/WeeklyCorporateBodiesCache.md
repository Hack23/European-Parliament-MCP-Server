[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyDataCache](../README.md) / WeeklyCorporateBodiesCache

# Type Alias: WeeklyCorporateBodiesCache

> **WeeklyCorporateBodiesCache** = `object`

Defined in: [utils/weeklyDataCache.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyDataCache.ts#L63)

## Type Declaration

### corporateBodies

> **corporateBodies**: `object`[]

### metadata

> **metadata**: `object` = `CacheMetadataSchema`

#### metadata.generatedAt

> **generatedAt**: `string`

#### metadata.schemaVersion

> **schemaVersion**: `number`

#### metadata.source

> **source**: `string`

#### metadata.complete?

> `optional` **complete?**: `boolean`

#### metadata.dataset?

> `optional` **dataset?**: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`

#### metadata.detailCount?

> `optional` **detailCount?**: `number`

#### metadata.recordCount?

> `optional` **recordCount?**: `number`

#### metadata.scope?

> `optional` **scope?**: `"current"` \| `"all"`

#### metadata.weekKey?

> `optional` **weekKey?**: `string`

### corporateBodyDetails?

> `optional` **corporateBodyDetails?**: `Record`\<`string`, \{ `abbreviation`: `string`; `id`: `string`; `members`: `string`[]; `name`: `string`; `chair?`: `string`; `meetingSchedule?`: `string`[]; `memberships?`: `object`[]; `responsibilities?`: `string`[]; `viceChairs?`: `string`[]; \}\>
