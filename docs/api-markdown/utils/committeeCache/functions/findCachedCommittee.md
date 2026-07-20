[**European Parliament MCP Server API v1.4.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/committeeCache](../README.md) / findCachedCommittee

# Function: findCachedCommittee()

> **findCachedCommittee**(`lookup`, `cachedBodies`, `cachedMEPs`): \{ `abbreviation`: `string`; `id`: `string`; `members`: `string`[]; `name`: `string`; `chair?`: `string`; `meetingSchedule?`: `string`[]; `memberships?`: `object`[]; `responsibilities?`: `string`[]; `viceChairs?`: `string`[]; \} \| `undefined`

Defined in: [utils/committeeCache.ts:128](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/committeeCache.ts#L128)

## Parameters

### lookup

`string`

### cachedBodies

#### corporateBodies

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

#### corporateBodyDetails?

`Record`\<`string`, \{ `abbreviation`: `string`; `id`: `string`; `members`: `string`[]; `name`: `string`; `chair?`: `string`; `meetingSchedule?`: `string`[]; `memberships?`: `object`[]; `responsibilities?`: `string`[]; `viceChairs?`: `string`[]; \}\> = `...`

### cachedMEPs

\{ `mepDetails`: `Record`\<`string`, \{ `active`: `boolean`; `committees`: `string`[]; `country`: `string`; `id`: `string`; `name`: `string`; `politicalGroup`: `string`; `termStart`: `string`; `address?`: `string`; `bday?`: `string`; `biography?`: `string`; `citizenship?`: `string`; `email?`: `string`; `facebook?`: `string`; `familyName?`: `string`; `givenName?`: `string`; `hasEmail?`: `string`; `hasGender?`: `string`; `hasHonorificPrefix?`: `string`; `hasMembership?`: `object`[]; `identifier?`: `string`; `img?`: `string`; `label?`: `string`; `notation_codictPersonId?`: `string`; `phone?`: `string`; `placeOfBirth?`: `string`; `roles?`: `string`[]; `sortLabel?`: `string`; `termEnd?`: `string`; `twitter?`: `string`; `type?`: `string`; `upperFamilyName?`: `string`; `upperGivenName?`: `string`; `votingStatistics?`: \{ `abstentions`: `number`; `attendanceRate`: `number`; `totalVotes`: `number`; `votesAgainst`: `number`; `votesFor`: `number`; \}; `website?`: `string`; \}\>; `meps`: `object`[]; `metadata`: \{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \}; \} \| `null`

## Returns

\{ `abbreviation`: `string`; `id`: `string`; `members`: `string`[]; `name`: `string`; `chair?`: `string`; `meetingSchedule?`: `string`[]; `memberships?`: `object`[]; `responsibilities?`: `string`[]; `viceChairs?`: `string`[]; \} \| `undefined`
