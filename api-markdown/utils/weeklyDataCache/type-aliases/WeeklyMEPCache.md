[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyDataCache](../README.md) / WeeklyMEPCache

# Type Alias: WeeklyMEPCache

> **WeeklyMEPCache** = `object`

Defined in: [utils/weeklyDataCache.ts:62](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyDataCache.ts#L62)

## Type Declaration

### mepDetails

> **mepDetails**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, \{ `active`: `boolean`; `committees`: `string`[]; `country`: `string`; `id`: `string`; `name`: `string`; `politicalGroup`: `string`; `termStart`: `string`; `address?`: `string`; `bday?`: `string`; `biography?`: `string`; `citizenship?`: `string`; `email?`: `string`; `facebook?`: `string`; `familyName?`: `string`; `givenName?`: `string`; `hasEmail?`: `string`; `hasGender?`: `string`; `hasHonorificPrefix?`: `string`; `hasMembership?`: `object`[]; `identifier?`: `string`; `img?`: `string`; `label?`: `string`; `notation_codictPersonId?`: `string`; `phone?`: `string`; `placeOfBirth?`: `string`; `roles?`: `string`[]; `sortLabel?`: `string`; `termEnd?`: `string`; `twitter?`: `string`; `type?`: `string`; `upperFamilyName?`: `string`; `upperGivenName?`: `string`; `votingStatistics?`: \{ `abstentions`: `number`; `attendanceRate`: `number`; `totalVotes`: `number`; `votesAgainst`: `number`; `votesFor`: `number`; \}; `website?`: `string`; \}\>

### meps

> **meps**: `object`[]

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
