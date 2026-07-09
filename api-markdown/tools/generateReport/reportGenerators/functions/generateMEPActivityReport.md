[**European Parliament MCP Server API v1.3.41**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/generateReport/reportGenerators](../README.md) / generateMEPActivityReport

# Function: generateMEPActivityReport()

> **generateMEPActivityReport**(`params`): `Promise`\<[`Report`](../../types/interfaces/Report.md)\>

Defined in: [tools/generateReport/reportGenerators.ts:283](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/generateReport/reportGenerators.ts#L283)

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

`Promise`\<[`Report`](../../types/interfaces/Report.md)\>
