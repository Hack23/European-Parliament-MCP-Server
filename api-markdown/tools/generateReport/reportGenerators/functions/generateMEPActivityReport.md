[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/generateReport/reportGenerators](../README.md) / generateMEPActivityReport

# Function: generateMEPActivityReport()

> **generateMEPActivityReport**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Report`](../../types/interfaces/Report.md)\>

Defined in: [tools/generateReport/reportGenerators.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/tools/generateReport/reportGenerators.ts#L105)

Generate MEP activity report using real EP API data
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
