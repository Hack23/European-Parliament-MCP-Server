[**European Parliament MCP Server API v1.0.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/generateReport/reportGenerators](../README.md) / generateVotingStatisticsReport

# Function: generateVotingStatisticsReport()

> **generateVotingStatisticsReport**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Report`](../../types/interfaces/Report.md)\>

Defined in: [tools/generateReport/reportGenerators.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/generateReport/reportGenerators.ts#L196)

Generate voting statistics report using real EP API data
Cyclomatic complexity: 1

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
