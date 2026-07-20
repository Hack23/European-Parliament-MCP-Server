[**European Parliament MCP Server API v1.4.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyDataCache](../README.md) / WeeklyVocabulariesCache

# Type Alias: WeeklyVocabulariesCache

> **WeeklyVocabulariesCache** = `object`

Defined in: [utils/weeklyDataCache.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyDataCache.ts#L64)

## Type Declaration

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

### vocabularies

> **vocabularies**: `Record`\<`string`, `unknown`\>[]

### vocabularyDetails?

> `optional` **vocabularyDetails?**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>
