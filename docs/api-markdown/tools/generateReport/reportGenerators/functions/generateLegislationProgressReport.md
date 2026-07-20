[**European Parliament MCP Server API v1.4.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/generateReport/reportGenerators](../README.md) / generateLegislationProgressReport

# Function: generateLegislationProgressReport()

> **generateLegislationProgressReport**(`params`): `Promise`\<[`Report`](../../types/interfaces/Report.md)\>

Defined in: [tools/generateReport/reportGenerators.ts:446](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/generateReport/reportGenerators.ts#L446)

Generate legislation progress report using real EP API data
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

`Promise`\<[`Report`](../../types/interfaces/Report.md)\>
