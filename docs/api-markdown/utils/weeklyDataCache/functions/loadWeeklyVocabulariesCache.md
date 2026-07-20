[**European Parliament MCP Server API v1.4.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyDataCache](../README.md) / loadWeeklyVocabulariesCache

# Function: loadWeeklyVocabulariesCache()

> **loadWeeklyVocabulariesCache**(): `Promise`\<\{ `metadata`: \{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \}; `vocabularies`: `Record`\<`string`, `unknown`\>[]; `vocabularyDetails?`: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>; \} \| `null`\>

Defined in: [utils/weeklyDataCache.ts:151](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyDataCache.ts#L151)

## Returns

`Promise`\<\{ `metadata`: \{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \}; `vocabularies`: `Record`\<`string`, `unknown`\>[]; `vocabularyDetails?`: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>; \} \| `null`\>
