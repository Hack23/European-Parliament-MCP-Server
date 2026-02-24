[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/generateReport/reportGenerators](../README.md) / generateMEPActivityReport

# Function: generateMEPActivityReport()

> **generateMEPActivityReport**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Report`](../../types/interfaces/Report.md)\>

Defined in: [tools/generateReport/reportGenerators.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/tools/generateReport/reportGenerators.ts#L54)

Generate MEP activity report
Cyclomatic complexity: 2

## Parameters

### params

#### reportType

`"MEP_ACTIVITY"` \| `"COMMITTEE_PERFORMANCE"` \| `"VOTING_STATISTICS"` \| `"LEGISLATION_PROGRESS"` = `...`

#### dateFrom?

`string` = `...`

#### dateTo?

`string` = `...`

#### subjectId?

`string` = `...`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Report`](../../types/interfaces/Report.md)\>
