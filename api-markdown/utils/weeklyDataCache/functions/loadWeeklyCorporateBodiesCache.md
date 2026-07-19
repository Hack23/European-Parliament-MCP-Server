[**European Parliament MCP Server API v1.4.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyDataCache](../README.md) / loadWeeklyCorporateBodiesCache

# Function: loadWeeklyCorporateBodiesCache()

> **loadWeeklyCorporateBodiesCache**(): `Promise`\<\{ `corporateBodies`: `object`[]; `metadata`: \{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \}; `corporateBodyDetails?`: `Record`\<`string`, \{ `abbreviation`: `string`; `id`: `string`; `members`: `string`[]; `name`: `string`; `chair?`: `string`; `meetingSchedule?`: `string`[]; `memberships?`: `object`[]; `responsibilities?`: `string`[]; `viceChairs?`: `string`[]; \}\>; \} \| `null`\>

Defined in: [utils/weeklyDataCache.ts:144](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyDataCache.ts#L144)

## Returns

`Promise`\<\{ `corporateBodies`: `object`[]; `metadata`: \{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \}; `corporateBodyDetails?`: `Record`\<`string`, \{ `abbreviation`: `string`; `id`: `string`; `members`: `string`[]; `name`: `string`; `chair?`: `string`; `meetingSchedule?`: `string`[]; `memberships?`: `object`[]; `responsibilities?`: `string`[]; `viceChairs?`: `string`[]; \}\>; \} \| `null`\>
