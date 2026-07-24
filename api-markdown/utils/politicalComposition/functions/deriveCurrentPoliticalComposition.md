[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/politicalComposition](../README.md) / deriveCurrentPoliticalComposition

# Function: deriveCurrentPoliticalComposition()

> **deriveCurrentPoliticalComposition**(`cache`, `asOf?`): [`CurrentPoliticalComposition`](../interfaces/CurrentPoliticalComposition.md)

Defined in: [utils/politicalComposition.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/politicalComposition.ts#L186)

Derives the current Parliament composition from dated MEP membership records.

## Parameters

### cache

#### mepDetails

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, \{ `active`: `boolean`; `committees`: `string`[]; `country`: `string`; `id`: `string`; `name`: `string`; `politicalGroup`: `string`; `termStart`: `string`; `address?`: `string`; `bday?`: `string`; `biography?`: `string`; `citizenship?`: `string`; `email?`: `string`; `facebook?`: `string`; `familyName?`: `string`; `givenName?`: `string`; `hasEmail?`: `string`; `hasGender?`: `string`; `hasHonorificPrefix?`: `string`; `hasMembership?`: `object`[]; `identifier?`: `string`; `img?`: `string`; `label?`: `string`; `notation_codictPersonId?`: `string`; `phone?`: `string`; `placeOfBirth?`: `string`; `roles?`: `string`[]; `sortLabel?`: `string`; `termEnd?`: `string`; `twitter?`: `string`; `type?`: `string`; `upperFamilyName?`: `string`; `upperGivenName?`: `string`; `votingStatistics?`: \{ `abstentions`: `number`; `attendanceRate`: `number`; `totalVotes`: `number`; `votesAgainst`: `number`; `votesFor`: `number`; \}; `website?`: `string`; \}\> = `...`

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

### asOf?

`string` = `...`

## Returns

[`CurrentPoliticalComposition`](../interfaces/CurrentPoliticalComposition.md)
