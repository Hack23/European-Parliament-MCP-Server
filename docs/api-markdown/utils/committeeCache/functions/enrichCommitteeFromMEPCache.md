[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/committeeCache](../README.md) / enrichCommitteeFromMEPCache

# Function: enrichCommitteeFromMEPCache()

> **enrichCommitteeFromMEPCache**(`committee`, `cache`, `organizationAliases?`): `object`

Defined in: [utils/committeeCache.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/committeeCache.ts#L106)

## Parameters

### committee

#### abbreviation

`string` = `...`

#### id

`string` = `...`

#### members

`string`[] = `...`

#### name

`string` = `...`

#### chair?

`string` = `...`

#### meetingSchedule?

`string`[] = `...`

#### memberships?

`object`[] = `...`

#### responsibilities?

`string`[] = `...`

#### viceChairs?

`string`[] = `...`

### cache

#### mepDetails

`Record`\<`string`, \{ `active`: `boolean`; `committees`: `string`[]; `country`: `string`; `id`: `string`; `name`: `string`; `politicalGroup`: `string`; `termStart`: `string`; `address?`: `string`; `bday?`: `string`; `biography?`: `string`; `citizenship?`: `string`; `email?`: `string`; `facebook?`: `string`; `familyName?`: `string`; `givenName?`: `string`; `hasEmail?`: `string`; `hasGender?`: `string`; `hasHonorificPrefix?`: `string`; `hasMembership?`: `object`[]; `identifier?`: `string`; `img?`: `string`; `label?`: `string`; `notation_codictPersonId?`: `string`; `phone?`: `string`; `placeOfBirth?`: `string`; `roles?`: `string`[]; `sortLabel?`: `string`; `termEnd?`: `string`; `twitter?`: `string`; `type?`: `string`; `upperFamilyName?`: `string`; `upperGivenName?`: `string`; `votingStatistics?`: \{ `abstentions`: `number`; `attendanceRate`: `number`; `totalVotes`: `number`; `votesAgainst`: `number`; `votesFor`: `number`; \}; `website?`: `string`; \}\> = `...`

#### meps

`object`[] = `...`

#### metadata

\{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \} = `CacheMetadataSchema`

#### metadata.generatedAt

`string` = `...`

#### metadata.schemaVersion

`number` = `...`

#### metadata.source

`string` = `...`

#### metadata.complete?

`boolean` = `...`

#### metadata.dataset?

`"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"` = `...`

#### metadata.detailCount?

`number` = `...`

#### metadata.recordCount?

`number` = `...`

#### metadata.scope?

`"current"` \| `"all"` = `...`

#### metadata.weekKey?

`string` = `...`

### organizationAliases?

readonly `string`[] = `[]`

## Returns

`object`

### abbreviation

> **abbreviation**: `string`

### id

> **id**: `string`

### members

> **members**: `string`[]

### name

> **name**: `string`

### chair?

> `optional` **chair?**: `string`

### meetingSchedule?

> `optional` **meetingSchedule?**: `string`[]

### memberships?

> `optional` **memberships?**: `object`[]

### responsibilities?

> `optional` **responsibilities?**: `string`[]

### viceChairs?

> `optional` **viceChairs?**: `string`[]
